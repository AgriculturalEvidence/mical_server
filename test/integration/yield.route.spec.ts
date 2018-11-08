import * as supertest from 'supertest';
import 'mocha';
import { expect } from 'chai';
import { app } from '../../server';
import { logger } from '../../utils/logger';
import { IYieldDocument, Yield } from '../../app/models/yield.model';
import { GeoPoint } from '../../app/models/geopoint.model';

const yieldEntry = {
  coords: new GeoPoint([1.5, 3.5]),
  effectSize: 3,
  sampleSize: 20,
  studyID: '11ADAFF',
};

describe('yield API', () => {

  before((done) => {
    Yield.remove({}, () => {
      logger.trace('Test db: Yield collection removed!');
      done();
    });
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
            expect(res.body.coords).to.deep.equal(yieldEntry.coords);
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('POST /api/yield', () => {
    it('should fail to create the same yield twice', (done) => {
      supertest(app)
        .post('/api/yield')
        .send(yieldEntry)
        .set('Content-Type', 'application/json')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.status).to.equal(500);
            done();
          }
        });
    });
  });

  describe('GET /api/yield', () => {
    it('should get valid yield', (done) => {
      supertest(app)
        .get('/api/yield/michael')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.equal('michael');
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

  describe('PUT /api/yield', () => {
    it('should successfully update existing yield', (done) => {
      supertest(app)
        .put('/api/yield/michael')
        .send({ 'newUsername': 'nathan' })
        .set('Content-Type', 'application/json')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.equal('nathan');
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('PUT /api/yield', () => {
    it('should fail to update invalid yield', (done) => {
      supertest(app)
        .put('/api/yield/michael')
        .send({ 'newUsername': 'nathan' })
        .set('Content-Type', 'application/json')
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
        .del('/api/yield/nathan')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body.username).to.equal('nathan');
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

});
