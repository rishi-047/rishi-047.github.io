/**
 * AudioManager.js
 * Handles all game audio using Web Audio API
 * Procedurally generates sound effects for a self-contained game
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.currentMusic = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();

            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);

            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;

            this.initialized = true;
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Procedural sound generation
    createOscillator(type, frequency, duration, gainValue = 0.3) {
        if (!this.initialized || this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(gainValue, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    // Sound Effects
    playShoot() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playEnemyShoot() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playExplosion() {
        if (!this.initialized || this.isMuted) return;

        // Use noise for explosion
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start();
    }

    playBigExplosion() {
        if (!this.initialized || this.isMuted) return;

        // Larger, more dramatic explosion
        const bufferSize = this.audioContext.sampleRate * 0.8;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
        }

        const noise = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.8);

        gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start();
    }

    playPowerUp() {
        if (!this.initialized || this.isMuted) return;

        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('sine', freq, 0.1, 0.2);
            }, i * 50);
        });
    }

    playHit() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playPlayerHit() {
        if (!this.initialized || this.isMuted) return;

        // Low rumble + alarm
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 80;

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc2.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
        osc2.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.3);
        osc2.stop(this.audioContext.currentTime + 0.3);
    }

    playLevelUp() {
        if (!this.initialized || this.isMuted) return;

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('sine', freq, 0.2, 0.2);
            }, i * 100);
        });
    }

    playBossWarning() {
        if (!this.initialized || this.isMuted) return;

        // Alarm sound
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
                osc.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.2);

                gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.4);
            }, i * 500);
        }
    }

    playBossLaser() {
        if (!this.initialized || this.isMuted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 1);

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 1);
    }

    playMenuSelect() {
        if (!this.initialized || this.isMuted) return;
        this.createOscillator('sine', 600, 0.1, 0.15);
    }

    playGameOver() {
        if (!this.initialized || this.isMuted) return;

        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('sawtooth', freq, 0.3, 0.2);
            }, i * 200);
        });
    }

    playVictory() {
        if (!this.initialized || this.isMuted) return;

        const melody = [523, 659, 784, 1047, 784, 1047, 1319];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.createOscillator('sine', freq, 0.2, 0.2);
            }, i * 150);
        });
    }

    // Background Music (simple procedural loop)
    startMusic(intensity = 'normal') {
        if (!this.initialized || this.currentMusic) return;

        // Create a simple bass line that loops
        this.playMusicLoop(intensity);
    }

    playMusicLoop(intensity) {
        if (!this.initialized || this.isMuted) return;

        const bpm = intensity === 'boss' ? 140 : 120;
        const beatDuration = 60 / bpm;

        const bassNotes = intensity === 'boss'
            ? [55, 55, 73, 55, 82, 55, 73, 55]  // A1, D2, E2 - more intense
            : [65, 65, 82, 65, 98, 65, 82, 65]; // C2, E2, G2 - chill

        let noteIndex = 0;

        const playNote = () => {
            if (this.isMuted || !this.initialized) return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.frequency.value = bassNotes[noteIndex];

            gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + beatDuration * 0.8);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start();
            osc.stop(this.audioContext.currentTime + beatDuration);

            noteIndex = (noteIndex + 1) % bassNotes.length;
        };

        this.currentMusic = setInterval(playNote, beatDuration * 1000);
        playNote(); // Start immediately
    }

    stopMusic() {
        if (this.currentMusic) {
            clearInterval(this.currentMusic);
            this.currentMusic = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 1;
        }
        return this.isMuted;
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }
}
