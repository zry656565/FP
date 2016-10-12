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

  let start = generateAvailablePoint(map, [0, w / 4], [0, h / 4]);
  let end = generateAvailablePoint(map, [3 * w / 4, w], [3 * h / 4, h]);

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

let printArr = [];
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
    printArr.push(`Map(${w}, ${w}), Obstacles: ${j}, avgTime: ${time / count}, noPath: ${noPathRate}%`);
    console.log(`Map(${w}, ${w}), Obstacles: ${j}, avgTime: ${time / count}, noPath: ${noPathRate}%`);
  }
}

for (let message of printArr) {
  console.log(message);
}
