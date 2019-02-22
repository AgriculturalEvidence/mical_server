import * as restify from 'restify';
import {IInterventionDocument, Intervention} from '../models/intervention.model';
import {logger} from '../../utils/logger';
import {Yield} from '../models/yield.model';
import * as mongoose from 'mongoose';
import {IOutcomeTableDocument, IOutcomeTableModel} from '../models/table.model';
import {format} from '../util/errorcodes.info';


// TODO: vpineda, do this dynamically knowing which type are available

const TableMap: {[key: string]: IOutcomeTableModel<IOutcomeTableDocument>} = {
  yield: Yield
};

/**
 * Search get all tables
 */
function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  req.params.tables = TableMap;
  return next();
}

function query(req: restify.Request, res: restify.Response, next: restify.Next) {
  let table: IOutcomeTableModel<IOutcomeTableDocument> = req.params.tables[req.params.table];
  if (!table) {
    logger.error("Table name given in request is not valid")
    res.json(404, "Table doesn't exist!");
  }
  table.findByCoords(getPolygon(req), getFilters(req.params.f)).then((doc) => {
    req.params.docs = doc;
    return next();
  }).catch((err) => {
    logger.error(err);
    res.json(format(err).status, format(err).msg);
  });
}

/**
 * Parses the filters from the request and applies them to the given query
 * @param req restify request
 */
function getFilters(req: restify.Request): Object {
  // todo vpineda
  return {};
}


/**
 * Gets array of points as [lng, lat]
 * @param req.params.area array orgianized by lat and then long, must come in pairs!
 */
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
    // swap the order 
    corners.push([points[i + 1], points[i]]);
  }
  corners.push(corners[0]);
  return corners;
}

/**
 * Gets all of the interventions in a given outcome table
 * @param req
 * @param res
 * @param next
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
