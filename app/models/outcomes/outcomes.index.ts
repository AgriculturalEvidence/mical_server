// get path to route handlers
import * as path from 'path';
import { config } from '../../../config/env';
import * as fs from 'fs';
import { IOutcomeTableDocument, IOutcomeTableModel } from '../../util/typedef.util';
import { logger } from '../../../utils/logger';

const pathToRoutes: string = path.join(config.root, '/app/models/outcomes');

export let OutcomeTableMapPromise:
  Promise<{[key: string]: IOutcomeTableModel<IOutcomeTableDocument>}> =
  new Promise((a, r) => {
    let res: {[key: string]: IOutcomeTableModel<IOutcomeTableDocument>} = {};
    fs.readdir(pathToRoutes, (err: any, files: string[]) => {
      if (err) {
        r(err);
        return;
      }

      let fHandler = (file: string) => {
        let fName = path.basename(file, '.js').split('.');
        if (fName.length) {
          // first word specifies the key
          try {
            let obj = require(path.join(pathToRoutes, file));
            if (!obj.getModel) {
              logger.warn(
                `Not loading outcome model ${file} since it doesnt have getModel method or object`
              );
            } else if (typeof obj.getModel === 'function') {
              res[fName[0]] = obj.getModel();
            } else {
              res[fName[0]] = obj.getModel;
            }
          } catch (e) {
            r(e);
          }
        }
      };

      files
        .filter((file: string) => path.extname(file) === '.js'
          && path.basename(file, '.js').endsWith('model'))
        .forEach(fHandler);
      a(res);
    });
  });
