import * as restify from 'restify';
import * as controller from '../controllers/yield.controller';

export default (api: restify.Server) => {
  api.get('/api/yield', controller.get);
  api.post('/api/yield', controller.create);
  api.put('/api/yield', controller.update);
  api.del('/api/yield', controller.remove);
};
