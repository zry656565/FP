const Quadtree = require('../structures/Quadtree');
const { generateAvailablePoint, generateObstacles } = require('./utils');
const { FlexNav, Point } = require('../FlexNav');

function test(w, h, obstacleNum, limitTime, count) {
  let map = new Quadtree({
    width: w,
    height: h,
    maxDepth: 12
  });
  
  generateObstacles(map, obstacleNum);

  let nav = new FlexNav(map);
  let onTime = 0;
  let noPath = 0;
  let unavailable = 0;

  for (let i = 0; i < count; i++) {
    let start = generateAvailablePoint(map, [0, 1 / 4], [0, 1 / 4]);
    let end = generateAvailablePoint(map, [3 / 4, 1], [3 / 4, 1]);
    let res = nav.search(start, end, limitTime);
    switch (res.status) {
      case "unavailable":
        unavailable++;
        break;
      case "success":
        if (res.time < limitTime) onTime++;
        break;
      case "noPath":
        noPath++;
        break;
    }
  }

  return {
    onTime: onTime / count,
    noPath: noPath / count,
    unavailable: unavailable / count
  }
}

const limitTimes = [5, 10, 20, 40, 100];
for (let i = 12; i <= 12; i++) {
  for (let j = 10; j <= 10; j+=3) {
    let w = Math.pow(2, i);
    let result;
    for (let k = 0, n = limitTimes.length; k < n; k++) {
      result = test(w, w, j, limitTimes[k], 10);
      console.log(`Map(${w}, ${w})\tObstacles: ${j}\tlimit time: ${limitTimes[k]}\ton time: ${result.onTime}\tnoPath: ${result.noPath}\tunavailable: ${result.unavailable}`);      
    }
  }
}