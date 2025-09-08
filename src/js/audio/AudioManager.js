/**
 * AudioManager - Core Audio Implementation
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.isInitialized = false;
        this.testOscillator = null;
        this.testGainNode = null;
        this.stereoPannerNode = null;
        this.isPlaying = false;
    }

    /**
     * Initialize Web Audio API context
     * Must be called after user interaction due to browser autoplay policies
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            
        } catch (error) {
            this.isInitialized = false;
        }
    }

    /**
     * Create a simple test oscillator
     */
    createTestOscillator() {
        if (!this.isInitialized) return;

        this.stopTestOscillator();

        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        this.testOscillator.type = 'sine';
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.masterGainNode);

        this.testOscillator.start();
        this.isPlaying = true;
    }

    /**
     * Stop the test oscillator
     */
    stopTestOscillator() {
        if (this.testOscillator) {
            try {
                this.testOscillator.stop();
            } catch (e) {
                // Oscillator already stopped
            }
            this.testOscillator.disconnect();
            this.testOscillator = null;
        }
        if (this.testGainNode) {
            this.testGainNode.disconnect();
            this.testGainNode = null;
        }
        if (this.stereoPannerNode) {
            this.stereoPannerNode.disconnect();
            this.stereoPannerNode = null;
        }
        this.isPlaying = false;
    }

    /**
     * Set the volume of the test oscillator (0-100 range from UI)
     */
    setTestVolume(volume) {
        if (!this.testGainNode) return;
        
        const gainValue = Math.max(0, Math.min(1, volume / 100));
        
        this.testGainNode.gain.setTargetAtTime(
            gainValue, 
            this.audioContext.currentTime, 
            0.1
        );
    }

    /**
     * Create a test oscillator with specific waveform type
     * @param {string} oscillatorType - 'sine', 'sawtooth', 'square', 'triangle'
     */
    createTestOscillatorWithType(oscillatorType = 'sine') {
        if (!this.isInitialized) return;

        this.stopTestOscillator();

        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        this.testOscillator.type = oscillatorType;
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        this.stereoPannerNode = this.audioContext.createStereoPanner();
        this.stereoPannerNode.pan.setValueAtTime(0, this.audioContext.currentTime);

        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(this.masterGainNode);

        this.testOscillator.start();
        this.isPlaying = true;
    }

    /**
     * Update volume in real-time during playback
     * @param {number} volume - Volume level 0-100 from UI
     */
    setVolumeRealTime(volume) {
        if (!this.testGainNode) return;
        
        const gainValue = Math.max(0, Math.min(1, volume / 100));
        
        this.testGainNode.gain.setValueAtTime(
            gainValue, 
            this.audioContext.currentTime
        );
    }

    /**
     * Set stereo balance in real-time
     * @param {number} balance - Balance -100 to +100 from UI
     */
    setBalanceRealTime(balance) {
        if (!this.stereoPannerNode && this.testGainNode) {
            this.stereoPannerNode = this.audioContext.createStereoPanner();
            
            this.testGainNode.disconnect();
            this.testGainNode.connect(this.stereoPannerNode);
            this.stereoPannerNode.connect(this.masterGainNode);
        }
        
        if (this.stereoPannerNode) {
            const panValue = Math.max(-1, Math.min(1, balance / 100));
            
            this.stereoPannerNode.pan.setValueAtTime(
                panValue,
                this.audioContext.currentTime
            );
        }
    }
}

// Global audio manager instance
let audioManager = null;