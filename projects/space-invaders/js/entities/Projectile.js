/**
 * Projectile.js
 * Handles all projectile types: player bullets, enemy bullets, homing missiles, laser beams
 */

class Projectile {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || 0;
        this.vy = options.vy || -10;
        this.width = options.width || 4;
        this.height = options.height || 15;
        this.color = options.color || '#00ffff';
        this.damage = options.damage || 1;
        this.isPlayerBullet = options.isPlayerBullet !== false;
        this.type = options.type || 'normal'; // normal, homing, laser, spread
        this.target = options.target || null;
        this.homingStrength = options.homingStrength || 0.1;
        this.life = options.life || Infinity;
        this.maxLife = this.life;
        this.glow = options.glow !== false;
        this.trail = [];
        this.trailLength = options.trailLength || 5;
    }

    update(player = null) {
        // Store position for trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // Homing behavior
        if (this.type === 'homing' && this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                this.vx += (dx / distance) * this.homingStrength;
                this.vy += (dy / distance) * this.homingStrength;

                // Limit speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxSpeed = 8;
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.save();

        // Draw trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = this.width * 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Glow effect
        if (this.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        // Different rendering based on type
        if (this.type === 'homing') {
            // Draw missile shape
            ctx.save();
            ctx.translate(this.x, this.y);
            const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            ctx.rotate(angle);

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.lineTo(0, this.height / 3);
            ctx.lineTo(-this.width / 2, this.height / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else {
            // Standard bullet
            ctx.fillStyle = this.color;

            // Rounded rectangle for bullet
            const radius = this.width / 2;
            ctx.beginPath();
            ctx.roundRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height,
                radius
            );
            ctx.fill();
        }

        ctx.restore();
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return (
            this.x < -50 ||
            this.x > canvasWidth + 50 ||
            this.y < -50 ||
            this.y > canvasHeight + 50
        );
    }

    isDead() {
        return this.life <= 0;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Laser beam (continuous damage)
class LaserBeam {
    constructor(x, startY, endY, width = 40) {
        this.x = x;
        this.startY = startY;
        this.endY = endY;
        this.width = width;
        this.targetWidth = width;
        this.currentWidth = 0;
        this.charging = true;
        this.chargeTime = 60; // frames to charge
        this.currentCharge = 0;
        this.duration = 120; // frames active
        this.currentDuration = 0;
        this.active = false;
        this.damage = 1;
        this.warningAlpha = 0;
    }

    update() {
        if (this.charging) {
            this.currentCharge++;
            this.warningAlpha = 0.3 + Math.sin(this.currentCharge * 0.3) * 0.2;

            if (this.currentCharge >= this.chargeTime) {
                this.charging = false;
                this.active = true;
                this.currentWidth = this.targetWidth;
            }
        } else if (this.active) {
            this.currentDuration++;

            // Flicker effect
            this.currentWidth = this.targetWidth * (0.8 + Math.random() * 0.4);

            if (this.currentDuration >= this.duration) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        if (this.charging) {
            // Warning line
            ctx.save();
            ctx.globalAlpha = this.warningAlpha;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.startY);
            ctx.lineTo(this.x, this.endY);
            ctx.stroke();
            ctx.restore();
        } else if (this.active) {
            ctx.save();

            // Core beam
            const gradient = ctx.createLinearGradient(
                this.x - this.currentWidth / 2, 0,
                this.x + this.currentWidth / 2, 0
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.2, '#ff4444');
            gradient.addColorStop(0.5, '#ffffff');
            gradient.addColorStop(0.8, '#ff4444');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.currentWidth / 2, this.startY, this.currentWidth, this.endY - this.startY);

            // Outer glow
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(this.x - this.currentWidth, this.startY, this.currentWidth * 2, this.endY - this.startY);

            ctx.restore();
        }
    }

    isDead() {
        return !this.charging && !this.active;
    }

    getBounds() {
        if (!this.active) return null;
        return {
            x: this.x - this.currentWidth / 2,
            y: this.startY,
            width: this.currentWidth,
            height: this.endY - this.startY
        };
    }
}
