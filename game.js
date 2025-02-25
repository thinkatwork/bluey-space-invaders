class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverDiv = document.getElementById('game-over');
        this.gameOverText = document.getElementById('game-over-text');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        this.playerName = "Reggie";
        this.score = 0;
        this.gameRunning = true;
        this.lastTime = 0;
        this.gameLoopId = null;
        
        // Initialize game objects
        this.bullets = [];
        this.invaders = [];
        this.invaderSpeed = 1;
        this.invaderDirection = 1;
        this.shootCooldown = 0;
        
        this.blueyCharacters = [
            "Bluey", "Bingo", "Bandit", "Chilli", "Muffin",
            "Socks", "Lucky", "Judo", "Rusty", "Coco"
        ];
        
        this.setupEventListeners();
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createPlayer();
        this.createInvaders();
        this.startGameLoop();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        // Play Again button - remove existing listeners and add new ones
        this.playAgainBtn.replaceWith(this.playAgainBtn.cloneNode(true));
        this.playAgainBtn = document.getElementById('play-again-btn'); // Get fresh reference
        
        const handlePlayAgain = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Play Again clicked/touched');
            this.resetGame();
        };

        this.playAgainBtn.addEventListener('click', handlePlayAgain, { capture: true });
        this.playAgainBtn.addEventListener('touchstart', handlePlayAgain, { capture: true });

        // Touch Controls
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const shootBtn = document.getElementById('shoot-btn');

        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.dx = -this.player.speed;
        });

        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.dx = this.player.speed;
        });

        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.shoot();
        });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.player.dx = 0;
        });

        // Keyboard Controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.player.dx = -this.player.speed;
            if (e.key === 'ArrowRight') this.player.dx = this.player.speed;
            if (e.key === ' ') this.shoot();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.player.dx = 0;
        });
    }

    resetGame() {
        console.log('Reset game called');
        
        // Hide game over screen first
        this.gameOverDiv.classList.add('hidden');
        
        // Reset all game state
        this.gameRunning = true;
        this.score = 0;
        this.player.lives = 3;
        this.invaderSpeed = 1;
        this.invaderDirection = 1;
        this.bullets = [];
        this.lastTime = 0;
        
        // Reset positions
        this.player.x = this.canvas.width/2 - this.player.width/2;
        this.player.y = this.canvas.height - 50;
        this.player.dx = 0;
        
        // Create new invaders
        this.createInvaders();
        
        // Cancel existing game loop if any
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        // Start new game loop
        this.startGameLoop();
        
        // Force a redraw
        this.draw();
    }

    endGame(won) {
        this.gameRunning = false;
        
        // Stop the game loop
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        // Clear any movement
        this.player.dx = 0;
        this.bullets = [];
        
        // Update and show game over screen
        this.gameOverText.textContent = won ? 
            `Well Done ${this.playerName}!!! Score: ${this.score}` : 
            `Game Over ${this.playerName}! Score: ${this.score}`;
        
        this.gameOverDiv.classList.remove('hidden');
        
        // Ensure the button is clickable
        this.playAgainBtn.style.pointerEvents = 'auto';
        console.log('Game Over screen shown');
    }

    createPlayer() {
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 50,
            width: 50,
            height: 20,
            speed: 5,
            dx: 0,
            lives: 3
        };
    }

    createInvaders() {
        this.invaders = [];
        const columns = 8;
        const rows = 5;
        const spacing = this.canvas.width / (columns + 2);
        const startX = spacing;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                this.invaders.push({
                    x: startX + j * spacing,
                    y: i * 50 + 50,
                    width: 40,
                    height: 30,
                    alive: true,
                    name: this.blueyCharacters[Math.floor(Math.random() * this.blueyCharacters.length)]
                });
            }
        }
    }

    resizeCanvas() {
        this.canvas.width = Math.min(window.innerWidth, 800);
        this.canvas.height = Math.min(window.innerHeight - 150, this.canvas.width * 0.75);
        
        if (this.player) {
            this.player.x = this.canvas.width / 2 - this.player.width / 2;
            this.player.y = this.canvas.height - 50;
        }
        
        if (this.invaders.length > 0) {
            const spacing = this.canvas.width / 10;
            this.invaders.forEach((invader, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                invader.x = col * spacing + spacing;
                invader.y = row * 50 + 50;
            });
        }
    }

    shoot() {
        if (this.gameRunning && this.shootCooldown <= 0) {
            this.bullets.push({
                x: this.player.x + this.player.width/2 - 2,
                y: this.player.y,
                width: 4,
                height: 10
            });
            this.shootCooldown = 200;
        }
    }

    update(delta) {
        if (!this.gameRunning) return;

        const deltaTime = delta / 1000;

        // Update player position
        const nextX = this.player.x + this.player.dx * deltaTime * 60;
        if (nextX >= 0 && nextX + this.player.width <= this.canvas.width) {
            this.player.x = nextX;
        }

        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.y -= 5 * deltaTime * 60;
            if (bullet.y < 0) this.bullets.splice(index, 1);

            this.invaders.forEach((invader, invIndex) => {
                if (invader.alive && 
                    bullet.x < invader.x + invader.width &&
                    bullet.x + bullet.width > invader.x &&
                    bullet.y < invader.y + invader.height &&
                    bullet.y + bullet.height > invader.y) {
                    invader.alive = false;
                    this.bullets.splice(index, 1);
                    this.score += 10;
                }
            });
        });

        // Update invaders
        let edgeReached = false;
        this.invaders.forEach(invader => {
            if (invader.alive) {
                invader.x += this.invaderSpeed * this.invaderDirection * deltaTime * 60;
                if (invader.x <= 0 || invader.x + invader.width >= this.canvas.width) {
                    edgeReached = true;
                }
                if (invader.y + invader.height >= this.player.y) {
                    this.player.lives--;
                }
            }
        });

        if (edgeReached) {
            this.invaderDirection *= -1;
            this.invaders.forEach(invader => {
                if (invader.alive) invader.y += 20;
            });
            this.invaderSpeed += 0.2;
        }

        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= delta;
        }

        // Check win/lose conditions
        const aliveInvaders = this.invaders.filter(i => i.alive).length;
        if (aliveInvaders === 0) this.endGame(true);
        if (this.player.lives <= 0) this.endGame(false);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 25, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + 20);
        this.ctx.lineTo(this.player.x + 50, this.player.y + 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw player name
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(this.playerName, this.player.x, this.player.y - 10);

        // Draw bullets
        this.ctx.fillStyle = '#ff4444';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw invaders
        this.invaders.forEach(invader => {
            if (invader.alive) {
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.beginPath();
                this.ctx.moveTo(invader.x + 20, invader.y);
                this.ctx.lineTo(invader.x, invader.y + 20);
                this.ctx.lineTo(invader.x + 10, invader.y + 10);
                this.ctx.lineTo(invader.x + 30, invader.y + 10);
                this.ctx.lineTo(invader.x + 40, invader.y + 20);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(invader.name, invader.x, invader.y - 5);
            }
        });

        // Draw score and lives
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 25);
        this.ctx.fillText(`Lives: ${this.player.lives}`, this.canvas.width - 100, 25);
    }

    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const delta = Math.min(timestamp - this.lastTime, 100);
            this.lastTime = timestamp;

            if (this.gameRunning) {
                this.update(delta);
                this.draw();
                this.gameLoopId = requestAnimationFrame(gameLoop);
            }
        };

        this.gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// Start the game
const game = new Game(); 