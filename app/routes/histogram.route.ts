import * as restify from 'restify';
import * as controller from '../controllers/histogram.controller';

export default (api: restify.Server) => {

  /** GET /api/histogram/:table - Get rows of the given invervention key */
  api.get('/api/histogram/:table', controller.load, controller.get);
};
