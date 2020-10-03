import * as path from 'path';
import { YieldJob } from '../app/parsers/outcomes/yield.parser';
import { InterventionJob } from '../app/parsers/intervention.parser';

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

const env: string = process.env.NODE_ENV || 'development';
const debug: any = process.env.DEBUG || false;

// default settings are for dev environment
const config: ConfigSettings = {
  name: 'MiCal API',
  env: env,
  debug: debug,
  root: path.join(__dirname, '/..'),
  port: 8888,
  db: 'mongodb+srv://admin:admin123@cluster0.5he4u.mongodb.net/Cluster0?retryWrites=true&w=majority',
  dbUser: 'root',
  dbPass: 'example',
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

const defaultYieldParsingParams: YieldJob = {
  importID: "1",
  fileName: "toupload.xlsx",
  columnMapping: {
   xCoords: "Study_Longitude",
   yCoords: "Study_Latitude",
   effectSize: "effect_plot",  
   sampleSize: "Ncontrol.new",
  //  studyId: "Study#",
   interventionType: "Intervention_type.new",
   filterCols: {
    author: "Study_Authors",
    crop: "Crop_Name",
    duration: "Study_Duration.new",
    soil: "soils.new",
    climate: "gens.new"
   }
  }
};

const defaultInterventionParsingParams: InterventionJob = {
  fileName: 'intervention.xlsx',
  columnMapping: {
    key: 'key',
    sKey: 'sKey',
    title: 'title',
    desc: 'desc',
    denom: 'denom',
    numerator: 'numerator',
    // xAxisLabel: 'xLabel'
  }
};

const parsingConfig = {
  yield: defaultYieldParsingParams,
  intervention: defaultInterventionParsingParams
};

export { config, parsingConfig };
