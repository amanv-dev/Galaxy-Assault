const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const gameOverScreen = document.getElementById("gameOver");

let gameState = "start"; // start | playing | gameover

let score = 0;
let health = 100;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* PLAYER */
const player = {
  x: 0,
  y: 0,
  size: 50,
  speed: 7
};

function resetPlayer() {
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
}

let keys = {};
document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === "start" && e.key === "Enter") {
    startGame();
  }

  if (gameState === "gameover" && e.key === "Enter") {
    restartGame();
  }
});
document.addEventListener("keyup", e => keys[e.key] = false);

let bullets = [];
let enemies = [];
let enemyBullets = [];
let stars = [];

for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 50),
    y: -60,
    size: 50,
    speed: 2 + Math.random()
  });
}

document.addEventListener("keydown", e => {
  if (e.code === "Space" && gameState === "playing") {
    bullets.push({
      x: player.x,
      y: player.y,
      speed: 9
    });
  }
});

function collision(a, b, sizeA, sizeB) {
  return (
    a.x < b.x + sizeB &&
    a.x + sizeA > b.x &&
    a.y < b.y + sizeB &&
    a.y + sizeA > b.y
  );
}

function drawEmoji(emoji, x, y, size) {
  ctx.font = size + "px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x, y);
}

function startGame() {
  gameState = "playing";
  score = 0;
  health = 100;
  bullets = [];
  enemies = [];
  enemyBullets = [];
  resetPlayer();
}

function restartGame() {
  gameState = "start";
}

function endGame() {
  gameState = "gameover";
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* STARFIELD */
  ctx.fillStyle = "white";
  stars.forEach(star => {
    star.y += 1;
    if (star.y > canvas.height) star.y = 0;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  if (gameState === "start") {
    ctx.fillStyle = "white";
    ctx.font = "60px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GALAXY ASSAULT", canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = "24px monospace";
    ctx.fillText("Press ENTER to Start", canvas.width / 2, canvas.height / 2 + 20);
    requestAnimationFrame(update);
    return;
  }

  if (gameState === "playing") {

    scoreEl.innerText = score;
    healthEl.innerText = health;

    if (keys["ArrowLeft"] && player.x > 30) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - 30) player.x += player.speed;

    drawEmoji("🚀", player.x, player.y, 40);

    bullets.forEach((bullet, i) => {
      bullet.y -= bullet.speed;
      drawEmoji("✨", bullet.x, bullet.y, 20);
      if (bullet.y < 0) bullets.splice(i, 1);
    });

    enemies.forEach((enemy, eIndex) => {
      enemy.y += enemy.speed;
      drawEmoji("👾", enemy.x, enemy.y, 40);

      if (Math.random() < 0.01) {
        enemyBullets.push({
          x: enemy.x,
          y: enemy.y,
          speed: 5
        });
      }

      bullets.forEach((bullet, bIndex) => {
        if (collision(bullet, enemy, 20, 40)) {
          bullets.splice(bIndex, 1);
          enemies.splice(eIndex, 1);
          score += 10;
        }
      });

      if (collision(player, enemy, 40, 40)) {
        enemies.splice(eIndex, 1);
        health -= 20;
        if (health <= 0) endGame();
      }
    });

    enemyBullets.forEach((bullet, i) => {
      bullet.y += bullet.speed;
      drawEmoji("🔥", bullet.x, bullet.y, 20);

      if (collision(player, bullet, 40, 20)) {
        enemyBullets.splice(i, 1);
        health -= 10;
        if (health <= 0) endGame();
      }
    });
  }

  if (gameState === "gameover") {
    ctx.fillStyle = "white";
    ctx.font = "60px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = "24px monospace";
    ctx.fillText("Press ENTER to Restart", canvas.width / 2, canvas.height / 2 + 20);
  }

  requestAnimationFrame(update);
}

setInterval(() => {
  if (gameState === "playing") spawnEnemy();
}, 900);

update();