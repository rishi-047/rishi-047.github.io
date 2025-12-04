/**
 * main.js
 * Entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // For debugging

    const startBtn = document.getElementById('start-btn');
    const menu = document.getElementById('main-menu');
    const hud = document.getElementById('hud');

    startBtn.addEventListener('click', () => {
        menu.classList.remove('active');
        menu.classList.add('hidden');

        hud.classList.remove('hidden');

        game.start();
    });
});
