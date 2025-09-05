/**
 * Session 1: AudioManager - Complete Implementation
 * Add this at the very top of your scripts.js file
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.isInitialized = false;
        this.testOscillator = null;
        this.testGainNode = null;
    }

    /**
     * Initialize Web Audio API context
     * Must be called after user interaction due to browser autoplay policies
     */
    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle suspended context (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Create master gain node for overall volume control
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            console.log('AudioManager initialized successfully');
            console.log('Audio context sample rate:', this.audioContext.sampleRate);
            
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Create a simple test oscillator
     */
    createTestOscillator() {
        if (!this.isInitialized) {
            console.error('AudioManager not initialized');
            return;
        }

        // Clean up existing oscillator
        this.stopTestOscillator();

        // Create oscillator and gain node
        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        // Configure oscillator
        this.testOscillator.type = 'sine';
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note

        // Configure gain (start at 0 to prevent sudden loud sound)
        this.testGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

        // Connect the audio chain: oscillator -> gain -> master -> speakers
        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.masterGainNode);

        // Start the oscillator
        this.testOscillator.start();
        
        console.log('Test oscillator created and started');
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
        
        console.log(`Volume set to: ${volume}% (gain: ${gainValue})`);
    }

    /**
     * Create a test oscillator with specific waveform type
     * @param {string} oscillatorType - 'sine', 'sawtooth', 'square', 'triangle'
     */
    createTestOscillatorWithType(oscillatorType = 'sine') {
        if (!this.isInitialized) {
            console.error('AudioManager not initialized');
            return;
        }

        this.stopTestOscillator();

        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        this.testOscillator.type = oscillatorType;
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.masterGainNode);

        this.testOscillator.start();
        
        console.log(`Test oscillator created with ${oscillatorType} wave type`);
    }
} // <- CLASS ENDS HERE

// Global audio manager instance
let audioManager = null;