/**
 * Menu.js
 * Handles all menu screens
 */

class Menu {
    constructor(game) {
        this.game = game;

        // Screen elements
        this.mainMenu = document.getElementById('main-menu');
        this.controlsScreen = document.getElementById('controls-screen');
        this.highscoresScreen = document.getElementById('highscores-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.levelTransition = document.getElementById('level-transition');

        // Elements
        this.menuHighscore = document.getElementById('menu-highscore');
        this.finalScoreValue = document.getElementById('final-score-value');
        this.victoryScoreValue = document.getElementById('victory-score-value');
        this.newHighscoreNotice = document.getElementById('new-highscore');
        this.highscoresList = document.getElementById('highscores-list');
        this.levelNumber = document.getElementById('level-number');
        this.levelName = document.getElementById('level-name');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu
        document.getElementById('start-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.hideAll();
            this.game.startGame();
        });

        document.getElementById('controls-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.showScreen(this.controlsScreen);
        });

        document.getElementById('highscores-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.showHighscores();
        });

        // Controls back
        document.getElementById('controls-back-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.showScreen(this.mainMenu);
        });

        // Highscores back
        document.getElementById('highscores-back-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.showScreen(this.mainMenu);
        });

        // Pause menu
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.hideAll();
            this.game.resumeGame();
        });

        document.getElementById('quit-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.game.quitToMenu();
        });

        // Game over
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.hideAll();
            this.game.startGame();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.game.quitToMenu();
        });

        // Victory
        document.getElementById('victory-retry-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.hideAll();
            this.game.startGame();
        });

        document.getElementById('victory-menu-btn').addEventListener('click', () => {
            this.game.audioManager.playMenuSelect();
            this.game.quitToMenu();
        });
    }

    hideAll() {
        this.mainMenu.classList.remove('active');
        this.controlsScreen.classList.remove('active');
        this.highscoresScreen.classList.remove('active');
        this.pauseScreen.classList.remove('active');
        this.gameoverScreen.classList.remove('active');
        this.victoryScreen.classList.remove('active');
        this.levelTransition.classList.remove('active');
    }

    showScreen(screen) {
        this.hideAll();
        screen.classList.add('active');
    }

    showMainMenu() {
        this.updateMenuHighscore();
        this.showScreen(this.mainMenu);
    }

    updateMenuHighscore() {
        const topScore = this.game.scoreManager.getTopScore();
        this.menuHighscore.textContent = topScore.toLocaleString();
    }

    showPause() {
        this.showScreen(this.pauseScreen);
    }

    hidePause() {
        this.pauseScreen.classList.remove('active');
    }

    showGameOver(score, isNewHighscore) {
        this.finalScoreValue.textContent = score.toLocaleString();

        if (isNewHighscore) {
            this.newHighscoreNotice.classList.remove('hidden');
        } else {
            this.newHighscoreNotice.classList.add('hidden');
        }

        this.showScreen(this.gameoverScreen);
    }

    showVictory(score) {
        this.victoryScoreValue.textContent = score.toLocaleString();
        this.showScreen(this.victoryScreen);
    }

    showHighscores() {
        const scores = this.game.scoreManager.getHighScores();

        if (scores.length === 0) {
            this.highscoresList.innerHTML = '<p>No high scores yet!</p>';
        } else {
            this.highscoresList.innerHTML = scores.map((entry, index) => `
                <div class="highscore-item">
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${entry.name}</span>
                    <span class="score-value">${entry.score.toLocaleString()}</span>
                </div>
            `).join('');
        }

        this.showScreen(this.highscoresScreen);
    }

    showLevelTransition(level, levelName) {
        this.levelNumber.textContent = level;
        this.levelName.textContent = levelName.toUpperCase();
        this.showScreen(this.levelTransition);

        // Auto-hide after 2 seconds
        return new Promise(resolve => {
            setTimeout(() => {
                this.levelTransition.classList.remove('active');
                resolve();
            }, 2000);
        });
    }
}
