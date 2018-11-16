/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This defines a basic set of data for our Star Wars Schema.
 *
 * This data is hard coded for the sake of the demo, but you could imagine
 * fetching this data from a backend service rather than from hardcoded
 * JSON objects in a more complex demo.
 */

const xwing: ShipSource = {
  id: '1',
  name: 'X-Wing',
};

const ywing: ShipSource = {
  id: '2',
  name: 'Y-Wing',
};

const awing: ShipSource = {
  id: '3',
  name: 'A-Wing',
};

// Yeah, technically it's Corellian. But it flew in the service of the rebels,
// so for the purposes of this demo it's a rebel ship.
const falcon: ShipSource = {
  id: '4',
  name: 'Millenium Falcon',
};

const homeOne: ShipSource = {
  id: '5',
  name: 'Home One',
};

const tieFighter: ShipSource = {
  id: '6',
  name: 'TIE Fighter',
};

const tieInterceptor: ShipSource = {
  id: '7',
  name: 'TIE Interceptor',
};

const executor: ShipSource = {
  id: '8',
  name: 'Executor',
};

const rebels: FactionSource = {
  id: '1',
  name: 'Alliance to Restore the Republic',
  ships: [ '1', '2', '3', '4', '5' ]
};

const empire: FactionSource = {
  id: '2',
  name: 'Galactic Empire',
  ships: [ '6', '7', '8' ]
};

const data: {
  Faction: { [id: string]: FactionSource },
  Ship: { [id: string]: ShipSource }
} = {
  Faction: {
    '1': rebels,
    '2': empire
  },
  Ship: {
    '1': xwing,
    '2': ywing,
    '3': awing,
    '4': falcon,
    '5': homeOne,
    '6': tieFighter,
    '7': tieInterceptor,
    '8': executor
  }
};

let nextShip = 9;

export interface ShipSource {
  id: string;
  name: string;
}

export interface FactionSource {
  id: string;
  name: string;
  ships: string[];
}

export function createShip(shipName: string, factionId: string): ShipSource {
  const newShip = {
    id: String(nextShip++),
    name: shipName
  };
  data.Ship[newShip.id] = newShip;
  data.Faction[factionId].ships.push(newShip.id);
  return newShip;
}

export function getShip(id: string): ShipSource {
  return data.Ship[id];
}

export function getFaction(id: string): FactionSource {
  return data.Faction[id];
}

export function getRebels(): FactionSource {
  return rebels;
}

export function getEmpire(): FactionSource {
  return empire;
}