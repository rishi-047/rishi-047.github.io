/**
 * ParticleSystem.js
 * Handles all particle effects: explosions, trails, power-up collection, etc.
 */

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 4;
        this.vy = options.vy || (Math.random() - 0.5) * 4;
        this.life = options.life || 60;
        this.maxLife = this.life;
        this.size = options.size || Math.random() * 3 + 1;
        this.color = options.color || '#00ffff';
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
        this.shrink = options.shrink !== false;
        this.glow = options.glow || false;
        this.trail = options.trail || false;
        this.trailLength = options.trailLength || 5;
        this.history = [];
    }

    update() {
        if (this.trail) {
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.trailLength) {
                this.history.shift();
            }
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.shrink) {
            this.size = (this.life / this.maxLife) * this.size;
        }
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;

        // Draw trail
        if (this.trail && this.history.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color.replace(')', `, ${alpha * 0.5})`).replace('rgb', 'rgba');
            ctx.lineWidth = this.size * 0.5;
            ctx.stroke();
        }

        // Draw glow
        if (this.glow) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.globalAlpha = alpha;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        if (this.glow) {
            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0 || this.size <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    // Create explosion effect
    explode(x, y, color = '#ff6600', count = 30, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = options.speed || (Math.random() * 4 + 2);
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: options.life || 40,
                size: options.size || Math.random() * 4 + 2,
                glow: true,
                friction: 0.95,
                ...options
            }));
        }
    }

    // Big explosion with multiple stages
    bigExplosion(x, y) {
        // Core flash
        this.explode(x, y, '#ffffff', 10, { speed: 8, life: 10, size: 6 });
        // Main explosion
        this.explode(x, y, '#ff6600', 40, { speed: 5, life: 50 });
        // Secondary debris
        setTimeout(() => {
            this.explode(x, y, '#ff4400', 20, { speed: 3, life: 40 });
        }, 50);
        // Smoke
        setTimeout(() => {
            this.explode(x, y, '#666666', 15, { speed: 1, life: 60, gravity: -0.02 });
        }, 100);
    }

    // Boss explosion - massive effect
    bossExplosion(x, y) {
        const colors = ['#ff0000', '#ff4400', '#ff8800', '#ffff00', '#ffffff'];
        for (let ring = 0; ring < 5; ring++) {
            setTimeout(() => {
                this.explode(x, y, colors[ring], 50, { 
                    speed: 6 + ring * 2, 
                    life: 60,
                    size: 5 - ring * 0.5
                });
            }, ring * 100);
        }
    }

    // Thrust/engine effect
    thrust(x, y, angle, color = '#00ffff') {
        const spread = 0.3;
        for (let i = 0; i < 3; i++) {
            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const speed = Math.random() * 2 + 1;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(particleAngle) * speed,
                vy: Math.sin(particleAngle) * speed,
                color: color,
                life: 15,
                size: Math.random() * 2 + 1,
                glow: true,
                shrink: true
            }));
        }
    }

    // Bullet trail effect
    bulletTrail(x, y, color = '#00ffff') {
        this.particles.push(new Particle(x, y, {
            vx: 0,
            vy: 0,
            color: color,
            life: 10,
            size: 2,
            glow: true,
            shrink: true
        }));
    }

    // Power-up collection sparkle
    powerUpCollect(x, y, color = '#ffff00') {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 / 20) * i;
            const speed = Math.random() * 3 + 2;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 30,
                size: 3,
                glow: true,
                trail: true,
                trailLength: 8
            }));
        }
    }

    // Hit spark effect
    hitSpark(x, y, color = '#ffffff') {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 3;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 15,
                size: 2,
                glow: true
            }));
        }
    }

    // Laser beam particles
    laserParticles(x, y, width) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x + (Math.random() - 0.5) * width, y, {
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                color: '#ff0000',
                life: 20,
                size: 3,
                glow: true
            }));
        }
    }

    // Victory celebration
    celebrate(canvasWidth, canvasHeight) {
        const colors = ['#ff0066', '#00ff66', '#6600ff', '#ffff00', '#00ffff', '#ff00ff'];
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const x = Math.random() * canvasWidth;
                const y = canvasHeight + 10;
                this.particles.push(new Particle(x, y, {
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 8 - 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 80,
                    size: Math.random() * 4 + 2,
                    glow: true,
                    gravity: 0.1,
                    trail: true,
                    trailLength: 10
                }));
            }, i * 30);
        }
    }

    clear() {
        this.particles = [];
    }
}
