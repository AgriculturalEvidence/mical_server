import { IStudyDocument, Study } from '../models/studies.model';
import { IYieldDocument, Yield } from '../models/yield.model';
import {GeoPoint} from '../models/geopoint.model';
import {Parser, ParseJob, ColumDesc} from './paper.parser'
import {ExcelDataType, WorkBook, WorkSheet} from 'xlsx';
import { parseRef } from '../util/excel.helpers';
import { Intervention } from '../models/intervention.model';
import { logger } from '../../utils/logger';
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
    interventionType: string
    [key: string]: string,
  };
}

function validRow(newData: any) {
  if (newData === null) {
    return false;
  }
  if (!newData.coords.coordinates.every(
    (v: any) => typeof v == 'number')) {
    logger.info("Dropping: " + JSON.stringify(newData));
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

class YieldParser extends Parser {

  constructor(public yieldJob: YieldJob) {
    super();
  }

  prepareRows(ws: WorkSheet, colInfo: ColumDesc) : Promise<IYieldDocument[]> {
    let [_, numRows] = parseRef(ws["!ref"]);
    let rowPromises = [];

    for(let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
      let newRowPromise = Intervention.findByStringKey(ws[colInfo.interventionType + rowIdx].v).then(interventionRow => {
        return {
          coords: {
            type: 'Point',
            coordinates: [ws[colInfo.xCoords + rowIdx].v, 
            ws[colInfo.yCoords + rowIdx].v],
          },
          effectSize: ws[colInfo.effectSize + rowIdx].v,
          sampleSize: ws[colInfo.sampleSize + rowIdx].v,
          studyID: this.yieldJob.studyDef.id + "_" + ws[colInfo.studyId + rowIdx].v,
          interventionType: interventionRow.key
        };
      }).catch((err) => {
        logger.error("Cannot find intervention type for row, ", err);
        return null;
      }).then((row) => {
        if(validRow(row)) return {success:true, r: row};
        else return {success:false, r: row}
      });
      rowPromises.push(newRowPromise);
    }
    let rows = Promise.all(rowPromises).then((rows) => {
      return rows.filter(v => v.success).map(v => v.r);
    });
    return rows;
  }

  async run(): Promise<number> {
    try {
      let wb: WorkBook = XLSX.readFile(this.yieldJob.fileName);
      let [found, ws, cols] = this.findColumns(wb, this.yieldJob.columnMapping);
      if (!found) {
        logger.error("Couldn't find all cols, aborting!");
        return 0;
      }
      let rows = this.prepareRows(ws, cols);
      return rows.then(rs =>
        Promise.all(rs.map(r => new Yield(r).save()))
      ).then((rows) => rows.length)
    } catch (e) {
      return Promise.reject("Error handling file: " + JSON.stringify(e));
    }
  }
}

export {YieldJob, YieldParser};
