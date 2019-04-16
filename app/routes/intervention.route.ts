import * as restify from 'restify';
import * as controller from '../controllers/intervention.controller';

export default (api: restify.Server) => {

  /** GET /api/intervention/:key - Get rows of the given invervention key */
  api.get('/api/intervention/:key', controller.load, controller.get);
  api.get('/api/intervention', controller.loadAll, controller.get);

  /** POST /api/intervention - Create new intervention entry for a given study */
  api.post('/api/intervention', controller.create);

  /** DELETE /api/intervention/:key - Delete all of the rows pertaining to intervention key */
  api.del('/api/intervention/:key', controller.load, controller.remove);
};
