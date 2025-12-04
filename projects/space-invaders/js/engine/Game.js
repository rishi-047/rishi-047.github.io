/**
 * Game.js
 * Main game controller - manages game loop, states, and scene coordination
 */

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Core systems
        this.inputHandler = new InputHandler();
        this.audioManager = new AudioManager();
        this.particleSystem = new ParticleSystem();
        this.sceneryManager = new SceneryManager(this.canvas.width, this.canvas.height);
        this.collisionManager = new CollisionManager();
        this.scoreManager = new ScoreManager();
        this.levelManager = new LevelManager(this.canvas.width, this.canvas.height);

        // UI
        this.hud = new HUD();
        this.menu = new Menu(this);

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover, victory, transition
        this.lives = 3;
        this.maxLives = 5;

        // Game entities
        this.player = null;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.boss = null;

        // Screen effects
        this.screenShake = 0;
        this.screenFlash = 0;
        this.screenFlashColor = '#ffffff';
        this.slowMotion = false;
        this.slowMotionTimer = 0;

        // Frame tracking
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;

        // Bind game loop
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            this.audioManager.init();
            this.audioManager.resume();
        }, { once: true });

        document.addEventListener('keydown', () => {
            this.audioManager.init();
            this.audioManager.resume();
        }, { once: true });

        // Show main menu
        this.menu.showMainMenu();

        // Start game loop (for menu animations)
        requestAnimationFrame(this.gameLoop);
    }

    startGame() {
        // Reset game state
        this.lives = 3;
        this.scoreManager.reset();
        this.levelManager.reset();
        this.particleSystem.clear();

        // Initialize player
        this.player = new Player(this.canvas.width, this.canvas.height);

        // Clear entities
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.boss = null;

        // Start first level
        this.startLevel();
    }

    async startLevel() {
        this.state = 'transition';

        const level = this.levelManager.getCurrentLevel();
        const levelName = this.levelManager.getLevelName();

        // Update scenery
        this.sceneryManager.setLevel(level);

        // Show level transition
        await this.menu.showLevelTransition(level, levelName);

        // Spawn enemies
        try {
            if (this.levelManager.isBossLevel()) {
                // Boss level
                this.enemies = this.levelManager.generateEnemies();
                this.boss = new Boss(this.canvas.width, this.canvas.height);
                this.audioManager.playBossWarning();
                this.hud.showBossHealth();
            } else {
                // Regular level
                this.enemies = this.levelManager.generateEnemies();
                this.boss = null;
                this.hud.hideBossHealth();
            }

            // Start playing
            this.state = 'playing';
            this.hud.show();
            this.hud.updateLives(this.lives);
            this.hud.updateLevel(level);

            // Start music
            this.audioManager.startMusic(this.boss ? 'boss' : 'normal');
        } catch (error) {
            console.error('startLevel: Error during initialization:', error);
        }
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.menu.showPause();
            this.audioManager.stopMusic();
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.menu.hidePause();
            this.audioManager.startMusic(this.boss ? 'boss' : 'normal');
        }
    }

    quitToMenu() {
        this.state = 'menu';
        this.audioManager.stopMusic();
        this.hud.hide();
        this.menu.showMainMenu();
        this.particleSystem.clear();
    }

    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.frameCount++;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake
        if (this.screenShake > 0) {
            this.ctx.save();
            const shakeX = (Math.random() - 0.5) * this.screenShake * 2;
            const shakeY = (Math.random() - 0.5) * this.screenShake * 2;
            this.ctx.translate(shakeX, shakeY);
            this.screenShake -= 0.5;
        }

        // Update and draw based on state
        switch (this.state) {
            case 'menu':
                this.updateMenu();
                this.drawMenu();
                break;
            case 'playing':
                this.update();
                this.draw();
                break;
            case 'paused':
                this.draw(); // Still draw but don't update
                break;
            case 'transition':
                this.sceneryManager.update();
                this.sceneryManager.draw(this.ctx);
                break;
            case 'gameover':
            case 'victory':
                this.sceneryManager.update();
                this.sceneryManager.draw(this.ctx);
                this.particleSystem.update();
                this.particleSystem.draw(this.ctx);
                break;
        }

        // Screen flash effect
        if (this.screenFlash > 0) {
            this.ctx.fillStyle = this.screenFlashColor;
            this.ctx.globalAlpha = this.screenFlash;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
            this.screenFlash -= 0.05;
        }

        // Restore from screen shake
        if (this.screenShake > 0) {
            this.ctx.restore();
        }

        requestAnimationFrame(this.gameLoop);
    }

    updateMenu() {
        // Animate background in menu
        this.sceneryManager.update();
    }

    drawMenu() {
        this.sceneryManager.draw(this.ctx);
    }

    update() {
        // Handle input
        this.handleInput();

        // Slow motion
        if (this.slowMotion) {
            this.slowMotionTimer--;
            if (this.slowMotionTimer <= 0) {
                this.slowMotion = false;
            }
            if (this.frameCount % 2 !== 0) return; // Skip every other frame
        }

        // Update scenery
        this.sceneryManager.update();

        // Update player
        this.player.update(this.inputHandler);

        // Player shooting
        if (this.inputHandler.isDown('shoot') && this.player.isAlive) {
            const bullets = this.player.shoot();
            if (bullets.length > 0) {
                this.playerBullets.push(...bullets);
                this.audioManager.playShoot();
            }
        }

        // Update enemies
        const formationMove = this.levelManager.updateFormation(this.enemies);
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update(formationMove.vx, formationMove.vy);

                // Enemy shooting
                const bullet = enemy.tryShoot();
                if (bullet) {
                    this.enemyBullets.push(bullet);
                    this.audioManager.playEnemyShoot();
                }
            }
        });

        // Update boss
        if (this.boss && this.boss.isAlive) {
            this.boss.update(this.player);

            // Boss attacks
            if (!this.boss.entering && !this.boss.phaseTransitioning) {
                // Phase transition effects
                if (this.boss.phaseTransitioning) {
                    this.screenShake = 10;
                    this.slowMotion = true;
                    this.slowMotionTimer = 30;
                }

                // Spawn minions
                if (this.boss.shouldSpawnMinions()) {
                    const minions = this.levelManager.generateMinions();
                    this.enemies.push(...minions);
                }
            }

            // Update HUD
            this.hud.updateBossHealth(this.boss.getHealthPercent(), this.boss.phase);
        }

        // Update bullets
        this.playerBullets.forEach(bullet => bullet.update());
        this.enemyBullets.forEach(bullet => bullet.update(this.player));

        // Update power-ups
        this.powerUps.forEach(powerUp => powerUp.update());

        // Update particles
        this.particleSystem.update();

        // Update score combo
        this.scoreManager.update();
        this.hud.updateCombo(this.scoreManager.getCombo(), this.scoreManager.getMultiplier());

        // Collision detection
        this.handleCollisions();

        // Clean up off-screen entities
        this.cleanup();

        // Check level completion
        this.checkLevelComplete();

        // Check game over conditions
        this.checkGameOver();

        // Clear input just-pressed states
        this.inputHandler.clearJustPressed();

        // Update HUD
        this.hud.updateScore(this.scoreManager.getScore());
        this.hud.updatePowerUp(this.player.getActivePowerUpName());
    }

    handleInput() {
        // Pause
        if (this.inputHandler.wasJustPressed('pause')) {
            this.pauseGame();
        }

        // Mute
        if (this.inputHandler.wasJustPressed('mute')) {
            this.audioManager.toggleMute();
        }
    }

    handleCollisions() {
        const results = this.collisionManager.checkCollisions(this);

        // Handle player hit
        if (results.playerHit) {
            this.lives--;
            this.hud.updateLives(this.lives);
            this.audioManager.playPlayerHit();
            this.screenShake = 15;
            this.screenFlash = 0.5;
            this.screenFlashColor = 'rgba(255, 0, 0, 0.5)';
            this.particleSystem.hitSpark(this.player.x, this.player.y, '#ff4444');

            if (this.lives <= 0) {
                this.player.die();
                this.particleSystem.bigExplosion(this.player.x, this.player.y);
            }
        }

        // Handle enemies killed
        results.enemiesKilled.forEach(({ enemy, x, y }) => {
            const scoreResult = this.scoreManager.addKill(enemy.type);
            this.particleSystem.explode(x, y, enemy.color);
            this.audioManager.playExplosion();
            this.hud.showScorePopup(x, y, scoreResult.points, scoreResult.combo);

            // Drop power-up chance
            if (enemy.shouldDropPowerUp()) {
                this.powerUps.push(new PowerUp(x, y));
            }
        });

        // Handle power-ups collected
        results.powerUpsCollected.forEach(({ powerUp, index }) => {
            const name = powerUp.apply(this.player, this);
            this.particleSystem.powerUpCollect(powerUp.x, powerUp.y, powerUp.config.color);
            this.audioManager.playPowerUp();

            // Remove from array
            this.powerUps.splice(index, 1);
        });

        // Handle boss hits
        results.bossHits.forEach(({ core, destroyed }) => {
            this.scoreManager.addBossHit(destroyed);
            this.audioManager.playHit();

            if (destroyed) {
                this.audioManager.playBigExplosion();
                this.screenShake = 20;
                this.particleSystem.bigExplosion(
                    this.boss.x + (core === 'left' ? -60 : core === 'right' ? 60 : 0),
                    this.boss.y + 20
                );
            }
        });

        // Remove used bullets
        this.collisionManager.removeAtIndices(this.playerBullets, results.playerBulletsRemoved);
        this.collisionManager.removeAtIndices(this.enemyBullets, results.enemyBulletsRemoved);
    }

    cleanup() {
        // Remove off-screen bullets
        this.playerBullets = this.playerBullets.filter(
            bullet => !bullet.isOffScreen(this.canvas.width, this.canvas.height) && !bullet.isDead()
        );
        this.enemyBullets = this.enemyBullets.filter(
            bullet => !bullet.isOffScreen(this.canvas.width, this.canvas.height) && !bullet.isDead()
        );

        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(
            powerUp => !powerUp.isOffScreen(this.canvas.height) && !powerUp.collected
        );
    }

    checkLevelComplete() {
        if (this.levelManager.isLevelComplete(this.enemies, this.boss)) {
            // Boss defeated
            if (this.boss && !this.boss.isAlive) {
                this.scoreManager.addBossDefeat();
                this.particleSystem.bossExplosion(this.boss.x, this.boss.y);
                this.audioManager.playBigExplosion();
                this.screenShake = 30;
                this.boss = null;
            }

            // Next level or victory
            if (this.levelManager.isLastLevel()) {
                this.victory();
            } else if (this.levelManager.nextLevel()) {
                this.audioManager.playLevelUp();
                this.audioManager.stopMusic();

                // Clear bullets
                this.playerBullets = [];
                this.enemyBullets = [];
                this.powerUps = [];

                // Respawn player if dead
                if (!this.player.isAlive) {
                    this.player.respawn();
                }

                // Start next level
                this.startLevel();
            }
        }
    }

    checkGameOver() {
        if (this.lives <= 0 && this.player && !this.player.isAlive) {
            this.gameOver();
        }

        // Check if enemies reached bottom
        if (this.collisionManager.checkEnemiesReachedBottom(this.enemies, this.canvas.height)) {
            this.gameOver();
        }
    }

    gameOver() {
        this.state = 'gameover';
        this.audioManager.stopMusic();
        this.audioManager.playGameOver();
        this.hud.hide();

        const score = this.scoreManager.getScore();
        const isNewHighscore = this.scoreManager.checkHighScore();

        if (isNewHighscore) {
            this.scoreManager.addHighScore('PLAYER');
        }

        setTimeout(() => {
            this.menu.showGameOver(score, isNewHighscore);
        }, 1500);
    }

    victory() {
        this.state = 'victory';
        this.audioManager.stopMusic();
        this.audioManager.playVictory();
        this.hud.hide();

        // Celebration particles
        this.particleSystem.celebrate(this.canvas.width, this.canvas.height);

        const score = this.scoreManager.getScore();
        this.scoreManager.addHighScore('VICTOR');

        setTimeout(() => {
            this.menu.showVictory(score);
        }, 3000);
    }

    draw() {
        // Draw scenery (background)
        this.sceneryManager.draw(this.ctx);

        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

        // Draw bullets
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.playerBullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx);
        }

        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);

            // Engine particles
            if (this.player.isAlive && Math.random() < 0.5) {
                this.particleSystem.thrust(
                    this.player.x,
                    this.player.y + this.player.height / 2,
                    Math.PI / 2,
                    '#00ffff'
                );
            }
        }

        // Draw particles
        this.particleSystem.draw(this.ctx);
    }

    // Game actions
    triggerBomb() {
        // Kill all regular enemies on screen
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.isAlive = false;
                this.particleSystem.explode(enemy.x, enemy.y, enemy.color);
                this.scoreManager.addKill(enemy.type);
            }
        });

        // Clear enemy bullets
        this.enemyBullets = [];

        // Visual effects
        this.screenFlash = 0.8;
        this.screenFlashColor = '#ff4444';
        this.screenShake = 20;
        this.audioManager.playBigExplosion();
    }

    addLife() {
        if (this.lives < this.maxLives) {
            this.lives++;
            this.hud.updateLives(this.lives);
        }
    }
}
