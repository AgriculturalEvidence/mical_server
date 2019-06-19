import {Point} from 'geojson';

export class GeoPoint implements Point {
  public type: 'Point';
  constructor(public coordinates: number[]) {
    this.type = 'Point';
  }
}


export interface RowData {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  studyID: string;
}


export type SeriesEntry = [number, number][]

export interface Series {
  title: string,
  bar: SeriesEntry,
  dist: SeriesEntry,
  ticks: Ticks,
  desc: string,
  labels: {
    denom: string,
    numerator: string
  }
}

export type Ticks = number[];
