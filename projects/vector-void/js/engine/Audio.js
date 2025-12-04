/**
 * Audio.js
 * Procedural Audio System using Web Audio API
 */
class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    }

    playTone(freq, type, duration, vol = 1) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        // Laser pew
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playThrust() {
        // Low rumble
        // Use noise buffer or low freq osc
        // Simple low square wave for now
        this.playTone(55, 'square', 0.1, 0.1);
    }

    playExplosion() {
        // Noise burst (simulated with many oscs for simplicity without noise buffer setup)
        for (let i = 0; i < 5; i++) {
            this.playTone(100 + Math.random() * 200, 'sawtooth', 0.2 + Math.random() * 0.2, 0.5);
        }
    }

    playPowerup() {
        this.playTone(440, 'sine', 0.1, 0.5);
        setTimeout(() => this.playTone(880, 'sine', 0.2, 0.5), 100);
    }
}
