import 'mocha';
import {expect} from 'chai';
import {logger} from '../../utils/logger';
import {equal} from 'assert';
import {WorkBook} from 'xlsx/types';
import {Intervention} from '../../app/models/intervention.model';
import {parsingConfig} from '../../config/env';
import {InterventionParser} from '../../app/parsers/intervention.parser';
import * as serverBoot from "../../server"

const XLSX = require('xlsx');

describe("Intervention", () => {
  let parseOpts = {
    ... parsingConfig.interventionParams,
    "fileName": "./test/parsing/data/intervention.csv",
  };

  before(async () => {
    // line needed to boot up server
    serverBoot.app.address();
    await Intervention.remove({}, () => {
      logger.trace('Test db: intervention collection removed!');
    });
  });


  describe("intervention parsing integration test", function() {

    describe("find the right columns", () => {
      it ("finds for intervention", () => {
        let int = new InterventionParser(parseOpts);
        let wb = XLSX.readFile(parseOpts.fileName);

        let [f, _, cols] = int.findColumns(wb, parseOpts.columnMapping);
        equal(f, true, "should find all columns");

        expect(cols.key).to.be.eq('A');
        expect(cols.sKey).to.be.eq('B');
        expect(cols.title).to.be.eq('C');
        expect(cols.desc).to.be.eq('D');
        expect(cols.denom).to.be.eq('E');
        expect(cols.numerator).to.be.eq('F');
      })
    });

    it("creates all of the rows", async () => {
      let int = new InterventionParser(parseOpts);
      let wb: WorkBook = XLSX.readFile(parseOpts.fileName);
      let columMP = {
        key: "A",
        sKey: "B",
        title: "C",
        desc: "D",
        denom: "E",
        numerator: "F",
      };
      let ans = await int.prepareRows(wb.Sheets[wb.SheetNames[0]], columMP);
      expect(ans.length).eq(5);

      expect(ans[0].key).eq(1)
    })

    it ("inserts all rows" , function(done) {
      let int = new InterventionParser(parseOpts);
      function validation() {
        console.log("in validation");
        Intervention.findByKey(1).then((values) => {
          expect(values.sKey).to.be.eq("organic");
          done();
        }, (err) => done(err));
      }
      int.run().then(validation, (err) => done("Coudn't add rows! " + err))
    });
  });
});
