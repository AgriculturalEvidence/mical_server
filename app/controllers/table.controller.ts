import * as restify from 'restify';
import {IInterventionDocument, Intervention} from '../models/intervention.model';
import {logger} from '../../utils/logger';
import {Yield} from '../models/yield.model';
import * as mongoose from 'mongoose';
import {IOutcomeTableDocument, IOutcomeTableModel} from '../models/table.model';
import {format} from '../util/errorcodes.info';


// TODO: vpineda, do this dynamically knowing which type are available
/**
 * Search get all tables
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  req.params.docs = Object.keys(TableMap);
  return next();
}

const TableMap: {[key: string]: IOutcomeTableModel<IOutcomeTableDocument>} = {
  yield: Yield
};

/**
 * Gets all of the interventions in a given outcome table
 * @param req
 * @param res
 * @param next
 */

function getTableInterventions(req: restify.Request, res: restify.Response, next: restify.Next) {
  const tableId = req.params.table;
  const tableModel = TableMap[tableId];
  if (!tableModel) {
    return res.json(404, "Table doesn't exist!");
  }
  const intPromise = tableModel.getAllInterventionTypes();
  const interventionRows = intPromise.then((interventionIds) => {
    return Promise.all(interventionIds.map((iKey) => Intervention.findByKey(iKey)));
  });
  interventionRows.then(interventions => {
    req.params.docs = interventions;
    next();
  }, (err) => {
    logger.error("Intervention:", err);
    res.json(format(err).status, format(err).msg);
  });
}

/**
 * Get a intervention description.
 * @returns {IInterventionDocument}
 */
function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info("Answering response with ", req.params.docs.length, " rows.")
  res.json(200, req.params.docs);
  next();
}

export { get, load, getTableInterventions };
