const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gameOverMessage = document.getElementById('gameOverMessage');
const scoreDisplay = document.getElementById('score');
const highestScoreDisplay = document.getElementById('highestScore');
const livesDisplay = document.getElementById('lives');
const countdownDisplay = document.getElementById('countdown');

// Game variables
const PLAYER_SIZE = { width: 50, height: 50 };
const OBSTACLE_SIZE = { width: 50, height: 50 };
const COIN_SIZE = { width: 30, height: 30 };
const HEART_SIZE = { width: 30, height: 30 };
let player = { x: canvas.width / 2 - 25, y: canvas.height - 100, width: PLAYER_SIZE.width, height: PLAYER_SIZE.height, speed: 5 };
let obstacles = [];
let coins = [];
let hearts = [];
let score = 0;
let highestScore = 0;
let lives = 3;
let spawnTimer = 0;
let heartTimer = 0;
let obstacleSpeed = 5;
let coinSpeed = 5;
let heartSpeed = 5;
let alertShown = false;
let gameStarted = false;

// Function to show the "New High Score" message
function showNewHighScoreMessage() {
    const newHighScoreMessage = document.createElement('div');
    newHighScoreMessage.textContent = "Congratulation New High Score!";
    newHighScoreMessage.style.position = 'absolute';
    newHighScoreMessage.style.top = '50%';
    newHighScoreMessage.style.left = '50%';
    newHighScoreMessage.style.transform = 'translate(-50%, -50%)';
    newHighScoreMessage.style.fontSize = '40px';
    newHighScoreMessage.style.fontWeight = 'bold';
    newHighScoreMessage.style.color = 'yellow';
    newHighScoreMessage.style.zIndex = '30';
    document.body.appendChild(newHighScoreMessage);

    setTimeout(() => {
        newHighScoreMessage.remove();
    }, 2000); // Hide the message after 2 seconds
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawEllipse(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function detectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function spawnObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - OBSTACLE_SIZE.width),
        y: -OBSTACLE_SIZE.height,
        width: OBSTACLE_SIZE.width,
        height: OBSTACLE_SIZE.height
    });
}

function spawnCoin() {
    coins.push({
        x: Math.random() * (canvas.width - COIN_SIZE.width),
        y: -COIN_SIZE.height,
        width: COIN_SIZE.width,
        height: COIN_SIZE.height
    });
}

function spawnHeart() {
    hearts.push({
        x: Math.random() * (canvas.width - HEART_SIZE.width),
        y: -HEART_SIZE.height,
        width: HEART_SIZE.width,
        height: HEART_SIZE.height
    });
}

function drawRoad() {
    const laneWidth = canvas.width / 3;
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#333';
        ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);

        if (i < 2) {
            for (let j = 0; j < canvas.height; j += 50) {
                ctx.fillStyle = 'white';
                ctx.fillRect((i + 1) * laneWidth - 5, j, 10, 30);
            }
        }
    }
}

function resetGame() {
    score = 0;
    lives = 3;
    obstacles = [];
    coins = [];
    hearts = [];
    player.x = canvas.width / 2 - 25;
    player.speed = 5;
    obstacleSpeed = 5;
    coinSpeed = 5;
    heartSpeed = 5;
    alertShown = false; // Reset the alert flag
    livesDisplay.textContent = lives;
}

function adjustSpeeds() {
    const speedMultiplier = 1 + score / 1000;
    player.speed = 5 * speedMultiplier;
    obstacleSpeed = 5 * speedMultiplier;
    coinSpeed = 5 * speedMultiplier;
    heartSpeed = 5 * speedMultiplier;
}

// Game loop
function gameLoop() {
    if (!gameStarted) return; // Wait until the countdown ends

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    adjustSpeeds();
    drawRoad();

    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed; 
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed; 
    if (keys['ArrowDown'] && player.y + player.height < canvas.height) player.y += player.speed;

    spawnTimer++;
    if (spawnTimer % 60 === 0) {
        spawnObstacle();
        if (Math.random() < 0.5) spawnCoin();
    }

    heartTimer++;
    if (heartTimer >= 1200) {
        spawnHeart();
        heartTimer = 0;
    }

    obstacles = obstacles.filter(obstacle => {
        obstacle.y += obstacleSpeed;
        drawRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 'red');
        if (detectCollision(player, obstacle)) {
            lives--;
            livesDisplay.textContent = lives;
            return false;
        }
        return obstacle.y < canvas.height;
    });

    coins = coins.filter(coin => {
        coin.y += coinSpeed;
        drawEllipse(coin.x, coin.y, coin.width, coin.height, 'gold');
        if (detectCollision(player, coin)) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            return false;
        }
        return coin.y < canvas.height;
    });

    hearts = hearts.filter(heart => {
        heart.y += heartSpeed;
        drawRect(heart.x, heart.y, heart.width, heart.height, 'pink');
        if (detectCollision(player, heart)) {
            lives++;
            livesDisplay.textContent = lives;
            return false;
        }
        return heart.y < canvas.height;
    });

    drawRect(player.x, player.y, player.width, player.height, 'green');

    // Check for new highest score
    if (score > highestScore) {
        highestScore = score;
        highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;

        // Show alert if it's the first time breaking the record in this game
        if (!alertShown) {
            showNewHighScoreMessage();  // Display the new high score message
            alertShown = true;
        }
    }

    if (lives <= 0) {
        gameOverMessage.style.display = 'flex';
        setTimeout(() => {
            gameOverMessage.style.display = 'none';
            resetGame();
        }, 3000);
    } else {
        requestAnimationFrame(gameLoop);
    }
}

const keys = {};
window.addEventListener('keydown', e => (keys[e.key] = true));
window.addEventListener('keyup', e => (keys[e.key] = false));

// Countdown timer
let countdown = 3;
function startCountdown() {
    countdownDisplay.textContent = countdown;
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';
            gameStarted = true;
            gameLoop();
        } else {
            countdownDisplay.textContent = countdown;
        }
    }, 1000);
}

startCountdown();
