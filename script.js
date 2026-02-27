const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 700;
canvas.height = 600;

const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const gameOverScreen = document.getElementById("gameOver");

let score = 0;
let health = 100;
let gameOver = false;

/* Player */
const player = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  size: 40,
  speed: 6
};

/* Controls */
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* Bullets */
let bullets = [];
let enemyBullets = [];
let enemies = [];
let stars = [];

/* Starfield */
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

/* Spawn enemies */
function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    size: 40,
    speed: 2 + Math.random() * 1
  });
}

/* Shooting */
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !gameOver) {
    bullets.push({
      x: player.x,
      y: player.y,
      speed: 8
    });
  }
});

/* Collision */
function collision(a, b, sizeA, sizeB) {
  return (
    a.x < b.x + sizeB &&
    a.x + sizeA > b.x &&
    a.y < b.y + sizeB &&
    a.y + sizeA > b.y
  );
}

/* Game Loop */
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Stars */
  ctx.fillStyle = "white";
  stars.forEach(star => {
    star.y += 1;
    if (star.y > canvas.height) star.y = 0;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  /* Player movement */
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - 40) player.x += player.speed;

  /* Draw player */
  ctx.font = "40px Arial";
  ctx.fillText("🚀", player.x, player.y);

  /* Bullets */
  ctx.fillStyle = "yellow";
  bullets.forEach((bullet, i) => {
    bullet.y -= bullet.speed;
    ctx.fillText("🔥", bullet.x, bullet.y);
    if (bullet.y < 0) bullets.splice(i, 1);
  });

  /* Enemies */
  enemies.forEach((enemy, eIndex) => {
    enemy.y += enemy.speed;
    ctx.fillText("👾", enemy.x, enemy.y);

    /* Enemy shoot randomly */
    if (Math.random() < 0.005) {
      enemyBullets.push({
        x: enemy.x,
        y: enemy.y,
        speed: 4
      });
    }

    /* Bullet collision */
    bullets.forEach((bullet, bIndex) => {
      if (collision(bullet, enemy, 20, 40)) {
        bullets.splice(bIndex, 1);
        enemies.splice(eIndex, 1);
        score += 10;
        scoreEl.innerText = score;
      }
    });

    /* Player collision */
    if (collision(player, enemy, 40, 40)) {
      health -= 20;
      healthEl.innerText = health;
      enemies.splice(eIndex, 1);
      if (health <= 0) endGame();
    }
  });

  /* Enemy bullets */
  enemyBullets.forEach((bullet, i) => {
    bullet.y += bullet.speed;
    ctx.fillText("💥", bullet.x, bullet.y);

    if (collision(player, bullet, 40, 20)) {
      health -= 10;
      healthEl.innerText = health;
      enemyBullets.splice(i, 1);
      if (health <= 0) endGame();
    }
  });

  requestAnimationFrame(update);
}

/* End game */
function endGame() {
  gameOver = true;
  gameOverScreen.classList.remove("hidden");
}

/* Spawn loop */
setInterval(() => {
  if (!gameOver) spawnEnemy();
}, 1000);

update();