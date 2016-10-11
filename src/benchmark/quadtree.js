const aStar = require('a-star');
const Quadtree = require('../quadtree/Quadtree');
const obstacleLib = require('./obstacleLib');

function test(w, h, obstacleNum) {
  let map = new Quadtree({
    width: w,
    height: h,
  });

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
      let node = map.getNode(x, y);
      if (node.val === 0) {
        return node;
      }
    }
  }

  let start = pointGenerator([0, w / 4], [0, h / 4]);
  let end = pointGenerator([3 * w / 4, w], [3 * h / 4, h]);

  let settings = {
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
