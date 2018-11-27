import { IStudyDocument, Study } from '../models/studies.model';
import { IYieldDocument, Yield } from '../models/yield.model';
import { app, db } from '../../server';
import {GeoPoint} from '../models/geopoint.model';
const XLSX = require('xlsx');

interface YieldJob {
  studyDef: IStudyDocument;
  fileName: string;
  columnMapping: {
    coords: string,
    effectSize: string
    sampleSize: string,
  };
}

function add (yieldJob: YieldJob) {
  XLSX.readFile(yieldJob)
}


export {YieldJob}
