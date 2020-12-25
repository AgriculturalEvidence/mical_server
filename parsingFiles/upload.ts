/**
 * This file acts as a terminal script that uploads intervention.csv and yields.json
 * to the active config mongo database.
 */
import { exec } from 'child_process';
import { config } from '../config/env';

const interventionImportScript = 'mongoimport --uri ' + config.db +
  ' --collection interventions --drop --type csv --headerline --file parsingFiles/intervention.csv';

const yieldsImportScript = 'mongoimport --uri ' + config.db +
  ' --collection yields --drop --type json --jsonArray --file parsingFiles/yields.json';

// create more exec functions for creating future imports to mongo!
exec(interventionImportScript, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
});

exec(yieldsImportScript, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
});