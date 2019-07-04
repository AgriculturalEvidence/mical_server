import * as restify from 'restify';
import { logger } from '../../utils/logger';
import { Intervention } from '../models/intervention.model';
import { aggregate, getCoordsPolygon, getQueryFilters } from '../models/table.model';
import { AggregateCalculator, AGGREGATION_OPT, CAPTION_OPT } from '../util/aggregation.util';
import { ServerConstants } from '../util/constants.util';
import { ErrorCode, format } from '../util/errorcodes.info';
import { IOutcomeTableRow, Series, SeriesEntry } from '../util/typedef.util';

/**
 * Adds the necessary fields to the given query
 */
function prepare(req: restify.Request, res: restify.Response, next: restify.Next) {
  req.params.cols = 'effectSize,sampleSize';
  next();
}

/**
 * Builds the histogram points
 * @param req.params.docs the result of the table query that we want to measure
 * @param req.params.ticks integer describing how many ticks should we use for the
 *        histogram, must be > 1
 * @param req.params.samplePts integer describing how many sample points you want
 *        to multiplex wrt ticks
 * @param req.params.int the intervention type, otherwise we return default histogram
 */
function build(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('Building histogram....');
  let ticks = parseInt(req.params.ticks), samplePts = parseInt(req.params.samplePts);
  let interventionKey = parseInt(req.params.int);
  let sMetaPromise = getSeriesMetadata(interventionKey);
  let sCaptionPromise = processCaption(sMetaPromise, req);
  buildSeries(ticks, samplePts, req.params.docs, sMetaPromise).then(async (s) => {
    s.desc = await sCaptionPromise;
    res.json(200, s);
  }).catch(err => {
    logger.error('Histogram build: ', err);
    res.json(format(err).status, format(err).msg);
  });
}

