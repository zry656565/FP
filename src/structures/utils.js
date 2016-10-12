'use strict';

const SIDE = {
  N: 0,
  E: 1,
  S: 2,
  W: 3
};

const QUADRANT = {
  NW: 0,
  NE: 1,
  SW: 2,
  SE: 3
};

const { N, E, S, W } = SIDE;
const { NW, NE, SW, SE } = QUADRANT;

function adj(side, quadrant) {
  switch (side) {
    case N:
      if (quadrant === NW || quadrant === NE) return true;
      break;
    case E:
      if (quadrant === NE || quadrant === SE) return true;
      break;
    case S:
      if (quadrant === SW || quadrant === SE) return true;
      break;
    case W:
      if (quadrant === NW || quadrant === SW) return true;
      break;
  }
  return false;
}

function reflect(side, quadrant) {
  switch (side) {
    case N:
    case S:
      switch (quadrant) {
        case NW:
          return SW;
        case NE:
          return SE;
        case SW:
          return NW;
        case SE:
          return NE;
      }
      break;
    case E:
    case W:
      switch (quadrant) {
        case NW:
          return NE;
        case NE:
          return NW;
        case SW:
          return SE;
        case SE:
          return SW;
      }
      break;
  }
}

function opside(side) {
  switch (side) {
    case N:
      return S;
    case S:
      return N;
    case E:
      return W;
    case W:
      return E;
  }
}

function opquad(quadrant) {
  switch (quadrant) {
    case NW:
      return SE;
    case NE:
      return SW;
    case SW:
      return NE;
    case SE:
      return NW;
  }
}

function commonSide(quadrant1, quadrant2) {
  switch (quadrant1) {
    case NW:
      switch (quadrant2) {
        case NE:
          return N;
        case SW:
          return W;
      }
      break;
    case NE:
      switch (quadrant2) {
        case NW:
          return N;
        case SE:
          return E;
      }
      break;
    case SW:
      switch (quadrant2) {
        case NW:
          return W;
        case SE:
          return S;
      }
      break;
    case SE:
      switch (quadrant2) {
        case NE:
          return E;
        case SW:
          return S;
      }
      break;
  }
  return false;
}

module.exports = {
  SIDE,
  QUADRANT,
  adj,
  reflect,
  opside,
  opquad,
  commonSide
};
