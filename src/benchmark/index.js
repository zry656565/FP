const gridTest = require('./grid');
const quadtreeTest = require('./quadtree');

let printArr = [];
let count = 100;
for (let i = 5; i <= 12; i++) {
  for (let j = 0; j <= 10; j++) {
    let w = Math.pow(2, i);
    let time = 0;
    let failureTimes = 0;
    for (let k = 0; k < count; k++) {
      let r = quadtreeTest(w, w, j);
      time += r.time;
      if (r.path.status === 'noPath') failureTimes++;
    }
    noPathRate = failureTimes / count * 100;
    printArr.push(`Map(${w}, ${w}), Obstacles: ${j}, avgTime: ${time / count}, noPath: ${noPathRate}%`);
    console.log(`Map(${w}, ${w}), Obstacles: ${j}, DONE`);
  }
}

for (let message of printArr) {
  console.log(message);
}

// let r = quadtreeTest(32, 32, 4);
// console.log(r);
