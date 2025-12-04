/**
 * Enemy.js
 * Seeker enemy that hunts the player
 */
class Enemy {
    constructor(x, y, player) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.player = player;

        this.speed = 2;
        this.force = 0.05;
        this.radius = 15;
        this.color = '#ff2a2a'; // Neon Red
        this.angle = 0;

        this.vertices = [
            new Vector(15, 0),
            new Vector(-10, 10),
            new Vector(-5, 0),
            new Vector(-10, -10)
        ];
    }

    update() {
        // Seek player
        const desired = Vector.sub(this.player.pos, this.pos);
        desired.normalize();
        desired.mult(this.speed);

        const steer = Vector.sub(desired, this.vel);
        steer.limit(this.force);

        this.acc.add(steer);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Rotate towards movement
        this.angle = this.vel.heading();

        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Engine glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(-8, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
