// Game.js

/*
  TODO:
  ~~~~~
  - bounds checking
  - add other snakes with AI
  - increase snake overlap
  - reduce turning radius (compare first and second positions and extrapolate an angle, then compare that angle to the first point to the mouse and if greater than a limit, limit the angle to the limit)
  - draw larger radius for snake when length increases
  - convert body into food on death
  - add visual indicator for edge of world
  - die when you approach the boundry of the world
  - respawn
  - draw only snake parts that are on screen
  - improve drawing speed to prevent gaps in snake
      - could try calculating graidents at 0, 0, and translate canvas to apply them
  - make food pulse at different rates
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const background = new Image();
const VELOCITY = 300; // pixels per second
const MAX_FOOD_VALUE = 50;
const MIN_FOOD_VALUE = 20;
const MAX_FOOD_ITEMS = 20;
const SNAKE_RADIUS = 20;
const UNSIGNED_INT_MAX_VALUE = 2 ** 31 - 1;
const SIGNED_INT_MAX_VALUE = 2 ** 31 - 1;
// Boundary for game should be between -SIGNED_INT_MAX_VALUE and +SIGNED_INT_MAX_VALUE

let mx = 0, my = 0;
let x = 0, y = 0;
let halfWidth = ~~(canvas.width / 2)
let halfHeight = ~~(canvas.height / 2);
let snake = [];
let snakeLength = 20;
let isPaused = false;
let food = [
  { x: 500, y: 0, value: 40 },
  { x: 0, y: 500, value: 20 },
  { x: -300, y: -200, value: 30 }
];

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

// TODO: try enlarging the background
function drawBackground() {
  // draw 3x3 copies of the background, offset by the position
  const xOffset = ((x % background.width) + background.width) % background.width;
  const yOffset = ((y % background.height) + background.height) % background.height;
  for (let xPos = -xOffset; xPos < canvas.width; xPos += background.width) {
    for (let yPos = -yOffset; yPos < canvas.height; yPos += background.height) {
      ctx.drawImage(background, xPos, yPos);
    }
  }
}

function drawSnake() {
  // draw body
  for (idx in snake) {
    const location = snake[idx];
    const cx = location.x - x + halfWidth;
    const cy = location.y - y + halfHeight;

    const gradient = ctx.createRadialGradient(cx, cy, 1, cx, cy, SNAKE_RADIUS);
    gradient.addColorStop(0, '#0000ff');
    gradient.addColorStop(0.7, '#0000dd');
    gradient.addColorStop(1, '#000088');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(cx, cy, SNAKE_RADIUS, 0, Math.PI*2);
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
}

function getFoodOnScreen() {
  return food.filter(({ x: foodX, y: foodY, value: foodValue }) => (
    (foodX >= (x - halfWidth) - foodValue && foodX <= (x + halfWidth) + foodValue) &&
    (foodY >= (y - halfHeight) - foodValue && foodY <= (y + halfHeight) + foodValue)
  ));
}

function drawPellet(tick, { x: foodX, y: foodY, value }) {
  const screenXPos = foodX - (x - halfWidth);
  const screenYPos = foodY - (y - halfHeight);

  const val = (~~tick % 2000) - 1000
  const smallest = value * 0.75;
  const biggest = value;
  // -1000 = biggest
  // 0 = smallest
  // 1000 = biggest
  const pct = Math.abs(val / 1000);
  const diff = biggest - smallest;
  const pctOfDiff = pct * diff;
  const radius = smallest + pctOfDiff;

  const gradient = ctx.createRadialGradient(screenXPos, screenYPos, 1, screenXPos, screenYPos, radius);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 1.0)');
  gradient.addColorStop(1, 'rgba(0, 128, 0, 0.0)');
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.arc(screenXPos, screenYPos, radius, 0, Math.PI*2);
  ctx.fill();
}

function drawFood(tick) {
  // iterate over all the food items and draw them
  const drawFood = drawPellet.bind(undefined, tick);
  const foodOnScreen = getFoodOnScreen();
  foodOnScreen.forEach(drawFood);
}

function draw(tick, prevTick) {
  const start = Date.now();
  drawBackground();
  drawFood(tick);
  drawSnake();

  // draw text
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'top';
  ctx.fillText(`x,y (${~~x}, ${~~y})`, 10, 10);
  ctx.fillText(`draw took ${Date.now() - start} ms`, 10, 40);
}

function update(tick, prevTick) {
  const timeDiff = (tick - prevTick) / 1000; // in seconds
  // add a snake body part
  if (isFinite(timeDiff) && timeDiff > 0) {
    // calc vector
    const angle = Math.atan2(my - halfHeight, mx - halfWidth);
    x = ~~(x + Math.cos(angle) * VELOCITY * timeDiff);
    y = ~~(y + Math.sin(angle) * VELOCITY * timeDiff);
    snake.push({x, y});
    while (snake.length > snakeLength) {
      snake.shift();
    }
  }

  // generate new food if needed
  if (food.length < MAX_FOOD_ITEMS) {
    food.push(generateNewFoodNearPlayer());
  }

  // detect if the player is on food
  const foodOnScreen = getFoodOnScreen();
  for (const foodItem of foodOnScreen) {
    const xDiff = Math.abs(foodItem.x - x);
    const yDiff = Math.abs(foodItem.y - y);
    const isOnFood = Math.max(foodItem.value, SNAKE_RADIUS) ** 2 >= yDiff ** 2 + xDiff ** 2;
    if (isOnFood) {
      // eat food
      food = food.filter(item => item.x !== foodItem.x || item.y !== foodItem.y);
      snakeLength += foodItem.value;
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

function generateNewFoodNearPlayer() {
  const screenMultiplier = 2;
  const rangeX = (canvas.width * screenMultiplier);
  const rangeY = (canvas.height * screenMultiplier);
  const randomX = ~~(Math.random() * rangeX) - (rangeX >> 1) + x;
  const randomY = ~~(Math.random() * rangeY) - (rangeY >> 1) + y;
  const foodRange = MAX_FOOD_VALUE - MIN_FOOD_VALUE;
  const randomValue = ~~(Math.random() * foodRange) + MIN_FOOD_VALUE;
  return { x: randomX, y: randomY, value: randomValue };
}

function init() {
  console.log('Snake');

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('blur', () => { isPaused = true; });
  window.addEventListener('focus', () => { isPaused = false; });

  resize();
  background.src = './background.jpg';
  background.onload = () => requestAnimationFrame(loop);
};
init();
