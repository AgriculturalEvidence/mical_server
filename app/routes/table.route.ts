import * as restify from 'restify';
import * as controller from '../controllers/table.controller';

export default (api: restify.Server) => {

  /** GET /api/table/:studyId - Get rows of the given studyId */
  api.get('/api/table/', controller.load, controller.get);
  api.get('/api/table/intervention/:table', controller.getTableInterventions, controller.get);

};
