/**
 * Bullet.js
 * Projectiles fired by the player
 */
class Bullet {
    constructor(x, y, vel) {
        this.pos = new Vector(x, y);
        this.vel = vel;
        this.life = 60; // Frames to live
        this.color = '#00f3ff'; // Cyan
    }

    update() {
        this.pos.add(this.vel);
        this.life--;

        // Screen wrap for bullets? Or destroy?
        // Let's destroy them if they go off screen for now, or wrap for chaos.
        // Classic asteroids wraps bullets, but let's keep it simple: destroy off screen.
        const margin = 50;
        if (this.pos.x < -margin || this.pos.x > window.innerWidth + margin ||
            this.pos.y < -margin || this.pos.y > window.innerHeight + margin) {
            this.life = 0;
        }

        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x - this.vel.x * 0.5, this.pos.y - this.vel.y * 0.5); // Trail effect
        ctx.stroke();

        ctx.restore();
    }
}
