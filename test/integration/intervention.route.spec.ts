// import * as supertest from 'supertest';
// import 'mocha';
// import { expect } from 'chai';
// import { app, db } from '../../server';
// import { logger } from '../../utils/logger';
// import { Intervention } from '../../app/models/intervention.model';
// import * as mongoose from 'mongoose';

// const interventionEntry = {
//   key: 1,
//   sKey: 'organic',
//   title: 'Orgainc Effect Size',
//   desc: 'How much does orgainc increase intervention',
//   denom: 'Lower interventions',
//   numerator: 'Higher interventions',
// };

// describe('intervention API', () => {

//   before((done) => {
//     Intervention.remove({}, () => {
//       logger.trace('Test db: intervention collection removed!');
//       done();
//     });
//   });

//   describe('POST /api/intervention', () => {
//     it('should successfully create a new intervention entry', (done) => {
//       supertest(app)
//         .post('/api/intervention')
//         .send(interventionEntry)
//         .set('Content-Type', 'application/json')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.key).to.equal(interventionEntry.key);
//             expect(res.body.sKey).to.equal(interventionEntry.sKey);
//             expect(res.body.title).to.equal(interventionEntry.title);
//             expect(res.body.desc).to.equal(interventionEntry.desc);
//             expect(res.body.denom).to.equal(interventionEntry.denom);
//             expect(res.body.numerator).to.equal(interventionEntry.numerator);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('GET /api/intervention', () => {
//     it('should get valid intervention', (done) => {
//       supertest(app)
//         .get('/api/intervention/' + interventionEntry.key)
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.key).to.equal(interventionEntry.key);
//             expect(res.body.sKey).to.equal(interventionEntry.sKey);
//             expect(res.body.title).to.equal(interventionEntry.title);
//             expect(res.body.desc).to.equal(interventionEntry.desc);
//             expect(res.body.denom).to.equal(interventionEntry.denom);
//             expect(res.body.numerator).to.equal(interventionEntry.numerator);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });

//     it('should get valid intervention by skey', (done) => {
//       supertest(app)
//         .get('/api/intervention/' + interventionEntry.sKey)
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.key).to.equal(interventionEntry.key);
//             expect(res.body.sKey).to.equal(interventionEntry.sKey);
//             expect(res.body.title).to.equal(interventionEntry.title);
//             expect(res.body.desc).to.equal(interventionEntry.desc);
//             expect(res.body.denom).to.equal(interventionEntry.denom);
//             expect(res.body.numerator).to.equal(interventionEntry.numerator);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('GET /api/intervention', () => {
//     it('should fail to get invalid intervention', (done) => {
//       supertest(app)
//         .get('/api/intervention/3')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.status).to.equal(404);
//             done();
//           }
//         });
//     });

//     it('should get all of the interventions', (done) => {
//       supertest(app)
//         .get('/api/intervention')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.length).to.equal(1);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('DEL /api/intervention', () => {
//     it('should successfully delete valid intervention', (done) => {
//       supertest(app)
//         .del('/api/intervention/' + interventionEntry.key)
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.key).to.equal(1);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('DEL /api/intervention', () => {
//     it('should fail to delete invalid intervention', (done) => {
//       supertest(app)
//         .del('/api/intervention/2')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.username).to.be.undefined;
//             expect(res.status).to.equal(404);
//             done();
//           }
//         });
//     });
//   });

// });
