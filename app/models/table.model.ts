import * as mongoose from 'mongoose';
import { Yield } from './yield.model';
import {logger} from '../../utils/logger';
import { ErrorCode } from '../util/errorcodes.info';
let atob = require('atob');

export interface IOutcomeTableDocument extends mongoose.Document {
  interventionType: string;
}

export interface IOutcomeTableModel<T> {
  findByCoords(areaPoints: Array<number[]>, filters?: Object): Promise<Array<IOutcomeTableDocument>>
  findByInterventionType(interventionKey: number): Promise<T[]>;
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
    ans['intervention'] = interventionKey;
  }
  return ans;
}

export function getQueryCols(str: string): string[] {
  return [];
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
  filters?: Object, cols?: string[]): Promise<Array<IOutcomeTableDocument>> {

  let table: IOutcomeTableModel<IOutcomeTableDocument> = TableMap[tableStr];
  if (!table) {
    logger.error("Table name given in request is not valid")
    return Promise.reject({code: ErrorCode.TABLE_NOT_FOUND, table: tableStr});
  }
  // todo vpineda add the query cols that we want to show
  return table.findByCoords(coords, filters);
}

export function getTables() {
  return TableMap;
}
