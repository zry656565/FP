const aStar = require('a-star');
const GridMap = require('../structures/GridMap');
const Quadtree = require('../structures/Quadtree');
const { generateObstacles, generateAvailablePoint } = require('./utils');

function test(MapPrototype, w, h, obstacleNum) {
  let map;
  if (MapPrototype === GridMap) {
    map = new GridMap(w, h);
  } else if (MapPrototype === Quadtree) {
    map = new Quadtree({
      width: w,
      height: h,
    });
  } else {
    throw new TypeError('Prototype of Map must be GridMap/Quadtree');
  }

  generateObstacles(map, obstacleNum);

  let start = generateAvailablePoint(map, [0, 1 / 4], [0, 1 / 4]);
  let end = generateAvailablePoint(map, [3 / 4, 1], [3 / 4, 1]);

  let config = map.generateConfig(start, end);

  let startTime = Date.now();
  let path = aStar(config);
  let time =  Date.now() - startTime;

  return {
    start,
    end,
    time,
    path
  };
}

let count = 100;
for (let i = 5; i <= 12; i++) {
  for (let j = 0; j <= 10; j++) {
    let w = Math.pow(2, i);
    let time = 0;
    let failureTimes = 0;
    for (let k = 0; k < count; k++) {
      let r = test(Quadtree, w, w, j);
      time += r.time;
      if (r.path.status === 'noPath') failureTimes++;
    }
    noPathRate = failureTimes / count * 100;
    console.log(`Map(${w}, ${w}), Obstacles: ${j}, avgTime: ${time / count}, noPath: ${noPathRate}%`);
  }
}
