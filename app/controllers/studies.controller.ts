import * as restify from 'restify';
import { IStudyDocument, Study } from '../models/studies.model';
import { format } from '../util/errorcodes.info';

/**
 * Search for studies of a given type
 * @returns {Array<IStudyDocument>}
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  Study.findByType(req.params.studyType).then((studies) => {
    req.params.studies = studies;
    return next();
  }).catch((err) => {
    res.json(format(err).status, format(err).msg);
  });
}

/**
 * Get a list of studies of a given type.
 * @returns {IStudyDocument}
 */
function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  res.json(200, req.params.studies);
}

/**
 * Create a new entry in Study table, mostly for testing purposes. You should
 * use @{addStudy}, which is bulk adding
 * @property {string} req.params.id - the study id
 * @property {string} req.params.name - the name of the study
 * @property {string} req.params.type - the type of the study (ie yield)
 * @property {EffectSizeScale} req.params.effectScale - effect size.. log ... div etc
 * @property {string} req.params.people? - the people in the study
 * @property {string} req.params.link? - a link to the study
 * @returns {IStudyDocument}
 */
function create(req: restify.Request, res: restify.Response, next: restify.Next) {
  const StudyEntry: IStudyDocument = new Study({
    id: req.params.id,
    name: req.params.name,
    type: req.params.type,
    effectScale: req.params.effectScale,
    people: req.params.people,
    link: req.params.link,
  });

  return StudyEntry
    .save()
    .then((savedEntry: IStudyDocument) => {
      res.json(200, savedEntry);
      return next();
    })
    .catch((err: any) => res.json(format(err).status, format(err).msg));
}


/**
 * Delete a whole study given an id
 * @returns {number} the number of records deleted
 */
function remove(req: restify.Request, res: restify.Response, next: restify.Next) {
  const rowsToRemove = req.params.studies;

  const promises = rowsToRemove.map((row: IStudyDocument) => {
    return row.remove();
  });
  return Promise.all(promises).then((results: any[]) => {
    res.json(200, results.length);
    next();
  }).catch((r) => {
    res.json(format(r).status, format(r).msg);
  });
}

export { get, create, remove, load };

