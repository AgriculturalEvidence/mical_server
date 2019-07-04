import * as path from 'path';
import { config } from '../../../config/env';
import * as fs from 'fs';
import { logger } from '../../../utils/logger';
import { Parser } from '../paper.parser';

const pathToRoutes: string = path.join(config.root, '/app/parsers/outcomes');

export let OutcomeParsingMapPromise: Promise<{[key: string]: Parser}> =
  new Promise((a, r) => {
    let res: {[key: string]: Parser} = {};
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
            if (!obj.getParser) {
              logger.warn(
                `Not loading outcome parser ${file} since it doesnt have getParser method or object`
              );
            } else if (typeof obj.getParser === 'function') {
              res[fName[0]] = obj.getParser();
            } else {
              res[fName[0]] = obj.getParser;
            }
          } catch (e) {
            r(e);
          }
        }
      };

      files
        .filter((file: string) => path.extname(file) === '.js'
          && path.basename(file, '.js').endsWith('parser'))
        .forEach(fHandler);
      a(res);
    });
  });
