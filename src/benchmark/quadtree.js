const aStar = require('a-star');
const Quadtree = require('../quadtree/Quadtree');

let w = 512;
let h = 512;

let map = new Quadtree({
  width: w,
  height: h,
});

// generate obstacles
map.setArea(20, 30, 50, 50, 1);
map.setArea(20, 200, 300, 2, 1);

let start = map.getNode(0, 0);
let end = map.getNode(333, 192);

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
console.log(Date.now() - startTime, path);
