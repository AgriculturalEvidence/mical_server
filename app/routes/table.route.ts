import * as restify from 'restify';
import * as controller from '../controllers/table.controller';
import * as histController from '../controllers/histogram.controller';

export default (api: restify.Server) => {

  /** GET /api/table/ gets all tables */
  api.get('/api/table/', controller.load, controller.get);

  /** GET the data on a table, pass in filters through query params */
  api.get('/api/table/:table', controller.query, controller.get);

  /** GET all of the distinct values in a given column */
  api.get('/api/table/:table/:column', controller.unique, controller.get);

  /** GET creates all of the datapoints needed for a smooth approximation to the function */
  api.get('/api/table/histogram/:table', histController.prepare, controller.load,
    controller.query, histController.build);

  /** GET the inteventions of a given table */
  api.get('/api/table/intervention/:table', controller.load,
    controller.getTableInterventions, controller.get);

};
