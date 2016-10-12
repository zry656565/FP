const Quadtree = require('../structures/Quadtree');
const obstacleLib = require('./obstacleLib');

function generateObstacles(map, num) {
  let used = new Set();
  let len = obstacleLib.length;
  for (var i = 0; i < num; i++) {
    let o;
    do {
      o = obstacleLib[Math.floor(Math.random() * len)];
    } while (used.has(o));
    used.add(o);
    let obstacle = o.map((val, index) => {
      return Math.floor(index % 2 === 0 ? val * map.width : val * map.height);
    });
    map.setArea.apply(map, obstacle.concat([1]));
  }
}

function generateAvailablePoint(map, rangeX, rangeY) {
  let isQuadtree = map instanceof Quadtree;
  let xMax = rangeX[1];
  let xMin = rangeX[0];
  let yMax = rangeY[1];
  let yMin = rangeY[0];
  while (true) {
    let y = Math.floor((yMax - yMin) * Math.random()) + yMin;
    let x = Math.floor((xMax - xMin) * Math.random()) + xMin;
    if (isQuadtree) {
      let node = map.getNode(x, y);
      if (node.val === 0) {
        return node;
      }
    } else {
      // GridMap
      if (map.get(x, y) === 0) {
        return [x, y];
      }
    }
  }
}

module.exports = {
  generateObstacles,
  generateAvailablePoint,
}