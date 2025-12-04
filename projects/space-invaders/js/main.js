/**
 * main.js
 * Entry point - Initialize and start the game
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();

    // Initialize and start
    game.init();

    // Make game accessible for debugging
    window.game = game;

    console.log('🚀 Space Invaders: Enhanced Edition loaded!');
    console.log('Controls: Arrow keys to move, Space to shoot, P to pause, M to mute');
});
