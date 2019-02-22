import * as restify from 'restify';
import { logger } from '../../utils/logger';


function load(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('get histogram');
  res.json(200, 'get histogram');
  return next();
}

function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('get histogram');
  res.json(200, 'get histogram');
  return next();
}

export { load, get }
