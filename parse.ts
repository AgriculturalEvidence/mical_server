import {YieldParser} from './app/parsers/yield.parser';
import * as readline from 'readline';
import {EffectSizeScale, Study} from './app/models/studies.model';
import {parsingConfig} from './config/env';
import {YieldType} from './app/models/yield.model';
import { Parser } from './app/parsers/paper.parser';

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

  var effectScaleEnum: EffectSizeScale = EffectSizeScale.LOG;
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
  console.log("Default parameters are:");
  console.log(JSON.stringify(parseYieldParams, <any> "", "\t"));
  console.log("To modify option type in its name otherwise just press enter or r, \n to quit press q and to print options p.");

  while (true) {
    let ans = await ask("What would you like to do? ");

    let cleanAns = ans.trim();
    let posn = parseYieldParams;
    let list = cleanAns.split(".");
    let lastMember = list.pop();
    list.forEach((v) => {
        posn = posn[v];
    });

    if (posn[lastMember] !== undefined) {
      // modify config
      posn[lastMember] = await ask("Value: ");
    } else if (cleanAns === "r" || cleanAns === "") {
      // start parsing at this point
      break;
    } else if (cleanAns == "q") {
      return null;
    } else if (cleanAns == "p") {
      console.log(JSON.stringify(parseYieldParams, <any> "", "\t"));
    }
  }

  // Create parser and return it
  return new YieldParser(parseYieldParams);
}

async function run() {
  while (true) {
    // Ask what type of parser we would like to execute
    let ans = await ask("What type of dataset? [yield, ...] ");
    let parser: Parser;
    switch (ans) {
      case "yield":
        parser = await parseYield();
        break;
      default:
        console.log("couldn't parse answer ")
    }

    console.log("Running parsing operation");
    parser.run();

  }
}

run();

