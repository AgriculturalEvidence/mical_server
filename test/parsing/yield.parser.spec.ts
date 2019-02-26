import 'mocha';
import {expect} from 'chai';
import * as mongoose from 'mongoose';
import {app} from '../../server';
import {logger} from '../../utils/logger';
import {Study} from '../../app/models/studies.model';
import {YieldParser} from '../../app/parsers/yield.parser';
import {equal} from 'assert';
import {WorkBook} from 'xlsx/types';
import {Yield} from '../../app/models/yield.model';
import {Intervention} from '../../app/models/intervention.model';
import * as serverBoot from '../../server';

const XLSX = require('xlsx');

let parseOpts = {
    "studyDef": new Study(),
    "fileName": "./test/parsing/data/TND.xlsx",
    "columnMapping": {
            "xCoords": "X-coord deg",
            "yCoords": "Y-coord deg",
            "effectSize": "Yield ic 1",
            "sampleSize": "N sc 1",
            "studyId": "Study#",
            "interventionType": "intType",
    }
};

parseOpts.studyDef = new Study({
    "id": "12",
    "name": "TND",
    "type": "YIELD",
    "effectScale": 0,
    "people": "Effet",
    "link": "google.com"
});

let mockInterventions = [new Intervention({
    key: 1,
    sKey: "organic",
    title: "Orgainc Effect Size",
    desc: "How much does orgainc increase intervention",
    denom: "Lower interventions",
    numerator: "Higher interventions",
}), new Intervention({
    key: 2,
    sKey: "biodiversity",
    title: "Orgainc Effect Size",
    desc: "How much does orgainc increase intervention",
    denom: "Lower interventions",
    numerator: "Higher interventions",
})];


describe("yield parsing integration test", function() {
  this.timeout(10000);

  before(async () => {
    // line needed to boot up server
    serverBoot.app.address();
    await Intervention.remove({}, () => {
      logger.trace('Test db: intervention collection removed!');
    });

    await Yield.remove({}, () => {
      logger.trace('Test db: yield collection removed!');
    });
    mockInterventions.forEach(i => i.save());
  });
    describe("find the right columns", () => {
        it ("finds for TND", () => {
            let yp = new YieldParser(parseOpts);
            let wb = XLSX.readFile(parseOpts.fileName);

            let [f, _, cols] = yp.findColumns(wb, parseOpts.columnMapping);
            equal(f, true, "should find all columns");

            expect(cols.yCoords).to.be.eq('T')
            expect(cols.xCoords).to.be.eq('V')
            expect(cols.sampleSize).to.be.eq('BE')
            expect(cols.effectSize).to.be.eq('BK')
        })
    })

    it("creates all of the rows", async () => {
        let yp = new YieldParser(parseOpts);
        let wb: WorkBook = XLSX.readFile(parseOpts.fileName);
        let columMP = {
            "xCoords": "T",
            "yCoords": "V",
            "effectSize": "BK",
            "sampleSize": "BE",
            "studyId": "A",
            "interventionType": "BY",
        }
        let ans = await yp.prepareRows(wb.Sheets[wb.SheetNames[0]], columMP);
        expect(ans.length).eq(746)

        expect(ans[0].effectSize).eq(340.09)
    })

    it ("inserts all rows" , (done) => {
        let yp = new YieldParser(parseOpts);
        function validation() {
            Yield.findByStudy(parseOpts.studyDef.id + "_1").then((values) => {
                expect(values.length).to.be.eq(8);
                return Yield.getAllInterventionTypes()
            }, (err) => done(err)).then((types) => {
                expect(types).to.deep.eq([1]);
                done();
            }, (err) => done(err));
        }
        yp.run().then(validation, (err) => done("Coudn't add rows! " + err))
    });

    it ("works with csv files", function (done) {
      let parseOpts = {
        "studyDef": new Study(),
        "fileName": "./test/parsing/data/DataForSubmitting.csv",
        "columnMapping": {
          "xCoords": "X_coord",
          "yCoords": "Y_coord",
          "effectSize": "log ratio",
          "sampleSize": "sampleSize",
          "studyId": "Study#",
          "interventionType": "intType"
        }
      };

      parseOpts.studyDef = new Study({
        "id": "13",
        "name": "Orgainic",
        "type": "YIELD",
        "effectScale": 0,
        "people": "Other",
        "link": "google.com"
      });

      let yp = new YieldParser(parseOpts);
      function validation() {
        Yield.findByStudy("12_1").then((values) => {
          console.log(values.length);
          done();
        }, (err) => done(err));
      }
      yp.run().then(validation, (err) => done("Coudn't add rows! " + err))
    });

    after(function (done) {
        app.close();
        mongoose.connection.close(done);
    });
})
