/**
 * Input.js
 * Handles keyboard input for tank controls
 */
class InputHandler {
    constructor() {
        this.keys = {};
        this.justPressed = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!e.repeat) {
                this.justPressed[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Check if key is currently held down
    isDown(action) {
        switch (action) {
            case 'thrust': return this.keys['ArrowUp'] || this.keys['KeyW'];
            case 'left': return this.keys['ArrowLeft'] || this.keys['KeyA'];
            case 'right': return this.keys['ArrowRight'] || this.keys['KeyD'];
            case 'shoot': return this.keys['Space'];
            default: return false;
        }
    }

    // Check if key was pressed this frame
    isPressed(action) {
        let code = '';
        switch (action) {
            case 'shoot': code = 'Space'; break;
            case 'pause': code = 'KeyP'; break;
        }
        return this.justPressed[code];
    }

    // Clear just pressed state at end of frame
    update() {
        this.justPressed = {};
    }
}
