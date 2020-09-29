import { WorkSheet } from 'xlsx';
import { Intervention } from '../models/intervention.model';
import { ColumDesc, Parser } from './paper.parser';

const XLSX = require('xlsx');

interface InterventionJob {
  fileName: string;
  columnMapping: {
    key: string,
    sKey: string,
    title: string,
    desc: string,
    denom: string,
    numerator: string
    // xAxisLabel: string,
    // [key: string]: string,
  };
}

class InterventionParser extends Parser {

  constructor(public interventionJob: InterventionJob) {
    super({
      fileName: interventionJob.fileName,
      colMapping: interventionJob.columnMapping,
    });
  }

  protected get extraCols() { return {}; }
  protected get model() { return Intervention; }

  public async prepareRow(ws: WorkSheet, colInfo: ColumDesc, rowIdx: number): Promise<Object> {
    return {
      key: ws[colInfo.key + rowIdx].v,
      sKey: ws[colInfo.sKey + rowIdx].v,
      title: ws[colInfo.title + rowIdx].v,
      desc: ws[colInfo.desc + rowIdx].v,
      denom: ws[colInfo.denom + rowIdx].v,
      numerator: ws[colInfo.numerator + rowIdx].v,
      // xAxisLabel: ws[colInfo.xAxisLabel + rowIdx].v
    };
  }

  public validRow(newData: any) {
    if (newData === null) {
      return false;
    }
    if (isNaN(newData.key) || typeof newData.key !== 'number') {
      return false;
    }
    if (typeof newData.sKey !== 'string') {
      return false;
    }

    if (typeof newData.title !== 'string') {
      return false;
    }

    return (typeof newData.denom === 'string') && (typeof newData.numerator === 'string');
  }
}

export { InterventionJob, InterventionParser };

