import * as restify from 'restify';
import * as controller from '../controllers/table.controller';

export default (api: restify.Server) => {

  /** GET /api/table/ gets all tables */
  api.get('/api/table/', controller.load, controller.get);

  /** GET the data on a table, pass in filters through query params */
  api.get('/api/table/:table', controller.load, controller.query, controller.get);

  /** GET the inteventions of a given table */
  api.get('/api/table/intervention/:table', controller.getTableInterventions, controller.get);
};
