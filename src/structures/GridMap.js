'use strict';

class GridMap {
  constructor(width, height, initialValue = 0) {
    this.width = width;
    this.height = height;
    this.map = [];
    for (let y = 0; y < height; y++) {
      this.map.push([]);
      for (let x = 0; x < width; x++) {
        this.map[y][x] = initialValue;
      }
    }
  }

  get(x, y) {
    return this.map[y][x];
  }

  set(x, y, val) {
    this.map[y][x] = val;
  }

  setArea(x, y, width, height, val) {
    if (x >= this.width || y >= this.height) return;
    const m = Math.min(this.height - y, height);
    const n = Math.min(this.width - x, width);
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        this.map[y + j][x + i] = val;
      }
    }
  }

  generateConfig(start, end) {
    let map = this;
    return {
      start,
      isEnd(node) {
        return node[0] === end[0] & node[1] === end[1];
      },
      neighbor(node) {
        let x = node[0];
        let y = node[1];
        let candidates = [
          [x - 1, y - 1],
          [x - 1, y],
          [x - 1, y + 1],
          [x, y - 1],
          [x, y + 1],
          [x + 1, y - 1],
          [x + 1, y],
          [x + 1, y + 1],
        ];
        let results = [];
        for (let c of candidates) {
          x = c[0];
          y = c[1];
          if (x >= 0 && x < map.width && y >= 0 && y < map.height && map.get(x, y) === 0) {
            results.push(c);
          }
        }
        return results;
      },
      distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2), 2);
      },
      heuristic(node) {
        return Math.abs(node[0] - end[0]) + Math.abs(node[1] - end[1]);
      },
      hash(node) {
        return `${node[0]},${node[1]}`;
      }
    }
  }
}

module.exports = GridMap;
