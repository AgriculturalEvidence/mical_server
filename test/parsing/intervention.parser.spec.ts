// import { equal } from 'assert';
// import { expect } from 'chai';
// import 'mocha';
// import { WorkBook } from 'xlsx/types';
// import { IInterventionRow, Intervention } from '../../app/models/intervention.model';
// import { InterventionParser } from '../../app/parsers/intervention.parser';
// import * as serverBoot from '../../server';
// import { logger } from '../../utils/logger';

// const XLSX = require('xlsx');

// describe('Intervention', () => {
//   let parseOpts = {
//     columnMapping: {
//       key: 'key',
//       sKey: 'sKey',
//       title: 'title',
//       desc: 'desc',
//       denom: 'denom',
//       numerator: 'numerator',
//       xAxisLabel: 'xLabel'
//     },
//     'fileName': './test/parsing/data/intervention.csv',
//   };

//   before(async () => {
//     // line needed to boot up server
//     serverBoot.app.address();
//     await Intervention.remove({}, () => {
//       logger.trace('Test db: intervention collection removed!');
//     });
//   });


//   describe('intervention parsing integration test', function() {

//     describe('find the right columns', () => {
//       it ('finds for intervention', () => {
//         let int = new InterventionParser(parseOpts);
//         let wb = XLSX.readFile(parseOpts.fileName);

//         let [f, _, cols] = InterventionParser.findColumns(wb, parseOpts.columnMapping);
//         equal(f, true, 'should find all columns');

//         expect(cols.key).to.be.eq('A');
//         expect(cols.sKey).to.be.eq('B');
//         expect(cols.title).to.be.eq('C');
//         expect(cols.desc).to.be.eq('D');
//         expect(cols.denom).to.be.eq('E');
//         expect(cols.numerator).to.be.eq('F');
//         expect(cols.xAxisLabel).to.be.eq('G');
//       });
//     });

//     it('calculates invalid data', function () {
//       let yp = new InterventionParser(parseOpts);
//       expect(yp.validRow(null)).to.be.eq(false);
//       expect(yp.validRow({
//         key: '21'
//       })).to.be.false;
//       expect(yp.validRow({
//         key: {}
//       })).to.be.false;
//       expect(yp.validRow({
//         key: 21,
//         sKey: 32
//       })).to.be.false;
//       expect(yp.validRow({
//         key: 21,
//         sKey: 'key',
//         title: 432
//       })).to.be.false;
//     });

//     it('creates all of the rows', async () => {
//       let int = new InterventionParser(parseOpts);
//       let wb: WorkBook = XLSX.readFile(parseOpts.fileName);
//       let columMP = {
//         key: 'A',
//         sKey: 'B',
//         title: 'C',
//         desc: 'D',
//         denom: 'E',
//         numerator: 'F',
//         xAxisLabel: 'G'
//       };
//       let ans: IInterventionRow[] = await int.prepareRows(wb.Sheets[wb.SheetNames[0]], columMP);
//       expect(ans.length).eq(5);

//       expect(ans[0].key).eq(1);
//     });

//     it('doesn\'t insert invalid rows with key', async () => {
//       let parseOpts = {
//         columnMapping: {
//           key: 'sKey',
//           sKey: 'sKey',
//           title: 'title',
//           desc: 'desc',
//           denom: 'denom',
//           numerator: 'numerator',
//           xAxisLabel: 'xLabel'
//         },
//         'fileName': './test/parsing/data/intervention.csv',
//       };
//       let int = new InterventionParser(parseOpts);
//       let a = await int.run();
//       expect(a).to.be.eq(0);

//       parseOpts = {
//         columnMapping: {
//           key: 'key',
//           sKey: 'sKey',
//           title: 'title',
//           desc: 'desc',
//           denom: 'key',
//           numerator: 'numerator',
//           xAxisLabel: 'xLabel'
//         },
//         'fileName': './test/parsing/data/intervention.csv',
//       };
//       int = new InterventionParser(parseOpts);
//       a = await int.run();
//       expect(a).to.be.eq(0);
//     });

//     it ('inserts all rows' , function(done) {
//       let int = new InterventionParser(parseOpts);
//       function validation() {
//         console.log('in validation');
//         Intervention.findByKey(1).then((values) => {
//           expect(values.sKey).to.be.eq('organic');
//           done();
//         }, (err) => done(err));
//       }
//       int.run().then(validation, (err) => done('Coudn\'t add rows! ' + err));
//     });
//   });
// });
