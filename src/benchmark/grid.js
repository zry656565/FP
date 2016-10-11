const aStar = require('a-star');
const GridMap = require('../grid/GridMap');
const obstacleLib = require('./obstacleLib');

function test(w, h, obstacleNum) {
  let map = new GridMap(w, h);

  // generate obstacles
  let used = new Set();
  let len = obstacleLib.length;
  for (var i = 0; i < obstacleNum; i++) {
    let o;
    do {
      o = obstacleLib[Math.floor(Math.random() * len)];
    } while (used.has(o));
    used.add(o);
    let obstacle = o.map((val, index) => {
      return Math.floor(index % 2 === 0 ? val * w : val * h);
    });
    map.setArea.apply(map, obstacle.concat([1]));
  }

  // set start point and end point
  function pointGenerator(rangeX, rangeY) {
    let xMax = rangeX[1];
    let xMin = rangeX[0];
    let yMax = rangeY[1];
    let yMin = rangeY[0];
    while (true) {
      let y = Math.floor((yMax - yMin) * Math.random()) + yMin;
      let x = Math.floor((xMax - xMin) * Math.random()) + xMin;
      if (map.get(x, y) === 0) {
        return [x, y];
      }
    }
  }

  let start = pointGenerator([0, w / 4], [0, h / 4]);
  let end = pointGenerator([3 * w / 4, w], [3 * h / 4, h]);

  let settings = {
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
        if (x >= 0 && x < w && y >= 0 && y < h && map.get(x, y) === 0) {
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
  };

  let startTime = Date.now();
  let path = aStar(settings);
  let time =  Date.now() - startTime;

  return {
    start,
    end,
    time,
    path
  };
}

module.exports = test;
