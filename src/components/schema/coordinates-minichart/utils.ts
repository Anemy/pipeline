/* eslint-disable prefer-const */
import L from 'leaflet';
const fetch = require('node-fetch');

import { COPYRIGHT_URL } from './constants';

/**
 * Fetches attribution objects from the attribution endpoint (currently the raw API).
 * @returns {Array} Array of attribution objects { label, alt, boxes, minLevel, maxLevel }
 */
export async function _getHereTileBoxes() {
  const rawTileBoxes = await fetch(COPYRIGHT_URL).then((response: any) =>
    response.json()
  );
  return rawTileBoxes.normal.map((attr: any) => ({
    ...attr,
    boxes: attr.boxes.map((box: any) =>
      L.latLngBounds(L.latLng(box[0], box[1]), L.latLng(box[2], box[3]))
    ),
  }));
}

function cachedGetHereTileBoxes() {
  let cache: any = undefined;
  return async function () {
    if (!cache) {
      cache = await _getHereTileBoxes();
    }
    return cache;
  };
}

let getHereTileBoxes = cachedGetHereTileBoxes();

const getHereAttributionMessage = async function (bounds: any, level: any) {
  const tileBoxes = await getHereTileBoxes();
  const copyrights: any[] = [];
  tileBoxes.forEach((attribution: any) => {
    const overlaps = attribution.boxes.some((b: any) => bounds.intersects(b));

    if (
      overlaps > 0 &&
      level > attribution.minLevel &&
      level < attribution.maxLevel
    ) {
      copyrights.push(attribution.label);
    }
  });

  const copyrightString = copyrights.join(', ');
  return ` &copy; 1987-2019 HERE${copyrightString.length > 0 ? `, ${copyrightString}` : ''
    } | <a href="https://legal.here.com/en/terms/serviceterms/us">Terms of Use</a>`;
};

export { getHereTileBoxes, getHereAttributionMessage };
