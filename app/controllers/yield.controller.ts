import * as restify from 'restify';
import { IYieldDocument, Yield } from '../models/yield.model';
import { GeoPoint } from '../models/geopoint.model';

/**
 * Search for a yield study by id, and append it to req.params if successful.
 * @returns {Array<IYieldDocument>}
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  Yield.findByStudy(req.params.studyId, getPolygon(req)).then((doc) => {
    req.params.docs = doc;
    return next();
  }).catch((err) => {
    next(err);
  });
}

function getPolygon(req: restify.Request): number[][] {
  const area: string = req.params.area;
  if (!area) {
    return [];
  }
  const points = area.split(',').map(num => parseFloat(num));
  if (points.length < 6 || points.length % 2) {
    return [];
  }
  let corners: number[][] = [];
  for (let i = 0; i < points.length; i += 2) {
    corners.push([points[i], points[i + 1]]);
  }
  corners.push(corners[0]);
  return corners;
}

/**
 * Get a yield study.
 * @returns {IYieldDocument}
 */
function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  res.json(200, req.params.docs);
}

/**
 * Create a new entry in yield table, mostly for testing purposes. You should
 * use @{addStudy}, which is bulk adding
 * @property {GeoPoint} req.params.coords - geojson point
 * @property {number} req.params.effectSize - floating-point of the effect size
 * @property {number} req.params.sampleSize - the size of the sample for the given geopoint
 * @property {string} req.params.studyID - key of the study in study table
 * @returns {IYieldDocument}
 */
function create(req: restify.Request, res: restify.Response, next: restify.Next) {
  const yieldEntry: IYieldDocument = new Yield({
    coords: req.params.coords,
    effectSize: req.params.effectSize,
    sampleSize: req.params.sampleSize,
    studyID: req.params.studyID,
  });

  return yieldEntry
    .save()
    .then((savedEntry: IYieldDocument) => {
      res.json(200, savedEntry);
      return next();
    })
    .catch((err: any) => next(err));
}


/**
 * Delete a whole study given an id
 * @returns {number} the number of records deleted
 */
function remove(req: restify.Request, res: restify.Response, next: restify.Next) {
  const rowsToRemove = req.params.docs;

  const promises = rowsToRemove.map((row: IYieldDocument) => {
    return row.remove();
  });
  return Promise.all(promises).then((results: any[]) => {
    res.json(200, results.length);
    next();
  }).catch((r) => {
    next(r);
  });
}

export { get, create, remove, load };
