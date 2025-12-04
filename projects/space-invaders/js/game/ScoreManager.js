/**
 * ScoreManager.js
 * Handles scoring, combos, and high score persistence
 */

class ScoreManager {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;
        this.highScores = this.loadHighScores();

        // Score values
        this.scoreValues = {
            basic: 100,
            fast: 150,
            elite: 300,
            minion: 50,
            boss: 10000,
            bossCore: 2000
        };

        // Combo thresholds
        this.comboThresholds = [
            { combo: 5, multiplier: 1.5 },
            { combo: 10, multiplier: 2 },
            { combo: 20, multiplier: 3 },
            { combo: 50, multiplier: 5 }
        ];
    }

    addKill(enemyType) {
        // Add to combo
        this.combo++;
        this.comboTimer = 120; // 2 seconds to maintain combo

        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        // Update multiplier
        this.updateMultiplier();

        // Calculate score
        const baseScore = this.scoreValues[enemyType] || 100;
        const finalScore = Math.floor(baseScore * this.comboMultiplier);

        this.score += finalScore;

        return {
            points: finalScore,
            combo: this.combo,
            multiplier: this.comboMultiplier
        };
    }

    addBossHit(coreDestroyed) {
        const points = coreDestroyed ? this.scoreValues.bossCore : 50;
        this.score += points;
        return points;
    }

    addBossDefeat() {
        this.score += this.scoreValues.boss;
        return this.scoreValues.boss;
    }

    updateMultiplier() {
        this.comboMultiplier = 1;

        for (const threshold of this.comboThresholds) {
            if (this.combo >= threshold.combo) {
                this.comboMultiplier = threshold.multiplier;
            }
        }
    }

    update() {
        // Decay combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }

    resetCombo() {
        this.combo = 0;
        this.comboMultiplier = 1;
    }

    getScore() {
        return this.score;
    }

    getFormattedScore() {
        return this.score.toLocaleString();
    }

    getCombo() {
        return this.combo;
    }

    getMultiplier() {
        return this.comboMultiplier;
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
        this.maxCombo = 0;
    }

    // High scores management
    loadHighScores() {
        try {
            const saved = localStorage.getItem('spaceInvadersHighScores');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load high scores:', e);
        }
        return [];
    }

    saveHighScores() {
        try {
            localStorage.setItem('spaceInvadersHighScores', JSON.stringify(this.highScores));
        } catch (e) {
            console.warn('Could not save high scores:', e);
        }
    }

    checkHighScore() {
        if (this.highScores.length < 10 || this.score > this.highScores[this.highScores.length - 1].score) {
            return true;
        }
        return false;
    }

    addHighScore(name = 'PLAYER') {
        const entry = {
            name: name.toUpperCase().substring(0, 10),
            score: this.score,
            date: new Date().toISOString().split('T')[0],
            maxCombo: this.maxCombo
        };

        this.highScores.push(entry);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10

        this.saveHighScores();

        return this.highScores.findIndex(h => h === entry) + 1;
    }

    getHighScores() {
        return this.highScores;
    }

    getTopScore() {
        return this.highScores.length > 0 ? this.highScores[0].score : 0;
    }
}
