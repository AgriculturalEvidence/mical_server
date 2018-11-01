import * as restify from 'restify';
import { logger } from '../../utils/logger';

function get(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('get histogram');
  res.json(200, 'get histogram');
  return next();
}

function create(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('create histogram');
  res.json(200, 'create histogram');
  return next();
}

function update(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('update histogram');
  res.json(200, 'update histogram');
  return next();
}

function remove(req: restify.Request, res: restify.Response, next: restify.Next) {
  logger.info('remove histogram');
  res.json(200, 'remove histogram');
  return next();
}

export { get, create, update, remove }
