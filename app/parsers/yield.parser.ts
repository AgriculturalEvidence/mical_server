import { WorkBook, WorkSheet } from 'xlsx';
import { logger } from '../../utils/logger';
import { Intervention } from '../models/intervention.model';
import { IStudyDocument } from '../models/studies.model';
import { IYieldRow, Yield } from '../models/yield.model';
import { parseRef } from '../util/excel.helpers.util';
import { ColumDesc, ParseJob, Parser, PaperParser } from './paper.parser';

const XLSX = require('xlsx');

interface YieldJob {
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

class YieldParser extends PaperParser {
  constructor(public yieldJob: YieldJob) {
    super({
      fileName: yieldJob.fileName,
      colMapping: {
        ...yieldJob.columnMapping, 
        filterCols: <any> undefined, 
        infoCols: <any> undefined
      }
    });
  }

  get filterCols() {return this.yieldJob.columnMapping.filterCols};
  // todo vpineda
  get infoCols() {return {}};


  // todo vpineda
  get importID() { return "yield";}
  get model() { return Yield};
}

export { YieldJob, YieldParser };

