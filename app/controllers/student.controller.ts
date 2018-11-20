import * as restify from 'restify';
import * as mongoose from 'mongoose';
import { Yield, IYieldDocument } from '../models/yield.model';
import { logger } from '../../utils/logger';

/**
 * Search for a student by username, and append it to req.params if successful.
 * @returns {IYieldDocument}
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  next();
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
 * Create a new student from a username, and return it.
 * @property {string} req.params.username - the GitHub username of the student
 * @returns {IYieldDocument}
 */
function create(req: restify.Request, res: restify.Response, next: restify.Next) {
  const student: IYieldDocument = new Yield({
    username: req.params.username,
  });

  return student
    .save()
    .then((savedStudent: IYieldDocument) => {
      res.json(200, savedStudent);
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
