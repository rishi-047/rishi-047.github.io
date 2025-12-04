/**
 * LevelManager.js
 * Manages level progression, enemy spawning, and wave configurations
 */

class LevelManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.currentLevel = 1;
        this.maxLevel = 10;
        this.levelComplete = false;

        // Level configurations
        this.levelConfigs = {
            1: {
                name: 'Deep Space',
                enemyCount: 24,
                rows: 4,
                cols: 6,
                types: { basic: 1 },
                speedMultiplier: 1,
                shootMultiplier: 1
            },
            2: {
                name: 'Deep Space',
                enemyCount: 28,
                rows: 4,
                cols: 7,
                types: { basic: 1 },
                speedMultiplier: 1.1,
                shootMultiplier: 1.2
            },
            3: {
                name: 'Nebula Field',
                enemyCount: 30,
                rows: 5,
                cols: 6,
                types: { basic: 0.7, fast: 0.3 },
                speedMultiplier: 1.2,
                shootMultiplier: 1.3
            },
            4: {
                name: 'Nebula Field',
                enemyCount: 32,
                rows: 4,
                cols: 8,
                types: { basic: 0.6, fast: 0.4 },
                speedMultiplier: 1.3,
                shootMultiplier: 1.4
            },
            5: {
                name: 'Asteroid Belt',
                enemyCount: 36,
                rows: 6,
                cols: 6,
                types: { basic: 0.5, fast: 0.3, elite: 0.2 },
                speedMultiplier: 1.3,
                shootMultiplier: 1.5
            },
            6: {
                name: 'Asteroid Belt',
                enemyCount: 40,
                rows: 5,
                cols: 8,
                types: { basic: 0.4, fast: 0.3, elite: 0.3 },
                speedMultiplier: 1.4,
                shootMultiplier: 1.6
            },
            7: {
                name: 'Alien Territory',
                enemyCount: 40,
                rows: 5,
                cols: 8,
                types: { basic: 0.3, fast: 0.4, elite: 0.3 },
                speedMultiplier: 1.5,
                shootMultiplier: 1.7
            },
            8: {
                name: 'Alien Territory',
                enemyCount: 44,
                rows: 4,
                cols: 11,
                types: { basic: 0.2, fast: 0.4, elite: 0.4 },
                speedMultiplier: 1.6,
                shootMultiplier: 1.8
            },
            9: {
                name: 'Warp Zone',
                enemyCount: 48,
                rows: 6,
                cols: 8,
                types: { fast: 0.5, elite: 0.5 },
                speedMultiplier: 1.8,
                shootMultiplier: 2
            },
            10: {
                name: 'Boss Lair',
                enemyCount: 20,
                rows: 4,
                cols: 5,
                types: { fast: 0.6, elite: 0.4 },
                speedMultiplier: 1.5,
                shootMultiplier: 1.5,
                isBossLevel: true
            }
        };

        // Formation movement
        this.formationX = 0;
        this.formationY = 0;
        this.formationVx = 1;
        this.formationVy = 0;
        this.formationBounces = 0;

        // Boundaries
        this.leftBound = 50;
        this.rightBound = canvasWidth - 50;
    }

    getCurrentConfig() {
        return this.levelConfigs[this.currentLevel] || this.levelConfigs[1];
    }

    generateEnemies() {
        const config = this.getCurrentConfig();
        const enemies = [];

        const startX = (this.canvasWidth - (config.cols - 1) * 55) / 2;
        const startY = 60;
        const spacingX = 55;
        const spacingY = 45;

        let enemyIndex = 0;

        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                if (enemyIndex >= config.enemyCount) break;

                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                const type = this.getEnemyType(config.types);

                const enemy = new Enemy(x, y, type);
                enemy.shootChance *= config.shootMultiplier;

                enemies.push(enemy);
                enemyIndex++;
            }
        }

        // Reset formation
        this.formationX = 0;
        this.formationY = 0;
        this.formationVx = config.speedMultiplier;
        this.formationVy = 0;
        this.formationBounces = 0;

        return enemies;
    }

    getEnemyType(typeWeights) {
        const random = Math.random();
        let cumulative = 0;

        for (const [type, weight] of Object.entries(typeWeights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return type;
            }
        }

        return 'basic';
    }

    generateMinions() {
        // Generate minions spawned by boss
        const minions = [];
        const count = 4 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
            const x = this.canvasWidth / 2 + (i - count / 2) * 50;
            const y = 150;
            minions.push(new Enemy(x, y, 'minion'));
        }

        return minions;
    }

    updateFormation(enemies) {
        // Find formation bounds
        let minX = this.canvasWidth, maxX = 0;
        let activeEnemies = enemies.filter(e => e.isAlive);

        if (activeEnemies.length === 0) {
            this.levelComplete = true;
            return { vx: 0, vy: 0 };
        }

        activeEnemies.forEach(enemy => {
            if (enemy.x < minX) minX = enemy.x;
            if (enemy.x > maxX) maxX = enemy.x;
        });

        // Move formation
        this.formationX += this.formationVx;

        // Check bounds and reverse
        if (minX + this.formationVx < this.leftBound || maxX + this.formationVx > this.rightBound) {
            this.formationVx *= -1;
            this.formationBounces++;

            // Move down after each bounce
            this.formationY += 10;

            return { vx: this.formationVx, vy: 10 };
        }

        return { vx: this.formationVx, vy: 0 };
    }

    isLevelComplete(enemies, boss = null) {
        const config = this.getCurrentConfig();

        if (config.isBossLevel) {
            // Boss level complete when boss is defeated
            return boss && !boss.isAlive;
        }

        // Regular level complete when all enemies dead
        return enemies.every(e => !e.isAlive);
    }

    isBossLevel() {
        return this.getCurrentConfig().isBossLevel;
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.levelComplete = false;
            return true;
        }
        return false; // Game complete
    }

    reset() {
        this.currentLevel = 1;
        this.levelComplete = false;
        this.formationX = 0;
        this.formationY = 0;
        this.formationVx = 1;
        this.formationVy = 0;
    }

    getLevelName() {
        return this.getCurrentConfig().name;
    }

    getCurrentLevel() {
        return this.currentLevel;
    }

    getMaxLevel() {
        return this.maxLevel;
    }

    isLastLevel() {
        return this.currentLevel === this.maxLevel;
    }
}
