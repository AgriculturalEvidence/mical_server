import {YieldParser} from './app/parsers/yield.parser';
import * as readline from 'readline';
import {EffectSizeScale, Study} from './app/models/studies.model';
import {parsingConfig} from './config/env';
import {YieldType} from './app/models/yield.model';
import { Parser } from './app/parsers/paper.parser';
import {InterventionParser} from './app/parsers/intervention.parser';
import * as serverBoot from './server';
import {logger} from './utils/logger';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ask(question: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    rl.question(question, a => resolve(a))
  })
}

async function askStudy(studyType: string) {
  let studyId = await ask("Study id: ");
  let studyName = await ask("Study name: ");
  let effectScale = await ask("Effect Size Scale [L, D]: ");

  let effectScaleEnum: EffectSizeScale = EffectSizeScale.LOG;
  switch (effectScale) {
    case 'D': case 'd':
      console.log("Setting effect size to division scale");
      break;
    default:
      console.log("Setting effect size to log scale");
      break;
  }
  let contrib = await ask("Contributors: ");
  let link = await ask("Link: ");

  return new Study({
    id: studyId,
    name: studyName,
    type: studyType,
    effectScale: effectScaleEnum,
    people: contrib,
    link: link,
  });
}

async function parseYield(): Promise<Parser> {
  let study = await askStudy(YieldType);
  let defaultSettings = parsingConfig.yieldParams;

  let parseYieldParams: any = {
    studyDef: study,
    ... defaultSettings
  };

  parseYieldParams = await modifyParams(parseYieldParams);

  // Create parser and return it
  return new YieldParser(parseYieldParams);
}

async function modifyParams(params: any) {
  console.log("Default parameters are:");
  console.log(JSON.stringify(params, <any> "", "\t"));
  console.log("To modify option, type in its name. Otherwise, " +
    "press enter or r, \n to quit press q and to print options p.");
  while (true) {
    let ans = await ask("Which parameter do you want to modify [fileName, ...]? ");

    let cleanAns = ans.trim();
    let posn = params;
    let list = cleanAns.split(".");
    let lastMember = list.pop();
    list.every((v) => {
      if (posn[v]) {
        posn = posn[v];
        return true;
      }
      return false;
    });

    if (posn[lastMember] !== undefined) {
      // modify config
      posn[lastMember] = await ask("Value: ");
    } else if (cleanAns === "r" || cleanAns === "") {
      // start parsing at this point
      break;
    } else if (cleanAns == "q") {
      return params;
    } else if (cleanAns == "p") {
      console.log(JSON.stringify(params, <any> "", "\t"));
    }
  }
}

async function parseIntervention(): Promise<Parser> {
  let defaultSettings = parsingConfig.interventionParams;

  let parseInterventionParams: any = {
    ... defaultSettings
  };

  parseInterventionParams = await modifyParams(parseInterventionParams);
  // Create parser and return it
  return new InterventionParser(parseInterventionParams);

}

async function run() {
  while (true) {
    // Ask what type of parser we would like to execute
    console.log("Options are: \n yield \n intervention \n ...")
    let ans = await ask("What type of dataset? [yield, ...] ");
    let parser: Parser;
    switch (ans) {
      case "yield":
        parser = await parseYield();
        break;
      case "intervention":
        parser = await parseIntervention()
        break;
      default:
        logger.error("couldn't parse answer ")
    }

    console.log("Running parsing operation");
    await parser.run().then((insertedRows) => {
      logger.info(insertedRows + " rows were inserted")
    }).catch(err => logger.error(err));

  }
}

serverBoot.db.once('open', function () {
  setTimeout(run, 100);
});


