/**
 * Particle.js
 * Visual effects for thrust and explosions
 */
class Particle {
    constructor(x, y, vel, color) {
        this.pos = new Vector(x, y);
        this.vel = vel;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.03;
    }

    update() {
        this.pos.add(this.vel);
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 2 * this.life, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
