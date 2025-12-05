// --- Hae DOM-elementit ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById("startButton");
const modal = document.getElementById("gameModal");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");
const scoreElement = document.getElementById("score");
const modalStartButton = document.getElementById("modalRestartButton");

// --- Pelin perusasetukset ---
const gridSize = 20; // Yhden ruudun koko pikseleinä
let frameRate = 150; // Päivitystiheys millisekunneissa
let cols = canvas.width / gridSize;
let rows = canvas.height / gridSize;

let snake = [{ x: 10, y: 10 }]; // Käärmeen alkuasento
let direction = { x: 0, y: 0 }; // Liikesuunta (0,0 = ei liiku)
let food = { x: 5, y: 5 };
let score = 0;
let gameRunning = false;
let gameLoop = null;

// --- Pulssivaraus ruoan animaatiolle ---
let foodPulse = 0;

// --- Pelin palauttaminen aloitustilaan ---
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    placeFood();
    score = 0;
    scoreElement.textContent = "Points: " + score;
    clearInterval(gameLoop);
    gameRunning = false;
}

// --- Pelin käynnistäminen ---
function startGame() {
    if (gameRunning) return;
    resetGame();
    gameRunning = true;
    startButton.style.display = "none";

    // Käynnistetään pelisilmukka
    gameLoop = setInterval(updateGame, frameRate);

    // Piirrä ensimmäinen ruutu heti
    draw();
}

// --- Start-napin toiminta ---
startButton.addEventListener("click", startGame);

// --- Restart-nappi modaalissa ---
modalStartButton.addEventListener("click", () => {
    modal.style.display = "none";
    startGame();
});

// --- Modaalin sulkeminen ---
modalClose.addEventListener("click", () => {
    modal.style.display = "none";
});

// --- Ruoka satunnaiseen paikkaan ---
function placeFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * cols);
        food.y = Math.floor(Math.random() * rows);
        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// --- Pelin päivitys ---
function updateGame() {
    if (direction.x === 0 && direction.y === 0) return;

    moveSnake();
    checkCollisions();
    draw();
}

// --- Käärmeen liikuttaminen ---
function moveSnake() {
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        scoreElement.textContent = "Points: " + score;
        placeFood();
    } else {
        snake.pop();
    }
}

// --- Törmäysten tarkistus ---
function checkCollisions() {
    const head = snake[0];

    if (
        head.x < 0 || head.x >= cols ||
        head.y < 0 || head.y >= rows
    ) {
        endGame("You hit the wall!");
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            endGame("You hit yourself!");
        }
    }
}

// --- Pelin lopetus ---
function endGame(message) {
    clearInterval(gameLoop);
    gameRunning = false;
    modalMessage.textContent = message;
    modal.style.display = "flex";
    startButton.style.display = "block";
}

// --- Ruudukko kentälle ---
function drawGrid() {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// --- Piirtofunktio ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawFood();
    drawSnake();
}

// --- Käärmeen piirtäminen (gradientoitu) ---
function drawSnake() {
    snake.forEach((segment, index) => {
        const ratio = index / snake.length;
        ctx.fillStyle = `rgb(${50 + 205 * ratio}, ${255 - 100 * ratio}, 50)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

// --- Ruoan piirtäminen (pyöreä, pulssiva) ---
function drawFood() {
    foodPulse += 0.3; // nopeampi pulssaus
    const size = gridSize * (0.7 + 0.3 * Math.sin(foodPulse));
    const x = food.x * gridSize + gridSize / 2;
    const y = food.y * gridSize + gridSize / 2;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

// --- Näppäimistön kuuntelu (Arrow + WASD) ---
document.addEventListener("keydown", (event) => {
    switch(event.code) {
        case "ArrowUp":
        case "KeyW":
            if (direction.y === 0) direction = { x: 0, y: -1 };
            event.preventDefault();
            break;
        case "ArrowDown":
        case "KeyS":
            if (direction.y === 0) direction = { x: 0, y: 1 };
            event.preventDefault();
            break;
        case "ArrowLeft":
        case "KeyA":
            if (direction.x === 0) direction = { x: -1, y: 0 };
            event.preventDefault();
            break;
        case "ArrowRight":
        case "KeyD":
            if (direction.x === 0) direction = { x: 1, y: 0 };
            event.preventDefault();
            break;
    }
});
