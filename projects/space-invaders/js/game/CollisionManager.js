/**
 * CollisionManager.js
 * Handles all collision detection between game entities
 */

class CollisionManager {
    constructor() {
        // Empty constructor - stateless utility class
    }

    // Check rectangle overlap
    checkRectCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    // Check circle collision
    checkCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }

    // Check point in rectangle
    pointInRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.x + rect.width &&
            py >= rect.y &&
            py <= rect.y + rect.height
        );
    }

    // Main collision check function
    checkCollisions(game) {
        const results = {
            playerHit: false,
            enemiesKilled: [],
            powerUpsCollected: [],
            bossHits: [],
            playerBulletsRemoved: [],
            enemyBulletsRemoved: []
        };

        const player = game.player;
        const playerBounds = player.getBounds();

        // Player bullets vs Enemies
        game.playerBullets.forEach((bullet, bulletIndex) => {
            const bulletBounds = bullet.getBounds();

            // Check against regular enemies
            game.enemies.forEach((enemy, enemyIndex) => {
                if (!enemy.isAlive) return;

                const enemyBounds = enemy.getBounds();
                if (this.checkRectCollision(bulletBounds, enemyBounds)) {
                    const killed = enemy.hit(bullet.damage);
                    results.playerBulletsRemoved.push(bulletIndex);

                    if (killed) {
                        results.enemiesKilled.push({
                            enemy: enemy,
                            index: enemyIndex,
                            x: enemy.x,
                            y: enemy.y
                        });
                    }
                }
            });

            // Check against boss
            if (game.boss && game.boss.isAlive && !game.boss.entering) {
                const coreName = game.boss.getCoreAtPosition(bullet.x, bullet.y);
                if (coreName) {
                    const destroyed = game.boss.hitCore(coreName, bullet.damage);
                    results.playerBulletsRemoved.push(bulletIndex);
                    results.bossHits.push({
                        core: coreName,
                        destroyed: destroyed
                    });
                }
            }
        });

        // Enemy bullets vs Player
        if (player.isAlive && !player.invulnerable) {
            game.enemyBullets.forEach((bullet, bulletIndex) => {
                const bulletBounds = bullet.getBounds();

                if (this.checkRectCollision(bulletBounds, playerBounds)) {
                    results.enemyBulletsRemoved.push(bulletIndex);
                    if (player.hit()) {
                        results.playerHit = true;
                    }
                }
            });

            // Boss lasers vs Player
            if (game.boss && game.boss.isAlive) {
                game.boss.lasers.forEach(laser => {
                    const laserBounds = laser.getBounds();
                    if (laserBounds && this.checkRectCollision(playerBounds, laserBounds)) {
                        if (player.hit()) {
                            results.playerHit = true;
                        }
                    }
                });
            }
        }

        // Enemies vs Player (collision damage)
        if (player.isAlive && !player.invulnerable) {
            game.enemies.forEach(enemy => {
                if (!enemy.isAlive) return;

                const enemyBounds = enemy.getBounds();
                if (this.checkRectCollision(playerBounds, enemyBounds)) {
                    if (player.hit()) {
                        results.playerHit = true;
                    }
                }
            });
        }

        // Power-ups vs Player
        game.powerUps.forEach((powerUp, index) => {
            if (powerUp.collected) return;

            const powerUpBounds = powerUp.getBounds();
            if (this.checkRectCollision(playerBounds, powerUpBounds)) {
                results.powerUpsCollected.push({
                    powerUp: powerUp,
                    index: index
                });
            }
        });

        return results;
    }

    // Check if enemies reached bottom
    checkEnemiesReachedBottom(enemies, canvasHeight) {
        for (const enemy of enemies) {
            if (enemy.isAlive && enemy.y + enemy.height / 2 >= canvasHeight - 80) {
                return true;
            }
        }
        return false;
    }

    // Remove items at indices (from arrays)
    removeAtIndices(array, indices) {
        // Sort indices in descending order to remove from end first
        const sortedIndices = [...new Set(indices)].sort((a, b) => b - a);
        sortedIndices.forEach(index => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            }
        });
    }
}
