/**
 * HUD.js
 * In-game heads-up display
 */

class HUD {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.livesContainer = document.getElementById('lives-icons');
        this.levelElement = document.getElementById('current-level');
        this.powerUpElement = document.getElementById('active-powerup');
        this.hudElement = document.getElementById('hud');

        this.bossContainer = document.getElementById('boss-health-container');
        this.bossHealthFill = document.getElementById('boss-health-fill');
        this.bossPhaseElement = document.getElementById('boss-phase');

        this.comboDisplay = null;
        this.createComboDisplay();
    }

    createComboDisplay() {
        this.comboDisplay = document.createElement('div');
        this.comboDisplay.id = 'combo-display';
        this.comboDisplay.className = 'hidden';
        this.comboDisplay.innerHTML = `
            <div class="combo-count">0</div>
            <div class="combo-label">COMBO</div>
            <div class="combo-multiplier">x1</div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #combo-display {
                position: absolute;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                text-align: center;
                font-family: 'Orbitron', sans-serif;
                z-index: 45;
                pointer-events: none;
            }
            
            #combo-display .combo-count {
                font-size: 2.5rem;
                color: #ffff00;
                text-shadow: 0 0 10px #ffff00;
                animation: comboPulse 0.3s ease-out;
            }
            
            #combo-display .combo-label {
                font-size: 0.8rem;
                color: #888899;
                letter-spacing: 0.2em;
            }
            
            #combo-display .combo-multiplier {
                font-size: 1.2rem;
                color: #ff6600;
                text-shadow: 0 0 5px #ff6600;
            }
            
            @keyframes comboPulse {
                0% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        document.getElementById('game-container').appendChild(this.comboDisplay);
    }

    show() {
        this.hudElement.classList.remove('hidden');
    }

    hide() {
        this.hudElement.classList.add('hidden');
        this.hideBossHealth();
    }

    updateScore(score) {
        this.scoreElement.textContent = score.toLocaleString();
    }

    updateLives(lives) {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            const icon = document.createElement('div');
            icon.className = 'life-icon';
            this.livesContainer.appendChild(icon);
        }
    }

    updateLevel(level) {
        this.levelElement.textContent = level;
    }

    updatePowerUp(powerUpName) {
        this.powerUpElement.textContent = powerUpName;

        // Color based on power-up
        const colors = {
            'RAPID FIRE': '#00aaff',
            'TRIPLE SHOT': '#00ff66',
            'SHIELD': '#ffff00',
            'NONE': '#888899'
        };
        this.powerUpElement.style.color = colors[powerUpName] || '#888899';
    }

    updateCombo(combo, multiplier) {
        if (combo > 2) {
            this.comboDisplay.classList.remove('hidden');
            this.comboDisplay.querySelector('.combo-count').textContent = combo;
            this.comboDisplay.querySelector('.combo-multiplier').textContent = `x${multiplier}`;

            // Re-trigger animation
            const countEl = this.comboDisplay.querySelector('.combo-count');
            countEl.style.animation = 'none';
            countEl.offsetHeight; // Trigger reflow
            countEl.style.animation = 'comboPulse 0.3s ease-out';
        } else {
            this.comboDisplay.classList.add('hidden');
        }
    }

    showBossHealth() {
        this.bossContainer.classList.remove('hidden');
    }

    hideBossHealth() {
        this.bossContainer.classList.add('hidden');
    }

    updateBossHealth(healthPercent, phase) {
        this.bossHealthFill.style.width = `${healthPercent * 100}%`;
        this.bossPhaseElement.textContent = phase;

        // Color based on health
        if (healthPercent <= 0.33) {
            this.bossHealthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4400)';
        } else if (healthPercent <= 0.66) {
            this.bossHealthFill.style.background = 'linear-gradient(90deg, #ff4400, #ff8800)';
        }
    }

    showScorePopup(x, y, points, combo = 0) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        if (combo > 5) {
            popup.textContent += ` x${Math.floor(combo / 5) + 1}`;
        }
        popup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-family: 'Orbitron', sans-serif;
            font-size: 1rem;
            color: #ffff00;
            text-shadow: 0 0 5px #ffff00;
            pointer-events: none;
            z-index: 45;
            animation: scoreFloat 1s ease-out forwards;
        `;

        document.getElementById('game-container').appendChild(popup);

        setTimeout(() => popup.remove(), 1000);
    }
}

// Add score popup animation
const popupStyle = document.createElement('style');
popupStyle.textContent = `
    @keyframes scoreFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.8);
        }
    }
`;
document.head.appendChild(popupStyle);
