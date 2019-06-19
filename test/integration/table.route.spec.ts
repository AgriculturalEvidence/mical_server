import * as supertest from 'supertest';
import 'mocha';
import { expect } from 'chai';
import { app, db } from '../../server';
import { logger } from '../../utils/logger';
import {IYieldDocument, Yield} from '../../app/models/yield.model';
import * as mongoose from "mongoose";
import {GeoPoint, Series} from '../../app/util/typedef.util';
import {Intervention} from '../../app/models/intervention.model';
const btoa = require('btoa');

const yieldEntry = {
  coords: new GeoPoint([1.5, 3.5]),
  effectSize: 3,
  sampleSize: 20,
  studyID: '11ADAFF',
  interventionType: 1,
};

const interventionEntry = {
  key: 1,
  sKey: "organic",
  title: "Orgainc Effect Size",
  desc: "How much does orgainc increase intervention",
  denom: "Lower interventions",
  numerator: "Higher interventions",
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

    await Intervention.remove({}, () => {
      logger.trace('Test db: Intervention collection removed!');
    });
    // add data
    let data: IYieldDocument[] = [];
    for (let i = 0; i < numberOfEntries; i++) {
      let yieldEnt = { ...yieldEntry, coords: geoPoints[i] };
      await new Yield(yieldEnt).save();
    }

    await new Intervention(interventionEntry).save();
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
          '?area=' + '0,0,' + '10,10')
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

  describe('GET /api/table/intervention/yield', () => {
    it('should get valid intervention types in table', (done) => {
      supertest(app)
        .get('/api/table/intervention/yield')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            expect(res.body[0].key).to.equal(interventionEntry.key);
            expect(res.body[0].sKey).to.equal(interventionEntry.sKey);
            expect(res.body[0].title).to.equal(interventionEntry.title);
            expect(res.body[0].desc).to.equal(interventionEntry.desc);
            expect(res.body[0].denom).to.equal(interventionEntry.denom);
            expect(res.body[0].numerator).to.equal(interventionEntry.numerator);
            expect(res.status).to.equal(200);
            done();
          }
        });
    });

    it('should return 404 if table doesnt exist', (done) => {
      supertest(app)
        .get('/api/table/intervention/mocktable')
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

  describe("GET /api/table/histogram/yield", () => {
    it("should return a valid histogram definition", (done) => {
      supertest(app)
        .get('/api/table/histogram/yield?ticks=10&samplePts=1')
        .end((err: any, res: supertest.Response) => {
          if (err) {
            done(err);
          } else {
            let series: Series = res.body;
            expect(series.bar).to.deep.equal([
              [ -4, 0 ],
              [ -3.111111111111111, 0 ],
              [ -2.2222222222222223, 0 ],
              [ -1.3333333333333335, 0 ],
              [ -0.44444444444444464, 0 ],
              [ 0.44444444444444464, 0 ],
              [ 1.333333333333333, 0 ],
              [ 2.2222222222222214, 1 ],
              [ 3.1111111111111107, 0 ],
              [ 4, 0 ] 
            ]);
            expect(isNaN(series.dist[0][0])).to.be.false;
            expect
            expect(res.status).to.equal(200);
            done();
          }
        });
    });

    describe("should work on uniform distribution", () => {
      before(async () => {
        await Yield.remove({}, () => {
          logger.trace('Test db: Yield collection removed!');
        });
        // add data
        let data: IYieldDocument[] = [];
        for (let i = 0; i < numberOfEntries; i++) {
          let yieldEnt = { ...yieldEntry, effectSize: (i - 5)/ 10, coords: geoPoints[i] };
          await new Yield(yieldEnt).save();
        }

      });

      it("should return a valid histogram definition", (done) => {
        supertest(app)
          .get('/api/table/histogram/yield?ticks=10&samplePts=1')
          .end((err: any, res: supertest.Response) => {
            if (err) {
              done(err);
            } else {
              let series: Series = res.body;
              console.log(JSON.stringify(series.bar))
              expect(series.bar).to.deep.equal([
                [-0.6,0.08333333333333333],
                [-0.4666666666666667,0.08333333333333333],
                [-0.3333333333333333,0.08333333333333333],
                [-0.19999999999999996,0.16666666666666666],
                [-0.06666666666666665,0.08333333333333333],
                [0.06666666666666665,0.08333333333333333],
                [0.20000000000000007,0.16666666666666666],
                [0.33333333333333337,0.08333333333333333],
                [0.4666666666666667,0.08333333333333333],
                [0.6,0.08333333333333333]]
                );
              expect(isNaN(series.dist[0][0])).to.be.false;
              expect(res.status).to.equal(200);
              done();
            }
          });
      })
    });

    describe("should work on normal dist", () => {
      before(async () => {
        await Yield.remove({}, () => {
          logger.trace('Test db: Yield collection removed!');
        });
        // add data
        let data: IYieldDocument[] = [];
        for (let i = 0; i < numberOfEntries; i++) {
          let yieldEnt = { ...yieldEntry,
            effectSize: (i - 5)/ 10,
            sampleSize: Math.floor(Math.exp(i-5)),
            coords: geoPoints[i] };
          await new Yield(yieldEnt).save();
        }

      });

      it("should return a valid histogram definition", (done) => {
        supertest(app)
          .get('/api/table/histogram/yield?ticks=10&samplePts=1')
          .end((err: any, res: supertest.Response) => {
            if (err) {
              done(err);
            } else {
              let series: Series = res.body;
              expect(isNaN(series.dist[0][0])).to.be.false;
              expect
              expect(res.status).to.equal(200);
              done();
            }
          });
      })
    })
  });

});
