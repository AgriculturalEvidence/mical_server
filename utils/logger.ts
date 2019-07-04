import * as bunyan from 'bunyan';
import * as stream from 'stream';
import { config } from '../config/env';

interface LoggerSettings {
  name: string;
  streams: Array<Object>;
  serializers: any;
}

let infoStream = process.stdout;

let settings: LoggerSettings = {
  name: config.env,
  serializers: bunyan.stdSerializers,
  streams: [{ level: 'error', path: `error.log` }, { level: 'error', stream: infoStream }]
};

if (config.env === 'dev' || config.env === 'development') {
  settings.streams.push({ level: 'info', stream: infoStream });
}

if (config.env === 'parse') {
  let bunyanDebugStream = require('bunyan-debug-stream');
  settings.streams = [{
    level:  'info',
    type:   'raw',
    stream: bunyanDebugStream({
      basepath: __dirname, // this should be the root folder of your project.
      forceColor: true
    })
  }];

  settings.serializers = bunyanDebugStream.serializers;
}

if (config.debug) {
  settings.streams.push({ level: 'trace', stream: infoStream });
  settings.streams.push({ level: 'debug', path: 'debug.log' });
}

const logger = bunyan.createLogger(settings);
console.log(`Logger setting: ${settings.name}`);

export { logger };
