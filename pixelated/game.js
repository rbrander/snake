// game.js

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var gridSizeX = 30; // in pixels, size of one square
var gridSizeY = 30;
var numGridWide = ~~(canvas.width / gridSizeX);
var numGridHigh = ~~(canvas.height / gridSizeY);

var headX, headY, xVel, yVel, tail, tailSize;
var foodX, foodY;
var pulse = 0;

var FPS = 15; // frames per second
var gameSpeed = 1000 / FPS; // milliseconds per frame

function makeNewFood() {
  foodX = ~~(Math.random() * numGridHigh);
  foodY = ~~(Math.random() * numGridHigh);
}

function resetGame() {
  tailSize = 5;
  tail = [];
  xVel = 1;
  yVel = 0;
  headX = ~~(numGridWide / 2);
  headY = ~~(numGridHigh / 2);
  makeNewFood();
}

function updatePulse() {
  var time = Date.now();
  var duration = 2000;
  var halfDuration = ~~(duration / 2);
  var timeElapsed = (time % duration);
  if (timeElapsed > halfDuration) {
    pulse = ((duration - timeElapsed) / halfDuration);
  } else {
    pulse = (timeElapsed / halfDuration);
  }
  pulse = pulse.toFixed(3);
}

function update() {
  updatePulse();

  // move the snake based on current velocity
  headX += xVel;
  headY += yVel;

  // x bounds checking
  if (headX >= numGridWide) {
    headX = 0;
  } else if (headX < 0) {
    headX = numGridWide - 1;
  }

  // y bounds checking
  if (headY >= numGridHigh) {
    headY = 0;
  } else if (headY < 0) {
    headY = numGridHigh - 1;
  }

  // food bounds checking
  if (headX === foodX && headY === foodY) {
    tailSize++;
    makeNewFood();
  }

  // body collision detection
  for (var i = 0; i < tail.length ; i++) {
    if (headX === tail[i].x && headY === tail[i].y) {
      resetGame();
      return;
    }
  }

  // grow the snake if the tail is shorter than it should be
  tail.push({ x: headX, y: headY });
  while (tail.length > tailSize) {
    tail.shift();
  }
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var drawGridSquare = function(gridX, gridY, fillStyle) {
    if (fillStyle !== undefined && fillStyle !== ctx.fillStyle) {
      ctx.fillStyle = fillStyle;
    }
    ctx.fillRect(gridX * gridSizeX + 1, gridY * gridSizeY + 1, gridSizeX - 2, gridSizeY - 2);
  };

  // draw grid squares
  ctx.fillStyle = '#050505';
  for (var y = 0; y < numGridHigh; y++) {
    for (var x = 0; x < numGridWide; x++) {
      drawGridSquare(x, y);
    }
  }

  // draw tail
  for (var i = tail.length - 1; i > 0; i--) {
    var x = tail[i].x;
    var y = tail[i].y;
    ctx.fillStyle = i < tail.length - 1 ? 'green' : 'blue';
    ctx.fillRect(x * gridSizeX, y * gridSizeY, gridSizeX - 2, gridSizeY - 2);
  }

  // draw food
  var colour = 100 + (100 * EasingFunctions.easeInOutQuad(pulse).toFixed(2));
  ctx.fillStyle = 'rgb('+colour+', 0, 0)';
  ctx.fillRect(foodX * gridSizeX + 2, foodY * gridSizeY + 2, gridSizeX - 4, gridSizeY - 4);

  // draw score
  ctx.fillStyle = 'white';
  ctx.font = '100px Arcade';
  ctx.textBaseline = 'top';
  ctx.fillText('Score: ' + (tailSize - 5).toString(), 20, 20);
}

function loop() {
  update();
  draw();
  setTimeout(loop, gameSpeed);
}

function onKeyDown(e) {
  switch (e.which) {
    case 37: // left
      xVel = -1;
      yVel = 0;
      break;
    case 38: // up
      xVel = 0;
      yVel = -1;
      break;
    case 39: // right
      xVel = 1;
      yVel = 0;
      break;
    case 40: // down
      xVel = 0;
      yVel = 1;
      break;
    default:
      break;
  }
}

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  numGridWide = ~~(canvas.width / gridSizeX);
  numGridHigh = ~~(canvas.height / gridSizeY);
}

(function init() {
  window.addEventListener('resize', onResize);
  onResize();
  document.addEventListener('keydown', onKeyDown);
  resetGame();
  loop();
})()
