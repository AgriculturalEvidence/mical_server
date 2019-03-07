import * as supertest from 'supertest';
import 'mocha';
import { expect } from 'chai';
import { app, db } from '../../server';
import { logger } from '../../utils/logger';
import {IYieldDocument, Yield} from '../../app/models/yield.model';
import * as mongoose from "mongoose";
import {GeoPoint} from '../../app/util/typedef.util';
const btoa = require('btoa');

const yieldEntry = {
  coords: new GeoPoint([1.5, 3.5]),
  effectSize: 3,
  sampleSize: 20,
  studyID: '11ADAFF',
  interventionType: 1,
};

const mockGeoPt: any = {
  type: 'Point'
}

const geoPoints = [
  {...mockGeoPt, coordinates: [0, 0] },
  {...mockGeoPt, coordinates: [10, 3] },
  {...mockGeoPt, coordinates: [20, 3] },
  {...mockGeoPt, coordinates: [30, 3] },
  {...mockGeoPt, coordinates: [-10, 3] },
  {...mockGeoPt, coordinates: [50, 3] },
  {...mockGeoPt, coordinates: [71, 3] },
  {...mockGeoPt, coordinates: [-70, 3] },
  {...mockGeoPt, coordinates: [20, 3] },
  {...mockGeoPt, coordinates: [21, 3] },
  {...mockGeoPt, coordinates: [19, 3] },
  {...mockGeoPt, coordinates: [11, 3] },
];
const numberOfEntries = geoPoints.length;

const encodeFilter = (f: any) => btoa(JSON.stringify(f));

describe('table API (with yield API)', () => {

  before(async () => {
    await Yield.remove({}, () => {
      logger.trace('Test db: Yield collection removed!');
    });
    // add data
    let data: IYieldDocument[] = [];
    for (let i = 0; i < numberOfEntries; i++) {
      let yieldEnt = { ...yieldEntry, coords: geoPoints[i] };
      await new Yield(yieldEnt).save();
    }
  });

  describe('GET /api/table', () => {
    it('should return the list of tables', (done) => {
      supertest(app)
        .get('/api/table')
        .send(yieldEntry)
        .set('Content-Type', 'application/json')
        .end((err: any, res: supertest.Response) => {
          if (err) return done(err);
          expect(res.body).to.be.deep.equal(['yield']);
          done();
        });
    });
  });

  describe('GET /api/table/yield', () => {
    it('should get valid yield', (done) => {
      supertest(app)
        .get('/api/table/yield')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body[0].effectSize).to.equal(yieldEntry.effectSize);
            expect(res.body[0].studyID).to.equal(yieldEntry.studyID);
            expect(res.body[0].sampleSize).to.equal(yieldEntry.sampleSize);
            expect(res.body[0].coords).to.not.be.undefined;
            expect(res.status).to.equal(200);
            done();
          }
        });
    });
  });

  describe('GET /api/table/yield', () => {
    it('should return 404 if no yield was found', (done) => {
      supertest(app)
        .get('/api/table/yield?f=' + encodeFilter({studyID: "1a"}))
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.status).to.equal(404);
            done();
          }
        });
    });
  });

  describe('GET /api/table/yield', () => {
    it('should get valid yield according to coords data', (done) => {
      supertest(app)
        .get('/api/table/yield' +
          '?area=' + '10,0,' + '0,0,' + '0,10,' + '10,10')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.status).to.equal(200);
            expect(res.body.length).equal(2);
            done();
          }
        });
    });
  });

});
