import {Yield} from '../../models/outcomes/yield.model';
import {OutcomeParser} from '../paper.parser';

interface YieldJob {
  importID: string;
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

class YieldParser extends OutcomeParser {
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
  get importID() { return this.yieldJob.importID }

  get model() { return Yield};
}

function getParser(): OutcomeParser {
  return <any>YieldParser;
}

export {getParser, YieldJob, YieldParser };

