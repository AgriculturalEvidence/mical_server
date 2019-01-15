import { IStudyDocument, Study } from '../models/studies.model';
import { IYieldDocument, Yield } from '../models/yield.model';
import { app, db } from '../../server';
import {GeoPoint} from '../models/geopoint.model';
import {ExcelDataType, WorkBook, WorkSheet} from 'xlsx';
const XLSX = require('xlsx');

interface ParseJob {

}

interface YieldJob extends ParseJob {
  studyDef: IStudyDocument;
  fileName: string;
  columnMapping: {
    xCoords: string,
    yCoords: string,
    effectSize: string
    sampleSize: string,
  };
}


interface ColumDesc {
  // column that contains as first entry the key of object
  [colName: string]: [WorkSheet, string];
}

function toColumnIndex(n: number) {
  var arr = [];
  while (n >= 0) {
    arr.push( String.fromCharCode(0x41 + (n % 26)));
    n = Math.floor(n /26) -1;
  }
  return arr.join("");
}

abstract class Parser {
  abstract validate(): boolean;
  abstract run(): void;

  findColumn(wb: WorkBook, colNames: {[idx: string]: boolean}): [boolean, ColumDesc] {
    let wbSheets = wb.SheetNames;
    let columns: ColumDesc = {};
    for (let wsPtr = 0; wsPtr < wbSheets.length; wsPtr++) {
      let ws = wb.Sheets[wbSheets[wsPtr]];
      let cols = ws['!cols'];
      for (let colPtr = 0; colPtr < cols.length; colPtr++) {
        let cell = ws[('A' + colPtr) + "1"]
        if (cell.t == 't' && colNames[cell.V]) {
          columns[cell.V] = [ws, toColumnIndex(colPtr)];
        }
      }
    }
    return [Object.keys(columns).length == Object.keys(colNames).length,
      columns];
  }
}

class YieldParser extends Parser{


  validate(): boolean {
    return false;
  }

  constructor(public yieldJob: YieldJob) {
    super();
  }

  run(): void {
    let valRes = this.validate();
    let file = XLSX.readFile(this.yieldJob.fileName);
    let colNamesObj = this.yieldJob.columnMapping.
  }
}

export {YieldJob, Parser, YieldParser};
