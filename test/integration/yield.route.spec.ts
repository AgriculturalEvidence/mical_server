import * as supertest from 'supertest';
import 'mocha';
import { expect } from 'chai';
import { app, db } from '../../server';
import { logger } from '../../utils/logger';
import { Yield } from '../../app/models/yield.model';
import { GeoPoint } from '../../app/models/geopoint.model';
import * as mongoose from "mongoose";

const yieldEntry = {
  coords: new GeoPoint([1.5, 3.5]),
  effectSize: 3,
  sampleSize: 20,
  studyID: '11ADAFF',
};


const geoPoints = [
  new GeoPoint([0, 0]),
  new GeoPoint([10, 3]),
  new GeoPoint([20, 3]),
  new GeoPoint([30, 3]),
  new GeoPoint([-10, 3]),
  new GeoPoint([50, 3]),
  new GeoPoint([71, 3]),
  new GeoPoint([-70, 3]),
  new GeoPoint([20, 3]),
  new GeoPoint([21, 3]),
  new GeoPoint([19, 3]),
  new GeoPoint([11, 3]),
];
const numberOfEntries = geoPoints.length;

describe('yield API', () => {

  before((done) => {
    Yield.remove({}, () => {
      logger.trace('Test db: Yield collection removed!');
      done();
    });
  });

  after(function (done) {
    app.close();
    mongoose.connection.close(done);
  });

  describe('POST /api/yield', () => {
    it('should successfully create a new yield entry', (done) => {
      supertest(app)
        .post('/api/yield')
        .send(yieldEntry)
        .set('Content-Type', 'application/json')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.effectSize).to.equal(yieldEntry.effectSize);
            expect(res.body.studyID).to.equal(yieldEntry.studyID);
            expect(res.body.sampleSize).to.equal(yieldEntry.sampleSize);
            expect(res.body.coords).to.deep.equal(yieldEntry.coords);
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('GET /api/yield', () => {
    it('should get valid yield', (done) => {
      supertest(app)
        .get('/api/yield/' + yieldEntry.studyID)
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body[0].effectSize).to.equal(yieldEntry.effectSize);
            expect(res.body[0].studyID).to.equal(yieldEntry.studyID);
            expect(res.body[0].sampleSize).to.equal(yieldEntry.sampleSize);
            expect(res.body[0].coords).to.deep.equal(yieldEntry.coords);
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('GET /api/yield', () => {
    it('should fail to get invalid yield', (done) => {
      supertest(app)
        .get('/api/yield/nathan')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.be.undefined;
            expect(res.status).to.equal(500);
            done();
          }
        });
    });
  });

  describe('DEL /api/yield', () => {
    it('should successfully delete valid yield', (done) => {
      supertest(app)
        .del('/api/yield/' + yieldEntry.studyID)
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.equal(1);
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('DEL /api/yield', () => {
    it('should fail to delete invalid yield', (done) => {
      supertest(app)
        .del('/api/yield/nathan')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.be.undefined;
            expect(res.status).to.equal(500);
            done();
          }
        });
    });
  });

  describe('GET /api/yield', () => {
    it('should fail to get invalid yield', (done) => {
      supertest(app)
        .get('/api/yield/nathan')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.be.undefined;
            expect(res.status).to.equal(500);
            done();
          }
        });
    });
  });

  describe('yield API multipoint', () => {

    before((done) => {
      Yield.remove({}, () => {
        logger.trace('Test db: Yield collection removed!');
        done();
      });
    });

    describe('POST /api/yield', () => {
      for (let i = 0; i < numberOfEntries; i++) {
        it('creates random entries ' + i, (done) => {
          supertest(app)
            .post('/api/yield')
            .send({ ...yieldEntry, coords: geoPoints[i] })
            .set('Content-Type', 'application/json')
            .end((err: any, res: supertest.Response) => {
              if (err) {
                done(err);
              } else {
                expect(res.status).to.equal(200);
                done();
              }
            });
        });
      }

    });

    describe('GET /api/yield', () => {
      it('should get valid yield according to coords data', (done) => {
        supertest(app)
          .get('/api/yield/' + yieldEntry.studyID +
            '?area=0,0,10,0,10,10,0,10')
          .end((err: any, res: supertest.Response) => {
            if (err) {
              done(err);
            } else {
              expect(res.body.length).equal(2);
              expect(res.status).to.equal(200);
              done();
            }
          });
      });
    });

    describe('DEL /api/yield', () => {
      it('should successfully delete valid yield', (done) => {
        supertest(app)
          .del('/api/yield/' + yieldEntry.studyID)
          .end((err: any, res: supertest.Response) => {
            if (err) {
              done(err);
            } else {
              expect(res.body).to.equal(numberOfEntries);
              expect(res.status).to.equal(200);
              done();
            }
          });
      });
    });

  });

});
