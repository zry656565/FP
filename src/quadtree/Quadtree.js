'use strict';

const { SIDE, QUADRANT, adj, reflect, opquad, commonSide } = require('./utils');
const { N, E, S, W } = SIDE;
const { NW, NE, SW, SE } = QUADRANT;

class Quadtree {
  constructor(options) {
    options = Object.assign({
      width: 524,
      height: 524,
      isGray(node) {
        return node.val !== 0 && node.val !== 1;
      },
    }, options);
    
    this.root = new Node(null, NW, 0, {
      width: options.width,
      height: options.height
    });
    this.isGray = options.isGray;
  }

  findAvailableNeighbors(node) {
    neighbors = new Set([
      _findAdjNeighbor(node, N),
      _findAdjNeighbor(node, E),
      _findAdjNeighbor(node, S),
      _findAdjNeighbor(node, W),
      _findCornerNeighbor(node, NW),
      _findCornerNeighbor(node, NE),
      _findCornerNeighbor(node, SW),
      _findCornerNeighbor(node, SE),
    ]);
    neighbors.delete(null);
    return Array.from(neighbors);
  }

  _findAdjNeighbor(node, side) {
    let parent;
    if (node.parent && adj(side, node.sonType)) {
      parent = _findAdjNeighbor(node.parent, side);
    } else {
      parent = node.parent;
    }
    if (parent && this.isGray(parent)) {
      return parent.getChild(reflect(side, node.sonType));
    } else {
      return parent;
    }
  }

  _findCornerNeighbor(node, quadrant) {

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
    this.children[NW] = new Node(this, NW, val);
    this.children[NE] = new Node(this, NE, val);
    this.children[SW] = new Node(this, SW, val);
    this.children[SE] = new Node(this, SE, val);
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

t = new Quadtree();
t.root.setChildren([0.5, 0.5, 1, 1]);
let nw = t.root.getChild(NW);
nw.setChildren([0, 1, 0, 0]);
let ne = t.root.getChild(NE);
ne.setChildren([0, 0, 1, 0]);


module.exports = Quadtree;
