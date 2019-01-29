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
    studyId: string,
    [key: string]: string,
  };
}

function validRow(newData: any) {
  if (!newData.coords.coordinates.every(
    (v: any) => typeof v == 'number')) {
    console.log("Dropping: " + JSON.stringify(newData));
    return false;
  }
  if (typeof newData.effectSize !== 'number') {
    return false;
  }

  return typeof newData.sampleSize === 'number';
}

class YieldParser extends Parser {

  constructor(public yieldJob: YieldJob) {
    super();
  }

  prepareRows(ws: WorkSheet, colInfo: ColumDesc) : Array<IYieldDocument> {
    let [_, numRows] = parseRef(ws["!ref"]);
    let rows = [];

    for(let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
      let newData = {
        coords: {
          type: 'Point',
          coordinates: [ws[colInfo.xCoords + rowIdx].v, 
          ws[colInfo.yCoords + rowIdx].v],
        },
        effectSize: ws[colInfo.effectSize + rowIdx].v,
        sampleSize: ws[colInfo.sampleSize + rowIdx].v,
        studyID: this.yieldJob.studyDef.id + "_" + ws[colInfo.studyId + rowIdx].v
      }
      if (validRow(newData)) {
        let newRow = new Yield(newData)
        rows.push(newRow);
      }

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
    return Promise.all(rows.map(r => r.save())).then(() => true)
  }
}

export {YieldJob, YieldParser};
