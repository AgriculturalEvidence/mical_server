import * as mongoose from 'mongoose';
import { GeoPoint } from './geopoint.model';
import {IOutcomeTableDocument, IOutcomeTableModel} from './table.model';
import {ErrorCode} from '../util/errorcodes.info';

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
  findByStudy(studyId: string, areaPoints?: Array<number[]>): Promise<Array<IYieldDocument>>;
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
  * @returns {Promise<Array<IYieldDocument>>} Returns a Promise of the datapoints.
  */
  // todo vpineda figure out which type of queries we want to compute
  findByStudy: function (studyId: string,
                         areaPoints?: Array<number[]>): Promise<Array<IYieldDocument>> {
    let q = this.find(studyId ? { studyID: studyId } : {});
    if (areaPoints && areaPoints.length > 2) {
      const polygon = {
        'type' : 'Polygon',
        'coordinates' : [areaPoints]
      };
      q.where('coords').within(polygon);
    }

    return q.exec()
      .then((dataPoints: Array<IYieldDocument>) => {
        if (dataPoints && dataPoints.length) {
          return dataPoints;
        }
        return Promise.reject({
          code: ErrorCode.YIELD_NO_DATA_FOR_STUDY,
          studyId: studyId,
        });
      });
  },

  findByInterventionType(interventionKey: number): Promise<IYieldDocument[]> {
    let q = this.find(interventionKey);

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
