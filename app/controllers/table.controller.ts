import * as restify from 'restify';
import { logger } from '../../utils/logger';
import * as Table from '../models/table.model';
import { getCoordsPolygon, getQueryCols, getQueryFilters } from '../models/table.model';
import { format } from '../util/errorcodes.info';

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
      logger.error('Query:', format(err));
      res.json(format(err).status, format(err).msg);
    });
}

/**
 * Returns the unique values of a given column in the table
 * @param req.param.table the query table
 * @param req.param.column the column that we will use
 */
function unique(req: restify.Request, res: restify.Response, next: restify.Next) {
  Table.unique(req.params.table, req.params.column)
    .then((data) => {
      req.params.docs = data;
      next();
    }).catch(err => {
      logger.error('Unique:', format(err));
      res.json(format(err).status, format(err).msg);
    });
}

/**
 * Gets all of the interventions in a given outcomes table
 * @param req.params.table the table that we want all intervention types
 */

function getTableInterventions(req: restify.Request, res: restify.Response, next: restify.Next) {
  Table.interventions(req.params.table)
    .then(interventions => {
      req.params.docs = interventions;
      next();
    }, (err) => {
      logger.error('Intervention:', err);
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
}

export { get, load, query, unique, getTableInterventions };

