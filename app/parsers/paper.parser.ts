import * as mongoose from 'mongoose';
import { WorkBook, WorkSheet } from 'xlsx';
import { logger } from '../../utils/logger';
import { Intervention } from '../models/intervention.model';
import { indexToColumn, parseRef } from '../util/excel.helpers.util';
import { IOutcomeTableRow } from '../util/typedef.util';

const XLSX = require('xlsx');

interface ParseJob {
  fileName: string;
  colMapping: ColumDesc;
}

interface ColumDesc {
  // column that contains as first entry the key of object
  [colName: string]: string;
}

interface ColumnMapping extends ColumDesc {}

abstract class Parser {
  constructor(public job: ParseJob) {}

  protected abstract get extraCols(): ColumDesc;
  protected abstract get model(): mongoose.Model<mongoose.Document>

  public abstract async prepareRow(ws: WorkSheet,
                                   colInfo: ColumDesc,
                                   rowIdx: number): Promise<Object>;
  public abstract validRow(r: Object): boolean;

  public async run(): Promise<number> {
    try {
      let wb: WorkBook = XLSX.readFile(this.job.fileName);
      let arg: {[key: string]: string} = {};
      flatten({ ...this.job.colMapping, ...this.extraCols }, arg);
      let [found, ws, cols] = Parser.findColumns(wb, arg);
      console.log('cols is: ' + JSON.stringify(cols))
      console.log('found: ', found)
      if (!found) {
        logger.error('Couldn\'t find all cols, aborting!');
        return 0;
      }
      let rows = await this.prepareRows(ws, cols);
      console.log('rows: ' + JSON.stringify(rows[0]))
      if (!rows.length) return 0;
      return new Promise((resolve, reject) => {
        this.model.collection.insertMany(rows, (error, result) => {
          if (error) reject(error);
          resolve(result);
        });
      }).then((ans: any) => {
        // console.log(ans);
        return ans.insertedCount;
      });
    } catch (e) {
      logger.error(e.stack);
      return Promise.reject('Error handling file: ' + JSON.stringify(e));
    }
  }

  public static findColumns(wb: WorkBook,
                        colMap: {[key: string]: string}): [boolean, WorkSheet, ColumnMapping] {
    let wbSheets = wb.SheetNames;
    let columns: ColumDesc = {};
    let colNames = invertKeyValue(colMap);
    let foundWorksheet = false;
    let wsPtr = 0;
    for (; wsPtr < wbSheets.length; wsPtr++) {
      let ws = wb.Sheets[wbSheets[wsPtr]];
      for (let colPtr = 0; ws[indexToColumn(colPtr) + '1'] !== undefined; colPtr++) {
        let cell = ws[indexToColumn(colPtr) + '1'];
        if (cell.t === 's' && colNames[cell.v] !== undefined) {
          foundWorksheet = true;
          columns[colNames[cell.v]] = indexToColumn(colPtr);
        }
      }
      if (foundWorksheet) break;
    }
    // console.log(columns)
    // console.log(Object.keys(columns).length)
    // console.log(colNames)
    // console.log(Object.keys(colNames).length)
    return [Object.keys(columns).length === Object.keys(colNames).length,
      wb.Sheets[wbSheets[wsPtr]],
      columns];
  }

  public prepareRows(ws: WorkSheet, colInfo: ColumDesc): Promise<any[]> {
    let [_, numRows] = parseRef(ws['!ref']);
    let rowPromises = [];
    console.log(colInfo);

    for (let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
      let newRowPromise = this.prepareRow(ws, colInfo, rowIdx)
        .catch((err) => {
          console.log('error for row parsing: ' + err);
          return null;
        });
      rowPromises.push(newRowPromise);
    }
    return Promise.all(rowPromises).then((rows) => {
      return rows.filter(v => v !== null && this.validRow(v));
    });
  }
}

abstract class OutcomeParser extends Parser {

  protected abstract get filterCols(): {[col: string]: string};
  protected abstract get infoCols(): {[col: string]: string};
  protected abstract get importID(): string;

  protected get extraCols() {
    return { ...this.filterCols, ... this.infoCols };
  }

  public async prepareRow(ws: WorkSheet,
                              colInfo: ColumDesc,
                              rowIdx: number): Promise<IOutcomeTableRow> {
    let interventionRow = this.getIntervention(ws, colInfo, rowIdx);
    let x = ws[colInfo.xCoords + rowIdx];
    let y = ws[colInfo.yCoords + rowIdx];
    let effS = ws[colInfo.effectSize + rowIdx];
    let samS = ws[colInfo.sampleSize + rowIdx];

    if (!x) {
      logger.warn(`Dropping row ${rowIdx} due to x`);
      return null;
    }

    if (!y) {
      logger.warn(`Dropping row ${rowIdx} due to y`);
      return null;
    }

    if (!effS) {
      logger.warn(`Dropping row ${rowIdx} due to effs`);
      return null;
    }

    if (!samS) {
      logger.warn(`Dropping row ${rowIdx} due to sams`);
      return null;
    }

    let filterObj = this.getColObj(this.filterCols, ws, colInfo, rowIdx);
    let infoObj = this.getColObj(this.infoCols, ws, colInfo, rowIdx);

    return {
      coords: {
        type: 'Point',
        coordinates: [x.v, y.v],
      },
      effectSize: effS.v,
      sampleSize: samS.v,
      importID: this.importID,
      interventionType: (await interventionRow).key,
      filterCols: filterObj,
      infoCols: infoObj
    };
  }

  private getColObj(colDesc: {[col: string]: string},
    ws: WorkSheet,
    colInfo: ColumDesc,
    rowIdx: number) {
    let ret: {[key: string]: string} = {};

    Object.keys(colDesc).map(k => {
      if (ws[colInfo[k] + rowIdx] !== undefined)
        ret[k] = ws[colInfo[k] + rowIdx].v;
    });
    return Object.keys(ret).length ? ret : undefined;
  }

  private async getIntervention(ws: WorkSheet, colInfo: ColumDesc, rowIdx: number) {
    let sKey = ws[colInfo.interventionType + rowIdx];
    if (!sKey) {
      logger.warn(`Dropping row ${rowIdx} since intervention is empty!`);
      return Promise.reject('Not a valid row!');
    }
    return Intervention.findByStringKey(sKey.v);
  }

  public validRow(newData: any) {
    if (newData === null) {
      return false;
    }
    if (!newData.coords || !newData.coords.coordinates || !newData.coords.coordinates.every(
      (v: any) => typeof v === 'number')) {
      logger.info('Dropping: ' + JSON.stringify(newData));
      return false;
    }
    if (typeof newData.effectSize !== 'number') {
      return false;
    }

    if (typeof newData.interventionType !== 'number') {
      return false;
    }

    return typeof newData.sampleSize === 'number';
  }
}

function invertKeyValue(obj: {[idx: string]: string}): {[idx: string]: string} {
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[obj[key]] = key;
    return acc;
  }, {});
}

type F = {
  [s: string]: F | string
};

function flatten(obj: F, acc: {[key: string]: string} = {}) {
  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (typeof obj[keys[i]] === 'object') {
      flatten(<F> obj[keys[i]], acc);
    } else if (typeof obj[keys[i]] === 'string') {
      acc[keys[i]] = <string>obj[keys[i]];
    }
  }
}


export { Parser, OutcomeParser, ParseJob, ColumDesc };

