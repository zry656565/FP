const aStar = require('a-star');
const GridMap = require('../grid/GridMap');

let w = 524;
let h = 524;
let map = new GridMap(w, h);
let start = [0, 0];
let end = [333, 192];

// generate obstacles
map.setArea(5, 5, 10, 12, 1);
map.setArea(20, 30, 50, 50, 1);
map.setArea(5, 100, 500, 2, 1);

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
console.log(Date.now() - startTime, path);
