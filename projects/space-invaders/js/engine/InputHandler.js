/**
 * InputHandler.js
 * Handles keyboard and touch input for the game
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this.touchControls = {
            left: false,
            right: false,
            shoot: false
        };
        this.isTouchDevice = 'ontouchstart' in window;

        this.setupKeyboardListeners();
        if (this.isTouchDevice) {
            this.setupTouchControls();
        }
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            // Prevent default for game keys to avoid scrolling
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupTouchControls() {
        // Create touch control overlay
        const touchOverlay = document.createElement('div');
        touchOverlay.id = 'touch-controls';
        touchOverlay.innerHTML = `
            <div class="touch-left">
                <button class="touch-btn" id="touch-left-btn">◀</button>
            </div>
            <div class="touch-right">
                <button class="touch-btn" id="touch-right-btn">▶</button>
            </div>
            <div class="touch-shoot">
                <button class="touch-btn shoot-btn" id="touch-shoot-btn">FIRE</button>
            </div>
        `;

        // Add touch control styles
        const style = document.createElement('style');
        style.textContent = `
            #touch-controls {
                display: none;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 150px;
                pointer-events: none;
                z-index: 200;
            }
            
            @media (hover: none) and (pointer: coarse) {
                #touch-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding: 10px 20px;
                }
            }
            
            .touch-left, .touch-right, .touch-shoot {
                pointer-events: auto;
            }
            
            .touch-btn {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: rgba(0, 255, 255, 0.3);
                border: 2px solid #00ffff;
                color: #00ffff;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
            }
            
            .touch-btn:active {
                background: rgba(0, 255, 255, 0.6);
                transform: scale(0.95);
            }
            
            .shoot-btn {
                width: 90px;
                height: 90px;
                background: rgba(255, 68, 68, 0.3);
                border-color: #ff4444;
                color: #ff4444;
                font-size: 16px;
            }
            
            .shoot-btn:active {
                background: rgba(255, 68, 68, 0.6);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(touchOverlay);

        // Touch event handlers
        const leftBtn = document.getElementById('touch-left-btn');
        const rightBtn = document.getElementById('touch-right-btn');
        const shootBtn = document.getElementById('touch-shoot-btn');

        // Left button
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
        });
        leftBtn.addEventListener('touchend', () => {
            this.touchControls.left = false;
        });

        // Right button
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
        });
        rightBtn.addEventListener('touchend', () => {
            this.touchControls.right = false;
        });

        // Shoot button
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.shoot = true;
            this.justPressed['Space'] = true;
        });
        shootBtn.addEventListener('touchend', () => {
            this.touchControls.shoot = false;
        });
    }

    // Check if a key is currently held down
    isDown(key) {
        // Map common key names
        const keyMap = {
            'left': ['ArrowLeft', 'KeyA'],
            'right': ['ArrowRight', 'KeyD'],
            'up': ['ArrowUp', 'KeyW'],
            'down': ['ArrowDown', 'KeyS'],
            'shoot': ['Space'],
            'pause': ['KeyP', 'Escape'],
            'mute': ['KeyM']
        };

        const codes = keyMap[key] || [key];

        // Check touch controls
        if (key === 'left' && this.touchControls.left) return true;
        if (key === 'right' && this.touchControls.right) return true;
        if (key === 'shoot' && this.touchControls.shoot) return true;

        return codes.some(code => this.keys[code]);
    }

    // Check if a key was just pressed this frame
    wasJustPressed(key) {
        const keyMap = {
            'left': ['ArrowLeft', 'KeyA'],
            'right': ['ArrowRight', 'KeyD'],
            'up': ['ArrowUp', 'KeyW'],
            'down': ['ArrowDown', 'KeyS'],
            'shoot': ['Space'],
            'pause': ['KeyP', 'Escape'],
            'mute': ['KeyM']
        };

        const codes = keyMap[key] || [key];
        return codes.some(code => this.justPressed[code]);
    }

    // Clear just pressed states (call at end of frame)
    clearJustPressed() {
        this.justPressed = {};
    }

    // Reset all input states
    reset() {
        this.keys = {};
        this.justPressed = {};
        this.touchControls = {
            left: false,
            right: false,
            shoot: false
        };
    }
}
