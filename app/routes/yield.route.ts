import * as restify from 'restify';
import * as controller from '../controllers/yield.controller';

export default (api: restify.Server) => {

  api.get('/api/yield/:studyId', controller.load, controller.get);

  api.post('/api/yield', controller.create);

  api.del('/api/yield/:studyId', controller.load, controller.remove);
};
