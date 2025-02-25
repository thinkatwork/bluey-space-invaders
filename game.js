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
        // Play Again button
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.resetGame();
        });

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
        this.gameRunning = true;
        this.score = 0;
        this.player.lives = 3;
        this.invaderSpeed = 1;
        this.invaderDirection = 1;
        this.bullets = [];
        
        this.createInvaders();
        this.resizeCanvas();
        
        this.gameOverDiv.classList.add('hidden');
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        this.startGameLoop();
    }

    endGame(won) {
        this.gameRunning = false;
        this.player.dx = 0;
        this.bullets = [];
        
        this.gameOverText.textContent = won ? 
            `Well Done ${this.playerName}!!! Score: ${this.score}` : 
            `Game Over ${this.playerName}! Score: ${this.score}`;
        
        this.gameOverDiv.classList.remove('hidden');
        
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    // ... rest of your game methods (createPlayer, createInvaders, update, draw, etc.)
    
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