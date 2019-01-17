import * as supertest from 'supertest';
import 'mocha';
import { expect } from 'chai';
import { app, db } from '../../server';
import { logger } from '../../utils/logger';
import { EffectSizeScale, Study } from '../../app/models/studies.model';
import * as mongoose from 'mongoose';
import { YieldParser } from '../../app/parsers/yield.parser';
import { equal } from 'assert';
import { WorkBook } from 'xlsx/types';
import { Yield } from '../../app/models/yield.model';
const XLSX = require('xlsx');

let parseOpts = {
    "studyDef": new Study(),
    "fileName": "./test/parsing/data/TND.xlsx",
    "columnMapping": {
            "xCoords": "X-coord deg",
            "yCoords": "Y-coord deg",
            "effectSize": "Yield ic 1",
            "sampleSize": "N sc 1"
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


describe("yield parsing integration test", () => {
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

    it("creates all of the rows", () => {
        let yp = new YieldParser(parseOpts);
        let wb: WorkBook = XLSX.readFile(parseOpts.fileName);
        let columMP = {
            "xCoords": "T",
            "yCoords": "V",
            "effectSize": "BK",
            "sampleSize": "BE"
        }
        let ans = yp.prepareRows(wb.Sheets[wb.SheetNames[0]], columMP);
        expect(ans.length).eq(746)

        expect(ans[0].effectSize).eq(340.09)
    })

    it ("inserts all rows" , (done) => {
        let yp = new YieldParser(parseOpts);
        function validation() {
            Yield.findByStudy(parseOpts.studyDef.id).then((values) => {
                console.log(values.length);
                done();
            })
        }
        yp.run().then(validation, () => done("Coudn't add rows!"))
    })
})