async function buildSeries(ticks: number,
                           samplePts: number,
                           docs: IOutcomeTableRow[],
                           sMetaPromise: Promise<Series>): Promise<Series> {

  let [aTicks, nHist] = await group(docs, ticks);
  let distPts = await sampleDistribution(aTicks, docs, samplePts);

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

async function group(rows: IOutcomeTableRow[], ticks: number): Promise<[number[], SeriesEntry]> {
  if (ticks < 2 || isNaN(ticks)) {
    return Promise.reject({
      code: ErrorCode.INVALID_NUMBER_OF_TICKS
    });
  }
  let max = -Infinity, min = Infinity;
  rows.forEach(r => {
    let efS = r['effectSize'];
    max = Math.max(max, efS);
    min = Math.min(min, efS);
  });

  if (max === min) max += 1;

  // make the graph "symetric"
  if (Math.abs(min) > Math.abs(max)) {
    max = Math.abs(min);
  } else {
    min = - Math.abs(max);
  }

  // create ticks
  let aTicks: number[] = [];
  for (let i = 0; i < ticks; i++) {
    aTicks.push(min + ((max - min) / (ticks - 1)) * i);
  }

  // create aggregate count
  let buckets = Array(aTicks.length).fill(0.0);
  let sum = 0;
  rows.forEach(r => {
    let efs = r['effectSize'];
    let saSize = r['sampleSize'];
    // get idx of the tick that we want to jump to
    let tick = Math.floor((efs - min) * (ticks - 1) / (max - min));
    if (tick >= buckets.length) return;
    buckets[tick] += saSize;
    sum += saSize;
  });

  if (sum === 0) sum = 1;

  let getloc = (idx: number) => {
    if (idx === 0) return min;
    if (idx === buckets.length - 1) return max;
    return aTicks[idx] ;
  };
  // normalize
  let nBuckets = buckets.map((v, idx) => <[number, number]>[getloc(idx) , v / sum]);

  return [aTicks, nBuckets];
}

function epanechnikovKde(sample: IOutcomeTableRow[]) {
  /* Epanechnikov kernel */
  function epanechnikov(u: number) {
    return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
  }

  let kernel = epanechnikov;
  let sum = sample.reduce((acc, r) => acc + r['sampleSize'], 0);
  return {
    scale: function(h: number) {
      kernel = function (u) { return epanechnikov(u / h) / h; };
      return this;
    },

    points: function(points: number[]) {
      return points.map(function(x) {
        let y = sample.reduce(function (acc, r) {
          let efs = r['effectSize'];
          let saSize = r['sampleSize'];
          return acc + kernel(x - efs) * saSize;
        }, 0) / sum;
        return [x, y];
      });
    }
  };
}

/**
 * Samples the distribution at sample points at each bucket
 * @param aTicks the ticks that generated the histogram
 * @param rows query rows
 * @param samplePts number of samples per bucket
 */
async function sampleDistribution(aTicks: number[],
                                  rows: IOutcomeTableRow[],
                                  samplePts: number): Promise<[number, number][]> {
  if (samplePts < 1 || isNaN(samplePts)) {
    return Promise.reject({
      code: ErrorCode.INVALID_NUMBER_OF_SAMPLE_PTS
    });
  }
  // build kernel
  let kde = epanechnikovKde(rows);
  let offsetPts = samplePts;
  let pts = Array((aTicks.length + 2) * samplePts);

  let step = (aTicks[1] - aTicks[0]) / samplePts;
  // offset pts
  for (let i = 0; i < offsetPts; i++) {
    pts[i] = aTicks[0] - (step * (offsetPts - i)) / 2;
  }

  // sample pts
  for (let i = 0; i < aTicks.length; i++) {
    let start = aTicks[i];
    for (let j = 0; j < samplePts; j ++) {
      pts[i * samplePts + j + offsetPts] = start + j * step;
    }
  }

  // offset pts
  for (let i = 0; i < offsetPts; i++) {
    pts[i + (aTicks.length + 1) * samplePts] = aTicks[aTicks.length - 1] - (step * i) / 2;
  }

  // @look at Scott, D. W. (1992) Multivariate Density Estimation: Theory, Practice, and
  // Visualization. Wiley.
  // let dist1 =  kde.bandwidth(science.stats.bandwidth.nrd)(pts);

  // if (dist1[0] !== undefined && !isNaN(dist1[0][1])) {
  //   return dist1;
  // }

  // sometimes that distribution doesnt work, if the third and first quartiles are the same
  // if we fail try the fallback, not as good but should do the trick
  // @lookat  Silverman, B. W. (1986) Density Estimation. London: Chapman and Hall.

  return <any> kde.points(pts);
}

async function processCaption(seriesInfo: Promise<Series>, req: restify.Request): Promise<string> {
  let { desc } = await seriesInfo;
  let token = desc.split(' ');
  let tIdxs: number[] = [];
  let reqCapts = CAPTION_OPT.map((c, idx) => {
    let tIdx = -1;
    let valid = token.some(t => {
      tIdx++;
      return (('${' + c + '}') === t);
    });
    if (valid) tIdxs.push(tIdx);
    return valid ? idx : -1;
  }).filter(i => i !== -1);
  if (reqCapts.length === 0) return token.join(' ');

  let ac = new AggregateCalculator(reqCapts);
  let aggAns = await aggregate(req.params.table,
    ac, getCoordsPolygon(req.params.area),
    getQueryFilters(req.params.f, req.params.int));
  let calculated = ac.get(aggAns);

  tIdxs.forEach((tIdx, idx) => {
    let addPercent = reqCapts[idx] === AGGREGATION_OPT.AVG;
    if (addPercent) calculated[idx] *= 100;
    token[tIdx] = calculated[idx].toPrecision(3) + (addPercent ? '%' : '');
    let possibleAppend = (tIdx + 1 < token.length) ? token[tIdx + 1].match(/^%{(.*)}$/) : null;
    if (possibleAppend != null) {
      let opts = possibleAppend[1].split('|');
      token[tIdx + 1] = calculated[idx] > 0 ? opts[1] : opts[0];
    }
  });

  return token.join(' ');
}

/**
 * Queries the given intervention and returns its series info
 * @param key intervention table key that we are looking for
 */
async function getSeriesMetadata(key: number): Promise<Series> {
  try {
    let interventionEntry: any = await new Promise((a, r) => {
      Intervention.findByKey(key).then(v => a(v), v => r(v));
    });
    return {
      labels: {
        denom: interventionEntry.denom,
        numerator: interventionEntry.numerator,
      },
      title: interventionEntry.title,
      bar: [], dist: [], ticks: [],
      desc: interventionEntry.desc,
    };
  } catch (e) {
    return {
      labels: {
        denom: ServerConstants.DEFAULT_LESS_EFFECT,
        numerator: ServerConstants.DEFAULT_MORE_EFFECT,
      },
      title: ServerConstants.DEFAULT_HISTOGRAM_TITLE,
      bar: [], dist: [], ticks: [],
      desc: '',
    };
  }
}


export { prepare, build };

