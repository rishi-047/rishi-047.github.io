/**
 * PowerUp.js
 * Power-up items that drop from enemies
 */

class PowerUp {
    constructor(x, y, type = null) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.vy = 1.5;

        // Random type if not specified
        this.type = type || this.getRandomType();
        this.config = this.getConfig();

        this.rotation = 0;
        this.pulsePhase = 0;
        this.collected = false;
    }

    getRandomType() {
        const types = ['rapidFire', 'tripleShot', 'shield', 'bomb', 'extraLife'];
        const weights = [30, 25, 20, 15, 10]; // Rarer = lower weight

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) return types[i];
        }
        return types[0];
    }

    getConfig() {
        const configs = {
            rapidFire: {
                color: '#00aaff',
                symbol: '⚡',
                name: 'RAPID FIRE',
                duration: 600 // 10 seconds at 60fps
            },
            tripleShot: {
                color: '#00ff66',
                symbol: '▼',
                name: 'TRIPLE SHOT',
                duration: 900 // 15 seconds
            },
            shield: {
                color: '#ffff00',
                symbol: '◆',
                name: 'SHIELD',
                duration: 0, // Shield uses hits instead
                hits: 3
            },
            bomb: {
                color: '#ff4444',
                symbol: '✸',
                name: 'BOMB',
                duration: 0 // Instant
            },
            extraLife: {
                color: '#ff00ff',
                symbol: '♥',
                name: 'EXTRA LIFE',
                duration: 0 // Instant
            }
        };
        return configs[this.type];
    }

    update() {
        this.y += this.vy;
        this.rotation += 0.02;
        this.pulsePhase += 0.1;
    }

    draw(ctx) {
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        const size = this.width * pulse;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.config.color;

        // Outer diamond
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, 0);
        ctx.lineTo(0, size / 2);
        ctx.lineTo(-size / 2, 0);
        ctx.closePath();

        ctx.fillStyle = this.config.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner symbol
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.config.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.symbol, 0, 0);

        ctx.restore();
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + this.height;
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }

    apply(player, game) {
        this.collected = true;

        switch (this.type) {
            case 'rapidFire':
                player.setPowerUp('rapidFire', this.config.duration);
                break;
            case 'tripleShot':
                player.setPowerUp('tripleShot', this.config.duration);
                break;
            case 'shield':
                player.activateShield(this.config.hits);
                break;
            case 'bomb':
                game.triggerBomb();
                break;
            case 'extraLife':
                game.addLife();
                break;
        }

        return this.config.name;
    }
}
