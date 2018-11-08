import * as restify from 'restify';
import { IYieldDocument, Yield } from '../models/yield.model';
import { GeoPoint } from '../models/geopoint.model';

/**
 * Search for a student by username, and append it to req.params if successful.
 * @returns {IYieldDocument}
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  Yield.findByUsername(req.params.username)
    .then((yieldData: IYieldDocument) => {
      req.params.student = yieldData;
      return next();
    })
    .catch((err: any) => next(err));
}

/**
 * Get a student.
 * @returns {IYieldDocument}
 */
function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  res.json(200, req.params.student);
  return next();
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
    studyID: req.params.studyId,
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
 * Update an existing student, and return it.
 * @property {string} req.params.original - the original username
 * @property {string} req.params.new - the new username
 * @returns {IYieldDocument}
 */
function update(req: restify.Request, res: restify.Response, next: restify.Next) {
  const student = req.params.student;
  student.username = req.params.newUsername;

  return student
    .save()
    .then((updatedStudent: IYieldDocument) => {
      res.json(200, updatedStudent);
      return next();
    })
    .catch((err: any) => next(err));
}

/**
 * Delete a student, and return it. (??)
 * @returns {IYieldDocument}
 */
function remove(req: restify.Request, res: restify.Response, next: restify.Next) {
  const student = req.params.student;

  return student
    .remove()
    .then((deletedStudent: IYieldDocument) => {
      res.json(200, deletedStudent);
      return next();
    })
    .catch((err: any) => next(err));
}

export { get, create, update, remove, load };
