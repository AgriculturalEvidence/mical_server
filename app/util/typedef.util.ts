import * as mongoose from 'mongoose';
import { Point } from 'geojson';

export class GeoPoint implements Point {
  public type: 'Point';
  constructor(public coordinates: number[]) {
    this.type = 'Point';
  }
}

// ----------------------------------------------
// Base table typedefs

// Row interface, values of each row without being a full-fledged document,
// helpful when querying a lot of data
export interface IOutcomeTableRow {
  studyLatitude: number;
  studyLongitude: number;
  country: string;
  effectSize: number;
  sampleSize: number;
  interventionType: number;
  author: string
  crop: string
  crop2: string
  duration: string
  soil: string
  climate: string
}

export interface IOutcomeTableDocument extends mongoose.Document, IOutcomeTableRow {
}

export interface IOutcomeTableModel<T> {
  executeQuery(filters?: Object,
                cols?: {[col: string]: number}): Promise<Array<IOutcomeTableRow>>;
  executeDistinct(col: string): Promise<string[]>;
  getAllInterventionTypes(): Promise<number[]>;
}

export const DefaultStatistics: any = {
  /**
    * Get data
    * @param {[]number} areaPoints a set of points greater than 3 that represents an area on the map
    * @param {Object} filters? additional filters that we might want to include
    * @param {Object} cols? key contains name of the column and value is whether you want it
    * @returns {Promise<Array<IYieldRow>>} Returns a Promise of the datapoints.
    */
  executeQuery(filters?: Object, cols?: {[col: string]: number}) {
    let q = this.find();
    if (filters) q.where(filters);
    if (cols) q.select(cols);
    return new Promise((a, r) => a(q.lean().exec()));
  },

  executeDistinct(col: string): Promise<string[]> {
    return new Promise((a, r) => a(this.distinct(col).lean().exec()));
  },

  getAllInterventionTypes(): Promise<number[]> {
    return new Promise((a, r) => a(this.distinct('interventionType').lean().exec()));
  },
};

export const DefaultSchemaJSON = {
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
  importID: {
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
  },
  infoCols: {
    type: Object,
    required: true,
    default: {}
  }
};



// ----------------------------------------------
// Basic query typedef

export interface RowData {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  _id: string;
}



// ------------------------------------------------
// Histogram typedefs


export type SeriesEntry = [number, number][];

export interface Series {
  title: string;
  bar: SeriesEntry;
  dist: SeriesEntry;
  ticks: Ticks;
  desc: string;
  labels: {
    denom: string,
    numerator: string,
    xaxis: string
  };
}

export type Ticks = number[];
