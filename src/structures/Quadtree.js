'use strict';

const { SIDE, QUADRANT, adj, reflect, opside, opquad, commonSide } = require('./utils');
const { N, E, S, W } = SIDE;
const { NW, NE, SW, SE } = QUADRANT;

class Quadtree {
  constructor(options = {}) {
    options = Object.assign({
      width: 512,
      height: 512,
      maxDepth: 10,
      leafRatio: 0.2,
      isGray(node) {
        let val;
        if (node.depth < this.level) val = node.val;
        else val = node.val > 0 ? 1 : 0;
        return val !== 0 && val !== 1;
      }
    }, options);
    
    this.root = new Node(null, NW, 0, {
      width: options.width,
      height: options.height
    });
    this.width = options.width;
    this.height = options.height;
    this.isGray = options.isGray;
    this.maxDepth = options.maxDepth;
    this.level = this.maxDepth;
    this.leafRatio = options.leafRatio;
  }

  setLevel(level) {
    if (typeof level !== 'number') return;
    this.level = level;
  }

  // find the node which contain Point(x, y)
  getNode(x, y) {
    let node = this.root;
    while(this.isGray(node)) {
      let centerX = node.x + node.width / 2;
      let centerY = node.y + node.height / 2;
      if (x < centerX && y < centerY) node = node.getChild(NW);
      else if (x >= centerX && y < centerY) node = node.getChild(NE);
      else if (x < centerX && y >= centerY) node = node.getChild(SW);
      else node = node.getChild(SE);
    }
    return node;
  }

  getVal(node) {
    if (node.depth < level) return node.val;
    return node.val > 0 ? 1 : 0;
  }

  toString() {
    return this.root.toString();
  }

  setArea(x, y, w, h, val) {
    return this._setArea(this.root, x, y, w, h, val);
  }

  _setArea(node, x, y, w, h, val) {
    if (node.x === x && node.y === y && node.width === w && node.height === h) {
      node.val = val;
      this._updateParent(node);
      return;
    }

    if (node.depth === this.maxDepth - 1) {
      node.val = val;
      this._updateParent(node);
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
          Math.min(x + w - centerX, w), Math.min(h, centerY - y),
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

  _updateParent(node) {
    let val = node.val;
    let parent = node.parent;
    if (!parent) return;
    if (parent.getChild(NW).val === val
      && parent.getChild(NE).val === val
      && parent.getChild(SW).val === val
      && parent.getChild(SE).val === val) {
      parent.val = val;
      this._updateParent(parent);
    }
  }

  findAvailableNeighbors(node) {
    let candidates = [];
    [N, E, S, W].forEach(side => {
      let queue = [ this._findAdjNeighbor(node, side) ];
      let leafSide = opside(side);
      while (queue.length > 0) {
        let candidate = queue.shift();
        if (!candidate) continue;
        if (!this.isGray(candidate)) {
          candidates.push(candidate);
        } else {
          [NW, NE, SW, SE].forEach(quadrant => {
            if (adj(leafSide, quadrant)) {
              queue.push(candidate.getChild(quadrant));
            }
          });
        }
      }
    });

    candidates.concat([NW, NE, SW, SE].map(quadrant => {
      let candidate = this._findCornerNeighbor(node, quadrant);
      let leafQuadrant = opquad(quadrant);
      while (candidate && this.isGray(candidate)) {
        candidate = candidate.getChild(leafQuadrant);
      }
      return candidate;
    }));
    let neighbors = new Set(candidates);
    neighbors.delete(null);
    // remove unreachable node
    for (let n of neighbors) {
      if (n.val !== 0) neighbors.delete(n);
    }
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

  generateConfig(start, end) {
    let map = this;
    return {
      start,
      isEnd(node) {
        return node === end;
      },
      neighbor(node) {
        return map.findAvailableNeighbors(node);
      },
      distance(a, b) {
        let x1 = a.x + a.width / 2;
        let y1 = a.y + a.height / 2;
        let x2 = b.x + b.width / 2;
        let y2 = b.y + b.height / 2;
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 2);
      },
      heuristic(node) {
        let x = node.x + node.width / 2;
        let y = node.y + node.height / 2;
        return Math.abs(x - end.x) + Math.abs(y - end.y);
      },
      hash(node) {
        return `${node.x},${node.y},${node.width},${node.height}`;
      }
    };
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

  toString() {
    if (this.val === 0 || this.val === 1) {
      return this.val;
    } else {
      var children = [];
      for (let node of this.children) {
        children.push(node.toString());
        return children.toString();
      }
    }
  }
}

module.exports = Quadtree;
