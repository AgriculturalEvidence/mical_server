import * as restify from 'restify';
import { logger } from '../../utils/logger';
import { query, getCoordsPolygon, getQueryFilters, IOutcomeTableDocument } from '../models/table.model';
// @ts-ignore
import * as science from 'science';
import { ErrorCode, format } from '../util/errorcodes.info';
import { isNumber } from 'util';


/**
 * Builds the histogram points
 * @param req.params.docs the result of the table query that we want to "histogramizar"
 * @param req.params.ticks integer describing how many ticks should we use for the histogram, must be > 1
 * @param req.params.samplePts integer describing how many sample points you want to multiplex wrt ticks
 */
function build(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('build histogram');
  let ticks = parseInt(req.params.ticks), samplePts = parseInt(req.params.samplePts);
  let aTicks: number[], hist: number[];
  group(req.params.docs, ticks)
    .then((values) => {
      [aTicks, hist] = values;
      return sampleDistribution(aTicks, hist, samplePts);
    }).then((distPts) => {
      res.json(200, {
        ticks: aTicks,
        hist: hist,
        distPts: distPts,
      });
    }).catch(err => {
      logger.error("Histogram build: ", err);
      res.json(format(err).status, format(err).msg);
    })
}

async function group(rows: IOutcomeTableDocument[], ticks: number): Promise<[number[], number[]]> {
  if (ticks < 2 || isNaN(ticks)) {
    return Promise.reject({
      code: ErrorCode.INVALID_NUMBER_OF_TICKS
    })
  }
  let max = -Infinity, min = Infinity;
  rows.forEach(r => {
    let efS = r.get("effectSize", Number);
    max = Math.max(max, efS);
    min = Math.min(min, efS);
  });

  // create ticks
  let aTicks: number[] = [];
  for (let i = 0; i < ticks; i++) {
    aTicks.push(min + (max/(ticks - 1))*i)
  }

  // create aggregate count
  let buckets = Array(aTicks.length).fill(0);
  rows.forEach(r => {
    let efs = r.get("effectSize", Number);
    // get idx of the tick that we want to jump to
    let tick = Math.floor((efs - min) * (ticks - 1) / max);
    buckets[tick]++;
  });

  // normalize
  return [aTicks, buckets];
}

async function sampleDistribution(aTicks: number[], buckets : number[], samplePts: number): Promise<[number, number]> {
  if (samplePts < 1 || isNaN(samplePts)) {
    return Promise.reject({
      code: ErrorCode.INVALID_NUMBER_OF_SAMPLE_PTS
    })
  }
  // build kernel
  let kde = science.stats.kde().sample(buckets);
  let pts = Array(aTicks.length * samplePts);
  // sample pts
  let step = (aTicks[1] - aTicks[0]) / samplePts;
  for (let i = 0; i < aTicks.length; i++) {
    let start = aTicks[i];
    for(let j = 0; j < samplePts; j ++) {
      pts[i*samplePts + j] = start + j*step;
    }
  }
  return kde(pts);
}


export { build }
