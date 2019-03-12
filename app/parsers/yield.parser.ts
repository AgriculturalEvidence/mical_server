import {IStudyDocument} from '../models/studies.model';
import {IYieldDocument, Yield} from '../models/yield.model';
import {ColumDesc, ParseJob, Parser} from './paper.parser';
import {WorkBook, WorkSheet} from 'xlsx';
import {parseRef} from '../util/excel.helpers.util';
import {Intervention} from '../models/intervention.model';
import {logger} from '../../utils/logger';

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
    console.log(colInfo);

    for(let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
      let m = ws[colInfo.interventionType + rowIdx];
      if (!m) {
        console.log("Cell: " + colInfo.interventionType + rowIdx + "is empty!");
        continue;
      }
      let newRowPromise = Intervention.findByStringKey(ws[colInfo.interventionType + rowIdx].v).then(interventionRow => {
        let x = ws[colInfo.xCoords + rowIdx];
        let y = ws[colInfo.yCoords + rowIdx];
        let effS = ws[colInfo.effectSize + rowIdx];
        let samS = ws[colInfo.sampleSize + rowIdx];
        let studID = ws[colInfo.studyId + rowIdx];

        if (!x) logger.info("Dropping row due to x");
        if (!y) logger.info("Dropping row due to y");
        if (!effS) logger.info("Dropping row due to effs");
        if (!samS) logger.info("Dropping row due to sams");
        if (!studID) logger.info("Dropping row due to studyid");

        let retv =  {
          coords: {
            type: 'Point',
            coordinates: [x.v, y.v],
          },
          effectSize: effS.v,
          sampleSize: samS.v,
          studyID: this.yieldJob.studyDef.id + "_" + studID.v,
          interventionType: interventionRow.key
        };
        return new Promise((d) => d(retv));
      }).catch((err) => {
        logger.error("Cannot find intervention type for row, ", err);
        return null;
      }).then((row) => {
        if(validRow(row)) return {success:true, r: row};
        else return {success:false, r: row}
      });
      rowPromises.push(newRowPromise);
    }
    return Promise.all(rowPromises).then((rows) => {
      return rows.filter(v => v.success).map(v => v.r);
    });
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
      console.log(e.stack);
      return Promise.reject("Error handling file: " + JSON.stringify(e));
    }
  }
}

export {YieldJob, YieldParser};
