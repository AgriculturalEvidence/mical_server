const CSVToJSON = require('csvtojson');
const fs = require("fs");


const yieldCSVPath: string = 'parsingFiles/yields.csv';

interface JSONType {
    [key: string]: any
}

// convert users.csv file to JSON array
CSVToJSON().fromFile(yieldCSVPath)
    .then((yields: any) => {
        let jsonArray = [];
        for (let yield of yields) {
            let jsonObj: JSONType = {};
            // console.log(yield)
            // jsonObj['coords'] = {}
            let coordsObj: JSONType = {};
            coordsObj['type'] = 'Point'
            coordsObj['coordinates'] = [yield.Study_Longitude, yield.Study_Latitude]
            jsonObj['coords'] = coordsObj;
            jsonObj['effectSize'] = yield.EffectSize_ReportedValue;
            jsonObj['sampleSize'] = yield['Ncontrol']['new'];
            jsonObj['importID'] = '1';
            jsonObj['interventionType'] = yield['Intervention_type']['new']; // needs revisino

            let filterObj: JSONType = {};
            filterObj['author'] = yield.Study_Authors;
            filterObj['crop'] = yield.Crop_Name;
            filterObj['duration'] = yield['Study_Duration']['new'];
            filterObj['soil'] = yield['soils']['new'];
            filterObj['climate'] = yield['gens']['new'];

            jsonObj['filterCols'] = filterObj;

            // console.log(jsonObj);
            jsonArray.push(jsonObj);
        }

        fs.writeFile('./yields.json', JSON.stringify(jsonArray), ((err: any) => {
            if(err) {
                console.log(err);
          } 
          else {
            console.log("Output saved to parsingFiles/yields.json.");
            }
        }))
    // });
        
    }).catch((err: any) => {
        // log error if any
        console.log(err);
    });