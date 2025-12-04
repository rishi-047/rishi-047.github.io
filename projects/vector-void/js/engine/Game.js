/**
 * Game.js
 * Main game loop and state management
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.input = new InputHandler();
        this.audio = new AudioController(); // Audio
        this.player = new Player(this);
        this.particles = [];
        this.bullets = [];
        this.asteroids = [];
        this.enemies = []; // Enemies
        this.blackHoles = [];

        this.lastTime = 0;
        this.isRunning = false;
        this.isGameOver = false;

        window.addEventListener('resize', () => this.resize());

        // Restart Button
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('game-over').classList.remove('active');
            document.getElementById('hud').classList.remove('hidden');
            this.start();
        });
    }

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    start() {
        this.isRunning = true;
        this.isGameOver = false;
        this.score = 0;
        this.lives = 3;

        // Reset Entities
        this.player = new Player(this);
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.enemies = [];
        this.blackHoles = [];

        // Update UI
        document.getElementById('score').innerText = this.score;
        document.getElementById('lives').innerText = this.lives;

        // Initial Spawn
        for (let i = 0; i < 5; i++) {
            this.spawnAsteroid();
        }

        // Spawn a Black Hole occasionally
        if (Math.random() > 0.5) this.spawnBlackHole();

        this.loop(0);
    }

    spawnAsteroid(x, y, size) {
        let pos;
        if (x === undefined) {
            // Spawn at edge
            if (Math.random() < 0.5) {
                pos = new Vector(Math.random() < 0.5 ? -50 : this.width + 50, Math.random() * this.height);
            } else {
                pos = new Vector(Math.random() * this.width, Math.random() < 0.5 ? -50 : this.height + 50);
            }
        } else {
            pos = new Vector(x, y);
        }
        this.asteroids.push(new Asteroid(pos.x, pos.y, size));
    }

    spawnBlackHole() {
        // Spawn away from center
        let x = Math.random() * this.width;
        let y = Math.random() * this.height;
        // Ensure not too close to player start
        while (Vector.dist(new Vector(x, y), new Vector(this.width / 2, this.height / 2)) < 300) {
            x = Math.random() * this.width;
            y = Math.random() * this.height;
        }
        this.blackHoles.push(new BlackHole(x, y));
    }

    spawnEnemy() {
        // Spawn at edge
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -50 : this.width + 50;
            y = Math.random() * this.height;
        } else {
            x = Math.random() * this.width;
            y = Math.random() < 0.5 ? -50 : this.height + 50;
        }
        this.enemies.push(new Enemy(x, y, this.player));
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        this.input.update();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.isGameOver) return;

        this.player.update();

        // Update entities
        this.particles = this.particles.filter(p => p.update());
        this.bullets = this.bullets.filter(b => b.update());
        this.asteroids.forEach(a => a.update());
        this.blackHoles.forEach(bh => bh.update());
        this.enemies = this.enemies.filter(e => e.update()); // Update Enemies

        // Gravity
        this.blackHoles.forEach(bh => {
            bh.pull(this.player);
            this.asteroids.forEach(a => bh.pull(a));
            this.bullets.forEach(b => bh.pull(b));
            this.enemies.forEach(e => bh.pull(e));
        });

        // Collisions
        this.checkCollisions();

        // Spawning Logic
        if (this.asteroids.length < 3) this.spawnAsteroid();
        if (this.enemies.length < 1 && Math.random() < 0.005) this.spawnEnemy(); // Rare enemy spawn
    }

    checkCollisions() {
        // Bullets hitting Asteroids & Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            let hit = false;

            // Vs Asteroids
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const a = this.asteroids[j];
                if (Vector.dist(b.pos, a.pos) < a.radius) {
                    this.bullets.splice(i, 1);
                    const newAsteroids = a.break();
                    this.asteroids.splice(j, 1);
                    this.asteroids.push(...newAsteroids);
                    this.createParticles(a.pos, a.color);
                    this.addScore(100 * (4 - a.size));
                    this.audio.playExplosion();
                    hit = true;
                    break;
                }
            }
            if (hit) continue;

            // Vs Enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                if (Vector.dist(b.pos, e.pos) < e.radius) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.createParticles(e.pos, e.color);
                    this.addScore(500);
                    this.audio.playExplosion();
                    hit = true;
                    break;
                }
            }
        }

        // Player vs Asteroids & Enemies
        if (!this.player.invulnerable) { // TODO: Add invulnerability
            // Vs Asteroids
            for (let a of this.asteroids) {
                if (Vector.dist(this.player.pos, a.pos) < this.player.radius + a.radius) {
                    this.playerHit();
                    return;
                }
            }
            // Vs Enemies
            for (let e of this.enemies) {
                if (Vector.dist(this.player.pos, e.pos) < this.player.radius + e.radius) {
                    this.playerHit();
                    return;
                }
            }
            // Vs Black Holes
            for (let bh of this.blackHoles) {
                if (Vector.dist(this.player.pos, bh.pos) < 20) { // Event horizon center
                    this.playerHit();
                    return;
                }
            }
        }
    }

    playerHit() {
        this.lives--;
        document.getElementById('lives').innerText = this.lives;
        this.createParticles(this.player.pos, this.player.color, 20);
        this.audio.playExplosion();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset position safely
            this.player.pos = new Vector(this.width / 2, this.height / 2);
            this.player.vel = new Vector(0, 0);
            // Clear nearby enemies/asteroids?
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.isRunning = false;
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('game-over').classList.add('active');
    }

    addScore(points) {
        this.score += points;
        document.getElementById('score').innerText = this.score;
    }

    createParticles(pos, color, count = 10) {
        for (let k = 0; k < count; k++) {
            this.particles.push(new Particle(
                pos.x, pos.y,
                Vector.random2D().mult(Math.random() * 3),
                color
            ));
        }
    }

    draw() {
        // Clear with trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Creates motion blur trails
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Grid (Optional, for depth)
        this.drawGrid();

        this.blackHoles.forEach(bh => bh.draw(this.ctx));
        if (!this.isGameOver) this.player.draw(this.ctx);
        this.asteroids.forEach(a => a.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx)); // Draw Enemies

        this.particles.forEach(p => p.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;

        const gridSize = 50;
        const offsetX = -this.player.pos.x * 0.1 % gridSize; // Parallax effect
        const offsetY = -this.player.pos.y * 0.1 % gridSize;

        this.ctx.beginPath();
        for (let x = offsetX; x < this.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = offsetY; y < this.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }
}
