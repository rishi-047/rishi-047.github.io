/**
 * Player.js
 * The player's ship with inertia-based physics
 */
class Player {
    constructor(game) {
        this.game = game;
        this.pos = new Vector(game.width / 2, game.height / 2);
        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);

        this.angle = -Math.PI / 2; // Pointing up
        this.rotationSpeed = 0.1;
        this.thrustPower = 0.2;
        this.friction = 0.98; // Space drag (1 = no friction)

        this.radius = 15;
        this.color = '#00ff41'; // Neon green
        this.isThrusting = false;

        // Weapon properties
        this.lastShotTime = 0;
        this.shootCooldown = 250; // ms
    }

    update() {
        // Rotation
        if (this.game.input.isDown('left')) {
            this.angle -= this.rotationSpeed;
        }
        if (this.game.input.isDown('right')) {
            this.angle += this.rotationSpeed;
        }

        // Thrust
        this.isThrusting = this.game.input.isDown('thrust');
        if (this.isThrusting) {
            const force = Vector.fromAngle(this.angle).mult(this.thrustPower);
            this.acc.add(force);

            // Add thrust particles
            const exhaustPos = Vector.fromAngle(this.angle + Math.PI).mult(this.radius).add(this.pos);
            this.game.particles.push(new Particle(
                exhaustPos.x, exhaustPos.y,
                Vector.fromAngle(this.angle + Math.PI + (Math.random() - 0.5)).mult(2),
                '#00ff41'
            ));
        }

        // Physics
        this.vel.add(this.acc);
        this.vel.mult(this.friction); // Drag
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acceleration

        // Screen Wrapping
        if (this.pos.x < -this.radius) this.pos.x = this.game.width + this.radius;
        if (this.pos.x > this.game.width + this.radius) this.pos.x = -this.radius;
        if (this.pos.y < -this.radius) this.pos.y = this.game.height + this.radius;
        if (this.pos.y > this.game.height + this.radius) this.pos.y = -this.radius;

        // Shooting
        if (this.game.input.isDown('shoot')) {
            this.shoot();
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime > this.shootCooldown) {
            const muzzlePos = Vector.fromAngle(this.angle).mult(this.radius).add(this.pos);
            const bulletVel = Vector.fromAngle(this.angle).mult(10).add(this.vel); // Add ship velocity for realism

            this.game.bullets.push(new Bullet(muzzlePos.x, muzzlePos.y, bulletVel));
            this.lastShotTime = now;
            // Play sound (TODO)
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        // Draw Ship (Triangle)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        // Nose
        ctx.moveTo(this.radius, 0);
        // Rear Right
        ctx.lineTo(-this.radius, this.radius * 0.7);
        // Rear Center (indent)
        ctx.lineTo(-this.radius * 0.5, 0);
        // Rear Left
        ctx.lineTo(-this.radius, -this.radius * 0.7);
        ctx.closePath();
        ctx.stroke();

        // Draw Thrust Flame
        if (this.isThrusting) {
            ctx.strokeStyle = '#ff2a2a'; // Red flame
            ctx.shadowColor = '#ff2a2a';
            ctx.beginPath();
            ctx.moveTo(-this.radius * 0.5, 0);
            ctx.lineTo(-this.radius * 1.5 - Math.random() * 10, 0);
            ctx.stroke();
        }

        ctx.restore();
    }
}
