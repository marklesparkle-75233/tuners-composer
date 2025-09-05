/**
 * Voice.js - Individual voice management for Tuners' Composer
 * Session 2: Sound Generation Architecture
 */

class Voice {
    constructor(audioContext, voiceIndex, masterGainNode) {
        this.audioContext = audioContext;
        this.voiceIndex = voiceIndex;
        this.masterGainNode = masterGainNode;
        
        // Audio nodes for this voice
        this.gainNode = null;
        this.panNode = null;
        this.oscillator = null;
        
        // Voice state
        this.isPlaying = false;
        this.currentSoundType = 'sine'; // Default to sine wave
        this.currentFrequency = 440; // A4
        
        // Initialize audio nodes
        this.initializeAudioNodes();
        
        console.log(`Voice ${this.voiceIndex + 1} initialized`);
    }
    
    initializeAudioNodes() {
        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        
        // Create stereo panner for balance control
        this.panNode = this.audioContext.createStereoPanner();
        this.panNode.pan.setValueAtTime(0, this.audioContext.currentTime);
        
        // Connect the chain: gain -> pan -> master
        this.gainNode.connect(this.panNode);
        this.panNode.connect(this.masterGainNode);
    }
    
    /**
     * Set the sound type for this voice
     * @param {string} soundType - Oscillator type: 'sine', 'sawtooth', 'square', 'triangle'
     */
    setSoundType(soundType) {
        this.currentSoundType = soundType;
        console.log(`Voice ${this.voiceIndex + 1} sound type set to: ${soundType}`);
        
        // If currently playing, restart with new sound type
        if (this.isPlaying) {
            this.stop();
            this.start();
        }
    }
    
    /**
     * Start playing this voice
     */
    start() {
        if (this.isPlaying) {
            this.stop(); // Stop existing oscillator first
        }
        
        // Create new oscillator
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.currentSoundType;
        this.oscillator.frequency.setValueAtTime(this.currentFrequency, this.audioContext.currentTime);
        
        // Connect oscillator to the voice's gain node
        this.oscillator.connect(this.gainNode);
        
        // Start the oscillator
        this.oscillator.start();
        this.isPlaying = true;
        
        console.log(`Voice ${this.voiceIndex + 1} started playing ${this.currentSoundType} at ${this.currentFrequency}Hz`);
    }
    
    /**
     * Stop playing this voice
     */
    stop() {
        if (this.oscillator && this.isPlaying) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
            this.isPlaying = false;
            
            console.log(`Voice ${this.voiceIndex + 1} stopped`);
        }
    }
    
    /**
     * Set the volume for this voice (0-100 range from UI)
     */
    setVolume(volume) {
        const gainValue = Math.max(0, Math.min(1, volume / 100));
        this.gainNode.gain.setTargetAtTime(
            gainValue, 
            this.audioContext.currentTime, 
            0.1
        );
    }
    
    /**
     * Set the stereo balance for this voice (-100 to 100 range from UI)
     */
    setBalance(balance) {
        const panValue = Math.max(-1, Math.min(1, balance / 100));
        this.panNode.pan.setTargetAtTime(
            panValue,
            this.audioContext.currentTime,
            0.1
        );
    }
    
    /**
     * Set the frequency for this voice
     */
    setFrequency(frequency) {
        this.currentFrequency = frequency;
        if (this.oscillator && this.isPlaying) {
            this.oscillator.frequency.setTargetAtTime(
                frequency,
                this.audioContext.currentTime,
                0.1
            );
        }
    }
}

/**
 * GM Sound mapping - maps GM instrument names to oscillator types
 */
const GM_SOUND_MAPPING = {
    // Piano/Keyboard sounds
    "Acoustic Grand Piano": "triangle",
    "Electric Piano 1": "square", 
    "Harpsichord": "sawtooth",
    "Clavi": "square",
    "Celesta": "sine",
    "Music Box": "sine",
    
    // Mallet instruments
    "Vibraphone": "sine",
    "Marimba": "triangle",
    
    // Organ sounds
    "Church Organ": "sine",
    "Rock Organ": "sawtooth",
    
    // Guitar sounds
    "Acoustic Guitar": "sawtooth",
    "Electric Guitar (Clean)": "triangle",
    "Electric Guitar (Distorted)": "square",
    
    // Bass sounds
    "Acoustic Bass": "sine",
    "Electric Bass": "triangle",
    
    // String instruments
    "Violin": "sawtooth",
    "Cello": "sawtooth",
    "String Ensemble": "sawtooth",
    
    // Brass instruments
    "Trumpet": "square",
    "Trombone": "sawtooth",
    "French Horn": "triangle",
    "Brass Section": "square",
    
    // Saxophone
    "Soprano Sax": "sawtooth",
    "Tenor Sax": "sawtooth",
    
    // Wind instruments
    "Flute": "sine",
    "Piccolo": "sine",
    "Clarinet": "triangle",
    "Oboe": "sawtooth",
    
    // Synth sounds
    "Synth Lead": "square",
    "Synth Pad": "triangle",
    "Synth Bass": "sawtooth",
    
    // Drums
    "Drum Kit": "square"
};

/**
 * Get oscillator type for a GM sound name
 */
function getOscillatorTypeForGMSound(gmSoundName) {
    return GM_SOUND_MAPPING[gmSoundName] || 'sine';
}

// Export for module use
export { Voice, GM_SOUND_MAPPING, getOscillatorTypeForGMSound };