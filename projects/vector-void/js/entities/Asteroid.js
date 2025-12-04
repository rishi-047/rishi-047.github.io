/**
 * Asteroid.js
 * Procedurally generated floating rocks that split when hit
 */
class Asteroid {
    constructor(x, y, size) {
        this.pos = new Vector(x, y);
        this.size = size || 3; // 3=Large, 2=Med, 1=Small

        // Random velocity based on size (smaller = faster)
        this.vel = Vector.random2D().mult((4 - this.size) * 0.5);

        // Visual properties
        this.radius = this.size * 20;
        this.vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numVertices; i++) {
            const angle = (Math.PI * 2 / numVertices) * i;
            const r = this.radius * (0.8 + Math.random() * 0.4); // Jaggedness
            this.vertices.push(new Vector(Math.cos(angle) * r, Math.sin(angle) * r));
        }

        this.angle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.color = '#ff00ff'; // Neon Magenta
    }

    update() {
        this.pos.add(this.vel);
        this.angle += this.rotationSpeed;

        // Screen Wrap
        const margin = this.radius;
        if (this.pos.x < -margin) this.pos.x = window.innerWidth + margin;
        if (this.pos.x > window.innerWidth + margin) this.pos.x = -margin;
        if (this.pos.y < -margin) this.pos.y = window.innerHeight + margin;
        if (this.pos.y > window.innerHeight + margin) this.pos.y = -margin;

        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    break() {
        if (this.size > 1) {
            const newSize = this.size - 1;
            const a1 = new Asteroid(this.pos.x, this.pos.y, newSize);
            const a2 = new Asteroid(this.pos.x, this.pos.y, newSize);

            // Push them apart
            a1.vel = this.vel.copy().add(Vector.random2D().mult(1));
            a2.vel = this.vel.copy().add(Vector.random2D().mult(1));

            return [a1, a2];
        }
        return [];
    }
}
