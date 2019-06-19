import { IOutcomeTableRow } from "../models/table.model";
import { logger } from "../../utils/logger";

export enum AGGREGATION_OPT {
  AVG, SUM
}
export const AGGREGATION_STR = ["$avg", "$sum"]
export const CAPTION_OPT = ["avg", "sum"];

export class AggregateCalculator {
  constructor(private opt: AGGREGATION_OPT[]) {}
  
  private buildProject() {
    return {
      "effectSize": 1,
      "sampleSize": 1,
      "value": { $multiply: ["$effectSize", "$sampleSize"]}
    }
  }

  buildGroup() {
    let group = { 
      "_id": "result",
      "count": { $sum: "$sampleSize"},
      "total": { $sum: "$value"}
    };
    return group;
  }

  build() {
    let opts = [
      { "$project": this.buildProject() },
      { "$group": this.buildGroup() }
    ];
    logger.info("Aggregating with: ", opts);
    return opts;
  }

  get(queryAnswer: any[]): number[] {
    let row = queryAnswer[0];
    return this.opt.map(v => {
      switch(v) {
        case AGGREGATION_OPT.AVG:
          return row.total / row.count;
        case AGGREGATION_OPT.SUM:
          return row.total;
      }
      return 0;
    })
  }
}
