import {ColumDesc, ParseJob, Parser} from './paper.parser';
import {WorkBook, WorkSheet} from 'xlsx';
import {parseRef} from '../util/excel.helpers';
import {IInterventionDocument, Intervention} from '../models/intervention.model';
import {logger} from '../../utils/logger';

const XLSX = require('xlsx');

interface InterventionJob extends ParseJob {
  fileName: string;
  columnMapping: {
    key: string,
    sKey: string,
    title: string,
    desc: string,
    denom: string,
    numerator: string
    [key: string]: string,
  };
}

function validRow(newData: any) {
  if (newData === null) {
    return false;
  }
  if (isNaN(newData.key) ||  typeof newData.key !== 'number') {
    return false;
  }
  if (typeof newData.sKey !== 'string') {
    return false;
  }

  if (typeof newData.title !== 'string') {
    return false;
  }

  return typeof newData.denom === 'string' && typeof newData.numerator === 'string';
}

class InterventionParser extends Parser {

  constructor(public interventionJob: InterventionJob) {
    super();
  }

  prepareRows(ws: WorkSheet, colInfo: ColumDesc) : IInterventionDocument[] {
    let [_, numRows] = parseRef(ws["!ref"]);
    let rows = [];

    for(let rowIdx = 2; rowIdx <= numRows; rowIdx ++) {
        let row =  {
          key: ws[colInfo.key + rowIdx].v,
          sKey: ws[colInfo.sKey + rowIdx].v,
          title: ws[colInfo.title + rowIdx].v,
          desc: ws[colInfo.desc + rowIdx].v,
          denom: ws[colInfo.denom + rowIdx].v,
          numerator: ws[colInfo.numerator + rowIdx].v,
        };

        if(!validRow(row)) {
          logger.info("Dropping row " + row);
        } else {
          rows.push(new Intervention(row));
        }
    }
    return rows;
  }

  async run(): Promise<number> {
    try {
      let wb: WorkBook = XLSX.readFile(this.interventionJob.fileName);
      let [found, ws, cols] = this.findColumns(wb, this.interventionJob.columnMapping);
      if (!found) {
        logger.error("Couldn't find all cols, aborting!");
        return 0;
      }
      let rows = this.prepareRows(ws, cols);
      return Promise.all(rows.map(function (r) {
        return r.save();
      })).then((rows) => rows.length).catch(e => {
        console.log("error!");
        return 0;
      });
    } catch (e) {
      logger.error(JSON.stringify(e));
      return Promise.reject("Error handling file");
    }
  }
}

export {InterventionJob, InterventionParser};
