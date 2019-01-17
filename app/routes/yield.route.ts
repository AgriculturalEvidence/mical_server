import * as restify from 'restify';
import * as controller from '../controllers/yield.controller';

export default (api: restify.Server) => {

  /** GET /api/yield/:studyId - Get rows of the given studyId */
  api.get('/api/yield/:studyId', controller.load, controller.get);
  api.get('/api/yield/', controller.load, controller.get);

  /** POST /api/yield - Create new yield entry for a given study */
  api.post('/api/yield', controller.create);

  /** DELETE /api/yield/:studyId - Delete all of the rows pertaining to studyId */
  api.del('/api/yield/:studyId', controller.load, controller.remove);
};
