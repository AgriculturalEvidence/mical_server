import * as readline from 'readline';
import * as Table from './app/models/table.model';
import { InterventionParser } from './app/parsers/intervention.parser';
import { Parser } from './app/parsers/paper.parser';
import { YieldJob, YieldParser } from './app/parsers/outcomes/yield.parser';
import { parsingConfig } from './config/env';
import * as serverBoot from './server';
import { logger } from './utils/logger';
import { OutcomeParsingMapPromise } from './app/parsers/outcomes/outcomes.index';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let PaperParsers: {[table: string]: any} = {};
OutcomeParsingMapPromise.then((v) => PaperParsers = { ...PaperParsers, ...v });


// -----------------------------------------------
// Main driver function of parsing operation
// -----------------------------------------------
async function run() {
  /* tslint:disable */
  while (true) {
    /* tslint:enable */
    // Ask what type of parser we would like to execute
    console.log(`Options are: intervention, ${Object.keys(Table.getTables()).join('\n')}`);
    let ans = await ask('What type of dataset? [yield, ...] ');
    let parser: Parser;

    if (Object.keys(Table.getTables()).indexOf(ans) !== -1) {
      parser = await parsePaper(ans);
    } else if (ans === 'intervention') {
      parser = await parseIntervention();
    } else {
      logger.error('couldn\'t parse answer ');
      continue;
    }

    logger.info('Running parsing operation');
    await parser.run().then((insertedRows) => {
      logger.info(insertedRows + ' rows were inserted');
    }).catch(err => logger.error(err));

  }
}

async function ask(question: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    rl.question(question, a => resolve(a));
  });
}

function getDefaultParams(table: string) {
  let key = Object.keys(Table.getTables()).filter(v => table === v);
  if (key.length === 1) {
    return (<any>parsingConfig)[table];
  }
  return {};
}

function getParser(table: string) {
  let key = Object.keys(Table.getTables()).filter(v => table === v);
  if (key.length === 1) {
    return PaperParsers[table];
  }
  return null;
}

async function parsePaper(table: string): Promise<Parser> {
  let importID = await ask('Import ID: ');
  let defaultSettings = getDefaultParams(table);

  let paperParams = {
    importID: importID,
    ... defaultSettings
  };
  await modifyParams(paperParams);

  // Create parser and return it
  return <Parser> new (<any>getParser(table)) (paperParams);
}

async function modifyParams(params: any) {
  console.log('Default parameters are:');
  console.log(JSON.stringify(params, <any> '', '\t'));
  console.log('To modify option, type in its name. Otherwise, ' +
    'press enter or r, \n to quit press q and to print options p.');
  /* tslint:disable */
  while (true) {
    /* tslint:enable */
    let ans = await ask('Which parameter do you want to modify [fileName, ...]? ');

    let cleanAns = ans.trim();
    let posn = params;
    let list = cleanAns.split('.');
    let lastMember = list.pop();
    list.every((v) => {
      if (posn[v]) {
        posn = posn[v];
        return true;
      }
      return false;
    });

    if (posn[lastMember] !== undefined || list.length) {
      // modify config
      posn[lastMember] = await ask('Value: ');
    } else if (cleanAns === 'r' || cleanAns === '' || cleanAns === 'q') {
      // start parsing at this point
      return params;
    } else if (cleanAns === 'p') {
      console.log(JSON.stringify(params, <any> '', '\t'));
    }
  }
}

async function parseIntervention(): Promise<Parser> {
  let defaultSettings = parsingConfig.intervention;

  let parseInterventionParams: any = {
    ... defaultSettings
  };

  parseInterventionParams = await modifyParams(parseInterventionParams);
  // Create parser and return it
  return new InterventionParser(parseInterventionParams);
}

serverBoot.db.then(function () {
  setTimeout(run, 100);
});


