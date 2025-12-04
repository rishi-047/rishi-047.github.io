/**
 * SceneryManager.js
 * Handles multi-layer parallax backgrounds and level-specific environments
 */

class Star {
    constructor(canvasWidth, canvasHeight, layer) {
        this.reset(canvasWidth, canvasHeight, layer, true);
    }

    reset(canvasWidth, canvasHeight, layer, initial = false) {
        this.x = Math.random() * canvasWidth;
        this.y = initial ? Math.random() * canvasHeight : -5;
        this.layer = layer;

        // Layer determines size and speed
        switch (layer) {
            case 1: // Far - tiny, slow
                this.size = Math.random() * 1 + 0.5;
                this.speed = 0.2;
                this.brightness = 0.3 + Math.random() * 0.3;
                break;
            case 2: // Mid - small
                this.size = Math.random() * 1.5 + 0.5;
                this.speed = 0.5;
                this.brightness = 0.5 + Math.random() * 0.3;
                break;
            case 3: // Near - medium, twinkle
                this.size = Math.random() * 2 + 1;
                this.speed = 1;
                this.brightness = 0.7 + Math.random() * 0.3;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.twinkleSpeed = Math.random() * 0.1 + 0.05;
                break;
            case 4: // Closest - shooting stars
                this.size = Math.random() * 2 + 2;
                this.speed = 3 + Math.random() * 2;
                this.brightness = 1;
                this.trailLength = 20 + Math.random() * 30;
                break;
        }
    }

    update(canvasHeight) {
        this.y += this.speed;

        if (this.layer === 3) {
            this.twinklePhase += this.twinkleSpeed;
        }

        return this.y > canvasHeight + 10;
    }

    draw(ctx, baseColor) {
        let alpha = this.brightness;

        if (this.layer === 3) {
            alpha *= 0.5 + 0.5 * Math.sin(this.twinklePhase);
        }

        ctx.globalAlpha = alpha;

        if (this.layer === 4) {
            // Shooting star with trail
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.trailLength,
                this.x, this.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, baseColor);

            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.trailLength);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.size * 0.5;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

class Nebula {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight * 0.6;
        this.radius = 100 + Math.random() * 200;
        this.color = this.getRandomNebulaColor();
        this.drift = (Math.random() - 0.5) * 0.2;
        this.opacity = 0.1 + Math.random() * 0.1;
    }

    getRandomNebulaColor() {
        const colors = [
            { r: 128, g: 0, b: 255 },   // Purple
            { r: 0, g: 100, b: 255 },   // Blue
            { r: 255, g: 0, b: 128 },   // Pink
            { r: 0, g: 200, b: 200 },   // Teal
            { r: 255, g: 100, b: 0 }    // Orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.drift;
    }

    draw(ctx, canvasWidth) {
        // Wrap around
        if (this.x < -this.radius) this.x = canvasWidth + this.radius;
        if (this.x > canvasWidth + this.radius) this.x = -this.radius;

        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );

        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
}

class Planet {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = -100;
        this.radius = 30 + Math.random() * 50;
        this.speed = 0.1 + Math.random() * 0.1;
        this.color = this.getRandomPlanetColor();
        this.hasRing = Math.random() > 0.7;
        this.ringColor = `rgba(200, 200, 200, 0.3)`;
    }

    getRandomPlanetColor() {
        const colors = ['#8B4513', '#CD853F', '#4169E1', '#228B22', '#FF6347', '#9370DB'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx, canvasHeight) {
        if (this.y > canvasHeight + this.radius) return false;

        ctx.globalAlpha = 0.5;

        // Planet body
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, '#000000');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Ring
        if (this.hasRing) {
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius * 1.8, this.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.strokeStyle = this.ringColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        return true;
    }
}

class Asteroid {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = -30;
        this.size = 10 + Math.random() * 20;
        this.speed = 1 + Math.random();
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.vertices = this.generateVertices();
    }

    generateVertices() {
        const vertices = [];
        const numVertices = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numVertices; i++) {
            const angle = (Math.PI * 2 / numVertices) * i;
            const radius = this.size * (0.7 + Math.random() * 0.3);
            vertices.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        return vertices;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx, canvasHeight) {
        if (this.y > canvasHeight + this.size) return false;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = '#555555';
        ctx.fill();
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
        return true;
    }
}

class SceneryManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Stars for each layer
        this.stars = {
            layer1: [], // Far
            layer2: [], // Mid
            layer3: [], // Near
            layer4: []  // Shooting stars
        };

        this.nebulas = [];
        this.planets = [];
        this.asteroids = [];

        // Environment settings per level
        this.environments = {
            1: { name: 'Deep Space', nebula: false, asteroid: false, starColor: '#aaddff', bgColor: '#050510' },
            2: { name: 'Deep Space', nebula: false, asteroid: false, starColor: '#aaddff', bgColor: '#050515' },
            3: { name: 'Nebula Field', nebula: true, asteroid: false, starColor: '#ffccff', bgColor: '#100520' },
            4: { name: 'Nebula Field', nebula: true, asteroid: false, starColor: '#ffccff', bgColor: '#150525' },
            5: { name: 'Asteroid Belt', nebula: false, asteroid: true, starColor: '#ffaa77', bgColor: '#151005' },
            6: { name: 'Asteroid Belt', nebula: false, asteroid: true, starColor: '#ffaa77', bgColor: '#1a1508' },
            7: { name: 'Alien Territory', nebula: true, asteroid: false, starColor: '#77ffaa', bgColor: '#051510' },
            8: { name: 'Alien Territory', nebula: true, asteroid: false, starColor: '#77ffaa', bgColor: '#081a15' },
            9: { name: 'Warp Zone', nebula: true, asteroid: false, starColor: '#ff77ff', bgColor: '#200530', speedLines: true },
            10: { name: 'Boss Lair', nebula: false, asteroid: false, starColor: '#ff4444', bgColor: '#1a0505', lightning: true }
        };

        this.currentLevel = 1;
        this.lightningTimer = 0;
        this.lightningFlash = 0;

        this.init();
    }

    init() {
        // Initialize stars
        for (let i = 0; i < 50; i++) this.stars.layer1.push(new Star(this.canvasWidth, this.canvasHeight, 1));
        for (let i = 0; i < 30; i++) this.stars.layer2.push(new Star(this.canvasWidth, this.canvasHeight, 2));
        for (let i = 0; i < 20; i++) this.stars.layer3.push(new Star(this.canvasWidth, this.canvasHeight, 3));

        // Initialize nebulas
        for (let i = 0; i < 3; i++) {
            this.nebulas.push(new Nebula(this.canvasWidth, this.canvasHeight));
        }
    }

    setLevel(level) {
        this.currentLevel = level;

        // Clear asteroids when changing levels
        this.asteroids = [];
    }

    update() {
        const env = this.environments[this.currentLevel] || this.environments[1];

        // Update stars
        Object.keys(this.stars).forEach(layer => {
            this.stars[layer].forEach(star => {
                if (star.update(this.canvasHeight)) {
                    star.reset(this.canvasWidth, this.canvasHeight, parseInt(layer.replace('layer', '')));
                }
            });
        });

        // Occasionally spawn shooting star
        if (Math.random() < 0.002) {
            this.stars.layer4.push(new Star(this.canvasWidth, this.canvasHeight, 4));
        }

        // Remove off-screen shooting stars
        this.stars.layer4 = this.stars.layer4.filter(star => !star.update(this.canvasHeight));

        // Update nebulas
        if (env.nebula) {
            this.nebulas.forEach(nebula => nebula.update());
        }

        // Spawn and update asteroids
        if (env.asteroid && Math.random() < 0.01) {
            this.asteroids.push(new Asteroid(this.canvasWidth, this.canvasHeight));
        }
        this.asteroids = this.asteroids.filter(asteroid => {
            asteroid.update();
            return asteroid.y < this.canvasHeight + 50;
        });

        // Spawn planets occasionally
        if (Math.random() < 0.0005 && this.planets.length < 2) {
            this.planets.push(new Planet(this.canvasWidth, this.canvasHeight));
        }
        this.planets = this.planets.filter(planet => {
            planet.update();
            return planet.y < this.canvasHeight + 100;
        });

        // Lightning effect for boss level
        if (env.lightning) {
            this.lightningTimer++;
            if (this.lightningTimer > 60 && Math.random() < 0.02) {
                this.lightningFlash = 10;
                this.lightningTimer = 0;
            }
            if (this.lightningFlash > 0) {
                this.lightningFlash--;
            }
        }
    }

    draw(ctx) {
        const env = this.environments[this.currentLevel] || this.environments[1];

        // Background gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        bgGradient.addColorStop(0, env.bgColor);
        bgGradient.addColorStop(1, '#000000');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Lightning flash
        if (this.lightningFlash > 0) {
            ctx.fillStyle = `rgba(255, 100, 100, ${this.lightningFlash * 0.03})`;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        // Draw nebulas (behind stars)
        if (env.nebula) {
            this.nebulas.forEach(nebula => nebula.draw(ctx, this.canvasWidth));
        }

        // Draw planets
        this.planets.forEach(planet => planet.draw(ctx, this.canvasHeight));

        // Draw stars layer by layer
        this.stars.layer1.forEach(star => star.draw(ctx, env.starColor));
        this.stars.layer2.forEach(star => star.draw(ctx, env.starColor));
        this.stars.layer3.forEach(star => star.draw(ctx, env.starColor));
        this.stars.layer4.forEach(star => star.draw(ctx, '#ffffff'));

        // Draw asteroids
        this.asteroids.forEach(asteroid => asteroid.draw(ctx, this.canvasHeight));

        // Speed lines for warp zone
        if (env.speedLines) {
            this.drawSpeedLines(ctx);
        }
    }

    drawSpeedLines(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvasWidth;
            const y = Math.random() * this.canvasHeight;
            const length = 50 + Math.random() * 100;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + length);
            ctx.stroke();
        }
    }

    getEnvironmentName(level) {
        const env = this.environments[level] || this.environments[1];
        return env.name;
    }
}
