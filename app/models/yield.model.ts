import * as mongoose from 'mongoose';
import {IOutcomeTableDocument, IOutcomeTableModel, IOutcomeTableRow} from './table.model';
import {ErrorCode} from '../util/errorcodes.info';
import {GeoPoint} from '../util/typedef.util';
const Schema = mongoose.Schema;

// Row interface, values of each row without being a full-fledged document,
interface IYieldRow extends IOutcomeTableRow {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  studyID: string;
  interventionType: string;
  filterCols: {[key: string]: string};
}

// Document interface
interface IYieldDocument extends mongoose.Document, IOutcomeTableDocument, IYieldRow {
}

// Model interface
interface IYieldModel extends mongoose.Model<IYieldDocument>, IOutcomeTableModel<IYieldDocument> {
  findByCoords(areaPoints: Array<number[]>,
               filters?: Object,
               cols?: {[col: string]: number}): Promise<Array<IYieldRow>>;
  findByStudy(studyId: string, filters?: Object): Promise<Array<IYieldRow>>;
  findUnique(col: string): Promise<string[]>;
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
  },
  filterCols: {
    type: Object,
    required: true,
    default: {}
  }
});
YieldSchema.index({ location: '2dsphere' });

// Statics
YieldSchema.statics = {
  /**
  * Get data
  * @param {[]number} areaPoints a set of points greater than 3 that represents an area on the map
  * @param {Object} filters? additional filters that we might want to include
  * @param {Object} cols? key contains name of the column and value is whether you want it
  * @returns {Promise<Array<IYieldRow>>} Returns a Promise of the datapoints.
  */
  // todo vpineda figure out which type of queries we want to compute
  findByCoords(areaPoints: Array<number[]>,
               filters?: Object,
               cols?: {[col: string]: number}): Promise<Array<IYieldRow>> {
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

    if (cols) {
      q.select(cols)
    }

    let query = q.lean().exec();
    return query
      .then((dataPoints: Array<IYieldRow>) => {
        if (dataPoints && dataPoints.length) {
          return dataPoints;
        }
        return Promise.reject({
          code: ErrorCode.YIELD_NO_DATA_FOR_STUDY,
          filters: filters,
        });
      });
  },

  findByStudy(studyId: string, filters?: Object): Promise<Array<IYieldRow>> {
    return this.findByCoords([], {
      studyID: studyId,
        ...filters
    });
  },

  findUnique(col: string): Promise<string[]> {
    let query = this.distinct(col).lean().exec();
    return query
      .then((data: string[]) => {
        if (data && data.length) return data;
        return Promise.reject({
          code: ErrorCode.NO_UNIQUE_VALUES,
          col: col,
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

export { Yield, IYieldDocument,IYieldRow, YieldType };
