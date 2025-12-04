/**
 * Boss.js
 * The Mothership - Final boss with 3 phases and multiple attack patterns
 */

class Boss {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Position
        this.x = canvasWidth / 2;
        this.y = -150;
        this.targetY = 80;
        this.width = 200;
        this.height = 100;

        // Health
        this.maxHp = 100;
        this.hp = this.maxHp;

        // Cores (weak points)
        this.leftCore = { hp: 15, maxHp: 15, destroyed: false };
        this.rightCore = { hp: 15, maxHp: 15, destroyed: false };
        this.mainCore = { hp: 70, maxHp: 70, vulnerable: false };

        // Phase system
        this.phase = 1;
        this.phaseTransitioning = false;
        this.phaseTransitionTimer = 0;

        // Movement
        this.vx = 0;
        this.movePhase = 0;
        this.moveSpeed = 1;

        // Attack system
        this.attackCooldown = 0;
        this.currentAttack = null;
        this.attackTimer = 0;
        this.lasers = [];

        // State
        this.isAlive = true;
        this.entering = true;
        this.hitFlash = 0;

        // Visual
        this.engineGlow = 0;
        this.damageSmoke = [];
        this.sparks = [];

        // Points
        this.points = 10000;
    }

    update(player) {
        // Entry animation
        if (this.entering) {
            this.y += 2;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.entering = false;
            }
            return;
        }

        // Phase transition
        if (this.phaseTransitioning) {
            this.phaseTransitionTimer--;
            if (this.phaseTransitionTimer <= 0) {
                this.phaseTransitioning = false;
            }
            return;
        }

        // Check phase transitions
        this.updatePhase();

        // Movement pattern
        this.movePhase += 0.02;
        const moveRange = this.phase === 3 ? 150 : 100;
        this.x = this.canvasWidth / 2 + Math.sin(this.movePhase) * moveRange;

        // Attack logic
        this.updateAttacks(player);

        // Update lasers
        this.lasers = this.lasers.filter(laser => {
            laser.update();
            return !laser.isDead();
        });

        // Hit flash decay
        if (this.hitFlash > 0) this.hitFlash--;

        // Engine glow
        this.engineGlow = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;

        // Update damage effects
        this.updateDamageEffects();
    }

    updatePhase() {
        const hpPercent = this.hp / this.maxHp;

        if (hpPercent <= 0.33 && this.phase < 3) {
            this.phase = 3;
            this.phaseTransitioning = true;
            this.phaseTransitionTimer = 60;
            this.moveSpeed = 2;
        } else if (hpPercent <= 0.66 && this.phase < 2) {
            this.phase = 2;
            this.phaseTransitioning = true;
            this.phaseTransitionTimer = 60;
            this.moveSpeed = 1.5;
        }

        // Make main core vulnerable when side cores destroyed
        if (this.leftCore.destroyed && this.rightCore.destroyed) {
            this.mainCore.vulnerable = true;
        }
    }

    updateAttacks(player) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        // Choose attack based on phase
        const attacks = this.getPhaseAttacks();
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        this.executeAttack(attack, player);
    }

    getPhaseAttacks() {
        switch (this.phase) {
            case 1:
                return ['spread', 'aimed', 'minions'];
            case 2:
                return ['spread', 'aimed', 'laser', 'minions', 'homing'];
            case 3:
                return ['bulletHell', 'laser', 'homing', 'emp', 'multiLaser'];
            default:
                return ['spread'];
        }
    }

    executeAttack(attack, player) {
        const bullets = [];

        switch (attack) {
            case 'spread':
                // Circular spread of bullets
                const spreadCount = 8 + this.phase * 4;
                for (let i = 0; i < spreadCount; i++) {
                    const angle = (Math.PI * 2 / spreadCount) * i + Math.PI / 2;
                    bullets.push(new Projectile(this.x, this.y + 30, {
                        vx: Math.cos(angle) * 3,
                        vy: Math.sin(angle) * 3,
                        color: '#ff4444',
                        isPlayerBullet: false,
                        width: 6,
                        height: 6
                    }));
                }
                this.attackCooldown = 60;
                break;

            case 'aimed':
                // Aimed at player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const speed = 5;

                for (let i = -1; i <= 1; i++) {
                    const spread = i * 0.2;
                    bullets.push(new Projectile(this.x, this.y + 40, {
                        vx: (dx / dist * speed) + spread,
                        vy: dy / dist * speed,
                        color: '#ff8800',
                        isPlayerBullet: false,
                        width: 5,
                        height: 12
                    }));
                }
                this.attackCooldown = 30;
                break;

            case 'laser':
                // Laser beam warning then fire
                this.lasers.push(new LaserBeam(
                    this.x,
                    this.y + 50,
                    this.canvasHeight,
                    60
                ));
                this.attackCooldown = 180;
                break;

            case 'multiLaser':
                // Multiple lasers
                const laserPositions = [-80, 0, 80];
                laserPositions.forEach((offset, i) => {
                    setTimeout(() => {
                        this.lasers.push(new LaserBeam(
                            this.x + offset,
                            this.y + 50,
                            this.canvasHeight,
                            50
                        ));
                    }, i * 200);
                });
                this.attackCooldown = 240;
                break;

            case 'homing':
                // Homing missiles
                for (let i = 0; i < 2; i++) {
                    bullets.push(new Projectile(this.x + (i === 0 ? -50 : 50), this.y + 30, {
                        vx: i === 0 ? -2 : 2,
                        vy: 2,
                        type: 'homing',
                        target: player,
                        homingStrength: 0.15,
                        color: '#ff00ff',
                        isPlayerBullet: false,
                        width: 8,
                        height: 16,
                        life: 300
                    }));
                }
                this.attackCooldown = 90;
                break;

            case 'minions':
                // Spawn minion enemies
                this.spawnMinions = true;
                this.attackCooldown = 120;
                break;

            case 'bulletHell':
                // Massive bullet pattern
                for (let wave = 0; wave < 3; wave++) {
                    setTimeout(() => {
                        const count = 16;
                        for (let i = 0; i < count; i++) {
                            const angle = (Math.PI / count) * i + Math.PI / 2 + wave * 0.1;
                            bullets.push(new Projectile(this.x, this.y + 40, {
                                vx: Math.cos(angle) * 4,
                                vy: Math.sin(angle) * 4,
                                color: '#ff0066',
                                isPlayerBullet: false,
                                width: 5,
                                height: 5
                            }));
                        }
                    }, wave * 150);
                }
                this.attackCooldown = 120;
                break;

            case 'emp':
                // EMP blast (visual warning only, handled by game)
                this.empBlast = true;
                this.empTimer = 120;
                this.attackCooldown = 180;
                break;
        }

        return bullets;
    }

    updateDamageEffects() {
        // Add smoke when damaged
        if (this.hp < this.maxHp * 0.5 && Math.random() < 0.1) {
            this.damageSmoke.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: this.y + Math.random() * this.height / 2,
                size: 5 + Math.random() * 10,
                life: 30
            });
        }

        // Update smoke
        this.damageSmoke = this.damageSmoke.filter(smoke => {
            smoke.y -= 0.5;
            smoke.size *= 1.02;
            smoke.life--;
            return smoke.life > 0;
        });

        // Sparks on cores
        if (this.leftCore.destroyed && Math.random() < 0.1) {
            this.sparks.push({
                x: this.x - 60,
                y: this.y + 20,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2,
                life: 10
            });
        }
        if (this.rightCore.destroyed && Math.random() < 0.1) {
            this.sparks.push({
                x: this.x + 60,
                y: this.y + 20,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2,
                life: 10
            });
        }

        this.sparks = this.sparks.filter(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.life--;
            return spark.life > 0;
        });
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Phase transition flash
        if (this.phaseTransitioning) {
            ctx.fillStyle = `rgba(255, 0, 0, ${0.5 * Math.sin(Date.now() * 0.02)})`;
            ctx.fillRect(-this.canvasWidth, -this.canvasHeight, this.canvasWidth * 2, this.canvasHeight * 2);
        }

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ffffff';
        }

        // Main body
        this.drawBody(ctx);

        // Cores
        this.drawCores(ctx);

        // Turrets
        this.drawTurrets(ctx);

        // Damage effects
        this.drawDamageEffects(ctx);

        ctx.restore();

        // Draw lasers
        this.lasers.forEach(laser => laser.draw(ctx));

        // EMP visual
        if (this.empBlast && this.empTimer > 0) {
            this.drawEMPBlast(ctx);
            this.empTimer--;
            if (this.empTimer <= 0) {
                this.empBlast = false;
            }
        }
    }

    drawBody(ctx) {
        // Main hull
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#666666');
        gradient.addColorStop(0.5, '#444444');
        gradient.addColorStop(1, '#222222');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 3, -this.height / 2);
        ctx.lineTo(this.width / 3, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 3, this.height / 2);
        ctx.lineTo(-this.width / 3, this.height / 2);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Panel lines
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.width / 4, -this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 2);
        ctx.moveTo(this.width / 4, -this.height / 2);
        ctx.lineTo(this.width / 4, this.height / 2);
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(this.width / 2, 0);
        ctx.stroke();

        // Engine glow
        ctx.fillStyle = `rgba(255, 100, 0, ${this.engineGlow})`;
        ctx.beginPath();
        ctx.ellipse(-this.width / 3, -this.height / 2 - 10, 15, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(this.width / 3, -this.height / 2 - 10, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCores(ctx) {
        // Left core
        if (!this.leftCore.destroyed) {
            this.drawCore(ctx, -60, 20, this.leftCore, '#ff4444');
        } else {
            this.drawDestroyedCore(ctx, -60, 20);
        }

        // Right core
        if (!this.rightCore.destroyed) {
            this.drawCore(ctx, 60, 20, this.rightCore, '#ff4444');
        } else {
            this.drawDestroyedCore(ctx, 60, 20);
        }

        // Main core
        if (this.mainCore.vulnerable) {
            this.drawCore(ctx, 0, 10, this.mainCore, '#ffff00', true);
        } else {
            // Shielded main core
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(0, 10, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    drawCore(ctx, x, y, core, color, isMain = false) {
        const radius = isMain ? 25 : 18;
        const pulseRadius = radius + Math.sin(Date.now() * 0.01) * 3;

        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        // Core
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Health indicator
        const healthPercent = core.hp / core.maxHp;
        ctx.fillStyle = `rgba(0, 0, 0, ${1 - healthPercent})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    drawDestroyedCore(ctx, x, y) {
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        // Destruction marks
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15);
            ctx.stroke();
        }
    }

    drawTurrets(ctx) {
        const turretPositions = [-70, -35, 0, 35, 70];

        turretPositions.forEach((xPos, i) => {
            const yPos = this.height / 2 - 5;

            // Turret base
            ctx.fillStyle = '#555555';
            ctx.fillRect(xPos - 8, yPos - 5, 16, 15);

            // Turret barrel
            ctx.fillStyle = '#777777';
            ctx.fillRect(xPos - 3, yPos + 5, 6, 12);

            // Muzzle glow
            if (Math.random() < 0.1) {
                ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(xPos, yPos + 17, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    drawDamageEffects(ctx) {
        // Smoke
        this.damageSmoke.forEach(smoke => {
            ctx.fillStyle = `rgba(50, 50, 50, ${smoke.life / 30})`;
            ctx.beginPath();
            ctx.arc(smoke.x - this.x, smoke.y - this.y, smoke.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Sparks
        this.sparks.forEach(spark => {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(spark.x - this.x - 1, spark.y - this.y - 1, 3, 3);
        });
    }

    drawEMPBlast(ctx) {
        const radius = (120 - this.empTimer) * 5;
        const alpha = this.empTimer / 120;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Electric arcs
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            let x = this.x, y = this.y;
            for (let j = 0; j < 10; j++) {
                x += Math.cos(angle) * (radius / 10) + (Math.random() - 0.5) * 20;
                y += Math.sin(angle) * (radius / 10) + (Math.random() - 0.5) * 20;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    hitCore(coreName, damage = 1) {
        let core;
        switch (coreName) {
            case 'left':
                core = this.leftCore;
                break;
            case 'right':
                core = this.rightCore;
                break;
            case 'main':
                if (!this.mainCore.vulnerable) return false;
                core = this.mainCore;
                break;
            default:
                return false;
        }

        if (core.destroyed) return false;

        core.hp -= damage;
        this.hitFlash = 10;

        if (core.hp <= 0) {
            core.destroyed = true;
            if (coreName === 'main') {
                this.hp = 0;
                this.isAlive = false;
            }
            return true; // Core destroyed
        }

        // Update total HP
        this.hp = this.leftCore.hp + this.rightCore.hp + this.mainCore.hp;
        return false;
    }

    getCoreAtPosition(x, y) {
        // Check left core
        if (!this.leftCore.destroyed) {
            const dx = x - (this.x - 60);
            const dy = y - (this.y + 20);
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                return 'left';
            }
        }

        // Check right core
        if (!this.rightCore.destroyed) {
            const dx = x - (this.x + 60);
            const dy = y - (this.y + 20);
            if (Math.sqrt(dx * dx + dy * dy) < 20) {
                return 'right';
            }
        }

        // Check main core
        if (this.mainCore.vulnerable && !this.mainCore.destroyed) {
            const dx = x - this.x;
            const dy = y - (this.y + 10);
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                return 'main';
            }
        }

        return null;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    getHealthPercent() {
        return this.hp / this.maxHp;
    }

    shouldSpawnMinions() {
        if (this.spawnMinions) {
            this.spawnMinions = false;
            return true;
        }
        return false;
    }

    getAttackBullets(player) {
        if (this.entering || this.phaseTransitioning) return [];
        return this.executeAttack(null, player) || [];
    }
}
