/**
 * Player.js
 * Player ship with controls, shooting, and power-up states
 */

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Position
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        this.width = 40;
        this.height = 40;

        // Movement
        this.speed = 5;
        this.vx = 0;
        this.friction = 0.85;

        // Shooting
        this.shootCooldown = 0;
        this.baseFireRate = 15; // frames between shots
        this.fireRate = this.baseFireRate;

        // Power-ups
        this.activePowerUp = null;
        this.powerUpTimer = 0;

        // Shield
        this.shieldActive = false;
        this.shieldHits = 0;
        this.shieldPulse = 0;

        // State
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        this.flashTimer = 0;
        this.isAlive = true;

        // Visual
        this.thrustIntensity = 0;
        this.tilt = 0;
    }

    update(input) {
        if (!this.isAlive) return;

        // Movement
        if (input.isDown('left')) {
            this.vx -= 0.8;
            this.tilt = Math.max(this.tilt - 0.1, -0.3);
        } else if (input.isDown('right')) {
            this.vx += 0.8;
            this.tilt = Math.min(this.tilt + 0.1, 0.3);
        } else {
            this.tilt *= 0.9;
        }

        this.vx *= this.friction;
        this.x += this.vx;

        // Thrust visual
        this.thrustIntensity = Math.abs(this.vx) / this.speed;

        // Bounds
        if (this.x < this.width / 2) {
            this.x = this.width / 2;
            this.vx = 0;
        }
        if (this.x > this.canvasWidth - this.width / 2) {
            this.x = this.canvasWidth - this.width / 2;
            this.vx = 0;
        }

        // Shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Power-up timer
        if (this.powerUpTimer > 0) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                this.clearPowerUp();
            }
        }

        // Shield pulse
        if (this.shieldActive) {
            this.shieldPulse += 0.1;
        }

        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTimer--;
            this.flashTimer++;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }

    shoot() {
        if (this.shootCooldown > 0 || !this.isAlive) return [];

        this.shootCooldown = this.fireRate;
        const bullets = [];

        if (this.activePowerUp === 'tripleShot') {
            // Triple shot - spread pattern
            bullets.push(new Projectile(this.x, this.y - this.height / 2, {
                vy: -12,
                color: '#00ff66',
                isPlayerBullet: true
            }));
            bullets.push(new Projectile(this.x - 15, this.y - this.height / 2 + 5, {
                vx: -2,
                vy: -11,
                color: '#00ff66',
                isPlayerBullet: true
            }));
            bullets.push(new Projectile(this.x + 15, this.y - this.height / 2 + 5, {
                vx: 2,
                vy: -11,
                color: '#00ff66',
                isPlayerBullet: true
            }));
        } else {
            // Normal shot
            bullets.push(new Projectile(this.x, this.y - this.height / 2, {
                vy: -12,
                color: '#00ffff',
                isPlayerBullet: true
            }));
        }

        return bullets;
    }

    draw(ctx) {
        if (!this.isAlive) return;

        // Flash when invulnerable
        if (this.invulnerable && Math.floor(this.flashTimer / 4) % 2 === 0) {
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt);

        // Engine thrust
        this.drawThrust(ctx);

        // Ship body
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';

        // Main body shape
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); // Top point
        ctx.lineTo(this.width / 2, this.height / 2 - 5); // Right
        ctx.lineTo(this.width / 4, this.height / 4); // Right inner
        ctx.lineTo(0, this.height / 2); // Bottom center
        ctx.lineTo(-this.width / 4, this.height / 4); // Left inner
        ctx.lineTo(-this.width / 2, this.height / 2 - 5); // Left
        ctx.closePath();

        // Fill with gradient
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0088aa');
        gradient.addColorStop(1, '#004455');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Outline
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cockpit
        ctx.beginPath();
        ctx.ellipse(0, -5, 6, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#66ffff';
        ctx.fill();

        ctx.restore();

        // Shield effect
        if (this.shieldActive) {
            this.drawShield(ctx);
        }

        // Power-up indicator
        if (this.activePowerUp) {
            this.drawPowerUpIndicator(ctx);
        }
    }

    drawThrust(ctx) {
        const intensity = 0.5 + this.thrustIntensity * 0.5 + Math.random() * 0.3;
        const flameHeight = 15 + intensity * 10;

        // Left engine
        ctx.beginPath();
        ctx.moveTo(-10, this.height / 2 - 5);
        ctx.lineTo(-15, this.height / 2 + flameHeight);
        ctx.lineTo(-5, this.height / 2 - 5);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, this.height / 2, 0, this.height / 2 + flameHeight);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#00ffff');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Right engine
        ctx.beginPath();
        ctx.moveTo(10, this.height / 2 - 5);
        ctx.lineTo(15, this.height / 2 + flameHeight);
        ctx.lineTo(5, this.height / 2 - 5);
        ctx.closePath();
        ctx.fill();
    }

    drawShield(ctx) {
        const radius = this.width * 0.8 + Math.sin(this.shieldPulse) * 3;

        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(this.shieldPulse * 2) * 0.2;

        // Shield bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.stroke();

        // Shield hits indicator
        ctx.font = 'bold 12px Orbitron';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText(this.shieldHits.toString(), this.x, this.y - radius - 10);

        ctx.restore();
    }

    drawPowerUpIndicator(ctx) {
        const colors = {
            rapidFire: '#00aaff',
            tripleShot: '#00ff66'
        };

        const color = colors[this.activePowerUp] || '#ffffff';
        const radius = this.width * 0.6;

        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    setPowerUp(type, duration) {
        this.activePowerUp = type;
        this.powerUpTimer = duration;

        if (type === 'rapidFire') {
            this.fireRate = Math.floor(this.baseFireRate / 3);
        }
    }

    clearPowerUp() {
        this.activePowerUp = null;
        this.powerUpTimer = 0;
        this.fireRate = this.baseFireRate;
    }

    activateShield(hits) {
        this.shieldActive = true;
        this.shieldHits = hits;
    }

    hit() {
        if (this.invulnerable) return false;

        if (this.shieldActive) {
            this.shieldHits--;
            if (this.shieldHits <= 0) {
                this.shieldActive = false;
            }
            return false;
        }

        // Take damage
        this.invulnerable = true;
        this.invulnerableTimer = 120; // 2 seconds
        this.flashTimer = 0;

        return true;
    }

    die() {
        this.isAlive = false;
    }

    respawn() {
        this.x = this.canvasWidth / 2;
        this.y = this.canvasHeight - 60;
        this.vx = 0;
        this.isAlive = true;
        this.invulnerable = true;
        this.invulnerableTimer = 180;
        this.flashTimer = 0;
        this.clearPowerUp();
        this.shieldActive = false;
        this.shieldHits = 0;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2 + 5,
            y: this.y - this.height / 2 + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }

    getActivePowerUpName() {
        const names = {
            rapidFire: 'RAPID FIRE',
            tripleShot: 'TRIPLE SHOT'
        };
        if (this.shieldActive) return 'SHIELD';
        return names[this.activePowerUp] || 'NONE';
    }
}
