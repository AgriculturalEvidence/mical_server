import { DEFAULT_COORDS_COL } from './constants.util';
import { logger } from '../../utils/logger';

function buildGeometry(coords: number[][]) {
  return {
    'type' : 'Polygon',
    'coordinates' : [coords],
    crs: {
      type: 'name',
      properties: { name: 'urn:x-mongodb:crs:strictwinding:EPSG:4326' }
    }
  };
}

function buildColWithinFilter(colName: string, coords: number[][]) {
  return {
    [colName]: {
      '$geoWithin': {
        '$geometry': buildGeometry(coords)
      }
    }
  };
}

/**
 * Assumes that the distance bewteen two points will never be more than 360deg
 * and its a closed loop
 * @param coords [long, lat] array
 */
export function sectionCalculator(coords: number[][]) {
  let left = [], centre = [], right = [];
  let n = coords.length;
  for (let i = 0; i < n; i++) {
    let coord = coords[i];

    // check left side
    if (coord[0] < -180) {
      // check previous
      if (coords[i ? (i - 1) : n - 1][0] > -180) {
        // interpolate and add point to centre left
        let prev = coords[i ? (i - 1) : n - 1];
        let lat = (coord[1] - prev[1]) / (coord[0] - prev[0]) * (prev[0] + 180) + prev[1];
        let midPoint = [-180, lat];
        left.push(midPoint);
        centre.push(midPoint);
      }
      // push current
      left.push(coord);
      // check next crosses boundary
      if (coords[(i + 1) % n][0] > -180) {
        let next = coords[(i + 1) % n];
        let lat = (coord[1] - next[1]) / (coord[0] - next[0]) * (next[0] + 180) + next[1];
        let midPoint = [-180, lat];
        left.push(midPoint);
        centre.push(midPoint);
      }
    } else if (coord[0] > 180) { // check if point is on right side
      // check previous
      if (coords[i ? (i - 1) : n - 1][0] < 180) {
        // interpolate and add point to centre left
        let prev = coords[i ? (i - 1) : n - 1];
        let lat = (coord[1] - prev[1]) / (coord[0] - prev[0]) * (prev[0] - 180) + prev[1];
        let midPoint = [180, lat];
        right.push(midPoint);
        centre.push(midPoint);
      }
      // push current
      right.push(coord);
      // check next crosses boundary
      if (coords[(i + 1) % n][0] < 180) {
        let next = coords[(i + 1) % n];
        let lat = (coord[1] - next[1]) / (coord[0] - next[0]) * (next[0] - 180) + next[1];
        let midPoint = [180, lat];
        right.push(midPoint);
        centre.push(midPoint);
      }
    } else { // we are in the centre
      centre.push(coord);
    }
  }

  // close loops
  if (left.length && (left[0][0] !== left[left.length - 1][0]
    || left[0][1] !== left[left.length - 1][1])) {
    left.push(left[0]);
  }

  if (right.length && (right[0][0] !== right[right.length - 1][0]
    || right[0][1] !== right[right.length - 1][1])) {
    right.push(right[0]);
  }

  if (centre.length && (centre[0][0] !== centre[centre.length - 1][0]
    || centre[0][1] !== centre[centre.length - 1][1])) {
    centre.push(centre[0]);
  }

  // shift coords accordingly
  left = left.map(c => [c[0] + 360, c[1]]);
  right = right.map(c => [c[0] - 360, c[1]]);

  return [left, centre, right].filter(s => s.length > 2);
}

export function createAreaFilter(coords: number[][]) {
  if (!coords || coords.length < 2) return {};

  let sections = sectionCalculator(coords);
  // logger.info('Querying info for areas: ', JSON.stringify(sections));

  if (!sections.length) return {};
  if (sections.length === 1) return buildColWithinFilter(DEFAULT_COORDS_COL, sections[0]);

  return {
    $or: sections.map(s => buildColWithinFilter(DEFAULT_COORDS_COL, s))
  };
}
