import * as mongoose from 'mongoose';
import {Yield} from './yield.model';
import {logger} from '../../utils/logger';
import {ErrorCode} from '../util/errorcodes.info';
import {performance} from 'perf_hooks';

let atob = require('atob');

// Row interface, values of each row without being a full-fledged document,
// helpful when querying a lot of data
export interface IOutcomeTableRow {
  interventionType: number;
  effectSize: number;
  sampleSize: number;
  filterCols: {[key: string]: string};
}

export interface IOutcomeTableDocument extends mongoose.Document, IOutcomeTableRow {
}

export interface IOutcomeTableModel<T> {
  findByCoords(areaPoints: Array<number[]>,
               filters?: Object,
               cols?: {[col: string]: number}): Promise<Array<IOutcomeTableRow>>
  findUnique(col: string): Promise<string[]>
  getAllInterventionTypes(): Promise<number[]>;
}

// TODO: vpineda, do this dynamically knowing which type are available
const TableMap: {[key: string]: IOutcomeTableModel<IOutcomeTableDocument>} = {
  yield: Yield
};


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
  if (points.length < 6 || points.length % 2) {
    return [];
  }
  let corners: number[][] = [];
  for (let i = 0; i < points.length; i += 2) {
    // swap the order 
    corners.push([points[i + 1], points[i]]);
  }
  corners.push(corners[0]);
  return corners;
}

/**
 * Parses the filters from the request and applies them to the given query
 * @param str the encoded str with all of the filters
 */
export function getQueryFilters(str: string, intTpe: string): Object {
  // todo vpineda
  let ans : any = {};
  if (str !== undefined && str !== "" && str !== null) {
    let decodedStr = atob(str);
    ans = {...ans, ...JSON.parse(decodedStr)}
  }
  let interventionKey = parseInt(intTpe);
  if (!isNaN(interventionKey)) {
    ans['interventionType'] = interventionKey;
  }
  return ans;
}

export function getQueryCols(str: string): {[col: string]: number } {
  if (str == undefined) return {_id: 0};
  let col = str.split(",");
  let obj: {[col: string]: number } = {_id: 0};
  col.forEach(v => obj[v] = 1);
  return obj;
}

/**
 * Queries the given table within coords and with a given set of filters. If you
 * need special columns you can specify them inside of the cols param
 * @param tableStr table name
 * @param coords the enclosing polygon oriented ccw
 * @param filters the filters that will be applied to the given query
 * @param cols extra cols that might be needed
 */
export async function query(tableStr: string, coords: number[][], 
  filters?: Object, cols?: {[col: string]: number}): Promise<Array<IOutcomeTableRow>> {

  let startT = performance.now();

  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error("Table name given in request is not valid")
    return Promise.reject({code: ErrorCode.TABLE_NOT_FOUND, table: tableStr});
  }
  // todo vpineda add the query cols that we want to show
  let ans = await table.findByCoords(coords, filters, cols);

  logger.trace("Query took: " + (performance.now() - startT) + " millis");
  return ans;
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
    logger.error("Table name given in request is not valid")
    return Promise.reject({code: ErrorCode.TABLE_NOT_FOUND, table: tableStr});
  }
  // todo vpineda add the query cols that we want to show
  let ans = await table.findUnique(col);

  logger.trace("Query took: " + (performance.now() - startT) + " millis");
  return ans;
}

export function getTables() {
  return TableMap;
}
