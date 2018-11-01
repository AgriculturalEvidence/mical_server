import * as restify from 'restify';
import * as controller from '../controllers/histogram.controller';
import * as auth from '../auth';

export default (api: restify.Server) => {
  api.get('/api/histogram', controller.get);
  api.post('/api/histogram', controller.create);
  api.put('/api/histogram',  controller.update);
  api.del('/api/histogram', controller.remove);
};
