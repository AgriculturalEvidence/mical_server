import * as restify from 'restify';
import { logger } from '../../utils/logger';


function build(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('build histogram');
  res.json(200, 'build histogram');
  return next();
}


export { build }
