import { WorkBook, WorkSheet } from 'xlsx';
import { logger } from '../../utils/logger';
import { Intervention } from '../models/intervention.model';
import { IStudyDocument } from '../models/studies.model';
import { IYieldRow, Yield } from '../models/yield.model';
import { parseRef } from '../util/excel.helpers.util';
import { ColumDesc, ParseJob, Parser } from './paper.parser';

const XLSX = require('xlsx');

interface YieldJob extends ParseJob {
  studyDef: IStudyDocument;
  fileName: string;
  columnMapping: {
    xCoords: string,
    yCoords: string,
    effectSize: string,
    sampleSize: string,
    interventionType: string,
    filterCols: {
      [key: string]: string,
    }
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

type F = {
  [s: string] : F | string
};

function flatten(obj: F, acc: {[key: string]: string} = {}) {
  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    if (typeof obj[keys[i]] == 'object') {
      flatten(<F>obj[keys[i]], acc);
    } else {
      acc[keys[i]] = <string>obj[keys[i]];
    }
  }
}

class YieldParser extends Parser {

  constructor(public yieldJob: YieldJob) {
    super();
  }

  prepareRows(ws: WorkSheet, colInfo: ColumDesc) : Promise<IYieldRow[]> {
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

        if (!x) logger.info(`Dropping row ${rowIdx} due to x`);
        if (!y) logger.info(`Dropping row ${rowIdx} due to y`);
        if (!effS) logger.info(`Dropping row ${rowIdx} due to effs`);
        if (!samS) logger.info(`Dropping row ${rowIdx} due to sams`);

        // parse filter cols
        let filterObj: {[key: string]: string} = {};

        Object.keys(this.yieldJob.columnMapping.filterCols).map(k => {
          if(ws[colInfo[k] + rowIdx] !== undefined)
            filterObj[k] = ws[colInfo[k] + rowIdx].v;
        });

        return {
          coords: {
            type: 'Point',
            coordinates: [x.v, y.v],
          },
          effectSize: effS.v,
          sampleSize: samS.v,
          importID: this.yieldJob.studyDef.id,
          interventionType: interventionRow.key,
          filterCols: filterObj,
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
    return Promise.all(rowPromises).then((rows) => {
      return rows.filter(v => v.success).map(v => v.r);
    });
  }

  async run(): Promise<number> {
    try {
      let wb: WorkBook = XLSX.readFile(this.yieldJob.fileName);
      let arg : {[key: string]: string} = {};
      flatten(this.yieldJob.columnMapping, arg);
      let [found, ws, cols] = this.findColumns(wb, arg);
      if (!found) {
        logger.error("Couldn't find all cols, aborting!");
        return 0;
      }
      let rows = this.prepareRows(ws, cols);
      return rows.then(rows => {
        return new Promise(((resolve, reject) => {
          Yield.collection.insertMany(rows, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
        }));
      }).then((ans: any) => {
        return ans.insertedCount;
      })
    } catch (e) {
      console.log(e.stack);
      return Promise.reject("Error handling file: " + JSON.stringify(e));
    }
  }
}

export { YieldJob, YieldParser };

