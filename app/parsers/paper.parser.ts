import { WorkBook, WorkSheet} from 'xlsx';
import { indexToColumn } from '../util/excel.helpers.util';
const XLSX = require('xlsx');

interface ParseJob {
}

interface ColumDesc {
    // column that contains as first entry the key of object
    [colName: string]: string;
  }
  

function invertKeyValue(obj: {[idx: string]: string}) : {[idx: string]: string} {
    return Object.keys(obj).reduce((acc: any, key) => {
        acc[obj[key]] = key;
        return acc;
    }, {});
}

abstract class Parser {

  abstract async run(): Promise<number>;

  findColumns(wb: WorkBook, colMap: {[key: string]: string}): [boolean, WorkSheet, ColumDesc] {
    let wbSheets = wb.SheetNames;
    let columns: ColumDesc = {};
    let colNames = invertKeyValue(colMap);
    let foundWorksheet = false;
    let wsPtr = 0;
    for (; wsPtr < wbSheets.length; wsPtr++) {
      let ws = wb.Sheets[wbSheets[wsPtr]];
      for (let colPtr = 0; ws[indexToColumn(colPtr) + "1"] !== undefined; colPtr++) {
        let cell = ws[indexToColumn(colPtr) + "1"]
        if (cell.t == 's' && colNames[cell.v] !== undefined) {
          foundWorksheet = true;
          columns[colNames[cell.v]] = indexToColumn(colPtr);
        }
      }
      if (foundWorksheet) break;
    }
    return [Object.keys(columns).length == Object.keys(colNames).length,
      wb.Sheets[wbSheets[wsPtr]],
      columns];
  }
}

export {Parser, ParseJob, ColumDesc}
