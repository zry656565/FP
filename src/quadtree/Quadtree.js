'use strict';

const { SIDE, QUADRANT, adj, reflect, opquad, commonSide } = require('./utils');
const { N, E, S, W } = SIDE;
const { NW, NE, SW, SE } = QUADRANT;

class Quadtree {
  constructor(options) {
    options = Object.assign({
      width: 512,
      height: 512,
      maxDepth: 8,
      leafRatio: 0.2,
      isGray(node) {
        return node.val !== 0 && node.val !== 1;
      },
    }, options);
    
    this.root = new Node(null, NW, 0, {
      width: options.width,
      height: options.height
    });
    this.isGray = options.isGray;
    this.maxDepth = options.maxDepth;
    this.leafRatio = options.leafRatio;
  }

  setArea(x, y, w, h, val) {
    return this._setArea(this.root, x, y, w, h, val);
  }

  // TODO: cannot merge results for now.
  _setArea(node, x, y, w, h, val) {
    if (node.x === x && node.y === y && node.width === w && node.height === h) {
      node.val = val;
      return;
    }

    if (node.depth === this.maxDepth) {
      node.val = val;
      return;
    }

    let centerX = node.x + node.width / 2;
    let centerY = node.y + node.height / 2;
    if (!node.children) node.setChildren([0, 0, 0, 0]);
    if (y < centerY) {
      if (x < centerX) {
        // NW
        node.val = 0.5;
        this._setArea(
          node.getChild(NW),
          x, y,
          Math.min(w, centerX - x), Math.min(h, centerY - y),
          val);
      }
      if (x + w > centerX) {
        // NE
        node.val = 0.5;
        this._setArea(
          node.getChild(NE),
          Math.max(x, centerX), y,
          Math.min(x + w - centerX, w), Math.min(h, y + h - centerY),
          val);
      }
    }
    if (y + h > centerY) {
      if (x < centerX) {
        // SW
        node.val = 0.5;
        this._setArea(
          node.getChild(SW),
          x, Math.max(y, centerY),
          Math.min(w, centerX - x), Math.min(h, y + h - centerY),
          val);
      }
      if (x + w > centerX) {
        // SE
        node.val = 0.5;
        this._setArea(
          node.getChild(SE),
          Math.max(x, centerX), Math.max(y, centerY),
          Math.min(x + w - centerX, w), Math.min(h, y + h - centerY),
          val);
      }
    }
  }

  findAvailableNeighbors(node) {
    let neighbors = new Set([
      this._findAdjNeighbor(node, N),
      this._findAdjNeighbor(node, E),
      this._findAdjNeighbor(node, S),
      this._findAdjNeighbor(node, W),
      this._findCornerNeighbor(node, NW),
      this._findCornerNeighbor(node, NE),
      this._findCornerNeighbor(node, SW),
      this._findCornerNeighbor(node, SE),
    ]);
    neighbors.delete(null);
    return Array.from(neighbors);
  }

  _findAdjNeighbor(node, side) {
    let tmpNode;
    if (node.parent && adj(side, node.sonType)) {
      tmpNode = this._findAdjNeighbor(node.parent, side);
    } else {
      tmpNode = node.parent;
    }

    if (tmpNode && this.isGray(tmpNode)) {
      return tmpNode.getChild(reflect(side, node.sonType));
    } else {
      return tmpNode;
    }
  }

  _findCornerNeighbor(node, quadrant) {
    let tmpNode;
    if (node.parent && node.sonType !== opquad(quadrant)) {
      if (node.sonType === quadrant) {
        tmpNode = this._findCornerNeighbor(node.parent, quadrant);
      } else {
        tmpNode = this._findAdjNeighbor(node.parent, commonSide(node.sonType, quadrant));
      }
    } else {
      tmpNode = node.parent;
    }

    if (tmpNode && this.isGray(tmpNode)) {
      return tmpNode.getChild(opquad(node.sonType))
    } else {
      return tmpNode;
    }
  }
}

class Node {
  constructor(parent, sonType, val, options = null) {
    this.val = val;
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
    this.children = null;
    this.sonType = sonType;
    this._calcLoc(options);
  }

  _calcLoc(options = null) {
    if (options) {
      this.width = options.width;
      this.height = options.height;
      this.x = 0;
      this.y = 0;
      return;
    }
    this.width = this.parent.width / 2;
    this.height = this.parent.height / 2;
    switch (this.sonType) {
      case NW:
        this.x = this.parent.x;
        this.y = this.parent.y;
        break;
      case NE:
        this.x = this.parent.x + this.width;
        this.y = this.parent.y;
        break;
      case SW:
        this.x = this.parent.x;
        this.y = this.parent.y + this.height;
        break;
      case SE:
        this.x = this.parent.x + this.width;
        this.y = this.parent.y + this.height;
        break;
    }
  }

  getVal() { return this.val; }

  setVal(val) { this.val = val; }

  setChildren(vals) {
    if (vals.length !== 4) throw new Error('[Quadtree - setChildren]: length of vals must be 4');
    this.children = [];
    this.children[NW] = new Node(this, NW, vals[NW]);
    this.children[NE] = new Node(this, NE, vals[NE]);
    this.children[SW] = new Node(this, SW, vals[SW]);
    this.children[SE] = new Node(this, SE, vals[SE]);
  }

  setChild(quadrant, val) {
    if (!this.children) throw new Error('[Quadtree - setChild]: Please initialize children with `setChildren` first.');
    switch (quadrant) {
      case NW:
      case NE:
      case SW:
      case SE:
        this.children[quadrant] = new Node(this, quadrant, val);
        break;
      default:
        throw new Error('[Quadtree - setChild]: illegal quadrant');
    }
  }

  getChild(quadrant) {
    return this.children[quadrant];
  }
}

module.exports = Quadtree;
