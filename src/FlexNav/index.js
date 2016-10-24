const aStar = require('a-star');
const Quadtree = require('../structures/Quadtree');
const { generateAvailablePoint } = require('../benchmark/utils')

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class FlexNav {
  constructor(map, alpha, beta) {
    if (!(map instanceof Quadtree)) throw new TypeError('FlexNav only accept an instance of Quadtree');
    this.map = map;
    this.preprocess(alpha, beta);
  }
  
  preprocess(alpha = 0.8, beta = 1.2) {
    let times = [];
    let results = [];
    let testcaseNum = 10;
    for (let l = 4; l <= this.map.maxDepth; l++) {
      for (let i = 0; i < testcaseNum; i++) {
        let start = generateAvailablePoint(this.map, [0, 1 / 4], [0, 1 / 4]);
        let end = generateAvailablePoint(this.map, [3 / 4, 1], [3 / 4, 1]);
        let result = this._search(start, end, l);
        results.push(result.time);
      }
      results.sort((a, b) => a - b);
      times.push(results[Math.floor(testcaseNum * alpha) - 1] * beta);
      results.length = 0;
    }
    this.times = times;
  }

  search(start, end, limitTime) {
    for (let level = this.map.maxDepth; level >= 4; level--) {
      if (this.times[level - 4] <= limitTime) {
        return this._search(start, end, level);
      }
    }
    return {
      status: "unavailable",
      level: -1,
      time: -1,
      path: []
    }
  }

  _search(start, end, level) {
    this.map.setLevel(level);
    let startNode = this.map.getNode(start.x, start.y);
    let endNode = this.map.getNode(end.x, end.y);

    let config = this.map.generateConfig(startNode, endNode);

    let startTime = Date.now();
    let path = aStar(config);
    let time =  Date.now() - startTime;

    return {
      status: path.status,
      level: this.map.level,
      time,
      path
    };
  }
}

module.exports = {
  FlexNav,
  Point
};
