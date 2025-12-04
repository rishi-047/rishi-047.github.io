/**
 * Enemy.js
 * Enemy entities with different types and behaviors
 */

class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;

        // Set properties based on type
        this.config = this.getConfig();
        this.width = this.config.width;
        this.height = this.config.height;
        this.hp = this.config.hp;
        this.maxHp = this.hp;
        this.speed = this.config.speed;
        this.points = this.config.points;
        this.color = this.config.color;
        this.shootChance = this.config.shootChance;

        // Movement
        this.vx = 0;
        this.vy = 0;
        this.baseX = x;
        this.movePhase = Math.random() * Math.PI * 2;

        // State
        this.isAlive = true;
        this.hitFlash = 0;

        // Animation
        this.animPhase = Math.random() * Math.PI * 2;
        this.eyeGlow = 0;
    }

    getConfig() {
        const configs = {
            basic: {
                width: 35,
                height: 30,
                hp: 1,
                speed: 1,
                points: 100,
                color: '#ff4444',
                shootChance: 0.002
            },
            fast: {
                width: 30,
                height: 25,
                hp: 1,
                speed: 2,
                points: 150,
                color: '#ff8844',
                shootChance: 0.003
            },
            elite: {
                width: 40,
                height: 35,
                hp: 3,
                speed: 1,
                points: 300,
                color: '#aa44ff',
                shootChance: 0.004
            },
            minion: {
                width: 25,
                height: 20,
                hp: 1,
                speed: 2.5,
                points: 50,
                color: '#44ff44',
                shootChance: 0.001
            }
        };
        return configs[this.type] || configs.basic;
    }

    update(formationVx = 0, formationVy = 0) {
        // Follow formation movement
        this.x += formationVx;
        this.y += formationVy;

        // Individual movement pattern
        this.movePhase += 0.02;
        this.animPhase += 0.1;

        if (this.type === 'fast') {
            // More erratic movement
            this.x += Math.sin(this.movePhase * 2) * 0.5;
        }

        // Eye glow animation
        this.eyeGlow = 0.5 + Math.sin(this.animPhase) * 0.5;

        // Hit flash decay
        if (this.hitFlash > 0) {
            this.hitFlash--;
        }
    }

    tryShoot() {
        if (Math.random() < this.shootChance) {
            return this.shoot();
        }
        return null;
    }

    shoot() {
        return new Projectile(this.x, this.y + this.height / 2, {
            vy: 4 + Math.random() * 2,
            color: '#ff6666',
            isPlayerBullet: false,
            width: 4,
            height: 10
        });
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffffff';
        }

        // Draw based on type
        switch (this.type) {
            case 'basic':
                this.drawBasicEnemy(ctx);
                break;
            case 'fast':
                this.drawFastEnemy(ctx);
                break;
            case 'elite':
                this.drawEliteEnemy(ctx);
                break;
            case 'minion':
                this.drawMinionEnemy(ctx);
                break;
            default:
                this.drawBasicEnemy(ctx);
        }

        ctx.restore();

        // Health bar for elite enemies
        if (this.type === 'elite' && this.hp < this.maxHp) {
            this.drawHealthBar(ctx);
        }
    }

    drawBasicEnemy(ctx) {
        // Classic Space Invader shape
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;

        // Body
        ctx.beginPath();
        ctx.moveTo(-w / 2, h / 4);
        ctx.lineTo(-w / 2, -h / 4);
        ctx.lineTo(-w / 4, -h / 2);
        ctx.lineTo(w / 4, -h / 2);
        ctx.lineTo(w / 2, -h / 4);
        ctx.lineTo(w / 2, h / 4);
        ctx.lineTo(w / 4, h / 2);
        ctx.lineTo(-w / 4, h / 2);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = `rgba(255, 255, 255, ${this.eyeGlow})`;
        ctx.beginPath();
        ctx.arc(-w / 6, -h / 6, 4, 0, Math.PI * 2);
        ctx.arc(w / 6, -h / 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Antenna
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w / 4, -h / 2);
        ctx.lineTo(-w / 4 - 5, -h / 2 - 8);
        ctx.moveTo(w / 4, -h / 2);
        ctx.lineTo(w / 4 + 5, -h / 2 - 8);
        ctx.stroke();
    }

    drawFastEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;

        // Sleek arrow shape
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 4);
        ctx.lineTo(w / 4, h / 2);
        ctx.lineTo(0, h / 4);
        ctx.lineTo(-w / 4, h / 2);
        ctx.lineTo(-w / 2, h / 4);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = `rgba(255, 255, 255, ${this.eyeGlow})`;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawEliteEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;

        // Bulky hexagonal shape
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, -h / 4);
        ctx.lineTo(w / 2, h / 4);
        ctx.lineTo(0, h / 2);
        ctx.lineTo(-w / 2, h / 4);
        ctx.lineTo(-w / 2, -h / 4);
        ctx.closePath();
        ctx.fill();

        // Inner detail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -h / 4);
        ctx.lineTo(w / 4, 0);
        ctx.lineTo(0, h / 4);
        ctx.lineTo(-w / 4, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Eyes
        ctx.fillStyle = `rgba(255, 255, 255, ${this.eyeGlow})`;
        ctx.beginPath();
        ctx.arc(-w / 5, -h / 6, 5, 0, Math.PI * 2);
        ctx.arc(w / 5, -h / 6, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMinionEnemy(ctx) {
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;

        // Small circle with spikes
        ctx.beginPath();
        ctx.arc(0, 0, w / 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Spikes
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + this.animPhase * 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * w / 4, Math.sin(angle) * w / 4);
            ctx.lineTo(Math.cos(angle) * w / 2, Math.sin(angle) * w / 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Eye
        ctx.fillStyle = `rgba(0, 0, 0, ${this.eyeGlow})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHealthBar(ctx) {
        const barWidth = 30;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.height / 2 - 10;

        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    hit(damage = 1) {
        this.hp -= damage;
        this.hitFlash = 10;

        if (this.hp <= 0) {
            this.isAlive = false;
            return true; // Killed
        }
        return false; // Still alive
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    shouldDropPowerUp() {
        // Drop chance based on enemy type
        const chances = {
            basic: 0.05,
            fast: 0.08,
            elite: 0.2,
            minion: 0.02
        };
        return Math.random() < (chances[this.type] || 0.05);
    }
}
