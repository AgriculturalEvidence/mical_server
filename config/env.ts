import * as path from 'path';
const dotenv = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand(dotenv);

interface ConfigSettings {
  root: string;
  name: string;
  port: number;
  env: string;
  db: string;
  dbUser: string;
  dbPass: string;
  connOpts: object;
  debug: boolean;
  github: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
}

console.log(process.env);

const env: string = process.env.NODE_ENV || 'development';
const debug: any = process.env.DEBUG || false;

// default settings are for dev environment
const config: ConfigSettings = {
  name: 'MiCal API',
  env: env,
  debug: debug,
  root: path.join(__dirname, '/..'),
  port: parseInt(process.env.PORT), // env passes PORT as a string for some reason :(
  db: process.env.MONGODB_URI,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,
  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: ''
  },
  connOpts: { auth: { authSource: 'admin' } },
};

// settings for test environment
// *IMPORTANT* do not set test db to production db, as the tests will overwrite it.
// if (env === 'test') {
//   config.db = 'mongodb://root:example@localhost:27017/test';
// }

// settings for test environment
if (env === 'production') {
  config.port = 5005;
  config.db = 'mongodb://root:example@localhost:27017/prod';
  config.debug = false;
}

if ( process.env.MONGO_URL ) {
  config.db = process.env.MONGO_URL;
}

if ( process.env.PORT ) {
  config.port = parseInt(process.env.PORT);
}

if ( process.env.DB_USER ) {
  config.dbUser = process.env.DB_USER;
  if (process.env.DB_USER !== 'root') {
    config.connOpts = {};
  }
}

if ( process.env.DB_PASS ) {
  config.dbPass = process.env.DB_PASS;
}

console.log(JSON.stringify(config, null, '\t'));

export { config };
