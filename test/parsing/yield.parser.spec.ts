// import 'mocha';
// import { expect } from 'chai';
// import * as mongoose from 'mongoose';
// import { app } from '../../server';
// import { logger } from '../../utils/logger';
// import { Study } from '../../app/models/studies.model';
// import { YieldParser, YieldJob } from '../../app/parsers/outcomes/yield.parser';
// import { equal } from 'assert';
// import { WorkBook } from 'xlsx/types';
// import { Yield } from '../../app/models/outcomes/yield.model';
// import { Intervention } from '../../app/models/intervention.model';
// import * as serverBoot from '../../server';

// const XLSX = require('xlsx');

// let parseOpts: YieldJob = {
//   'importID': '21',
//   'fileName': './test/parsing/data/TND.xlsx',
//   'columnMapping': {
//     'xCoords': 'X-coord deg',
//     'yCoords': 'Y-coord deg',
//     'effectSize': 'Yield ic 1',
//     'sampleSize': 'N sc 1',
//     'interventionType': 'intType',
//     'filterCols': {
//       'author': 'Author',
//     },
//   }
// };

// let mockInterventions = [new Intervention({
//   key: 1,
//   sKey: 'organic',
//   title: 'Orgainc Effect Size',
//   desc: 'How much does orgainc increase intervention',
//   denom: 'Lower interventions',
//   numerator: 'Higher interventions',
//   xAxisLabel: 'Log Ratio'
// }), new Intervention({
//   key: 2,
//   sKey: 'biodiversity',
//   title: 'Orgainc Effect Size',
//   desc: 'How much does orgainc increase intervention',
//   denom: 'Lower interventions',
//   numerator: 'Higher interventions',
//   xAxisLabel: 'Log Ratio'
// })];


// describe('yield parsing integration test', function() {
//   this.timeout(10000);

//   before(async () => {
//     // line needed to boot up server
//     serverBoot.app.address();
//     await Intervention.remove({}, () => {
//       logger.trace('Test db: intervention collection removed!');
//     });

//     await Yield.remove({}, () => {
//       logger.trace('Test db: yield collection removed!');
//     });
//     mockInterventions.forEach(i => i.save());
//   });


//   describe('find the right columns', () => {
//     it ('finds for TND', () => {
//       let yp = new YieldParser(parseOpts);
//       let wb = XLSX.readFile(parseOpts.fileName);

//       let [f, _, cols] = YieldParser.findColumns(wb, {
//         'xCoords': 'X-coord deg',
//         'yCoords': 'Y-coord deg',
//         'effectSize': 'Yield ic 1',
//         'sampleSize': 'N sc 1',
//         'interventionType': 'intType',
//       });
//       equal(f, true, 'should find all columns');

//       expect(cols.yCoords).to.be.eq('T');
//       expect(cols.xCoords).to.be.eq('V');
//       expect(cols.sampleSize).to.be.eq('BE');
//       expect(cols.effectSize).to.be.eq('BK');
//     });
//   });

//   it ('stops when it doesn\'t find all cols', async () => {
//     let opts = {
//       ...parseOpts
//     };
//     opts.columnMapping = { ... parseOpts.columnMapping, xCoords: 'hello' };
//     let yp = new YieldParser(opts);
//     let ans = await yp.run();
//     // no rows inserted
//     expect(ans).to.be.eq(0);
//   });

//   it('fails when file doesnt exist!', (done) => {
//     let opts = {
//       ...parseOpts
//     };
//     opts.fileName = 'hsdasada.xls';
//     let yp = new YieldParser(opts);
//     yp.run().then(() => done('expected fail'), () => done());
//   });

//   it('creates all of the rows', async () => {
//     let yp = new YieldParser(parseOpts);
//     let wb: WorkBook = XLSX.readFile(parseOpts.fileName);
//     let columMP = {
//       'xCoords': 'T',
//       'yCoords': 'V',
//       'effectSize': 'BK',
//       'sampleSize': 'BE',
//       'interventionType': 'BY',
//     };
//     let ans = await yp.prepareRows(wb.Sheets[wb.SheetNames[0]], columMP);
//     expect(ans.length).eq(746);

//     expect(ans[0].effectSize).eq(340.09);
//   });

//   it('calculates invalid data', function () {
//     let yp = new YieldParser(parseOpts);
//     expect(yp.validRow(null)).to.be.eq(false);
//     expect(yp.validRow({
//       coords: [3, '21']
//     })).to.be.false;
//     expect(yp.validRow({
//       coords: { coordinates: [3, 2] },
//       effectSize: '321a'
//     })).to.be.false;
//     expect(yp.validRow({
//       coords: { coordinates: [3, 2] },
//       effectSize: 12,
//       interventionType: 'sad',
//     })).to.be.false;
//     expect(yp.validRow({
//       coords: { coordinates: [3, 2] },
//       effectSize: 12,
//       interventionType: 1,
//       sampleSize: '4asd'
//     })).to.be.false;
//   });

//   it ('inserts all rows' , (done) => {
//     let yp = new YieldParser(parseOpts);
//     function validation() {
//       Yield.executeQuery().then((values) => {
//         expect(values.length).to.be.eq(746);
//         return Yield.getAllInterventionTypes();
//       }, (err) => done(err)).then((types) => {
//         expect(types).to.deep.eq([1]);
//         done();
//       }, (err) => done(err));
//     }
//     yp.run().then(validation, (err) => done('Coudn\'t add rows! ' + err));
//   });

//   it ('works with csv files', function (done) {
//     let parseOpts = {
//       'importID': '44',
//       'fileName': './test/parsing/data/DataForSubmitting.csv',
//       'columnMapping': {
//         'xCoords': 'X_coord',
//         'yCoords': 'Y_coord',
//         'effectSize': 'log ratio',
//         'sampleSize': 'sampleSize',
//         'interventionType': 'intType',
//         'filterCols': {
//           'crop': 'Crop type',
//           'soil': 'Soil pH',
//           'duration': 'Duration of study',
//         },
//       }
//     };

//     let yp = new YieldParser(parseOpts);
//     function validation() {
//       Yield.executeQuery({ sampleSize: 3 }).then((values) => {
//         expect(values.length).to.be.eq(657);
//         return Yield.executeQuery({ 'filterCols.crop': 'vegetables' });
//       }).then((rows) => {
//         expect(rows.length).to.be.eq(140);
//         expect(rows[0].filterCols).to.contain.all.keys(['crop', 'soil', 'duration']);
//         done();
//       }, (err) => done(err));
//     }
//     yp.run().then(validation, (err) => done('Coudn\'t add rows! ' + err));
//   });

//   after(function (done) {
//     app.close();
//     mongoose.connection.close(done);
//   });
// });
