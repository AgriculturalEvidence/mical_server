// import * as supertest from 'supertest';
// import 'mocha';
// import { expect } from 'chai';
// import { app, db } from '../../server';
// import { logger } from '../../utils/logger';
// import { EffectSizeScale, Study } from '../../app/models/studies.model';
// import * as mongoose from 'mongoose';

// const studyEntry = {
//   id: 'Yield1',
//   name: 'Yield Study',
//   type: 'YIELD',
//   effectScale: EffectSizeScale.LOG,
//   people: 'John, Edward',
//   link: 'amazon.com'
// };

// describe('study API', () => {

//   before((done) => {
//     Study.remove({}, () => {
//       logger.trace('Test db: Study collection removed!');
//       done();
//     });
//   });

//   describe('POST /api/studies', () => {
//     it('should successfully create a new study entry', (done) => {
//       supertest(app)
//         .post('/api/studies')
//         .send(studyEntry)
//         .set('Content-Type', 'application/json')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.id).to.equal(studyEntry.id);
//             expect(res.body.name).to.equal(studyEntry.name);
//             expect(res.body.type).to.equal(studyEntry.type);
//             expect(res.body.effectScale).to.equal(studyEntry.effectScale);
//             expect(res.body.people).to.equal(studyEntry.people);
//             expect(res.body.link).to.equal(studyEntry.link);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });

//     it('should fail create a new duplicate entry', (done) => {
//       supertest(app)
//         .post('/api/studies')
//         .send(studyEntry)
//         .set('Content-Type', 'application/json')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.status).to.equal(500);
//             done();
//           }
//         });
//     });
//   });

//   describe('GET /api/studies', () => {
//     it('should get valid study', (done) => {
//       supertest(app)
//         .get('/api/studies/' + studyEntry.type)
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body[0].id).to.equal(studyEntry.id);
//             expect(res.body[0].name).to.equal(studyEntry.name);
//             expect(res.body[0].type).to.equal(studyEntry.type);
//             expect(res.body[0].effectScale).to.equal(studyEntry.effectScale);
//             expect(res.body[0].people).to.equal(studyEntry.people);
//             expect(res.body[0].link).to.equal(studyEntry.link);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('GET /api/studies', () => {
//     it('should fail to get invalid study', (done) => {
//       supertest(app)
//         .get('/api/studies/nathan')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.status).to.equal(500);
//             done();
//           }
//         });
//     });
//   });

//   describe('DEL /api/studies', () => {
//     it('should successfully delete valid study', (done) => {
//       supertest(app)
//         .del('/api/studies/' + studyEntry.type)
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body).to.equal(1);
//             expect(res.status).to.equal(200);
//             done();
//           }
//         });
//     });
//   });

//   describe('DEL /api/studies', () => {
//     it('should fail to delete invalid study', (done) => {
//       supertest(app)
//         .del('/api/studies/nathan')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.username).to.be.undefined;
//             expect(res.status).to.equal(500);
//             done();
//           }
//         });
//     });
//   });

//   describe('GET /api/studies', () => {
//     it('should fail to get invalid study', (done) => {
//       supertest(app)
//         .get('/api/studies/nathan')
//         .end((err: any, res: supertest.Response) => {
//           if (err) {
//             done(err);
//           } else {
//             expect(res.body.username).to.be.undefined;
//             expect(res.status).to.equal(500);
//             done();
//           }
//         });
//     });
//   });

// });
