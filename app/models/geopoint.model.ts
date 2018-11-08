import {Point} from 'geojson';

export class GeoPoint implements Point {
  public type: 'Point';
  constructor(public coordinates: number[]) {
    this.type = 'Point';
  }
}
