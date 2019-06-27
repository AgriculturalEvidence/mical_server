import * as path from 'path';

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
  db: 'mongodb://localhost:27017/dev',
  dbUser: 'root',
  dbPass: 'example',
  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: ''
  },
  connOpts: { auth: { authSource: "admin" } },
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
  if (process.env.DB_USER !== "root") {
    config.connOpts = {}
  }
}

if ( process.env.DB_PASS ) {
  config.dbPass = process.env.DB_PASS;
}

console.log(JSON.stringify(config, null, '\t'));

const defaultYieldParsingParams = {
  fileName: "yield.xlsx",
  columnMapping: {
    xCoords: "x",
    yCoords: "y",
    effectSize: "EffectSize",
    sampleSize: "SampleSize",
    interventionType: "intType",
    filterCols: {
      author: "Author",
      crop: "Crop type",
      duration: "Duration of study",
      soil: "Soil pH"
    }
  } 
};
const defaultInterventionParsingParams = {
  fileName: "intervention.xlsx",
  columnMapping: {
    key: "key",
    sKey: "sKey",
    title: "title",
    desc: "desc",
    denom: "denom",
    numerator: "numerator"
  }
};

const parsingConfig = {
  yieldParams: defaultYieldParsingParams,
  interventionParams: defaultInterventionParsingParams
};

export { config, parsingConfig };
