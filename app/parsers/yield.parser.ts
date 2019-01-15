import { IStudyDocument, Study } from '../models/studies.model';
import { IYieldDocument, Yield } from '../models/yield.model';
import { app, db } from '../../server';
import {GeoPoint} from '../models/geopoint.model';
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

interface Parser {
  validate(): boolean;
  run(): void;
}

class YieldParser implements Parser{


  validate(): boolean {
    return false;
  }

  constructor(public yieldJob: YieldJob) {

  }

  run(): void {
    let valRes = this.validate();
    XLSX.readFile(this.yieldJob.fileName).SheetNames.forEach( (n : any) => console.log(n));
  }
}

export {YieldJob, Parser, YieldParser};
