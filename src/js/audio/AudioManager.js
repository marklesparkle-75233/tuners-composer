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
        this.stereoPannerNode = null; 
        this.isPlaying = false; // Add this line
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

    this.stopTestOscillator();

    this.testOscillator = this.audioContext.createOscillator();
    this.testGainNode = this.audioContext.createGain();

    this.testOscillator.type = 'sine';  // Fixed to 'sine', no oscillatorType variable
    this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

    this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    this.testOscillator.connect(this.testGainNode);
    this.testGainNode.connect(this.masterGainNode);

    this.testOscillator.start();
    
    this.isPlaying = true;
    
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

    // Always create a fresh stereo panner
    this.stereoPannerNode = this.audioContext.createStereoPanner();
    this.stereoPannerNode.pan.setValueAtTime(0, this.audioContext.currentTime);

    // Connect the complete audio chain: oscillator -> gain -> panner -> master
    this.testOscillator.connect(this.testGainNode);
    this.testGainNode.connect(this.stereoPannerNode);
    this.stereoPannerNode.connect(this.masterGainNode);

    this.testOscillator.start();
    
    this.isPlaying = true;
    
    console.log(`Test oscillator created with ${oscillatorType} wave type`);
}

    /**
 * Update volume in real-time during playback
 * @param {number} volume - Volume level 0-100 from UI
 */
setVolumeRealTime(volume) {
    if (!this.testGainNode) return;
    
    const gainValue = Math.max(0, Math.min(1, volume / 100));
    
    // Use setValueAtTime for immediate changes during interaction
    this.testGainNode.gain.setValueAtTime(
        gainValue, 
        this.audioContext.currentTime
    );
    
    console.log(`Real-time volume: ${volume}% (gain: ${gainValue})`);
}

/**
 * Add stereo panner node for balance control
 */
addStereoPanner() {
    if (!this.isInitialized || !this.testGainNode) return;
    
    // Create stereo panner if it doesn't exist
    if (!this.stereoPannerNode) {
        this.stereoPannerNode = this.audioContext.createStereoPanner();
        
        // Reconnect the audio chain: oscillator -> gain -> panner -> master
        this.testGainNode.disconnect();
        this.testGainNode.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(this.masterGainNode);
    }
}

/**
 * Set stereo balance in real-time
 * @param {number} balance - Balance -100 to +100 from UI
 */
setBalanceRealTime(balance) {
    // If no panner exists, we need to create and insert one
    if (!this.stereoPannerNode && this.testGainNode) {
        this.stereoPannerNode = this.audioContext.createStereoPanner();
        
        // Reconnect the audio chain: disconnect gain from master, insert panner
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
        
        console.log(`Real-time balance: ${balance}% (pan: ${panValue})`);
    }
}



} // <- CLASS ENDS HERE

// Global audio manager instance
let audioManager = null;