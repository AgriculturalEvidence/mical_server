// import * as supertest from 'supertest';
// import 'mocha';
// import { expect } from 'chai';
// import { logger } from '../../utils/logger';
// import { columnToIndex, indexToColumn, parseRef } from '../../app/util/excel.helpers.util';

// describe('Excel helper tests', function() {
//   describe('can succesfully convert to letters', function() {
//     it('0', () => {
//       expect(indexToColumn(0)).to.eq('A');
//     });

//     it('1', () => {
//       expect(indexToColumn(1)).to.eq('B');
//     });

//     it('26', () => {
//       expect(indexToColumn(26)).to.eq('AA');
//     });

//     it('27', () => {
//       expect(indexToColumn(27)).to.eq('AB');
//     });

//     it('26*26', () => {
//       expect(indexToColumn(26 * 26)).to.eq('ZA');
//     });
//     it('26*26 + 26', () => {
//       expect(indexToColumn(26 * 26 + 26)).to.eq('AAA');
//     });
//   });

//   describe('can succesfully convert to numers', function() {
//     it('A', () => {
//       expect(columnToIndex('A')).to.deep.eq([1, 0]);
//     });

//     it('B', () => {
//       expect(columnToIndex('B')).to.deep.eq([1, 1]);
//     });

//     it('AA', () => {
//       expect(columnToIndex('AA')).to.deep.eq([2, 26]);
//     });

//     it('AB', () => {
//       expect(columnToIndex('AB')).to.deep.eq([2, 27]);
//     });

//     it('26*26', () => {
//       expect(columnToIndex('ZA')).to.deep.eq([2, 26 * 26]);
//     });
//     it('26*26 + 26', () => {
//       expect(columnToIndex('AAA')).to.deep.eq([3, 26 * 26 + 26]);
//     });

//     it('Weird input', () => {
//       expect(columnToIndex('AAA1:ZA1')).to.deep.eq([3, 26 * 26 + 26]);
//     });
//   });

//   describe('parse ref', () => {
//     it('A1:B11', () => {
//       expect(parseRef('A1:B11')).to.deep.eq([2, 11]);
//     });
//   });
// });
