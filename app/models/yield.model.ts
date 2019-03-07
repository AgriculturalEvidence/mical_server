import * as mongoose from 'mongoose';
import {IOutcomeTableDocument, IOutcomeTableModel} from './table.model';
import {ErrorCode} from '../util/errorcodes.info';
import {GeoPoint} from '../util/typedef.util';

const Schema = mongoose.Schema;

// Document interface
interface IYieldDocument extends mongoose.Document, IOutcomeTableDocument {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  studyID: string;
  interventionType: string;
}

// Model interface
interface IYieldModel extends mongoose.Model<IYieldDocument>, IOutcomeTableModel<IYieldDocument> {
  findByCoords(areaPoints: Array<number[]>, filters?: Object): Promise<Array<IYieldDocument>>;
  findByStudy(studyId: string, filters?: Object): Promise<Array<IYieldDocument>>;
}

const YieldType = 'YIELD';

const YieldSchema = new Schema({
  coords: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  effectSize: {
    type: Number,
    required: true,
  },
  sampleSize: {
    type: Number,
    default: 1
  },
  studyID: {
    type: String,
    default: '-1',
  },
  interventionType: {
    type: Number,
    required: true,
  }
});
YieldSchema.index({ location: '2dsphere' });

// Statics
YieldSchema.statics = {
  /**
  * Get
  * @param {string} studyId - The studyId that we are trying to query.
  * @param {[]number} areaPoints a set of points greater than 3 that represents an area on the map
  * @param {Object} filters? additional filters that we might want to include
  * @returns {Promise<Array<IYieldDocument>>} Returns a Promise of the datapoints.
  */
  // todo vpineda figure out which type of queries we want to compute
  findByCoords(areaPoints: Array<number[]>, filters?: Object): Promise<Array<IYieldDocument>> {
    let q = this.find();
    if (areaPoints && areaPoints.length > 2) {
      const polygon = {
        'type' : 'Polygon',
        'coordinates' : [areaPoints],
        crs: {
          type: "name",
          properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
        }
      };
      q.where('coords').within(polygon);
    }
    if (filters) {
      q.where(filters)
    }
    
    return q.exec()
      .then((dataPoints: Array<IYieldDocument>) => {
        if (dataPoints && dataPoints.length) {
          return dataPoints;
        }
        return Promise.reject({
          code: ErrorCode.YIELD_NO_DATA_FOR_STUDY,
          filters: filters,
        });
      });
  },

  findByStudy(studyId: string, filters?: Object): Promise<Array<IYieldDocument>> {
    return this.findByCoords([], {
      studyID: studyId
    });
  },

  findByInterventionType(interventionKey: number): Promise<IYieldDocument[]> {
    let q = this.find({
      interventionType: interventionKey,
    });

    return q.exec()
      .then((dataPoints: Array<IYieldDocument>) => {
        if (dataPoints && dataPoints.length) {
          return dataPoints;
        }
        return Promise.reject({
          code: ErrorCode.YIELD_NO_INTERVENTION_OF_TYPE,
          key: interventionKey,
        });
      });
  },

  getAllInterventionTypes(): Promise<number[]> {
    let q = this.distinct("interventionType");

    return q.exec()
      .then((dataPoints: Array<number>) => {
        if (dataPoints && dataPoints.length) {
          return dataPoints;
        }
        return Promise.reject({
          code: ErrorCode.YIELD_NO_INTERVENTION_TYPES,
        });
      });
  },
};

const Yield: IYieldModel = <IYieldModel>mongoose.model('Yield', YieldSchema);

export { Yield, IYieldDocument, YieldType };
