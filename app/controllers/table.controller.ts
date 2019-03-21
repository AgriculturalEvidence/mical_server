import * as restify from 'restify';
import {IInterventionDocument, Intervention} from '../models/intervention.model';
import {logger} from '../../utils/logger';
import {Yield} from '../models/yield.model';
import * as mongoose from 'mongoose';
import {IOutcomeTableDocument, IOutcomeTableModel, getCoordsPolygon, getQueryFilters, getQueryCols} from '../models/table.model';
import {format} from '../util/errorcodes.info';
import * as Table from '../models/table.model'
/**
 * Search get all tables
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  req.params.tables = Table.getTables();
  req.params.docs = Object.keys(Table.getTables());
  return next();
}

/**
 * Performs a query on a given table
 * @param req.param.table the query table
 * @param req.param.area the ccw-oriented geolocation point filter
 * @param req.param.f extra filters that frontend might want
 * @param req.param.cols columns that you want to query
 */
function query(req: restify.Request, res: restify.Response, next: restify.Next) {
  Table.query(req.params.table,
    getCoordsPolygon(req.params.area),
    getQueryFilters(req.params.f, req.params.int),
    getQueryCols(req.params.cols))
    .then((data) => {
      req.params.docs = data;
      next();
    }).catch(err => {
      logger.error("Query:", format(err));
      res.json(format(err).status, format(err).msg);
    })
}

/**
 * Gets all of the interventions in a given outcome table
 * @param req.params.table the table that we want all intervention types
 */

function getTableInterventions(req: restify.Request, res: restify.Response, next: restify.Next) {
  const tableId = req.params.table;
  const tableModel: IOutcomeTableModel<IOutcomeTableDocument> = req.params.tables[tableId];
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
}

export { get, load, query, getTableInterventions };
