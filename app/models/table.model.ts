import { performance } from 'perf_hooks';
import { logger } from '../../utils/logger';
import { AggregateCalculator } from '../util/aggregation.util';
import { ErrorCode } from '../util/errorcodes.info';
import { createAreaFilter } from '../util/location.util';
import { IOutcomeTableDocument, IOutcomeTableModel, IOutcomeTableRow } from '../util/typedef.util';
import { IInterventionDocument, Intervention } from './intervention.model';
import { OutcomeTableMapPromise } from './outcomes/outcomes.index';

let atob = require('atob');

let TableMap: {[key: string]: IOutcomeTableModel<IOutcomeTableDocument>} = {};
OutcomeTableMapPromise.then((v) => TableMap = { ...TableMap, ...v });


/**
 * Queries the given table within coords and with a given set of filters. It aggregates
 * data accoring to the aggCalculator. A single row will be returned.
 * @param tableStr table name
 * @param coords the enclosing polygon formatted properly (lng, lat)
 * @param filters the filters that will be applied to the given query
 * @param aggCalculator helper with enough information to build the aggreate string
 */
export async function aggregate(tableStr: string, aggCalculator: AggregateCalculator,
  coords: number[][], filters?: Object): Promise<Array<IOutcomeTableRow>> {

  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error('Table name given in request is not valid');
    return Promise.reject({ code: ErrorCode.TABLE_NOT_FOUND, table: tableStr });
  }

  let areaFilter = createAreaFilter(coords);
  let match = {
    '$and': [filters, areaFilter]
  };

  return (<any>table).aggregate([
    { '$match': match },
    ... aggCalculator.build()
  ]).exec();
}

/**
 * Queries the given table within coords and with a given set of filters. If you
 * need special columns you can specify them inside of the cols param
 * @param tableStr table name
 * @param coords the enclosing polygon formatted properly (lng, lat)
 * @param filters the filters that will be applied to the given query
 * @param cols extra cols that might be needed
 */
export async function query(tableStr: string, coords: number[][],
  filters?: Object, cols?: {[col: string]: number}): Promise<Array<IOutcomeTableRow>> {

  let startT = performance.now();

  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error('Table name given in request is not valid');
    return Promise.reject({ code: ErrorCode.TABLE_NOT_FOUND, table: tableStr });
  }

  let areaFilter = createAreaFilter(coords);
  let ans = await table.executeQuery({
    '$and': [filters, areaFilter]
  }, cols);

  logger.trace('Query took: ' + (performance.now() - startT) + ' millis');

  return ans;

  // return Promise.reject({
  //   code: ErrorCode.NO_DATA_FOR_STUDY,
  //   filters: filters,
  //   table: tableStr
  // });
}

/**
 * Queries the given table for unique names in the given column
 * @param tableStr table name
 * @param col name of the given column
 */
export async function unique(tableStr: string, col: string): Promise<string[]> {

  let startT = performance.now();

  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error('Table name given in request is not valid');
    return Promise.reject({ code: ErrorCode.TABLE_NOT_FOUND, table: tableStr });
  }
  let ans = await table.executeDistinct(col);

  logger.trace('Query took: ' + (performance.now() - startT) + ' millis');

  if (ans && ans.length) return ans;
  return Promise.reject({
    code: ErrorCode.NO_UNIQUE_VALUES,
    col: col,
    table: tableStr
  });
}

export async function interventions(tableStr: string): Promise<IInterventionDocument[]> {
  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error('Table name given in request is not valid');
    return Promise.reject({ code: ErrorCode.TABLE_NOT_FOUND, table: tableStr });
  }
  const intPromise = await table.getAllInterventionTypes();
  if (!intPromise || intPromise.length === 0) {
    return Promise.reject({
      code: ErrorCode.NO_INTERVENTION_TYPES,
      table: tableStr
    });
  }
  return Promise.all(intPromise.map((iKey) => Intervention.findByKey(iKey)));
}

export function getTables() {
  return TableMap;
}

/**
 * Gets array of points as [lng, lat]
 * @param str string array orgianized by lat and then long, must come in pairs, coma-separated!
 */
export function getCoordsPolygon(str: string): number[][] {
  const area: string = str;
  if (!area) {
    return [];
  }
  const points = area.split(',').map(num => parseFloat(num));
  if (points.length !== 4) {
    return [];
  }

  if (points[1] - points[3] > 360) {
    points[1] = 180;
    points[3] = -180;
  }

  let corners: number[][] = [];
  corners.push([points[3], points[0]]);
  corners.push([points[3], points[2]]);
  corners.push([points[1], points[2]]);
  corners.push([points[1], points[0]]);
  corners.push([points[3], points[0]]);
  return corners;
}

/**
 * Parses the filters from the request and applies them to the given query
 * @param str the encoded str with all of the filters
 * @param intType intervention type as integer key
 */
export function getQueryFilters(str: string, intType: string): Object {
  // todo vpineda
  let ans: any = {};
  if (str !== undefined && str !== '' && str !== null) {
    let decodedStr = atob(str);
    ans = { ...ans, ...JSON.parse(decodedStr) };
  }
  let interventionKey = parseInt(intType);
  if (!isNaN(interventionKey)) {
    ans['interventionType'] = interventionKey;
  }
  return ans;
}

export function getQueryCols(str: string): {[col: string]: number } {
  if (str === undefined || str === null) return { _id: 0 };
  let col = str.split(',');
  let obj: {[col: string]: number } = { _id: 0 };
  col.forEach(v => obj[v] = 1);
  return obj;
}
