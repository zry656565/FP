const fs = require('fs');
const Quadtree = require('../structures/Quadtree');
const { generateAvailablePoint, generateMap } = require('./utils');
const { FlexNav, Point } = require('../FlexNav');
const mapData = require('./mapData');

try {
  fs.statSync('./output');
} catch (e) {
  fs.mkdirSync('./output');
}

let fd = fs.openSync(`./output/flexNav-${Date.now()}.csv`, 'a');

log('Limit Time, On Time, No Path, Unavailable, Level');

const limitTimes = [2, 5, 10, 20, 50, 200, 1000];
const categories = ['sparse', 'narrow', 'dense'];
const indices = [0, 0, 0];
for (let i = 12; i <= 12; i++) {
  categories.forEach((c, id) => {
    let w = Math.pow(2, i);
    log(`Map Width: ${w}`);
    log(`Category: ${c}`);
    test(w, w, mapData[c][indices[id]], limitTimes, 10);
  })
}

fs.closeSync(fd);

function log(str) {
  fs.writeSync(fd, str + '\n');
  console.log(str);
}

function test(w, h, data, limitTimes, count) {
  let map = new Quadtree({
    width: w,
    height: h,
    maxDepth: 12
  });
  
  generateMap(map, data);

  let nav = new FlexNav(map);

  for (let j = 0; j < limitTimes.length; j++) {
    let limitTime = limitTimes[j];
    let onTime = 0;
    let noPath = 0;
    let unavailable = 0;
    let level = 0;

    for (let i = 0; i < count; i++) {
      let start = generateAvailablePoint(map, [0, 1 / 4], [0, 1 / 4]);
      let end = generateAvailablePoint(map, [3 / 4, 1], [3 / 4, 1]);
      let res = nav.search(start, end, limitTime);
      level = res.level;
      switch (res.status) {
        case "unavailable":
          unavailable++;
          break;
        case "noPath":
          noPath++;
        case "success":
          if (res.time < limitTime) onTime++;
          break;
      }
    }
    log(`${limitTime}, ${onTime / count}, ${noPath / count}, ${unavailable / count}, ${level}`);
  }
}
