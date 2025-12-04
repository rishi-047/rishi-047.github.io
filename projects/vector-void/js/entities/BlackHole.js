/**
 * BlackHole.js
 * Gravity well that pulls entities and bends projectiles
 */
class BlackHole {
    constructor(x, y) {
        this.pos = new Vector(x, y);
        this.mass = 1000;
        this.radius = 40;
        this.eventHorizon = 150; // Pull range
        this.color = '#9900ff'; // Deep Purple
        this.angle = 0;
    }

    update() {
        this.angle += 0.05;
        return true;
    }

    // Apply gravity force to an entity
    pull(entity) {
        const dir = Vector.sub(this.pos, entity.pos);
        const dist = dir.mag();

        if (dist < this.eventHorizon && dist > 10) {
            dir.normalize();
            const force = this.mass / (dist * dist);
            dir.mult(force);
            entity.vel.add(dir);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        // Event Horizon Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Swirling Vortex
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius - i * 5, 0 + i, Math.PI * 1.5 + i);
            ctx.stroke();
        }

        // Accretion Disk Particles (Simulated)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const r = this.radius + Math.random() * 20;
            const a = Math.random() * Math.PI * 2;
            ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 2, 2);
        }

        ctx.restore();
    }
}
