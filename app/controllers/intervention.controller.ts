import * as restify from 'restify';
import { logger } from '../../utils/logger';
import { IInterventionDocument, Intervention } from '../models/intervention.model';
import { format } from '../util/errorcodes.info';

/**
 * Search for a Intervention by id, and append it to req.params if successful.
 * @returns {Array<IInterventionDocument>}
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  let k = parseInt(req.params.key, 10);
  let fn: (a: (number|string)) => Promise<IInterventionDocument> =
    Intervention.findByKey.bind(Intervention);
  if (isNaN(k)) {
    // then is a search on key
    k = req.params.key;
    fn = Intervention.findByStringKey.bind(Intervention);
  }
  fn(k).then((doc) => {
    req.params.docs = doc;
    return next();
  }).catch((err) => {
    logger.error(err);
    res.json(format(err).status, format(err).msg);
  });
}

/**
 * Search for a Intervention by id, and append it to req.params if successful.
 * @returns {Array<IInterventionDocument>}
 */
function loadAll(req: restify.Request, res: restify.Response, next: restify.Next) {
  Intervention.find().then((doc) => {
    req.params.docs = doc;
    return next();
  }).catch((err) => {
    logger.error(err);
    res.json(format(err).status, format(err).msg);
  });
}

/**
 * Get a intervention description.
 * @returns {IInterventionDocument}
 */
function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('Answering response with ', req.params.docs.length, ' rows.');
  res.json(200, req.params.docs);
  next();
}

/**
 * Create a new entry in Intervention table, mostly for testing purposes.
 *   key: number;
  sKey: string;
  title: string;
  desc: string;
  denom: string;
  numerator: string;
 * @property {number} req.params.key - key value of the join
 * @property {string} req.params.sKey - at parsing time we are going to match
 * the intervention types with these strings and assign them a key
 * @property {string} req.params.title - dim title
 * @property {string} req.params.desc - dim description
 * @property {string} req.params.denom - caption when effectSize < 0
 * @property {string} req.params.numerator - caption when effectSize >0
 * @returns {IInterventionDocument}
 */
function create(req: restify.Request, res: restify.Response, next: restify.Next) {
  const interventionEntry: IInterventionDocument = new Intervention({
    key: req.params.key,
    sKey: req.params.sKey,
    title: req.params.title,
    desc: req.params.desc,
    denom: req.params.denom,
    numerator: req.params.numerator,
  });

  return interventionEntry
    .save()
    .then((savedEntry: IInterventionDocument) => {
      res.json(200, savedEntry);
      return next();
    })
    .catch((err: any) => { logger.error(err); next(err); });
}


/**
 * Delete a whole study given an id
 * @returns {number} the number of records deleted
 */
function remove(req: restify.Request, res: restify.Response, next: restify.Next) {
  const rowToRemove: IInterventionDocument = req.params.docs;
  return rowToRemove.remove().then((results: any) => {
    res.json(200, results);
    next();
  }).catch((r) => {
    next(r);
  });
}

export { get, create, remove, load, loadAll };

