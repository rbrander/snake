// Game.js

/*
  TODO:
  ~~~~~
  - bounds checking; background doesn't draw beyond -250
  - add pellets to eat and grow
  - add other snakes with AI
  - update snake colour to better see overlap
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const background = new Image();

let mx = 0, my = 0;
let x = 500, y = 500;
let halfWidth = ~~(canvas.width / 2)
let halfHeight = ~~(canvas.height / 2);
let accel = 200; // pixels per second
let snake = [];
let snakeLength = 20;
let isPaused = false;

function resize() {
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  halfWidth = ~~(canvas.width / 2);
  halfHeight = ~~(canvas.height / 2);
}

function mousemove(event) {
  mx = event.clientX;
  my = event.clientY;
}

function drawBackground() {
  // draw 3x3 copies of the background, offset by the position
  const xOffset = x % background.width;
  const yOffset = y % background.height;
  // draw the background where our position is inside
  const startX = halfWidth - xOffset;
  const startY = halfHeight - yOffset;
  ctx.drawImage(background, startX, startY); // center
  ctx.drawImage(background, startX + background.width, startY); // right
  ctx.drawImage(background, startX - background.width, startY); // left
  ctx.drawImage(background, startX, startY + background.height); // bottom
  ctx.drawImage(background, startX, startY - background.height); // top
  ctx.drawImage(background, startX + background.width, startY - background.height); // upper right
  ctx.drawImage(background, startX + background.width, startY + background.height); // lower right
  ctx.drawImage(background, startX - background.width, startY - background.height); // upper left
  ctx.drawImage(background, startX - background.width, startY + background.height); // lower left
}

function draw(tick, prevTick) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  // draw snake
  const radius = 20;
  for (idx in snake) {
    const location = snake[idx];
    const cx = location.x - x + halfWidth;
    const cy = location.y - y + halfHeight;
    const value = (idx / snakeLength) * 255 + 00;
    ctx.fillStyle = `rgb(${0}, ${0}, ${value})`
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fill();
  }

  // draw eyes
  ctx.translate(halfWidth, halfHeight);
  const angle = Math.atan2(my-halfHeight, mx-halfWidth);
  ctx.rotate(angle);
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(7, -7, 6, 0, Math.PI * 2);
  ctx.arc(7, 7, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(10, -7, 3, 0, Math.PI * 2);
  ctx.arc(10, 7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(-angle);
  ctx.translate(-halfWidth, -halfHeight);

  // draw text
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'top';
  ctx.fillText(`x,y (${~~x}, ${~~y})`, 10, 10);
}

function update(tick, prevTick) {
  const timeDiff = (tick - prevTick) / 1000; // in seconds
  if (isFinite(timeDiff) && timeDiff > 0) {
    // calc vector
    const angle = Math.atan2(my - halfHeight, mx - halfWidth);
    x = ~~(x + Math.cos(angle) * accel * timeDiff);
    y = ~~(y + Math.sin(angle) * accel * timeDiff);
    snake.push({x, y});
    if (snake.length > snakeLength) {
      snake.shift();
    }
  }
}

let prevTick = 0, tick = 0;
function loop(tick) {
  if (!isPaused) {
    update(tick, prevTick);
    draw(tick, prevTick);
  }
  prevTick = tick;
  requestAnimationFrame(loop);
}

function init() {
  console.log('Snake');

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('blur', () => { isPaused = true; });
  window.addEventListener('focus', () => { isPaused = false; });

  resize();
  background.src = './background.jpg';
  background.onload = loop;
};
init();
