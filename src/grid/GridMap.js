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
}

module.exports = GridMap;
