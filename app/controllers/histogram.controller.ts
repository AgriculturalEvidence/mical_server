import * as restify from 'restify';
import {logger} from '../../utils/logger';
import {IOutcomeTableDocument} from '../models/table.model';
import {ServerConstants} from '../util/constants.util';
// @ts-ignore
import * as science from 'science';
import {ErrorCode, format} from '../util/errorcodes.info';
import {Series, SeriesEntry} from '../util/typedef.util';
import {Intervention} from '../models/intervention.model';

/**
 * Builds the histogram points
 * @param req.params.docs the result of the table query that we want to "histogramizar"
 * @param req.params.ticks integer describing how many ticks should we use for the histogram, must be > 1
 * @param req.params.samplePts integer describing how many sample points you want to multiplex wrt ticks
 * @param req.params.int the intervention type, otherwise we return default histogram
 */
function build(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('build histogram');
  let ticks = parseInt(req.params.ticks), samplePts = parseInt(req.params.samplePts);
  let interventionKey = parseInt(req.params.int);
  buildSeries(ticks, samplePts, req.params.docs, interventionKey).then((s) => {
    res.json(200, s);
  }).catch(err => {
    logger.error("Histogram build: ", err);
    res.json(format(err).status, format(err).msg);
  })
}

async function buildSeries(ticks: number,
                           samplePts: number,
                           docs: IOutcomeTableDocument[],
                           interventionKey?: number): Promise<Series> {
  let sMetaPromise = getSeriesMetadata(interventionKey);

  let [aTicks, hist, nHist] = await group(docs, ticks);
  let distPts = await sampleDistribution(aTicks, hist, samplePts);

  let series: Series = await sMetaPromise;
  series.ticks = aTicks;
  series.bar = nHist;
  series.dist = distPts;
  return series;
}

/**
 * Groups all of the data points and stores the sample size so the histogram
 * is on the sample size rather than the number of entries we find
 * @returns first array contains the ticks used to calculate the buckets
 *          second array contains the values at each bucket delimited by ticks
 */

async function group(rows: IOutcomeTableDocument[], ticks: number): Promise<[number[], number[], SeriesEntry]> {
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
  let sum = 0;
  rows.forEach(r => {
    let efs = r.get("effectSize", Number);
    let saSize = r.get("sampleSize", Number);
    // get idx of the tick that we want to jump to
    let tick = Math.floor((efs - min) * (ticks - 1) / max);
    buckets[tick] +=  saSize;
    sum += saSize;
  });

  let getloc = (idx: number) => {
    if (idx == 0) return min;
    if (idx == buckets.length - 1) return max;
    return (aTicks[idx + 1] - aTicks[idx - 1]) / 2 ;
  };
  // normalize
  let nBuckets = buckets.map((v, idx) => <[number, number]>[getloc(idx) , v/sum]);

  return [aTicks, buckets, nBuckets];
}

/**
 * Samples the distribution at sample points at each bucket
 * @param aTicks the ticks that generated the histogram
 * @param buckets values of the histogram
 * @param samplePts number of samples per bucket
 */
async function sampleDistribution(aTicks: number[], buckets : number[], samplePts: number): Promise<[number, number][]> {
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

/**
 * Queries the given intervention and returns its series info
 * @param key intervention table key that we are looking for
 */
async function getSeriesMetadata(key: number): Promise<Series> {
  try {
    let interventionEntry = await Intervention.findByKey(key);
    return {
      labels: {
        denom: interventionEntry.denom,
        numerator: interventionEntry.numerator,
      },
      title: interventionEntry.title,
      bar: [], dist: [], ticks: [],
    }
  } catch (e) {
    return {
      labels: {
        denom: ServerConstants.DEFAULT_LESS_EFFECT,
        numerator: ServerConstants.DEFAULT_MORE_EFFECT,
      },
      title: ServerConstants.DEFAULT_HISTOGRAM_TITLE,
      bar: [], dist: [], ticks: [],
    }
  }
}


export { build }
