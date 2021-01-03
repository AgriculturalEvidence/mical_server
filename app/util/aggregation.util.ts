import { logger } from '../../utils/logger';

export enum AGGREGATION_OPT {
  AVG, COUNT
}
export const CAPTION_OPT = ['avg', 'count'];

export class AggregateCalculator {
  constructor(private opt: AGGREGATION_OPT[]) {}

  private buildProject() {
    return {
      'effectSize': 1,
      'sampleSize': 1,
      'value': { $multiply: ['$effectSize', '$sampleSize'] }
    };
  }

  private buildGroup() {
    let group = {
      '_id': 'result',
      'count': { $sum: '$sampleSize' },
      'total': { $sum: '$value' }
    };
    return group;
  }

  public build() {
    let opts = [
      { '$project': this.buildProject() },
      { '$group': this.buildGroup() }
    ];
    logger.info('Aggregating with: ', opts);
    return opts;
  }

  public get(queryAnswer: any[]): number[] {
    let row = queryAnswer[0];
    try {
      return this.opt.map(v => {
        switch (v) {
          case AGGREGATION_OPT.AVG:
            return row.total / row.count;
          case AGGREGATION_OPT.COUNT:
            return row.count;
        }
        return 0;
      });
    } catch (e) {
      throw 'histogram is empty'
    }

  }
}
