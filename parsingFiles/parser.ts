/**
 * This file acts as a script which converts yields.csv to yields.json file.
 */
const CSVToJSON = require('csvtojson');
const fs = require('fs');

const yieldCSVPath: string = 'parsingFiles/yields.csv';
const interventionCSVPath: string = 'parsingFiles/intervention.csv';

interface JSONType {
  [key: string]: any;
}

let interventionMap: JSONType = {};

console.log('Creating interventionMap');
CSVToJSON().fromFile(interventionCSVPath)
    .then((interventions: any) => {
      for (let intervention of interventions) {
        // removing all whitespace from keys
        let interventionTitle = intervention.sKey.replace(/\s+/g, '');
        interventionMap[interventionTitle] = Number(intervention.key);
      }
    })
    .catch((e: any) => {
      console.log('intervention map creation error' + e);
    });
// Script that converts yields.csv to yields.json with proper headers
CSVToJSON().fromFile(yieldCSVPath)
    .then((yields: any) => {
      let jsonArray = [];
      for (let yield of yields) {
        let jsonObj: JSONType = {};
        let coordsObj: JSONType = {};
        coordsObj['type'] = 'Point';
        coordsObj['coordinates'] = [Number(yield.Study_Longitude), Number(yield.Study_Latitude)];
        jsonObj['coords'] = coordsObj;
        jsonObj['effectSize'] = Number(yield.EffectSize_ReportedValue);
        jsonObj['sampleSize'] = Number(yield['Ncontrol']['new']);
        jsonObj['importID'] = '1';
        // removes all whitespace
        jsonObj['interventionType'] = JSON.parse(JSON.stringify(interventionMap))[String(yield['Intervention_type']['new']).replace(/\s+/, '')];

        let filterObj: JSONType = {};
        filterObj['author'] = yield.Study_Authors;
        filterObj['crop'] = yield.Crop_Name;
        filterObj['duration'] = yield['Study_Duration']['new'];
        filterObj['soil'] = yield['soils']['new'];
        filterObj['climate'] = yield['gens']['new'];

        jsonObj['filterCols'] = filterObj;
        jsonArray.push(jsonObj);
      }

      fs.writeFile('parsingFiles/yields.json', JSON.stringify(jsonArray), ((err: any) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Output saved to parsingFiles/yields.json.');
        }
      }));
    }).catch((err: any) => {
      console.log(err);
    });