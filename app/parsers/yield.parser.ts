import { IStudyDocument, Study } from '../models/studies.model';
import { IYieldDocument, Yield } from '../models/yield.model';
import { app, db } from '../../server';
import {GeoPoint} from '../models/geopoint.model';
import {Parser, ParseJob, ColumDesc} from './paper.parser'
import {ExcelDataType, WorkBook, WorkSheet} from 'xlsx';
import { parseRef } from '../util/excel.helpers';
const XLSX = require('xlsx');

interface YieldJob extends ParseJob {
  studyDef: IStudyDocument;
  fileName: string;
  columnMapping: {
    xCoords: string,
    yCoords: string,
    effectSize: string,
    sampleSize: string,
    [key: string]: string,
  };
}

// interface IYieldDocument extends mongoose.Document {
//   coords: GeoPoint;
//   effectSize: number;
//   sampleSize: number;
//   studyID: string;
// }

class YieldParser extends Parser {

  constructor(public yieldJob: YieldJob) {
    super();
  }

  prepareRows(ws: WorkSheet, colInfo: ColumDesc) : Array<IYieldDocument> {
    let [numCols, numRows] = parseRef(ws["!ref"]);
    let colInfoKeys = Object.keys(colInfo);
    let rows = [];
    for(let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
      let newData = {
        coords: new GeoPoint([ws[colInfo.xCoords + rowIdx].v, 
          ws[colInfo.yCoords + rowIdx].v]),
        effectSize: ws[colInfo.effectSize + rowIdx].v,
        sampleSize: ws[colInfo.sampleSize + rowIdx].v,
        studyID: this.yieldJob.studyDef.id
      }
      let newRow = new Yield(newData)
      rows.push(newRow);
    }
    return rows;
  }

  async run(): Promise<boolean> {
    let wb: WorkBook = XLSX.readFile(this.yieldJob.fileName);
    let [found, ws, cols] = this.findColumns(wb, this.yieldJob.columnMapping);
    if (!found) {
      console.log("Couldn't find all cols, aborting!");
      return false;
    }
    
    let rows = this.prepareRows(ws, cols);
    
    return Promise.all(rows.map(r => {
      return r.save()
    })).then(() => true, () => false)
  }
}

export {YieldJob, YieldParser};
