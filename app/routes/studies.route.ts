import * as restify from 'restify';
import * as controller from '../controllers/studies.controller';

export default (api: restify.Server) => {

  /** GET /api/yield/:studyId - Get rows of the given study type */
  api.get('/api/studies/:studyType', controller.load, controller.get);

  /** POST /api/yield - Create new study entry */
  api.post('/api/studies', controller.create);

  /** DELETE /api/yield/:studyId - Delete all of the rows pertaining to the
   * given study type */
  api.del('/api/studies/:studyType', controller.load, controller.remove);
};
