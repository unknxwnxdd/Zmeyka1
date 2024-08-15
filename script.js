const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Адаптивний розмір канвасу
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CELL_SIZE = 20;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FPS = 10;

const BLACK = '#000';
const GREEN = '#0f0';
const RED = '#f00';

class Cube {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    }
}

class Snake {
    constructor() {
        this.body = [new Cube(WIDTH / 2, HEIGHT / 2)];
        this.direction = 'RIGHT';
        this.grow = false;
        this.directionQueue = [];
    }

    move() {
        if (this.directionQueue.length) {
            const nextDirection = this.directionQueue.shift();
            const oppositeDirections = {
                'RIGHT': 'LEFT',
                'LEFT': 'RIGHT',
                'UP': 'DOWN',
                'DOWN': 'UP'
            };
            if (nextDirection !== oppositeDirections[this.direction]) {
                this.direction = nextDirection;
            }
        }

        const head = this.body[0];
        let newX = head.x;
        let newY = head.y;

        if (this.direction === 'RIGHT') newX += CELL_SIZE;
        else if (this.direction === 'LEFT') newX -= CELL_SIZE;
        else if (this.direction === 'UP') newY -= CELL_SIZE;
        else if (this.direction === 'DOWN') newY += CELL_SIZE;

        // Wrap-around logic
        if (newX >= WIDTH) newX = 0;
        else if (newX < 0) newX = WIDTH - CELL_SIZE;
        if (newY >= HEIGHT) newY = 0;
        else if (newY < 0) newY = HEIGHT - CELL_SIZE;

        const newHead = new Cube(newX, newY);

        if (this.grow) {
            this.body.unshift(newHead);
            this.grow = false;
        } else {
            this.body.pop();
            this.body.unshift(newHead);
        }
    }

    draw() {
        this.body.forEach(segment => segment.draw(GREEN));
    }

    changeDirection(direction) {
        this.directionQueue.push(direction);
    }

    growSnake() {
        this.grow = true;
    }

    checkCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) return true;
        }
        return false;
    }
}

class Food {
    constructor(snakeBody) {
        this.position = this.randomPosition(snakeBody);
    }

    randomPosition(snakeBody) {
        while (true) {
            const x = Math.floor(Math.random() * (WIDTH / CELL_SIZE)) * CELL_SIZE;
            const y = Math.floor(Math.random() * (HEIGHT / CELL_SIZE)) * CELL_SIZE;
            const newPosition = new Cube(x, y);

            if (snakeBody.every(segment => segment.x !== newPosition.x || segment.y !== newPosition.y)) {
                return newPosition;
            }
        }
    }

    draw() {
        this.position.draw(RED);
    }
}

function gameLoop() {
    const snake = new Snake();
    const food = new Food(snake.body);

    let lastFrameTime = 0;

    function loop(timestamp) {
        const deltaTime = timestamp - lastFrameTime;

        if (deltaTime >= 1000 / FPS) {
            snake.move();

            if (snake.body[0].x === food.position.x && snake.body[0].y === food.position.y) {
                snake.growSnake();
                food.position = new Food(snake.body).position;
            }

            if (snake.checkCollision()) {
                alert('Game Over');
                return;
            }

            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            snake.draw();
            food.draw();
            lastFrameTime = timestamp;
        }

        requestAnimationFrame(loop);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') snake.changeDirection('UP');
        if (e.key === 'ArrowDown') snake.changeDirection('DOWN');
        if (e.key === 'ArrowLeft') snake.changeDirection('LEFT');
        if (e.key === 'ArrowRight') snake.changeDirection('RIGHT');
    });

    // Додати підтримку сенсорних подій для мобільних пристроїв
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        handleTouch(x, y);
    });

    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        handleTouch(x, y);
    });

    function handleTouch(x, y) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        if (x < centerX - 50) snake.changeDirection('LEFT');
        if (x > centerX + 50) snake.changeDirection('RIGHT');
        if (y < centerY - 50) snake.changeDirection('UP');
        if (y > centerY + 50) snake.changeDirection('DOWN');
    }

    requestAnimationFrame(loop);
}

gameLoop();
