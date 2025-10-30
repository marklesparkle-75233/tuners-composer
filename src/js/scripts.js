// Parameter definitions
const parameterDefinitions = [
  // INSTRUMENT & SOUND ROLLUP - CORRECTED ORDER
  { name: "INSTRUMENT", type: "dropdown", options: "gm-sounds", rollup: "instrument" },
  { name: "MELODIC RANGE", type: "single-dual", min: 21, max: 108, rollup: "instrument" },
  { name: "POLYPHONY", type: "single-dual", min: 1, max: 16, rollup: "instrument" },
  { name: "ATTACK VELOCITY", type: "single-dual", min: 0, max: 127, rollup: "instrument" },
  { name: "DETUNING", type: "single-dual", min: -50, max: 50, rollup: "instrument" },
  { name: "PORTAMENTO GLIDE TIME", type: "single-dual", min: 0, max: 100, rollup: "instrument" },
  
  // RHYTHM & TIMING ROLLUP (unchanged)
  { name: "TEMPO (BPM)", type: "single-dual", min: 40, max: 240, rollup: "rhythm" },
  { name: "RHYTHMS", type: "dual-dropdown", options: "rhythms", rollup: "rhythm" },
  { name: "RESTS", type: "dual-dropdown", options: "rests", rollup: "rhythm" },
  { name: "LIFE SPAN", type: "timing-controls", min: 0, max: 100, rollup: "rhythm" },
  
  // MIXING & LEVELS ROLLUP (unchanged)
  { name: "VOLUME", type: "single-dual", min: 0, max: 100, rollup: "mixing" },
  { name: "STEREO BALANCE", type: "single-dual", min: -100, max: 100, rollup: "mixing" },
  
  // MODULATION EFFECTS ROLLUP (unchanged)
  { name: "TREMOLO", type: "multi-dual", min: 0, max: 100, rollup: "modulation" },
  { name: "CHORUS", type: "multi-dual", min: 0, max: 100, rollup: "modulation" },
  { name: "PHASER", type: "multi-dual", min: 0, max: 100, rollup: "modulation" },
  
  // SPATIAL EFFECTS ROLLUP (unchanged)
  { name: "REVERB", type: "multi-dual", min: 0, max: 100, rollup: "spatial" },
  { name: "DELAY", type: "multi-dual", min: 0, max: 100, rollup: "spatial" }
];



// GM Sounds list
const gmSounds = [
  "Acoustic Grand Piano",
  "Electric Piano 1", 
  "Harpsichord",
  "Clavi",
  "Celesta",
  "Music Box",
  "Vibraphone",
  "Marimba",
  "Church Organ",
  "Rock Organ",
  "Acoustic Guitar",
  "Electric Guitar (Clean)",
  "Electric Guitar (Distorted)",
  "Acoustic Bass",
  "Electric Bass",
  "Violin",
  "Cello",
  "String Ensemble",
  "Trumpet",
  "Trombone",
  "French Horn",
  "Brass Section",
  "Soprano Sax",
  "Tenor Sax",
  "Flute",
  "Piccolo",
  "Clarinet",
  "Oboe",
  "Synth Lead",
  "Synth Pad",
  "Synth Bass",
  "Drum Kit"
];

// Rhythms and Rests options
// Updated rhythmOptions - removed "Select", everything shifts down by 1
const rhythmOptions = [
  "Thirty-second Notes",       // Index 0 (was 1)
  "Thirty-second Note Triplets", // Index 1 (was 2)
  "Sixteenth Notes",           // Index 2 (was 3)
  "Sixteenth Note Triplets",   // Index 3 (was 4) 
  "Eighth Notes",             // Index 4 (was 5)
  "Eighth Note Triplets",     // Index 5 (was 6)
  "Quarter Note Triplets",    // Index 6 (was 7)
  "Quarter Notes",            // Index 7 (was 8)
  "Half Note Triplets",       // Index 8 (was 9)
  "Half Notes",               // Index 9 (was 10)
  "Whole Note Triplets",      // Index 10 (was 11)
  "Whole Note",               // Index 11 (was 12)
  "Two Whole Notes",          // Index 12 (was 13)
  "Three Whole Notes",        // Index 13 (was 14)
  "Four Whole Notes"          // Index 14 (was 15)
];

  

// Updated restOptions - "Select" becomes "No Rests"
const restOptions = [
  "No Rests",                  // Index 0 (was "Select")
  "Thirty-second Notes",       // Index 1
  "Thirty-second Note Triplets", // Index 2
  "Sixteenth Notes",           // Index 3
  "Sixteenth Note Triplets",   // Index 4
  "Eighth Notes",             // Index 5
  "Eighth Note Triplets",     // Index 6
  "Quarter Note Triplets",    // Index 7
  "Quarter Notes",            // Index 8
  "Half Note Triplets",       // Index 9
  "Half Notes",               // Index 10
  "Whole Note Triplets",      // Index 11
  "Whole Note",               // Index 12
  "Two Whole Notes",          // Index 13
  "Three Whole Notes",        // Index 14
  "Four Whole Notes"          // Index 15
];


const midiNoteNames = {
  21: "A0", 22: "A♯0", 23: "B0", 24: "C1", 25: "C♯1", 26: "D1", 27: "D♯1", 28: "E1", 29: "F1", 30: "F♯1", 31: "G1", 32: "G♯1",
  33: "A1", 34: "A♯1", 35: "B1", 36: "C2", 37: "C♯2", 38: "D2", 39: "D♯2", 40: "E2", 41: "F2", 42: "F♯2", 43: "G2", 44: "G♯2",
  45: "A2", 46: "A♯2", 47: "B2", 48: "C3", 49: "C♯3", 50: "D3", 51: "D♯3", 52: "E3", 53: "F3", 54: "F♯3", 55: "G3", 56: "G♯3",
  57: "A3", 58: "A♯3", 59: "B3", 60: "C4", 61: "C♯4", 62: "D4", 63: "D♯4", 64: "E4", 65: "F4", 66: "F♯4", 67: "G4", 68: "G♯4",
  69: "A4", 70: "A♯4", 71: "B4", 72: "C5", 73: "C♯5", 74: "D5", 75: "D♯5", 76: "E5", 77: "F5", 78: "F♯5", 79: "G5", 80: "G♯5",
  81: "A5", 82: "A♯5", 83: "B5", 84: "C6", 85: "C♯6", 86: "D6", 87: "D♯6", 88: "E6", 89: "F6", 90: "F♯6", 91: "G6", 92: "G♯6",
  93: "A6", 94: "A♯6", 95: "B6", 96: "C7", 97: "C♯7", 98: "D7", 99: "D♯7", 100: "E7", 101: "F7", 102: "F♯7", 103: "G7", 104: "G♯7",
  105: "A7", 106: "A♯7", 107: "B7", 108: "C8"
};


/**
 * Compatibility bridge - maps old voiceLifecycleManager calls to new VoiceClock system
 */
class VoiceLifecycleCompatibility {
  constructor() {
    this.isActive = false;
  }
  
  start() {
    this.isActive = true;
    console.log('🔄 VoiceLifecycle compatibility layer started');
  }
  
  stop() {
    this.isActive = false;
    console.log('🔄 VoiceLifecycle compatibility layer stopped');
  }
  
  updateVoiceStates() {
    // Delegate to VoiceClockManager if it exists
    if (voiceClockManager && voiceClockManager.isInitialized) {
      voiceClockManager.updateAllVoices();
    }
  }
  
  shouldVoicePlaying(voiceIndex) {
    // Delegate to VoiceClock system
    if (voiceClockManager && voiceClockManager.isInitialized) {
      const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
      return voiceClock ? voiceClock.shouldPlayNote() : false;
    }
    return false;
  }
  
  getVoiceState(voiceIndex) {
    // Delegate to VoiceClock system
    if (voiceClockManager && voiceClockManager.isInitialized) {
      const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
      return voiceClock ? voiceClock.lifeCycleState : 'stopped';
    }
    return 'stopped';
  }
}



// NEW MASTER CLOCK SYSTEM
// =============================================================================
// MASTER CLOCK SYSTEM - High Resolution Parameter Evolution
// =============================================================================

/**
 * High-resolution Master Clock - Continuously evolves all parameters
 * Runs at ~100Hz (10ms intervals) for smooth parameter evolution
 */

/**
 * Enhanced Master Clock - 1ms resolution for parameter evolution and voice coordination
 */
class MasterClock {
  constructor() {
    this.resolution = 1; // 1ms = 1000Hz update rate for maximum precision
    this.isRunning = false;
    this.intervalId = null;
    this.startTime = 0;
    this.currentTime = 0;
    this.lastUpdateTime = 0;
    this.lastParameterUpdate = 0;
    
    // Master timeline tracking
    this.masterStartTime = 0; // When playback started (for Life Span calculations)
    this.elapsedTime = 0;     // Total elapsed time since start (ms)
    
    console.log('Enhanced Master Clock initialized - 1ms resolution for voice coordination');
  }
  
  /**
   * Start master clock with 1ms precision
   */
  start() {
    if (this.isRunning) {
      this.stop();
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.masterStartTime = this.startTime;
    this.lastUpdateTime = this.startTime;
    this.currentTime = this.startTime;
    this.elapsedTime = 0;
    
    // High-precision 1ms interval
    this.intervalId = setInterval(() => {
      this.update();
    }, this.resolution);
    
    console.log('🕐 Enhanced Master Clock started - 1ms precision active');
  }
  
  /**
   * Stop master clock
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    
    console.log('🕐 Master Clock stopped');
  }
  
/**
 * Main update loop - runs every 1ms
 */
/**
 * Performance-optimized Master Clock update - Session 10
 */
update() {
  const now = Date.now();
  this.currentTime = now;
  this.elapsedTime = now - this.masterStartTime;
  
  // Throttle parameter updates to reduce CPU load
  if (now - this.lastParameterUpdate > 50) { // Update parameters every 50ms instead of 1ms
    this.updateAllParameters();
    this.lastParameterUpdate = now;
  }
  
  // Efficient voice clock updates
  if (voiceClockManager && voiceClockManager.isInitialized) {
    voiceClockManager.updateAllVoices();
  }
  
  this.lastUpdateTime = now;
}



  /**
   * Get elapsed time since master clock started (for Life Span calculations)
   */
  getElapsedTime() {
    return this.elapsedTime;
  }
  
  /**
   * Get elapsed time in seconds
   */
  getElapsedSeconds() {
    return this.elapsedTime / 1000;
  }
  
  /**
   * Get current master time reference (for voice synchronization)
   */
  getMasterTime() {
    return this.currentTime;
  }
  
  /**
   * Check if master clock is running
   */
  isActive() {
    return this.isRunning;
  }
  
  /**
   * Update all voice parameters (existing logic)
   */
  updateAllParameters() {
    const deltaTime = Math.min((this.currentTime - this.lastUpdateTime) / 1000, 0.05);
    
    // Update parameters for enabled voices
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (voiceData[voiceIndex] && voiceData[voiceIndex].enabled) {
        this.updateVoiceParameters(voiceIndex, deltaTime);
      }
    }
  }
  
  /**
   * Update parameters for a specific voice (existing logic)
   */
  updateVoiceParameters(voiceIndex, deltaTime) {
    const voice = voiceData[voiceIndex];
    if (!voice) return;
    
    // Update all parameters continuously
    this.updateParameter(voice.parameters['VOLUME'], deltaTime);
    this.updateParameter(voice.parameters['STEREO BALANCE'], deltaTime);
    this.updateParameter(voice.parameters['MELODIC RANGE'], deltaTime);
    this.updateParameter(voice.parameters['ATTACK VELOCITY'], deltaTime);
    this.updateParameter(voice.parameters['DETUNING'], deltaTime);
    this.updateParameter(voice.parameters['PORTAMENTO GLIDE TIME'], deltaTime);
    this.updateParameter(voice.parameters['TEMPO (BPM)'], deltaTime); // Individual voice tempo
    this.updateParameter(voice.parameters['REVERB'], deltaTime);
    
    // Update multi-parameter effects
    this.updateEffectParameter(voice.parameters['TREMOLO'], deltaTime);
    this.updateEffectParameter(voice.parameters['CHORUS'], deltaTime);
    this.updateEffectParameter(voice.parameters['PHASER'], deltaTime);
    this.updateEffectParameter(voice.parameters['DELAY'], deltaTime);
    
    // Apply real-time audio changes for preview voice
    if (voiceIndex === currentVoice && audioManager && audioManager.isPlaying) {
      this.applyAudioChanges(voiceIndex);
    }
  }
  
  /**
   * Update individual parameter (existing logic)
   */
  updateParameter(param, deltaTime) {
    if (!param || param.behavior <= 0) return;
    
    if (param.currentValue === undefined) {
      param.currentValue = (param.min + param.max) / 2;
    }
    
    param.currentValue = interpolateParameter(
      param.currentValue,
      param.min,
      param.max,
      param.behavior,
      deltaTime * 2
    );
  }
  
  /**
   * Update effect parameter (existing logic)
   */
  updateEffectParameter(param, deltaTime) {
    if (!param || param.behavior <= 0) return;
    
    if (param.speed) {
      if (param.speed.currentValue === undefined) {
        param.speed.currentValue = (param.speed.min + param.speed.max) / 2;
      }
      param.speed.currentValue = interpolateParameter(
        param.speed.currentValue,
        param.speed.min,
        param.speed.max,
        param.behavior,
        deltaTime * 2
      );
    }
    
    if (param.depth) {
      if (param.depth.currentValue === undefined) {
        param.depth.currentValue = (param.depth.min + param.depth.max) / 2;
      }
      param.depth.currentValue = interpolateParameter(
        param.depth.currentValue,
        param.depth.min,
        param.depth.max,
        param.behavior,
        deltaTime * 2
      );
    }
  }
  
  /**
   * Apply real-time audio changes (existing logic)
   */
  applyAudioChanges(voiceIndex) {
    const voice = voiceData[voiceIndex];
    
    if (voice.parameters['VOLUME'].currentValue !== undefined && audioManager.setVolumeRealTime) {
      audioManager.setVolumeRealTime(voice.parameters['VOLUME'].currentValue);
    }
    
    if (voice.parameters['STEREO BALANCE'].currentValue !== undefined && audioManager.setBalanceRealTime) {
      audioManager.setBalanceRealTime(voice.parameters['STEREO BALANCE'].currentValue);
    }
  }
}


// Global master clock instance
let masterClock = null;
let voiceClockManager = null;
let voiceLifecycleManager = new VoiceLifecycleCompatibility();



// Master Clock System Variables
let masterTempo = 120; // Default master tempo

// Tempo scrolling variables - ADD THESE
let tempoScrollInterval = null;
let tempoScrollDirection = 0; // -1 for down, +1 for up, 0 for stopped

console.log('Master Clock System initialized at', masterTempo, 'BPM');
// End Master Clock

// Global state
let currentVoice = 0;
let voiceData = [];

// INSERT THE COMPLETE FUNCTION HERE:
// Initialize voice data structure - WITH SENSIBLE DEFAULTS
// NEW TIMING PARAMETER ROW
function initializeVoices() {
  voiceData = [];
  for (let i = 0; i < 16; i++) {
    const voice = {
      enabled: i === 0,
      locked: false,
      parameters: {}
    };
    
    parameterDefinitions.forEach(param => {
      if (param.name === 'POLYPHONY') {
        voice.parameters[param.name] = {
          min: 1,    // Minimum 1 note (monophonic)
          max: 4,    // Default maximum 4 notes
          behavior: 25  // Low behavior for stable chord changes
        };
      } else if (param.type === 'dropdown') {
        // Set sensible defaults for dropdown parameters
        if (param.name === 'INSTRUMENT') {
          voice.parameters[param.name] = 0; // First GM sound (Acoustic Grand Piano)
        } else {
          voice.parameters[param.name] = 0;
        }
      } else if (param.type === 'dual-dropdown') {
        // Set sensible defaults for rhythm/rest dual dropdowns
        if (param.name === 'RHYTHMS') {
          voice.parameters[param.name] = {
            min: 7,  // Quarter Notes (index 7 in new system)
            max: 7,  // Quarter Notes
            behavior: 50
          };
        } else if (param.name === 'RESTS') {
          voice.parameters[param.name] = {
            min: 0,  // No Rests (index 0 in new system)
            max: 0,  // No Rests
            behavior: 50
          };
        } else {
          voice.parameters[param.name] = {
            min: 0,
            max: 0,
            behavior: 50
          };
        }
      } else if (param.type === 'single-dual') {
        if (typeof param.min === 'undefined' || typeof param.max === 'undefined') {
          console.error(`Missing min/max for parameter: ${param.name}`);
        }
        
        // Set sensible defaults for single-dual parameters
        if (param.name === 'MELODIC RANGE') {
          voice.parameters[param.name] = {
            min: 60,  // Middle C (C4)
            max: 60,  // Middle C (will be updated by piano to show single note)
            behavior: 50,
            selectedNotes: [60] // Piano will load this as Middle C selected
          };
        } else {
          // Use 25%-75% range for other parameters (existing logic)
          voice.parameters[param.name] = {
            min: param.min + (param.max - param.min) * 0.25,
            max: param.min + (param.max - param.min) * 0.75,
            behavior: 50
          };
        }
      } else if (param.type === 'multi-dual') {
        if (typeof param.min === 'undefined' || typeof param.max === 'undefined') {
          console.error(`Missing min/max for parameter: ${param.name}`);
        }
        
        // NEW: Set all ADSR effects to OFF by default
        if (param.name === 'TREMOLO' || param.name === 'CHORUS' || param.name === 'PHASER') {
          voice.parameters[param.name] = {
            speed: {
              min: 0,  // OFF
              max: 0   // OFF
            },
            depth: {
              min: 0,  // OFF
              max: 0   // OFF
            },
            behavior: 0  // No evolution when OFF
          };
         } else if (param.name === 'REVERB') {
          voice.parameters[param.name] = {
            speed: {
              min: 0,  // OFF
              max: 0   // OFF (reverb time controlled differently)
            },
            depth: {
              min: 0,     // Starts at 0 (OFF)
              max: 0    // Available up to 100% wet
            },
            behavior: 0
          };
        } else if (param.name === 'DELAY') {
          voice.parameters[param.name] = {
            speed: {      // Delay Time
              min: 0,     // Starts at 0 (OFF)
              max: 0    // Available up to 100% (maps to 0-2000ms via your formatter)
            },
            depth: {      // Mix (wet/dry)
              min: 0,     // Starts at 0 (OFF) 
              max: 0    // Available up to 100% wet
            },
            feedback: {   // Feedback amount
              min: 0,     // Starts at 0 (OFF)
              max: 0     // Available up to 90% (not 100% to prevent runaway feedback)
            },
            behavior: 0   // No evolution behavior
          };
        } else {
          // Other multi-dual parameters (if any)
          voice.parameters[param.name] = {
            speed: {
              min: param.min + (param.max - param.min) * 0.25,
              max: param.min + (param.max - param.min) * 0.75
            },
            depth: {
              min: param.min + (param.max - param.min) * 0.25,
              max: param.min + (param.max - param.min) * 0.75
            },
            behavior: 50
          };
        }
      } else if (param.type === 'timing-controls') {
        voice.parameters[param.name] = {
          entrance: 0,
          duration: 100,
          repeat: true,
        };
      }
    });
    
    voiceData.push(voice);
  }
  
  // Updated log message
  console.log('Voices initialized with sensible defaults:');
  console.log('- Sound: Acoustic Grand Piano');
  console.log('- Melodic Range: Middle C (C4) selected in piano');
  console.log('- Rhythms: Quarter Notes');
  console.log('- Rests: No Rests (continuous playing)');
  console.log('- Effects: ALL OFF by default (Tremolo, Chorus, Phaser, Reverb, Delay)');
  console.log('- Other parameters: 25%-75% of their ranges');
}








// Create voice tabs
function createVoiceTabs() {
  const voiceTabs = document.getElementById('voice-tabs');
  voiceTabs.innerHTML = '';
  
  for (let i = 0; i < 16; i++) {
    const tab = document.createElement('div');
    tab.className = `voice-tab ${i === currentVoice ? 'active' : ''}`;
    tab.innerHTML = `
      <input type="checkbox" ${voiceData[i].enabled ? 'checked' : ''} 
             onchange="toggleVoice(${i})" onclick="event.stopPropagation()">
      <span>VOICE ${i + 1}</span>
    `;
    tab.onclick = () => selectVoice(i);
    voiceTabs.appendChild(tab);
  }
}

function selectVoice(voiceIndex) {
  if (currentVoice !== voiceIndex) {
    currentVoice = voiceIndex;
    updateVoiceTabs();
    renderParameters();
    
    // ADDED: Reconnect all sliders for the new voice
    setTimeout(() => {
      connectAllSliders();
    }, 100);
  }
}

function toggleVoice(voiceIndex) {
  voiceData[voiceIndex].enabled = !voiceData[voiceIndex].enabled;
}

function updateVoiceTabs() {
  const tabs = document.querySelectorAll('.voice-tab');
  tabs.forEach((tab, index) => {
    tab.classList.toggle('active', index === currentVoice);
  });
}

// Parameter creation functions
function createDropdown(optionsType, paramName, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown-container';
  
  const label = document.createElement('div');
  label.className = 'dropdown-label';
  label.textContent = paramName === 'INSTRUMENT' ? 'Instrument' : 'Selection';
  wrapper.appendChild(label);
  
  const select = document.createElement('select');
  select.className = 'param-select';
  
  let options = [];
  if (optionsType === 'gm-sounds') options = gmSounds;
  
  options.forEach((option, index) => {
    const optionElement = document.createElement('option');
    optionElement.value = index;
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
  
  select.value = voiceData[voiceIndex].parameters[paramName];
  select.onchange = (e) => {
    voiceData[voiceIndex].parameters[paramName] = parseInt(e.target.value);
  };
  
  wrapper.appendChild(select);
  return wrapper;
}

function createDualDropdown(optionsType, paramName, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-dropdown-container';
  
  const minWrapper = document.createElement('div');
  minWrapper.className = 'dropdown-container';
  
  const minLabel = document.createElement('div');
  minLabel.className = 'dropdown-label';
  minLabel.textContent = 'Minimum';
  minWrapper.appendChild(minLabel);
  
  const minSelect = document.createElement('select');
  minSelect.className = 'param-select';
  
  const maxWrapper = document.createElement('div');
  maxWrapper.className = 'dropdown-container';
  
  const maxLabel = document.createElement('div');
  maxLabel.className = 'dropdown-label';
  maxLabel.textContent = 'Maximum';
  maxWrapper.appendChild(maxLabel);
  
  const maxSelect = document.createElement('select');
  maxSelect.className = 'param-select';
  
  let options = [];
  if (optionsType === 'rhythms') options = rhythmOptions;
  else if (optionsType === 'rests') options = restOptions;
  
  options.forEach((option, index) => {
    const minOption = document.createElement('option');
    minOption.value = index;
    minOption.textContent = option;
    minSelect.appendChild(minOption);
    
    const maxOption = document.createElement('option');
    maxOption.value = index;
    maxOption.textContent = option;
    maxSelect.appendChild(maxOption);
  });
  
  minSelect.value = voiceData[voiceIndex].parameters[paramName].min;
  maxSelect.value = voiceData[voiceIndex].parameters[paramName].max;
  
  minSelect.onchange = (e) => {
    voiceData[voiceIndex].parameters[paramName].min = parseInt(e.target.value);
  };
  
  maxSelect.onchange = (e) => {
    voiceData[voiceIndex].parameters[paramName].max = parseInt(e.target.value);
  };
  
  minWrapper.appendChild(minSelect);
  maxWrapper.appendChild(maxSelect);
  
  wrapper.appendChild(minWrapper);
  wrapper.appendChild(maxWrapper);
  
  return wrapper;
}

function createDualSlider(param, voiceIndex) {
    const wrapper = document.createElement('div');
    wrapper.className = param.name === 'DELAY' ? 'triple-slider' : 'dual-slider';;
    
    // Special case for MELODIC RANGE - use piano keyboard on desktop, slider on mobile
    if (param.name === 'MELODIC RANGE') {
        // Check screen size to determine which control to show
        const isNarrowScreen = window.innerWidth <= 768;
        
        if (isNarrowScreen) {
            // MOBILE: Create only the slider fallback
            console.log('📱 Creating mobile slider for melodic range');
            
            const label = document.createElement('div');
            label.className = 'slider-label';
            label.textContent = 'Range';
            wrapper.appendChild(label);
            
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'slider-wrapper mobile-slider-fallback';
            
            const sliderDiv = document.createElement('div');
            const voiceParam = voiceData[voiceIndex].parameters[param.name];
            
            // Clear any piano selections for mobile
            delete voiceParam.selectedNotes;
            
            // Validate and fix any NaN values before slider creation
            if (isNaN(voiceParam.min) || isNaN(voiceParam.max)) {
                voiceParam.min = param.min + (param.max - param.min) * 0.25;
                voiceParam.max = param.min + (param.max - param.min) * 0.75;
            }

            // Check if slider already exists and destroy it
            if (sliderDiv.noUiSlider) {
                sliderDiv.noUiSlider.destroy();
            }

            noUiSlider.create(sliderDiv, {
                start: [voiceParam.min, voiceParam.max],
                connect: true,
                range: { min: param.min, max: param.max },
                step: 1,
                tooltips: [true, true],
                format: {
                    to: value => {
                        const roundedValue = Math.round(value);
                        if (midiNoteNames[roundedValue]) {
                            return midiNoteNames[roundedValue];
                        }
                        return roundedValue.toString();
                    },
                    from: value => {
                        if (typeof value === 'string') {
                            for (let [midiNum, noteName] of Object.entries(midiNoteNames)) {
                                if (noteName === value) {
                                    return Number(midiNum);
                                }
                            }
                        }
                        return Number(value);
                    }
                }
            });
            
            const updateValues = () => {
                if (!sliderDiv.noUiSlider) return;
                
                try {
                    const values = sliderDiv.noUiSlider.get();
                    const min = Math.round(Number(values[0]));
                    const max = Math.round(Number(values[1]));
                    
                    if (!isNaN(min) && !isNaN(max) && voiceIndex === currentVoice) {
                        voiceData[voiceIndex].parameters[param.name].min = min;
                        voiceData[voiceIndex].parameters[param.name].max = max;
                        delete voiceData[voiceIndex].parameters[param.name].currentNote;
                        delete voiceData[voiceIndex].parameters[param.name].selectedNotes; // Ensure mobile uses range
                        
                        console.log(`📱 Mobile slider updated: MIDI ${min}-${max}`);
                    }
                } catch (error) {
                    // Silent error handling
                }
            };
            
            sliderDiv.noUiSlider.off('update');
            sliderDiv.noUiSlider.on('update', updateValues);
            updateValues();
            
            sliderWrapper.appendChild(sliderDiv);
            wrapper.appendChild(sliderWrapper);
            
        } else {
            // DESKTOP: Create only the piano keyboard
            console.log('🖥️ Creating piano keyboard for melodic range');
            
            const pianoContainer = document.createElement('div');
            pianoContainer.className = 'piano-container';
            wrapper.appendChild(pianoContainer);
            
            // Initialize piano keyboard
            setTimeout(() => {
                pianoContainer.pianoInstance = new InteractivePiano(pianoContainer, voiceIndex);
            }, 100);
        }
        
        return wrapper;
    }
    
    // Regular dual slider code for other parameters...
    const label = document.createElement('div');
    label.className = 'slider-label';
    label.textContent = 'Range';
    wrapper.appendChild(label);
    
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';
    
    const sliderDiv = document.createElement('div');
    
    const voiceParam = voiceData[voiceIndex].parameters[param.name];
    
    // Validate and fix any NaN values before slider creation
    if (isNaN(voiceParam.min) || isNaN(voiceParam.max)) {
        voiceParam.min = param.min + (param.max - param.min) * 0.25;
        voiceParam.max = param.min + (param.max - param.min) * 0.75;
    }

    // Check if slider already exists and destroy it
    if (sliderDiv.noUiSlider) {
        sliderDiv.noUiSlider.destroy();
    }

    noUiSlider.create(sliderDiv, {
        start: [voiceParam.min, voiceParam.max],
        connect: true,
        range: { min: param.min, max: param.max },
        step: 1,
        tooltips: [true, true],
        format: {
            to: value => Math.round(value).toString(),
            from: value => Number(value)
        }
    });
    
    const updateValues = () => {
        if (!sliderDiv.noUiSlider) return;
        
        try {
            const values = sliderDiv.noUiSlider.get();
            const min = Math.round(Number(values[0]));
            const max = Math.round(Number(values[1]));
            
            if (!isNaN(min) && !isNaN(max) && voiceIndex === currentVoice) {
                voiceData[voiceIndex].parameters[param.name].min = min;
                voiceData[voiceIndex].parameters[param.name].max = max;
                delete voiceData[voiceIndex].parameters[param.name].currentValue;
            }
        } catch (error) {
            // Silent error handling
        }
    };
    
    sliderDiv.noUiSlider.off('update');
    sliderDiv.noUiSlider.on('update', updateValues);
    updateValues();
    
    sliderWrapper.appendChild(sliderDiv);
    wrapper.appendChild(sliderWrapper);
    
    return wrapper;
}

function createDualSlider(param, voiceIndex) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dual-slider';
    
    // Special case for MELODIC RANGE - ALWAYS use piano keyboard
    if (param.name === 'MELODIC RANGE') {
        console.log('🎹 Creating piano keyboard for melodic range (all screen sizes)');
        
        const pianoContainer = document.createElement('div');
        pianoContainer.className = 'piano-container';
        wrapper.appendChild(pianoContainer);
        
        // Initialize piano keyboard
        setTimeout(() => {
            pianoContainer.pianoInstance = new InteractivePiano(pianoContainer, voiceIndex);
        }, 100);
        
        return wrapper;
    }

    
    // Regular dual slider code for other parameters...
    const label = document.createElement('div');
    label.className = 'slider-label';
    label.textContent = 'Range';
    wrapper.appendChild(label);
    
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';
    
    const sliderDiv = document.createElement('div');
    
    const voiceParam = voiceData[voiceIndex].parameters[param.name];
    
    // Validate and fix any NaN values before slider creation
    if (isNaN(voiceParam.min) || isNaN(voiceParam.max)) {
        voiceParam.min = param.min + (param.max - param.min) * 0.25;
        voiceParam.max = param.min + (param.max - param.min) * 0.75;
    }

    // Check if slider already exists and destroy it
    if (sliderDiv.noUiSlider) {
        sliderDiv.noUiSlider.destroy();
    }

    noUiSlider.create(sliderDiv, {
        start: [voiceParam.min, voiceParam.max],
        connect: true,
        range: { min: param.min, max: param.max },
        step: 1,
        tooltips: [true, true],
        format: {
            to: value => Math.round(value).toString(),
            from: value => Number(value)
        }
    });
    
    const updateValues = () => {
        if (!sliderDiv.noUiSlider) return;
        
        try {
            const values = sliderDiv.noUiSlider.get();
            const min = Math.round(Number(values[0]));
            const max = Math.round(Number(values[1]));
            
            if (!isNaN(min) && !isNaN(max) && voiceIndex === currentVoice) {
                voiceData[voiceIndex].parameters[param.name].min = min;
                voiceData[voiceIndex].parameters[param.name].max = max;
                delete voiceData[voiceIndex].parameters[param.name].currentValue;
            }
        } catch (error) {
            // Silent error handling
        }
    };
    
    sliderDiv.noUiSlider.off('update');
    sliderDiv.noUiSlider.on('update', updateValues);
    updateValues();
    
    sliderWrapper.appendChild(sliderDiv);
    wrapper.appendChild(sliderWrapper);
    
    return wrapper;
}

function createMultiDualSlider(param, voiceIndex) {
  const wrapper = document.createElement('div');
  // NEW: Use triple-slider class for DELAY to accommodate 3 sliders
  wrapper.className = 'dual-slider'; // Keep same class for all, just add more content for DELAY
  
  const speedWrapper = document.createElement('div');
  speedWrapper.className = 'slider-wrapper';
  
  const speedLabel = document.createElement('div');
  speedLabel.className = 'slider-label';
  
  // Conditional labeling for REVERB and DELAY effects
  if (param.name === 'REVERB' || param.name === 'DELAY') {
    speedLabel.textContent = 'Time';
  } else {
    speedLabel.textContent = 'Speed';
  }
  
  speedWrapper.appendChild(speedLabel);
  
  const speedDiv = document.createElement('div');
  const voiceParam = voiceData[voiceIndex].parameters[param.name];
  
  // Create custom formatters for time-based parameters
  let speedFormatter = {
    to: value => Math.round(value).toString(),
    from: value => Number(value)
  };
  
  // NEW: Custom time formatters for REVERB and DELAY
  if (param.name === 'REVERB') {
    speedFormatter = {
      to: value => {
        const timeSeconds = (value / 100) * 3.0; // 0-100% maps to 0-3 seconds
        return timeSeconds.toFixed(1) + 's';
      },
      from: value => {
        const numStr = value.replace('s', '');
        const seconds = parseFloat(numStr);
        return (seconds / 3.0) * 100; // Convert back to 0-100 range
      }
    };
  } else if (param.name === 'DELAY') {
    speedFormatter = {
      to: value => {
        const timeMs = (value / 100) * 2000; // 0-100% maps to 0-2000ms
        if (timeMs >= 1000) {
          return (timeMs / 1000).toFixed(1) + 's';
        } else {
          return Math.round(timeMs) + 'ms';
        }
      },
      from: value => {
        let timeMs;
        if (value.includes('s')) {
          const seconds = parseFloat(value.replace('s', ''));
          timeMs = seconds * 1000;
        } else {
          timeMs = parseFloat(value.replace('ms', ''));
        }
        return (timeMs / 2000) * 100; // Convert back to 0-100 range
      }
    };
  }
  
  noUiSlider.create(speedDiv, {
    start: [voiceParam.speed.min, voiceParam.speed.max],
    connect: true,
    range: { min: param.min, max: param.max },
    step: 1,
    tooltips: [true, true],
    format: speedFormatter
  });
  
  const updateSpeedValues = () => {
    const values = speedDiv.noUiSlider.get();
    const min = Math.round(Number(speedFormatter.from(values[0])));
    const max = Math.round(Number(speedFormatter.from(values[1])));
    voiceData[voiceIndex].parameters[param.name].speed.min = min;
    voiceData[voiceIndex].parameters[param.name].speed.max = max;
  };
  
  speedDiv.noUiSlider.on('update', updateSpeedValues);
  updateSpeedValues();
  
  speedWrapper.appendChild(speedDiv);
  
  // Depth/Wet/Dry slider
  const depthWrapper = document.createElement('div');
  depthWrapper.className = 'slider-wrapper';
  
  const depthLabel = document.createElement('div');
  depthLabel.className = 'slider-label';
  
  if (param.name === 'REVERB' || param.name === 'DELAY') {
    depthLabel.textContent = 'Mix';
  } else {
    depthLabel.textContent = 'Depth';
  }
  
  depthWrapper.appendChild(depthLabel);
  
  const depthDiv = document.createElement('div');
  
  noUiSlider.create(depthDiv, {
    start: [voiceParam.depth.min, voiceParam.depth.max],
    connect: true,
    range: { min: param.min, max: param.max },
    step: 1,
    tooltips: [true, true],
    format: {
      to: value => Math.round(value).toString() + '%',
      from: value => Number(value.replace('%', ''))
    }
  });
  
  const updateDepthValues = () => {
    const values = depthDiv.noUiSlider.get();
    const min = Math.round(Number(values[0].replace('%', '')));
    const max = Math.round(Number(values[1].replace('%', '')));
    voiceData[voiceIndex].parameters[param.name].depth.min = min;
    voiceData[voiceIndex].parameters[param.name].depth.max = max;
  };
  
  depthDiv.noUiSlider.on('update', updateDepthValues);
  updateDepthValues();
  
  depthWrapper.appendChild(depthDiv);
  
  // NEW: Add Feedback slider for DELAY only
  if (param.name === 'DELAY') {
    const feedbackWrapper = document.createElement('div');
    feedbackWrapper.className = 'slider-wrapper';
    
    const feedbackLabel = document.createElement('div');
    feedbackLabel.className = 'slider-label';
    feedbackLabel.textContent = 'Feedback';
    feedbackWrapper.appendChild(feedbackLabel);
    
    const feedbackDiv = document.createElement('div');
    
    // Initialize feedback parameter if it doesn't exist
    if (!voiceParam.feedback) {
      voiceParam.feedback = { min: 0, max: 0 }; // Start OFF
    }
    
    noUiSlider.create(feedbackDiv, {
      start: [voiceParam.feedback.min, voiceParam.feedback.max],
      connect: true,
      range: { min: param.min, max: param.max },
      step: 1,
      tooltips: [true, true],
      format: {
        to: value => Math.round(value).toString() + '%',
        from: value => Number(value.replace('%', ''))
      }
    });
    
    const updateFeedbackValues = () => {
      const values = feedbackDiv.noUiSlider.get();
      const min = Math.round(Number(values[0].replace('%', '')));
      const max = Math.round(Number(values[1].replace('%', '')));
      voiceData[voiceIndex].parameters[param.name].feedback.min = min;
      voiceData[voiceIndex].parameters[param.name].feedback.max = max;
    };
    
    feedbackDiv.noUiSlider.on('update', updateFeedbackValues);
    updateFeedbackValues();
    
    feedbackWrapper.appendChild(feedbackDiv);
    wrapper.appendChild(speedWrapper);
    wrapper.appendChild(depthWrapper);
    wrapper.appendChild(feedbackWrapper); // Add feedback as third slider
  } else {
    // Regular dual-slider layout
    wrapper.appendChild(speedWrapper);
    wrapper.appendChild(depthWrapper);
  }
  
  return wrapper;
}




function createBehaviorSlider(param, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'behavior-container';
  
  const label = document.createElement('label');
  label.textContent = 'Behavior';
  wrapper.appendChild(label);
  
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'behavior-slider-wrapper';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 100;
  slider.value = voiceData[voiceIndex].parameters[param.name].behavior;
  
  const tooltip = document.createElement('div');
  tooltip.className = 'behavior-tooltip';
  tooltip.textContent = slider.value + '%';
  
  const updateTooltipPosition = () => {
    const value = parseInt(slider.value);
    const percentage = (value - slider.min) / (slider.max - slider.min);
    const offset = percentage * (slider.offsetWidth - 16);
    tooltip.style.left = `${offset + 8}px`;
    tooltip.textContent = value + '%';
  };
  
  slider.oninput = (e) => {
    const value = parseInt(e.target.value);
    voiceData[voiceIndex].parameters[param.name].behavior = value;
    updateTooltipPosition();
  };
  
  setTimeout(updateTooltipPosition, 0);
  window.addEventListener('resize', updateTooltipPosition);
  
  sliderWrapper.appendChild(slider);
  sliderWrapper.appendChild(tooltip);
  wrapper.appendChild(sliderWrapper);
  
  return wrapper;
}
function createTimingControls(param, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'timing-controls-container';
  
  // Get current voice data for initial values
  const currentTimingData = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  // Container 1: Repeat label and checkbox
  const repeatContainer = document.createElement('div');
  repeatContainer.className = 'timing-repeat-container';
  
  const repeatLabel = document.createElement('span');
  repeatLabel.className = 'timing-repeat-label';
  repeatLabel.textContent = 'Repeat Y/N';
  
  const repeatCheckbox = document.createElement('input');
  repeatCheckbox.type = 'checkbox';
  repeatCheckbox.checked = currentTimingData.repeat; // Default: false
  repeatCheckbox.className = 'timing-checkbox';
  
  repeatContainer.appendChild(repeatLabel);
  repeatContainer.appendChild(repeatCheckbox);
  
  // Container 2: Entrance (KEEP AS IS)
  const entranceContainer = document.createElement('div');
  entranceContainer.className = 'timing-control-container entrance-container';
  
  const entranceLabel = document.createElement('div');
  entranceLabel.className = 'timing-control-label';
  entranceLabel.textContent = 'Entrance';
  
  const entranceFormatLabel = document.createElement('div');
  entranceFormatLabel.className = 'timing-format-label';
  entranceFormatLabel.textContent = 'mm:ss';
  
  const entranceSlider = document.createElement('input');
  entranceSlider.type = 'range';
  entranceSlider.min = 0;    // 0 seconds
  entranceSlider.max = 100;  // 5 minutes
  entranceSlider.value = currentTimingData.entrance; // Default: 0
  entranceSlider.className = 'timing-slider';
  
  entranceContainer.appendChild(entranceLabel);
  entranceContainer.appendChild(entranceFormatLabel);
  entranceContainer.appendChild(entranceSlider);
  
  // Container 3: Duration (RENAMED FROM EXIT)
  const durationContainer = document.createElement('div');
  durationContainer.className = 'timing-control-container duration-container';
  
  const durationLabel = document.createElement('div');
  durationLabel.className = 'timing-control-label';
  durationLabel.textContent = 'Duration'; // CHANGED FROM "Exit"
  
  const durationFormatLabel = document.createElement('div');
  durationFormatLabel.className = 'timing-format-label';
  durationFormatLabel.textContent = 'mm:ss';
  
  const durationSlider = document.createElement('input');
  durationSlider.type = 'range';
  durationSlider.min = 0;    // 0 seconds
  durationSlider.max = 100;  // 5 minutes
  durationSlider.value = currentTimingData.duration; // Default: 100 (5 minutes)
  durationSlider.className = 'timing-slider';
  
  durationContainer.appendChild(durationLabel);
  durationContainer.appendChild(durationFormatLabel);
  durationContainer.appendChild(durationSlider);
  
  // Add containers to wrapper (ONLY 3 NOW: repeat, entrance, duration)
  wrapper.appendChild(repeatContainer);
  wrapper.appendChild(entranceContainer);
  wrapper.appendChild(durationContainer);
  
  return wrapper;
}


function createRow(param, voiceIndex) {
  const row = document.createElement('div');
  row.className = 'row-container';
  
  // Add special class for melodic range
  if (param.name === 'MELODIC RANGE') {
    row.classList.add('melodic-range-row');
  }
  
  // Add special class for timing controls (full width, no behavior section)
  if (param.name === 'LIFE SPAN') {
    row.classList.add('timing-controls-row');
  }

  // Label section (top)
  const label = document.createElement('div');
  label.className = 'label-container';
  label.textContent = param.name;
  row.appendChild(label);

  // For timing controls, create a different structure (no controls-container wrapper)
  if (param.type === 'timing-controls') {
    const timingWrapper = document.createElement('div');
    timingWrapper.className = 'timing-wrapper';
    timingWrapper.appendChild(createTimingControls(param, voiceIndex));
    row.appendChild(timingWrapper);
    return row;
  }

  // Controls section (bottom) - NORMAL STRUCTURE for other parameters
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';

  // Range controls (left side of controls)
  const range = document.createElement('div');
  range.className = 'range-container';

  if (param.type === 'dropdown') {
    range.appendChild(createDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'dual-dropdown') {
    range.appendChild(createDualDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'single-dual') {
    range.appendChild(createDualSlider(param, voiceIndex));
  } else if (param.type === 'multi-dual') {
    range.appendChild(createMultiDualSlider(param, voiceIndex));
  }

  controlsContainer.appendChild(range);

  // Behavior controls (right side of controls) - only for non-dropdown params
  if (param.type !== 'dropdown') {
    const behaviorContainer = createBehaviorSlider(param, voiceIndex);
    controlsContainer.appendChild(behaviorContainer);
  } else {
    // For dropdown params, add empty div to maintain layout
    const emptyBehavior = document.createElement('div');
    emptyBehavior.className = 'behavior-container';
    controlsContainer.appendChild(emptyBehavior);
  }

  row.appendChild(controlsContainer);
  return row;
}

// ONE LEVEL OF ROLLUPS:
function renderParameters() {
  const parameterSection = document.getElementById('parameter-section');
  
  // Initialize parameter rollup states if needed
  if (Object.keys(parameterRollupState).length === 0) {
    initializeParameterRollupState();
  }
  
  // Properly destroy all existing noUiSlider instances before clearing
  const existingSliders = parameterSection.querySelectorAll('[data-nouislider]');
  existingSliders.forEach(slider => {
    if (slider.noUiSlider) {
      try {
        slider.noUiSlider.destroy();
      } catch (error) {
        // Silent error handling
      }
    }
  });
  
  parameterSection.innerHTML = '';
  
  // Voice controls
  const voiceControls = document.createElement('div');
  voiceControls.className = 'voice-controls';
  voiceControls.innerHTML = `
    <div class="voice-label">Voice ${currentVoice + 1}</div>
    <div class="control-buttons">
      <button class="control-btn" onclick="previewVoice(${currentVoice})">PREVIEW</button>
      <button class="control-btn sync-btn" onclick="syncVoiceToOthers(${currentVoice})" title="Copy this voice's tempo to all other voices">SYNC</button>
      <button class="control-btn" onclick="toggleLockVoice(${currentVoice})">${voiceData[currentVoice].locked ? 'UNLOCK' : 'LOCK'}</button>
    </div>
  `;
  parameterSection.appendChild(voiceControls);
  
  // Create individual parameter rollups directly (no grouping)
  parameterDefinitions.forEach(param => {
    const parameterRollup = createParameterRollup(param, currentVoice);
    parameterSection.appendChild(parameterRollup);
  });
  
  // Reconnect all sliders after rendering
  setTimeout(() => {
    connectAllSliders();
  }, 100);
}


// ADDING SYNC BUTTON FUNCTION
/**
 * Copy this voice's tempo settings to all other voices
 */
function syncVoiceToOthers(sourceVoiceIndex) {
  console.log(`=== SYNCING ALL VOICES TO VOICE ${sourceVoiceIndex + 1} TEMPO ===`);
  
  const sourceTempo = voiceData[sourceVoiceIndex].parameters['TEMPO (BPM)'];
  
  if (!sourceTempo) {
    console.warn('Source voice has no tempo parameter');
    alert('Error: Source voice has no tempo settings to copy.');
    return;
  }
  
  console.log(`Source tempo: ${sourceTempo.min}-${sourceTempo.max} BPM (behavior: ${sourceTempo.behavior}%)`);
  
  // Copy this voice's tempo settings to all other voices
  let syncedCount = 0;
  for (let i = 0; i < 16; i++) {
    if (i !== sourceVoiceIndex && voiceData[i].parameters['TEMPO (BPM)']) {
      // Copy all tempo properties
      voiceData[i].parameters['TEMPO (BPM)'].min = sourceTempo.min;
      voiceData[i].parameters['TEMPO (BPM)'].max = sourceTempo.max;
      voiceData[i].parameters['TEMPO (BPM)'].behavior = sourceTempo.behavior;
      
      // Reset any current tempo evolution
      delete voiceData[i].parameters['TEMPO (BPM)'].currentTempo;
      delete voiceData[i].parameters['TEMPO (BPM)'].currentValue;
      
      syncedCount++;
    }
  }
  
  console.log(`✅ Synced ${syncedCount} voices to Voice ${sourceVoiceIndex + 1} tempo settings`);
  
  // Update UI if we're viewing a different voice
  if (currentVoice !== sourceVoiceIndex) {
    renderParameters();
    setTimeout(() => {
      connectAllSliders();
    }, 100);
  }
  
  // Visual feedback on the SYNC button
  const syncButton = document.querySelector('.sync-btn');
  if (syncButton) {
    const originalText = syncButton.textContent;
    const originalColor = syncButton.style.backgroundColor;
    
    // Flash green to show success
    syncButton.style.backgroundColor = '#28a745';
    syncButton.style.color = 'white';
    syncButton.textContent = 'SYNCED!';
    
    setTimeout(() => {
      syncButton.style.backgroundColor = originalColor;
      syncButton.style.color = '';
      syncButton.textContent = originalText;
    }, 1500);
  }
  
  // Show user feedback
  alert(`✅ Success!\n\nCopied Voice ${sourceVoiceIndex + 1} tempo settings to ${syncedCount} other voices.\n\nTempo: ${sourceTempo.min}-${sourceTempo.max} BPM\nBehavior: ${sourceTempo.behavior}%`);
}

  
// Voice-specific functions with Preview/Stop toggle
/**
 * Enhanced Preview Voice using new VoiceClock system - CLEANED UP
 */
async function previewVoice(voiceIndex) {
  console.log(`=== PREVIEW VOICE ${voiceIndex + 1} (New Clock System) ===`);
  
  // Initialize audio system if needed
  if (!audioManager || !audioManager.isInitialized) {
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('❌ Audio initialization failed');
      return;
    }
  }
  
  // Initialize clock systems if needed
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  if (!voiceClockManager) {
    voiceClockManager = new VoiceClockManager();
    voiceClockManager.initialize(masterClock);
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (!previewButton) {
    console.log('❌ Preview button not found');
    return;
  }
  
  if (previewButton.textContent === 'STOP') {
    console.log(`Stopping preview for Voice ${voiceIndex + 1}...`);
    
    // Stop individual voice clock
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.stop();
    }
    
    // Stop master clock if no other voices are active
    if (voiceClockManager.getActiveVoiceCount() === 0) {
      masterClock.stop();
    }
    
    // Reset button appearance
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview stopped`);
    
  } else {
    console.log(`Starting preview for Voice ${voiceIndex + 1}...`);
    
    // Stop any existing full playback first
    if (voiceClockManager.getActiveVoiceCount() > 0) {
      voiceClockManager.stopAllVoices();
    }
    
    // Start master clock
    if (!masterClock.isActive()) {
      masterClock.start();
    }
    
    // Enable only this voice temporarily for preview
    const originalEnabled = voiceData[voiceIndex].enabled;
    voiceData[voiceIndex].enabled = true;
    
    // Start individual voice clock - THIS REPLACES enableParameterInterpolation()
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.start();
    }
    
    // Update button appearance
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview started with new clock system`);
  }
}

  
function toggleLockVoice(voiceIndex) {
  voiceData[voiceIndex].locked = !voiceData[voiceIndex].locked;
  renderParameters();
}


 /**
 * Fixed Master Playback with proper timing
 */
async function toggleMasterPlayback() {
  console.log('🎯 MASTER PLAY clicked (Fixed Version)');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    console.log('=== STOPPING MASTER PLAYBACK (New System) ===');
    
    // Stop all systems
    if (voiceClockManager) {
      voiceClockManager.stopAllVoices();
    }
    
    if (masterClock) {
      masterClock.stop();
    }
    
    // Reset button appearance
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    console.log('✅ Master playback stopped (New System)');
    
  } else {
    console.log('=== STARTING MASTER PLAYBACK (New System) ===');
    
    // Initialize audio if needed
    if (!audioManager || !audioManager.isInitialized) {
      console.log('Initializing audio system...');
      if (!audioManager) {
        audioManager = new AudioManager();
      }
      await audioManager.initialize();
      
      if (!audioManager.isInitialized) {
        console.log('❌ Audio initialization failed');
        return;
      }
    }
    
    // Initialize clock systems
    if (!masterClock) {
      masterClock = new MasterClock();
    }
    
    if (!voiceClockManager) {
      voiceClockManager = new VoiceClockManager();
      voiceClockManager.initialize(masterClock);
    }
    
    // Check enabled voices
    const enabledVoices = [];
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        enabledVoices.push(i + 1);
      }
    }
    
    if (enabledVoices.length === 0) {
      console.log('❌ No voices enabled! Please enable at least one voice.');
      alert('Please enable at least one voice by checking the checkboxes in the voice tabs.');
      return;
    }
    
    console.log(`Starting playback with voices: ${enabledVoices.join(', ')}`);
    
    // Start master clock FIRST
    console.log('🕐 Starting master clock...');
    masterClock.start();
    
    // FIXED: Wait a moment for master clock to fully start
    console.log('⏳ Waiting for master clock to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
    
    // NOW start voice clocks
    console.log('🎵 Starting voice clocks...');
    voiceClockManager.startAllVoices();
    
    // Update button appearance
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
    
    console.log(`🎉 Master playback started with ${enabledVoices.length} voices!`);
  }
}




function stopMasterPlayback() {
  console.log('=== STOPPING MASTER MULTI-VOICE PLAYBACK ===');
  
  // Keep these - they're for the NEW system:
  if (voiceClockManager) {
    voiceClockManager.stopAllVoices();
  }
  
  if (masterClock) {
    masterClock.stop();
  }
  
  // Keep button state updates too...
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
  }
  
  console.log('✅ Multi-voice playback stopped');
}

async function toggleMasterPlayback() {
  console.log('🎯 PLAY button clicked (Fixed Version)');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    console.log('=== STOPPING MASTER PLAYBACK (New System) ===');
    
    // Stop all systems
    if (voiceClockManager) {
      voiceClockManager.stopAllVoices();
    }
    
    if (masterClock) {
      masterClock.stop();
    }
    
    // Reset button appearance
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    console.log('✅ Master playback stopped (New System)');
    
  } else {
    console.log('=== STARTING MASTER PLAYBACK (New System) ===');
    
    // Initialize audio if needed
    if (!audioManager || !audioManager.isInitialized) {
      console.log('Initializing audio system...');
      if (!audioManager) {
        audioManager = new AudioManager();
      }
      await audioManager.initialize();
      
      if (!audioManager.isInitialized) {
        console.log('❌ Audio initialization failed');
        return;
      }
    }
    
    // Initialize clock systems
    if (!masterClock) {
      masterClock = new MasterClock();
    }
    
    if (!voiceClockManager) {
      voiceClockManager = new VoiceClockManager();
      voiceClockManager.initialize(masterClock);
    }
    
    // Check enabled voices
    const enabledVoices = [];
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        enabledVoices.push(i + 1);
      }
    }
    
    if (enabledVoices.length === 0) {
      console.log('❌ No voices enabled! Please enable at least one voice.');
      alert('Please enable at least one voice by checking the checkboxes in the voice tabs.');
      return;
    }
    
    console.log(`Starting playback with voices: ${enabledVoices.join(', ')}`);
    
    // Start master clock FIRST
    console.log('🕐 Starting master clock...');
    masterClock.start();
    
    // Wait for master clock to stabilize
    console.log('⏳ Waiting for master clock to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // NOW start voice clocks
    console.log('🎵 Starting voice clocks...');
    voiceClockManager.startAllVoices();
    
    // Update button appearance
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
    
    console.log(`🎉 Master playback started with ${enabledVoices.length} voices!`);
  }
}



// INITIALIZE SYSTEMS ON PAGE LOAD

document.addEventListener('DOMContentLoaded', () => {
  // Initialize existing systems
  audioManager = new AudioManager();
  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  
document.addEventListener('DOMContentLoaded', () => {
  // Existing initialization code...
  
  // ADD THIS DEBUG CODE:
  setTimeout(() => {
    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    console.log('=== PLAY BUTTON DEBUG ===');
    console.log('playButton found:', !!playButton);
    console.log('playButton.onclick:', playButton?.onclick);
    console.log('playButton text:', playButton?.textContent);
    
    // ENSURE CONNECTION TO NEW SYSTEM:
    if (playButton) {
      console.log('🔧 Connecting PLAY button to toggleMasterPlayback...');
      playButton.onclick = toggleMasterPlayback;
      console.log('✅ PLAY button connected to new system');
    } else {
      console.log('❌ PLAY button not found!');
    }
  }, 500);
  
  
    // Connect PLAY button to new system
    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    if (playButton) {
      playButton.onclick = toggleMasterPlayback;
      console.log('✅ Master PLAY button connected to new clock system');
    } else {
      console.log('❌ PLAY button not found during connection');
    }
  }, 200);

  // Initialize audio on first click
  document.addEventListener('click', initializeAudioOnFirstClick, { once: true });
  
  // Initialize master tempo controls
  setTimeout(() => {
    const tempoUpBtn = document.getElementById('tempo-up');
    const tempoDownBtn = document.getElementById('tempo-down');
    
    if (tempoUpBtn) {
      tempoUpBtn.onmousedown = () => startTempoScroll(1);
      tempoUpBtn.onmouseup = stopTempoScroll;
      tempoUpBtn.onmouseleave = stopTempoScroll;
    }
    
    if (tempoDownBtn) {
      tempoDownBtn.onmousedown = () => startTempoScroll(-1);
      tempoDownBtn.onmouseup = stopTempoScroll; 
      tempoDownBtn.onmouseleave = stopTempoScroll;
    }
    
    
  }, 200);
});



/**
 * Get tempo for a specific voice (uses voice's TEMPO parameter range)
 */
// Replace the getVoiceTempo function with this enhanced version
function getVoiceTempo(voiceIndex) {
  const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
  
  if (!tempoParam) {
    console.warn(`Voice ${voiceIndex + 1}: No TEMPO parameter found`);
    return masterTempo;
  }
  
  // Get the voice's base tempo (average of min/max range)
  let baseTempo = (tempoParam.min + tempoParam.max) / 2;
  
  // Apply behavior evolution if active
  if (tempoParam.behavior > 0) {
    if (!tempoParam.currentTempo) {
      tempoParam.currentTempo = baseTempo;
    }
    
    baseTempo = interpolateParameter(
      tempoParam.currentTempo,
      tempoParam.min,
      tempoParam.max,
      tempoParam.behavior,
      0.1
    );
    
    tempoParam.currentTempo = baseTempo;
  }
  
  return Math.round(Math.max(40, Math.min(240, baseTempo)));
}








async function initializeAudioOnFirstClick() {
  console.log('🎵 Initializing audio on first click...');
  await audioManager.initialize();
  
  if (audioManager.isInitialized) {
    console.log('✅ Audio manager initialized successfully');
    // Don't auto-create test oscillator - let preview handle it
    // audioManager.createTestOscillator(); // REMOVE THIS LINE
  } else {
    console.log('❌ Audio manager initialization failed');
  }
}


// GM Sound mapping function
function getOscillatorTypeForGMSound(gmSoundName) {
    const GM_SOUND_MAPPING = {
        "Acoustic Grand Piano": "triangle",
        "Electric Piano 1": "square", 
        "Harpsichord": "sawtooth",
        "Clavi": "square",
        "Celesta": "sine",
        "Music Box": "sine",
        "Vibraphone": "sine",
        "Marimba": "triangle",
        "Church Organ": "sine",
        "Rock Organ": "sawtooth",
        "Acoustic Guitar": "sawtooth",
        "Electric Guitar (Clean)": "triangle",
        "Electric Guitar (Distorted)": "square",
        "Acoustic Bass": "sine",
        "Electric Bass": "triangle",
        "Violin": "sawtooth",
        "Cello": "sawtooth",
        "String Ensemble": "sawtooth",
        "Trumpet": "square",
        "Trombone": "sawtooth",
        "French Horn": "triangle",
        "Brass Section": "square",
        "Soprano Sax": "sawtooth",
        "Tenor Sax": "sawtooth",
        "Flute": "sine",
        "Piccolo": "sine",
        "Clarinet": "triangle",
        "Oboe": "sawtooth",
        "Synth Lead": "square",
        "Synth Pad": "triangle",
        "Synth Bass": "sawtooth",
        "Drum Kit": "square"
    };
    
    return GM_SOUND_MAPPING[gmSoundName] || 'sine';
}

// Session 4: Parameter Interpolation Implementation
// Add these functions to scripts.js

// Global variables for parameter interpolation
let parameterUpdateTimer = null;
let isParameterInterpolationActive = false;
let lastUpdateTime = Date.now();

/**
 * Core parameter interpolation algorithm
 * Controls how dramatically parameters change during playback based on behavior settings
 */


 /**
 * FINAL ENHANCED interpolateParameter - Fixed boundary sticking
 */
function interpolateParameter(currentValue, minRange, maxRange, behaviorSetting, deltaTime) {
  if (behaviorSetting <= 0) return currentValue;
  
  const range = maxRange - minRange;
  
  // Behavior factor: 100% behavior should allow huge jumps
  const behaviorFactor = Math.pow(behaviorSetting / 100, 1.5);
  
  // Maximum possible change per update
  const maxChangePercent = behaviorFactor * 0.4;
  const maxChange = range * maxChangePercent * (deltaTime * 10);
  
  // Generate random factor between -1 and 1
  const randomFactor = (Math.random() - 0.5) * 2;
  
  // Calculate actual change
  let change = maxChange * randomFactor;
  
  // FIXED: Add boundary bounce-back to prevent sticking
  if (currentValue <= minRange && change < 0) {
    change = Math.abs(change); // Force positive change when at minimum
  } else if (currentValue >= maxRange && change > 0) {
    change = -Math.abs(change); // Force negative change when at maximum
  }
  
  // Apply change while respecting boundaries
  const newValue = Math.max(minRange, Math.min(maxRange, currentValue + change));
  
  return newValue;
}

/**
 * Update parameters for a specific voice during playback
 * FIXED: Better parameter evolution strategy
 */
function updateVoiceParameters(voiceIndex) {
  if (!voiceData[voiceIndex] || !voiceData[voiceIndex].enabled) {
    return;
  }
  
  const currentTime = Date.now();
  const deltaTime = Math.min((currentTime - lastUpdateTime) / 1000, 0.2); // Cap deltaTime to prevent jumps
  
  // Update VOLUME parameter
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  if (volumeParam && volumeParam.behavior > 0) {
    // Store the current center value if not already stored
    if (!volumeParam.currentValue) {
      volumeParam.currentValue = (volumeParam.min + volumeParam.max) / 2;
    }
    
    // Evolve the current value within the original range
    volumeParam.currentValue = interpolateParameter(
      volumeParam.currentValue,
      volumeParam.min,
      volumeParam.max,
      volumeParam.behavior,
      deltaTime
    );
    
    // Apply real-time audio changes for current voice
    if (voiceIndex === currentVoice && audioManager && audioManager.isPlaying) {
      audioManager.setVolumeRealTime(volumeParam.currentValue);
    }
  }
  
  // Update STEREO BALANCE parameter
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  if (balanceParam && balanceParam.behavior > 0) {
    // Store the current center value if not already stored
    if (!balanceParam.currentValue) {
      balanceParam.currentValue = (balanceParam.min + balanceParam.max) / 2;
    }
    
    // Evolve the current value within the original range
    balanceParam.currentValue = interpolateParameter(
      balanceParam.currentValue,
      balanceParam.min,
      balanceParam.max,
      balanceParam.behavior,
      deltaTime
    );
    
    // Apply real-time audio changes for current voice
    if (voiceIndex === currentVoice && audioManager && audioManager.isPlaying) {
      audioManager.setBalanceRealTime(balanceParam.currentValue);
    }
  }
}


/**
 * Reset parameter evolution when stopping
 */
function resetParameterValues() {
  for (let i = 0; i < 16; i++) {
    if (voiceData[i]) {
      Object.keys(voiceData[i].parameters).forEach(paramName => {
        const param = voiceData[i].parameters[paramName];
        if (param && typeof param === 'object' && 'currentValue' in param) {
          delete param.currentValue; // Reset for next preview session
        }
      });
    }
  }
}


/**
 * Main parameter interpolation update loop
 * Runs continuously during playback
 */
function startParameterInterpolation() {
  if (!isParameterInterpolationActive) {
    return;
  }
  
  // Update each enabled voice's parameters
  for (let i = 0; i < 16; i++) {
    if (voiceData[i] && voiceData[i].enabled) {
      updateVoiceParameters(i);
    }
  }
  
  lastUpdateTime = Date.now();
  
  // Update UI sliders for current voice to show parameter changes
  if (currentVoice >= 0 && currentVoice < 16) {
    updateCurrentVoiceSliders();
  }
}

/**
 * Update the UI sliders to reflect current parameter values
 */
function updateCurrentVoiceSliders() {
  const parameterSection = document.getElementById('parameter-section');
  const sliders = parameterSection.querySelectorAll('[data-nouislider]');
  
  sliders.forEach(slider => {
    if (slider.noUiSlider) {
      try {
        // Find which parameter this slider represents
        const sliderWrapper = slider.closest('.row-container');
        if (!sliderWrapper) return;
        
        const labelElement = sliderWrapper.querySelector('.label-container');
        if (!labelElement) return;
        
        const paramName = labelElement.textContent.trim();
        const paramData = voiceData[currentVoice].parameters[paramName];
        
        if (paramData && typeof paramData.min !== 'undefined' && typeof paramData.max !== 'undefined') {
          // Update slider values without triggering events
          slider.noUiSlider.set([paramData.min, paramData.max]);
        }
      } catch (error) {
        // Silent error handling - slider might be in transition
      }
    }
  });
}

// Session 5: Rhythm Implementation - Add to scripts.js

// Updated rhythmDurations - remove index 0, everything shifts down
const rhythmDurations = {
  0: { name: "Thirty-second Notes", beats: 0.125 },        // Was index 1
  1: { name: "Thirty-second Note Triplets", beats: 1/12 }, // Was index 2
  2: { name: "Sixteenth Notes", beats: 0.25 },             // Was index 3
  3: { name: "Sixteenth Note Triplets", beats: 1/6 },      // Was index 4
  4: { name: "Eighth Notes", beats: 0.5 },                 // Was index 5
  5: { name: "Eighth Note Triplets", beats: 1/3 },         // Was index 6
  6: { name: "Quarter Note Triplets", beats: 2/3 },        // Was index 7
  7: { name: "Quarter Notes", beats: 1 },                  // Was index 8
  8: { name: "Half Note Triplets", beats: 4/3 },           // Was index 9
  9: { name: "Half Notes", beats: 2 },                     // Was index 10
  10: { name: "Whole Note Triplets", beats: 8/3 },         // Was index 11
  11: { name: "Whole Note", beats: 4 },                    // Was index 12
  12: { name: "Two Whole Notes", beats: 8 },               // Was index 13
  13: { name: "Three Whole Notes", beats: 12 },            // Was index 14
  14: { name: "Four Whole Notes", beats: 16 }              // Was index 15
};


// Global rhythm system variables
let noteScheduler = null;
let nextNoteTime = 0;
let isRhythmicPlaybackActive = false;

/**
 * Convert rhythm dropdown index to actual duration in seconds
 */
function getRhythmDuration(rhythmIndex, currentTempo = null) {
  const tempo = currentTempo || getCurrentTempo(voiceIndex);
  const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[4];
  const beatDuration = 60 / tempo;
  const noteDuration = rhythmInfo.beats * beatDuration;
  
  console.log(`Rhythm: ${rhythmInfo.name} = ${rhythmInfo.beats} beats = ${noteDuration.toFixed(3)}s at ${tempo} BPM`);
  return noteDuration;
}

function getRestDuration(restIndex, currentTempo = null) {
  const tempo = currentTempo || getCurrentTempo(voiceIndex);
  
  if (restIndex === 0) {
    console.log('No Rests selected = 0s rest');
    return 0;
  }
  
  const restInfo = rhythmDurations[restIndex - 1];
  if (!restInfo) {
    console.warn(`Invalid rest index ${restIndex}, defaulting to quarter note rest`);
    return 60 / tempo;
  }
  
  const beatDuration = 60 / tempo;
  const restDuration = restInfo.beats * beatDuration;
  
  console.log(`Rest: ${restInfo.name} = ${restInfo.beats} beats = ${restDuration.toFixed(3)}s at ${tempo} BPM`);
  return restDuration;
}


/**
 * MIDI note to frequency conversion
 */
function midiToFrequency(midiNote) {
  // A4 (440Hz) = MIDI note 69
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}


/**
 * ENHANCED selectMidiNote with Musical Chord System
 */
window.selectMidiNote = function(voiceIndex) {
    console.log(`🎼 ENHANCED selectMidiNote called for Voice ${voiceIndex + 1} (Musical Chord System)`);
    
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    const polyphonyParam = voiceData[voiceIndex].parameters['POLYPHONY'];
    
    console.log('Polyphony param:', polyphonyParam);
    
    // Determine how many notes to play simultaneously
    let noteCount = 1; // Default to monophonic
    
    if (polyphonyParam && typeof polyphonyParam.min === 'number' && typeof polyphonyParam.max === 'number') {
        if (polyphonyParam.behavior > 0) {
            const currentPolyphony = interpolateParameter(
                (polyphonyParam.min + polyphonyParam.max) / 2,
                polyphonyParam.min,
                polyphonyParam.max,
                polyphonyParam.behavior,
                0.15
            );
            noteCount = Math.round(Math.max(1, Math.min(16, currentPolyphony)));
        } else {
            noteCount = Math.round((polyphonyParam.min + polyphonyParam.max) / 2);
        }
    }
    
    console.log(`Calculated noteCount: ${noteCount}`);
    
    const selectedNotes = [];
    
    // Handle custom selected notes from piano
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
        console.log('Using piano selection');
        const availableNotes = [...melodicParam.selectedNotes];
        
        // Select notes based on polyphony count
        for (let i = 0; i < noteCount && availableNotes.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableNotes.length);
            const selectedMidi = availableNotes.splice(randomIndex, 1)[0];
            
            const frequency = midiToFrequency(selectedMidi);
            const noteName = midiNoteNames[selectedMidi] || `MIDI${selectedMidi}`;
            
            selectedNotes.push({ midiNote: selectedMidi, frequency, noteName });
        }
        
        console.log(`Returning ${selectedNotes.length} piano notes:`, selectedNotes.map(n => n.noteName));
        return selectedNotes;
    } else {
        console.log('Using MUSICAL CHORD SYSTEM for range-based selection');
        
        // Handle range-based selection with musical chord system
        const currentMin = Math.round(melodicParam.min);
        const currentMax = Math.round(melodicParam.max);
        
        if (isNaN(currentMin) || isNaN(currentMax) || currentMin > currentMax) {
            console.warn(`Voice ${voiceIndex + 1}: Invalid melodic range, using Middle C`);
            selectedNotes.push({
                midiNote: 60,
                frequency: midiToFrequency(60),
                noteName: 'C4'
            });
            return selectedNotes;
        }
        
        // Generate evolving root note
        let currentNote = melodicParam.currentNote;
        if (!currentNote || currentNote < currentMin || currentNote > currentMax) {
            currentNote = Math.floor((currentMin + currentMax) / 2);
            melodicParam.currentNote = currentNote;
        }
        
        // Apply behavior changes to root note
        if (melodicParam.behavior > 0) {
            const newNote = interpolateParameter(
                currentNote,
                currentMin,
                currentMax,
                melodicParam.behavior,
                0.15
            );
            currentNote = Math.round(newNote);
            melodicParam.currentNote = currentNote;
        }
        
        // Ensure note stays within bounds
        currentNote = Math.max(currentMin, Math.min(currentMax, currentNote));
        
        const baseNote = {
            midiNote: currentNote,
            frequency: midiToFrequency(currentNote),
            noteName: midiNoteNames[currentNote] || `MIDI${currentNote}`
        };
        
        // NEW: Generate musical chord using compendium
        const behaviorSetting = melodicParam.behavior || 50;
        const musicalChord = generateMusicalChord(baseNote, noteCount, currentMin, currentMax, behaviorSetting);
        
        console.log(`Returning ${musicalChord.length} musical chord notes:`, musicalChord.map(n => n.noteName));
        return musicalChord;
    }
};



// Add a function to test melodic range responsiveness
function testMelodicRangeResponsiveness() {
  console.log('=== TESTING MELODIC RANGE RESPONSIVENESS ===');
  
  const melodicParam = voiceData[currentVoice].parameters['MELODIC RANGE'];
  
  console.log('Current slider settings:', {
    min: melodicParam.min,
    max: melodicParam.max,
    behavior: melodicParam.behavior
  });
  
  console.log('\nGenerating 10 notes with current range:');
  for (let i = 0; i < 10; i++) {
    const note = selectMidiNote(currentVoice);
    // Just call the function to see the range in action
  }
  
  console.log('\nTo test different ranges:');
  console.log('1. Move the melodic range sliders to different positions');
  console.log('2. Run this test again to see if notes change ranges');
  console.log('3. Try extreme ranges like A0-C2 (bass) or C6-C8 (treble)');
}

// Add a function to force-refresh the melodic parameter from UI
function refreshMelodicRangeFromUI() {
  console.log('=== REFRESHING MELODIC RANGE FROM UI ===');
  
  // Find the melodic range slider in the current UI
  const parameterSection = document.getElementById('parameter-section');
  const rows = parameterSection.querySelectorAll('.row-container');
  
  rows.forEach(row => {
    const label = row.querySelector('.label-container');
    if (label && label.textContent.trim() === 'MELODIC RANGE') {
      const slider = row.querySelector('[data-nouislider]');
      if (slider && slider.noUiSlider) {
        const values = slider.noUiSlider.get();
        const min = Math.round(Number(values[0]));
        const max = Math.round(Number(values[1]));
        
        console.log('UI slider values:', { min, max });
        
        // Force update the parameter
        voiceData[currentVoice].parameters['MELODIC RANGE'].min = min;
        voiceData[currentVoice].parameters['MELODIC RANGE'].max = max;
        
        // Reset current note to force recalculation
        delete voiceData[currentVoice].parameters['MELODIC RANGE'].currentNote;
        
        console.log('Parameter forcibly updated to match UI');
        return;
      }
    }
  });
}

/**
 * Test rhythm duration calculations
 */
function testRhythmCalculations() {
  console.log('=== TESTING RHYTHM CALCULATIONS ===');
  
  const testTempo = 120;
  console.log(`Test tempo: ${testTempo} BPM`);
  
  // Test various rhythm types
  for (let i = 1; i <= 10; i++) {
    const duration = getRhythmDuration(i, testTempo);
    console.log(`Index ${i}: ${rhythmDurations[i].name} = ${duration.toFixed(3)}s`);
  }
  
  // Test MIDI conversion
  console.log('\n=== TESTING MIDI CONVERSION ===');
  const testNotes = [60, 69, 72, 84]; // C4, A4, C5, C6
  testNotes.forEach(midi => {
    const freq = midiToFrequency(midi);
    const name = midiNoteNames[midi];
    console.log(`${name} (MIDI ${midi}) = ${freq.toFixed(1)}Hz`);
  });
  
  // Test note selection for current voice
  console.log('\n=== TESTING NOTE SELECTION ===');
  console.log('Current voice melodic range:', voiceData[currentVoice].parameters['MELODIC RANGE']);
  
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`Test note ${i + 1}: ${note.noteName} = ${note.frequency.toFixed(1)}Hz`);
  }
}


// Session 5 Phase 2: Note Scheduling System - Add to scripts.js

// Note scheduling variables
let currentlyPlayingNotes = [];
let nextScheduledNoteTime = 0;
let rhythmScheduler = null;

/**
 * Create and schedule a single note with envelope
 */
function scheduleNote(frequency, duration, startTime, voiceIndex) {
  
  // ADD THIS LINE FIRST
  recordNoteForTempoTest();

  if (!audioManager || !audioManager.isInitialized) {
    return null;
  }
  
  const oscillator = audioManager.audioContext.createOscillator();
  const gainNode = audioManager.audioContext.createGain();
  const panNode = audioManager.audioContext.createStereoPanner();
  
  // Get current sound type for this voice
  const selectedSoundIndex = voiceData[voiceIndex].parameters['INSTRUMENT'];
  const selectedSoundName = gmSounds[selectedSoundIndex];
  const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
  
  // Set up oscillator
  oscillator.type = oscillatorType;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  
  // Apply current volume parameter
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
  const gainValue = currentVolume / 100;
  
  // Apply current balance parameter
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  const currentBalance = balanceParam.currentValue || (balanceParam.min + balanceParam.max) / 2;
  const panValue = Math.max(-1, Math.min(1, currentBalance / 100));
  
  // *** NEW: Dynamic envelope based on note duration ***
  const envelope = getEnvelopeForDuration(duration);
  const sustainLevel = gainValue * envelope.sustain;
  
  // Set up dynamic envelope
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, startTime + envelope.attack);
  gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - envelope.release);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  panNode.pan.setValueAtTime(panValue, startTime);
  
  // Connect audio chain
  oscillator.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioManager.masterGainNode);
  
  // Schedule start and stop
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
  
  // Track this note
  const noteInfo = {
    oscillator,
    gainNode,
    panNode,
    startTime,
    duration,
    frequency,
    voiceIndex
  };
  
  currentlyPlayingNotes.push(noteInfo);
  
  // Clean up when note ends
  oscillator.onended = () => {
    const index = currentlyPlayingNotes.indexOf(noteInfo);
    if (index > -1) {
      currentlyPlayingNotes.splice(index, 1);
    }
    try {
      oscillator.disconnect();
      gainNode.disconnect();
      panNode.disconnect();
    } catch (e) {
      // Already disconnected
    }
  };
  
  return noteInfo;
}

/**
 * Enhanced Preview Voice using new VoiceClock system - CLEANED UP
 */
async function previewVoice(voiceIndex) {
  console.log(`=== PREVIEW VOICE ${voiceIndex + 1} (New Clock System) ===`);
  
  // Initialize audio system if needed
  if (!audioManager || !audioManager.isInitialized) {
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('❌ Audio initialization failed');
      return;
    }
  }
  
  // Initialize clock systems if needed
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  if (!voiceClockManager) {
    voiceClockManager = new VoiceClockManager();
    voiceClockManager.initialize(masterClock);
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (!previewButton) {
    console.log('❌ Preview button not found');
    return;
  }
  
  if (previewButton.textContent === 'STOP') {
    console.log(`Stopping preview for Voice ${voiceIndex + 1}...`);
    
    // Stop individual voice clock
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.stop();
    }
    
    // Stop master clock if no other voices are active
    if (voiceClockManager.getActiveVoiceCount() === 0) {
      masterClock.stop();
    }
    
    // Reset button appearance
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview stopped`);
    
  } else {
    console.log(`Starting preview for Voice ${voiceIndex + 1}...`);
    
    // Stop any existing full playback first
    if (voiceClockManager.getActiveVoiceCount() > 0) {
      voiceClockManager.stopAllVoices();
    }
    
    // Start master clock
    if (!masterClock.isActive()) {
      masterClock.start();
    }
    
    // Enable only this voice temporarily for preview
    const originalEnabled = voiceData[voiceIndex].enabled;
    voiceData[voiceIndex].enabled = true;
    
    // Start individual voice clock - THIS REPLACES enableParameterInterpolation()
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.start();
    }
    
    // Update button appearance
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview started with new clock system`);
  }
}



// Test function to verify all rhythm options are working
// Add this to scripts.js and run in console

function testAllRhythmOptions() {
  console.log('=== TESTING ALL RHYTHM OPTIONS ===');
  
  const testTempo = 120; // BPM
  const beatDuration = 60 / testTempo; // 0.5 seconds per beat at 120 BPM
  
  console.log(`Test tempo: ${testTempo} BPM (${beatDuration}s per beat)`);
  console.log('');
  
  // Test each rhythm option
  for (let i = 0; i <= 10; i++) {
    const duration = getRhythmDuration(i, testTempo);
    const rhythmInfo = rhythmDurations[i];
    const beatsCalculated = duration / beatDuration;
    
    console.log(`Index ${i}: ${rhythmInfo.name}`);
    console.log(`  Expected: ${rhythmInfo.beats} beats`);
    console.log(`  Calculated: ${beatsCalculated.toFixed(3)} beats`);
    console.log(`  Duration: ${duration.toFixed(3)} seconds`);
    console.log(`  Time range: ${duration < 0.1 ? 'Very fast' : duration < 0.5 ? 'Fast' : duration < 2 ? 'Medium' : duration < 5 ? 'Slow' : 'Very slow'}`);
    console.log('');
  }
  
  // Test extreme cases
  console.log('=== EXTREME DURATION EXAMPLES ===');
  
  const shortestDuration = getRhythmDuration(0, testTempo); // 32nd notes
  const longestDuration = getRhythmDuration(10, testTempo); // 4 whole notes

  console.log(`Shortest: ${rhythmDurations[0].name} = ${shortestDuration.toFixed(3)}s`);
  console.log(`Longest: ${rhythmDurations[10].name} = ${longestDuration.toFixed(3)}s`);
  console.log(`Duration ratio: ${(longestDuration / shortestDuration).toFixed(1)}x difference`);
  
  // Verify mathematical consistency
  console.log('');
  console.log('=== MATHEMATICAL VERIFICATION ===');
  const wholNote = getRhythmDuration(7, testTempo); // Whole note = 4 beats
  const halfNote = getRhythmDuration(6, testTempo); // Half note = 2 beats
  const quarterNote = beatDuration; // 1 beat by definition
  
  console.log(`Whole note: ${wholNote.toFixed(3)}s (should be 4x quarter note)`);
  console.log(`Half note: ${halfNote.toFixed(3)}s (should be 2x quarter note)`);
  console.log(`Quarter note: ${quarterNote.toFixed(3)}s (1 beat)`);
  console.log(`Ratio check: whole/half = ${(wholNote/halfNote).toFixed(1)} (should be 2.0)`);
  console.log(`Ratio check: half/quarter = ${(halfNote/quarterNote).toFixed(1)} (should be 2.0)`);
}


// Add this diagnostic function to test melodic range issues

function testMelodicRangeIssues() {
  console.log('=== MELODIC RANGE DIAGNOSTIC ===');
  
  const currentVoiceParam = voiceData[currentVoice].parameters['MELODIC RANGE'];
  
  console.log('Current melodic range parameter:', {
    min: currentVoiceParam.min,
    max: currentVoiceParam.max,
    behavior: currentVoiceParam.behavior,
    currentNote: currentVoiceParam.currentNote
  });
  
  // Test frequency range capabilities
  console.log('\n=== FREQUENCY RANGE TEST ===');
  const extremeNotes = [
    { midi: 21, name: 'A0', freq: midiToFrequency(21) },   // Lowest piano key
    { midi: 36, name: 'C2', freq: midiToFrequency(36) },   // Low bass
    { midi: 60, name: 'C4', freq: midiToFrequency(60) },   // Middle C
    { midi: 84, name: 'C6', freq: midiToFrequency(84) },   // High treble
    { midi: 108, name: 'C8', freq: midiToFrequency(108) }  // Highest piano key
  ];
  
  extremeNotes.forEach(note => {
    console.log(`${note.name} (MIDI ${note.midi}) = ${note.freq.toFixed(1)}Hz`);
  });
  
  // Test note selection with different ranges
  console.log('\n=== NOTE SELECTION TEST ===');
  
  // Backup original values
  const originalMin = currentVoiceParam.min;
  const originalMax = currentVoiceParam.max;
  const originalCurrentNote = currentVoiceParam.currentNote;
  
  // Test low range (bass notes)
  console.log('Testing LOW RANGE (C2-C3):');
  currentVoiceParam.min = 36;  // C2
  currentVoiceParam.max = 48;  // C3
  currentVoiceParam.currentNote = 42; // Reset to middle of new range
  
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`  Low test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote}) = ${note.frequency.toFixed(1)}Hz`);
  }
  
  // Test high range (treble notes)
  console.log('Testing HIGH RANGE (C5-C6):');
  currentVoiceParam.min = 72;  // C5
  currentVoiceParam.max = 84;  // C6
  currentVoiceParam.currentNote = 78; // Reset to middle of new range
  
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`  High test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote}) = ${note.frequency.toFixed(1)}Hz`);
  }
  
  // Test extreme range (full piano)
  console.log('Testing EXTREME RANGE (A0-C8):');
  currentVoiceParam.min = 21;   // A0
  currentVoiceParam.max = 108;  // C8
  currentVoiceParam.currentNote = 60; // Reset to middle C
  
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`  Extreme test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote}) = ${note.frequency.toFixed(1)}Hz`);
  }
  
  // Restore original values
  currentVoiceParam.min = originalMin;
  currentVoiceParam.max = originalMax;
  currentVoiceParam.currentNote = originalCurrentNote;
  
  console.log('\n=== INTERPOLATION BEHAVIOR TEST ===');
  console.log('Testing how behavior affects note changes...');
  
  // Test with different behavior settings
  const originalBehavior = currentVoiceParam.behavior;
  
  currentVoiceParam.behavior = 0;
  const staticNote = selectMidiNote(currentVoice);
  console.log(`0% behavior: ${staticNote.noteName} (should stay same)`);
  
  currentVoiceParam.behavior = 100;
  const varyingNote1 = selectMidiNote(currentVoice);
  const varyingNote2 = selectMidiNote(currentVoice);
  console.log(`100% behavior: ${varyingNote1.noteName} -> ${varyingNote2.noteName} (should vary dramatically)`);
  
  // Restore original behavior
  currentVoiceParam.behavior = originalBehavior;
  
  console.log('\nDiagnostic complete. Check if note selection reflects the ranges tested.');
}

// Test function to play specific MIDI notes to verify oscillator capabilities
function testOscillatorRange() {
  console.log('=== TESTING OSCILLATOR FREQUENCY RANGE ===');
  
  if (!audioManager || !audioManager.isInitialized) {
    console.log('ERROR: Audio manager not initialized. Start preview first.');
    return;
  }
  
  const testNotes = [
    { midi: 21, name: 'A0' },    // 27.5 Hz - Lowest piano
    { midi: 36, name: 'C2' },    // 65.4 Hz - Low bass
    { midi: 60, name: 'C4' },    // 261.6 Hz - Middle C
    { midi: 84, name: 'C6' },    // 1046.5 Hz - High treble
    { midi: 108, name: 'C8' }    // 4186.0 Hz - Highest piano
  ];
  
  let currentIndex = 0;
  
  function playNextTestNote() {
    if (currentIndex >= testNotes.length) {
      console.log('Oscillator range test complete!');
      return;
    }
    
    const note = testNotes[currentIndex];
    const frequency = midiToFrequency(note.midi);
    
    console.log(`Playing: ${note.name} (MIDI ${note.midi}) = ${frequency.toFixed(1)}Hz`);
    
    // Schedule a 1-second test note
    scheduleNote(frequency, 1.0, audioManager.audioContext.currentTime, currentVoice);
    
    currentIndex++;
    
    // Play next note after 1.5 seconds
    setTimeout(playNextTestNote, 1500);
  }
  
  playNextTestNote();
}


// Function to play complete 88-key chromatic scale from A0 to C8

function playChromaticScale() {
  console.log('=== PLAYING 88-KEY CHROMATIC SCALE ===');
  console.log('Starting from A0 (27.5Hz) to C8 (4186.0Hz)');
  
  if (!audioManager || !audioManager.isInitialized) {
    console.log('ERROR: Audio manager not initialized. Start preview first.');
    return;
  }
  
  const startMidi = 21;  // A0 - first key on piano
  const endMidi = 108;   // C8 - last key on piano
  const noteDuration = 0.3; // 300ms per note for reasonable speed
  const gapDuration = 0.05;  // 50ms gap between notes
  
  let currentMidi = startMidi;
  let playbackStartTime = audioManager.audioContext.currentTime + 0.1;
  
  console.log(`Playing ${endMidi - startMidi + 1} notes from MIDI ${startMidi} to ${endMidi}`);
  console.log('Note duration: 300ms, Gap: 50ms, Total time: ~31 seconds');
  


  function scheduleNextNote() {
    if (currentMidi > endMidi) {
      console.log('Chromatic scale complete!');
      return;
    }
    
    // Calculate frequency using 12th root of 2 (semitone ratio)
    const frequency = 440 * Math.pow(2, (currentMidi - 69) / 12);
    
    // Get note name
    const noteName = midiNoteNames[currentMidi] || `MIDI${currentMidi}`;
    
    // Calculate octave for display
    const octave = Math.floor((currentMidi - 12) / 12);
    const noteInOctave = (currentMidi - 12) % 12;
    const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const calculatedName = noteNames[noteInOctave] + octave;
    
    console.log(`MIDI ${currentMidi}: ${noteName} = ${frequency.toFixed(2)}Hz (calculated: ${calculatedName})`);
    
    // Schedule the note
    scheduleNote(frequency, noteDuration, playbackStartTime, currentVoice);
    
    // Advance to next note
    currentMidi++;
    playbackStartTime += noteDuration + gapDuration;
    
    // Schedule next note immediately (don't wait for audio)
    setTimeout(scheduleNextNote, 10);
  }
  
  scheduleNextNote();
}

// Function to test specific frequency calculations
function testFrequencyCalculations() {
  console.log('=== FREQUENCY CALCULATION VERIFICATION ===');
  
  const semitoneRatio = Math.pow(2, 1/12); // 12th root of 2
  console.log(`Semitone ratio (12th root of 2): ${semitoneRatio.toFixed(6)}`);
  
  // Test the calculation manually
  console.log('\nManual frequency calculations:');
  
  let testFreq = 27.5; // A0
  for (let i = 21; i <= 30; i++) {
    const midiCalc = midiToFrequency(i);
    const noteName = midiNoteNames[i];
    
    console.log(`MIDI ${i} (${noteName}): Manual=${testFreq.toFixed(2)}Hz, Function=${midiCalc.toFixed(2)}Hz, Diff=${Math.abs(testFreq - midiCalc).toFixed(3)}Hz`);
    
    testFreq *= semitoneRatio; // Multiply by 12th root of 2 for next semitone
  }
  
  // Test key reference points
  console.log('\nKey reference points:');
  const referenceNotes = [
    { midi: 21, expected: 27.5, name: 'A0' },     // Lowest piano key
    { midi: 33, expected: 55.0, name: 'A1' },     // One octave up
    { midi: 45, expected: 110.0, name: 'A2' },    // Two octaves up
    { midi: 57, expected: 220.0, name: 'A3' },    // Three octaves up
    { midi: 69, expected: 440.0, name: 'A4' },    // Concert pitch
    { midi: 81, expected: 880.0, name: 'A5' },    // One octave above concert
    { midi: 60, expected: 261.626, name: 'C4' },  // Middle C
    { midi: 108, expected: 4186.009, name: 'C8' } // Highest piano key
  ];
  
  referenceNotes.forEach(ref => {
    const calculated = midiToFrequency(ref.midi);
    const error = Math.abs(calculated - ref.expected);
    const errorPercent = (error / ref.expected) * 100;
    
    console.log(`${ref.name}: Expected=${ref.expected}Hz, Calculated=${calculated.toFixed(3)}Hz, Error=${error.toFixed(3)}Hz (${errorPercent.toFixed(3)}%)`);
  });
}

// Function to play specific octaves for comparison
function playOctaveComparison() {
  console.log('=== OCTAVE COMPARISON TEST ===');
  
  if (!audioManager || !audioManager.isInitialized) {
    console.log('ERROR: Audio manager not initialized. Start preview first.');
    return;
  }
  
  const octaveTests = [
    { midi: 21, name: 'A0', octave: 0 },   // 27.5 Hz
    { midi: 33, name: 'A1', octave: 1 },   // 55 Hz
    { midi: 45, name: 'A2', octave: 2 },   // 110 Hz
    { midi: 57, name: 'A3', octave: 3 },   // 220 Hz
    { midi: 69, name: 'A4', octave: 4 },   // 440 Hz (concert pitch)
    { midi: 81, name: 'A5', octave: 5 },   // 880 Hz
    { midi: 93, name: 'A6', octave: 6 },   // 1760 Hz
    { midi: 105, name: 'A7', octave: 7 }   // 3520 Hz
  ];
  
  let currentIndex = 0;
  
  function playNextOctave() {
    if (currentIndex >= octaveTests.length) {
      console.log('Octave comparison complete!');
      return;
    }
    
    const test = octaveTests[currentIndex];
    const frequency = midiToFrequency(test.midi);
    
    console.log(`Playing ${test.name} (octave ${test.octave}): ${frequency.toFixed(1)}Hz`);
    
    // Play a 1-second note
    scheduleNote(frequency, 1.0, audioManager.audioContext.currentTime, currentVoice);
    
    currentIndex++;
    
    // Next octave after 1.5 seconds
    setTimeout(playNextOctave, 1500);
  }
  
  playNextOctave();
}



// Diagnostic function to trace the complete data flow from UI to note selection

function diagnoseMelodicRangeDataFlow() {
  console.log('=== MELODIC RANGE DATA FLOW DIAGNOSTIC ===');
  
  // Step 1: Check what's stored in voiceData
  console.log('1. Current voiceData parameter:');
  const storedParam = voiceData[currentVoice].parameters['MELODIC RANGE'];
  console.log('   Stored values:', {
    min: storedParam.min,
    max: storedParam.max,
    behavior: storedParam.behavior,
    currentNote: storedParam.currentNote
  });
  
  // Step 2: Find and read the actual UI slider
  console.log('\n2. Reading UI slider values:');
  const parameterSection = document.getElementById('parameter-section');
  const rows = parameterSection.querySelectorAll('.row-container');
  
  let sliderFound = false;
  rows.forEach(row => {
    const label = row.querySelector('.label-container');
    if (label && label.textContent.trim() === 'MELODIC RANGE') {
      const slider = row.querySelector('[data-nouislider]');
      if (slider && slider.noUiSlider) {
        const values = slider.noUiSlider.get();
        console.log('   UI slider shows:', {
          rawValues: values,
          min: Math.round(Number(values[0])),
          max: Math.round(Number(values[1]))
        });
        
        // Check if values match voiceData
        const uiMin = Math.round(Number(values[0]));
        const uiMax = Math.round(Number(values[1]));
        const dataMatch = (uiMin === Math.round(storedParam.min) && uiMax === Math.round(storedParam.max));
        console.log('   UI matches stored data:', dataMatch);
        
        sliderFound = true;
      }
    }
  });
  
  if (!sliderFound) {
    console.log('   ERROR: Melodic range slider not found in UI!');
  }
  
  // Step 3: Test the selectMidiNote function
  console.log('\n3. Testing note selection with current data:');
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`   Test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote})`);
  }
  
  // Step 4: Check if the slider update events are working
  console.log('\n4. Checking slider update mechanism:');
  console.log('   The issue might be that slider changes aren\'t updating voiceData');
  console.log('   This would happen if the slider\'s onChange event is broken');
  
  return {
    voiceDataValues: storedParam,
    sliderFound: sliderFound,
    recommendation: sliderFound ? 
      'Slider found - check if onChange events are firing' : 
      'Slider missing - UI rendering problem'
  };
}

// Function to manually set melodic range for testing
function forceSetMelodicRange(minNote, maxNote) {
  console.log(`=== FORCE SETTING MELODIC RANGE: ${minNote}-${maxNote} ===`);
  
  const param = voiceData[currentVoice].parameters['MELODIC RANGE'];
  
  // Store old values
  const oldMin = param.min;
  const oldMax = param.max;
  
  // Force new values
  param.min = minNote;
  param.max = maxNote;
  param.currentNote = Math.floor((minNote + maxNote) / 2);
  
  console.log('Forced parameter values:', {
    old: { min: oldMin, max: oldMax },
    new: { min: param.min, max: param.max },
    resetNote: param.currentNote
  });
  
  // Test note selection with forced values
  console.log('\nTesting note selection with forced range:');
  for (let i = 0; i < 8; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`  Note ${i + 1}: ${note.noteName} (MIDI ${note.midiNote})`);
  }
  
  console.log('\nIf you hear different notes now, the issue is UI->data connection');
  console.log('If notes are still the same, the issue is in selectMidiNote function');
}

// Function to test extreme ranges manually
function testExtremeRanges() {
  console.log('=== TESTING EXTREME MELODIC RANGES ===');
  
  console.log('\n1. Testing BASS range (A0-C2):');
  forceSetMelodicRange(21, 36);  // A0 to C2
  
  setTimeout(() => {
    console.log('\n2. Testing TREBLE range (C6-C8):');
    forceSetMelodicRange(84, 108); // C6 to C8
    
    setTimeout(() => {
      console.log('\n3. Testing MID range (C4-C5):');
      forceSetMelodicRange(60, 72); // C4 to C5
      
      console.log('\nListen to the playback - you should hear:');
      console.log('- Very low bass notes, then');
      console.log('- Very high treble notes, then'); 
      console.log('- Mid-range notes');
    }, 3000);
  }, 3000);
}


// Diagnostic function to trace the complete data flow from UI to note selection

function diagnoseMelodicRangeDataFlow() {
  console.log('=== MELODIC RANGE DATA FLOW DIAGNOSTIC ===');
  
  // Step 1: Check what's stored in voiceData
  console.log('1. Current voiceData parameter:');
  const storedParam = voiceData[currentVoice].parameters['MELODIC RANGE'];
  console.log('   Stored values:', {
    min: storedParam.min,
    max: storedParam.max,
    behavior: storedParam.behavior,
    currentNote: storedParam.currentNote
  });
  
  // Step 2: Find and read the actual UI slider
  console.log('\n2. Reading UI slider values:');
  const parameterSection = document.getElementById('parameter-section');
  const rows = parameterSection.querySelectorAll('.row-container');
  
  let sliderFound = false;
  rows.forEach(row => {
    const label = row.querySelector('.label-container');
    if (label && label.textContent.trim() === 'MELODIC RANGE') {
      const slider = row.querySelector('[data-nouislider]');
      if (slider && slider.noUiSlider) {
        const values = slider.noUiSlider.get();
        console.log('   UI slider shows:', {
          rawValues: values,
          min: Math.round(Number(values[0])),
          max: Math.round(Number(values[1]))
        });
        
        // Check if values match voiceData
        const uiMin = Math.round(Number(values[0]));
        const uiMax = Math.round(Number(values[1]));
        const dataMatch = (uiMin === Math.round(storedParam.min) && uiMax === Math.round(storedParam.max));
        console.log('   UI matches stored data:', dataMatch);
        
        sliderFound = true;
      }
    }
  });
  
  if (!sliderFound) {
    console.log('   ERROR: Melodic range slider not found in UI!');
  }
  
  // Step 3: Test the selectMidiNote function
  console.log('\n3. Testing note selection with current data:');
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`   Test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote})`);
  }
  
  // Step 4: Check if the slider update events are working
  console.log('\n4. Checking slider update mechanism:');
  console.log('   The issue might be that slider changes aren\'t updating voiceData');
  console.log('   This would happen if the slider\'s onChange event is broken');
  
  return {
    voiceDataValues: storedParam,
    sliderFound: sliderFound,
    recommendation: sliderFound ? 
      'Slider found - check if onChange events are firing' : 
      'Slider missing - UI rendering problem'
  };
}

// Function to manually set melodic range for testing
function forceSetMelodicRange(minNote, maxNote) {
  console.log(`=== FORCE SETTING MELODIC RANGE: ${minNote}-${maxNote} ===`);
  
  const param = voiceData[currentVoice].parameters['MELODIC RANGE'];
  
  // Store old values
  const oldMin = param.min;
  const oldMax = param.max;
  
  // Force new values
  param.min = minNote;
  param.max = maxNote;
  param.currentNote = Math.floor((minNote + maxNote) / 2);
  
  console.log('Forced parameter values:', {
    old: { min: oldMin, max: oldMax },
    new: { min: param.min, max: param.max },
    resetNote: param.currentNote
  });
  
  // Test note selection with forced values
  console.log('\nTesting note selection with forced range:');
  for (let i = 0; i < 8; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`  Note ${i + 1}: ${note.noteName} (MIDI ${note.midiNote})`);
  }
  
  console.log('\nIf you hear different notes now, the issue is UI->data connection');
  console.log('If notes are still the same, the issue is in selectMidiNote function');
}

// Function to test extreme ranges manually
function testExtremeRanges() {
  console.log('=== TESTING EXTREME MELODIC RANGES ===');
  
  console.log('\n1. Testing BASS range (A0-C2):');
  forceSetMelodicRange(21, 36);  // A0 to C2
  
  setTimeout(() => {
    console.log('\n2. Testing TREBLE range (C6-C8):');
    forceSetMelodicRange(84, 108); // C6 to C8
    
    setTimeout(() => {
      console.log('\n3. Testing MID range (C4-C5):');
      forceSetMelodicRange(60, 72); // C4 to C5
      
      console.log('\nListen to the playback - you should hear:');
      console.log('- Very low bass notes, then');
      console.log('- Very high treble notes, then'); 
      console.log('- Mid-range notes');
    }, 3000);
  }, 3000);
}


// Enhanced diagnostic to find ALL sliders
function findAllParameterSliders() {
  console.log('=== FINDING ALL PARAMETER SLIDERS ===');
  
  const parameterSection = document.getElementById('parameter-section');
  const allRows = parameterSection.querySelectorAll('.row-container');
  
  console.log(`Found ${allRows.length} parameter rows`);
  
  allRows.forEach((row, index) => {
    const label = row.querySelector('.label-container');
    const slider = row.querySelector('[data-nouislider]');
    
    if (label) {
      const paramName = label.textContent.trim();
      const hasSlider = slider && slider.noUiSlider;
      
      console.log(`Row ${index}: "${paramName}" - Slider: ${hasSlider ? 'YES' : 'NO'}`);
      
      if (hasSlider && paramName.toLowerCase().includes('melodic')) {
        console.log('  -> FOUND MELODIC SLIDER!');
        const values = slider.noUiSlider.get();
        console.log('  -> Current values:', values);
      }
    }
  });
}


// Check if noUiSlider library loaded
function checkNoUiSliderLibrary() {
  console.log('=== CHECKING NOUISLIDER LIBRARY ===');
  console.log('noUiSlider available:', typeof noUiSlider !== 'undefined');
  console.log('noUiSlider.create:', typeof noUiSlider?.create);
  
  // Find a raw slider div to test
  const parameterSection = document.getElementById('parameter-section');
  const sliderDivs = parameterSection.querySelectorAll('.slider-wrapper > div');
  
  console.log(`Found ${sliderDivs.length} slider divs`);
  
  sliderDivs.forEach((div, index) => {
    console.log(`Slider div ${index}:`, {
      hasNoUiSlider: !!div.noUiSlider,
      hasDataAttribute: div.hasAttribute('data-nouislider'),
      className: div.className
    });
  });
}


// Fixed diagnostic - look for actual noUiSlider elements
function findWorkingSliders() {
  console.log('=== FINDING WORKING SLIDERS (FIXED) ===');
  
  const parameterSection = document.getElementById('parameter-section');
  const allRows = parameterSection.querySelectorAll('.row-container');
  
  console.log(`Found ${allRows.length} parameter rows`);
  
  allRows.forEach((row, index) => {
    const label = row.querySelector('.label-container');
    // FIXED: Look for noUi-target class instead of data-nouislider attribute
    const slider = row.querySelector('.noUi-target');
    
    if (label) {
      const paramName = label.textContent.trim();
      const hasSlider = slider && slider.noUiSlider;
      
      console.log(`Row ${index}: "${paramName}" - Slider: ${hasSlider ? 'YES' : 'NO'}`);
      
      if (hasSlider) {
        try {
          const values = slider.noUiSlider.get();
          console.log(`  -> Values: [${values[0]}, ${values[1]}]`);
          
          // Check if this is melodic range
          if (paramName === 'MELODIC RANGE') {
            console.log(`  -> MELODIC RANGE FOUND! Current range: ${values[0]}-${values[1]}`);
          }
        } catch (error) {
          console.log(`  -> Error reading values: ${error.message}`);
        }
      }
    }
  });
}


// Quick test - manually sync slider to voiceData
function testSliderSync() {
  console.log('=== TESTING SLIDER SYNC ===');
  
  const parameterSection = document.getElementById('parameter-section');
  const rows = parameterSection.querySelectorAll('.row-container');
  
  rows.forEach(row => {
    const label = row.querySelector('.label-container');
    const slider = row.querySelector('.noUi-target');
    
    if (label && label.textContent.trim() === 'MELODIC RANGE' && slider) {
      console.log('Found melodic range slider');
      
      // Get current UI values
      const values = slider.noUiSlider.get();
      console.log('UI shows:', values);
      
      // Get current voiceData
      const storedParam = voiceData[currentVoice].parameters['MELODIC RANGE'];
      console.log('voiceData shows:', storedParam);
      
      // Test if onChange is working - try to trigger it
      console.log('Testing onChange...');
      slider.noUiSlider.set([60, 72]); // Should trigger onChange
      
      // Check if voiceData updated
      setTimeout(() => {
        const afterUpdate = voiceData[currentVoice].parameters['MELODIC RANGE'];
        console.log('After manual update:', afterUpdate);
      }, 100);
    }
  });
}





// DELETE AND PASTE FROM HERE TO THE END?   9-28-25  FIXING TWO MELODIC RANGES
// Line 2736 starts here - CLEANED AND OPTIMIZED VERSION

// =============================================================================
// MELODIC RANGE CONNECTION AND CONFLICT RESOLUTION
// =============================================================================

/**
 * Helper function to convert note names back to MIDI
 */
function convertNoteNameToMidi(noteName) {
  for (let [midi, name] of Object.entries(midiNoteNames)) {
    if (name === noteName) {
      return parseInt(midi);
    }
  }
  return 60; // Default to C4 if not found
}

/**
 * Clear competing melodic range systems based on screen size
 */
function clearMelodicRangeConflict(parameterName, voiceIndex) {
  if (parameterName === 'MELODIC RANGE') {
    const param = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    const isNarrowScreen = window.innerWidth <= 768;
    
    if (isNarrowScreen) {
      // Mobile: Clear piano selections, use slider range
      delete param.selectedNotes;
      console.log('📱 Mobile mode: Cleared piano selection, using slider range');
    } else {
      // Desktop: If piano exists, let it manage; otherwise use slider
      const pianoContainer = document.querySelector('.piano-container');
      if (pianoContainer && pianoContainer.pianoInstance) {
        console.log('🖥️ Desktop mode: Piano keyboard managing melodic range');
      } else {
        delete param.selectedNotes;
        console.log('🖥️ Desktop mode: No piano found, using slider range');
      }
    }
  }
}


/**
 * Enhanced parameter connection system - connects ALL UI controls to voiceData
 */
/**
 * Enhanced parameter connection system - connects ALL UI controls to voiceData
 */
function connectAllSliders() {
  console.log('=== CONNECTING ALL PARAMETER CONTROLS (including timing controls) ===');
  
  const parameterSection = document.getElementById('parameter-section');
  
  // 1. Connect dual-range sliders (noUiSlider instances)
  const dualSliders = parameterSection.querySelectorAll('.noUi-target');
  console.log(`Found ${dualSliders.length} dual-range sliders to connect`);
  
  dualSliders.forEach((slider, index) => {
    if (slider.noUiSlider) {
      // CORRECT - look for .row-container-content  
      const row = slider.closest('.row-container-content');
      const rollup = row ? row.closest('.parameter-rollup') : null;
      const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
      const paramName = rollupTitle ? rollupTitle.textContent.trim() : `Unknown ${index}`;

      console.log(`Connecting dual-slider: ${paramName}`);
      
      slider.noUiSlider.off('update');
      
      slider.noUiSlider.on('update', function(values) {
        if (paramName === 'MELODIC RANGE') {
          // CLEAR CONFLICT FIRST
          clearMelodicRangeConflict(paramName, currentVoice);
          
          // Handle melodic range with note name conversion
          const minMidi = convertNoteNameToMidi(values[0]);
          const maxMidi = convertNoteNameToMidi(values[1]);
          
          if (!isNaN(minMidi) && !isNaN(maxMidi)) {
            voiceData[currentVoice].parameters[paramName].min = minMidi;
            voiceData[currentVoice].parameters[paramName].max = maxMidi;
            delete voiceData[currentVoice].parameters[paramName].currentNote;
            delete voiceData[currentVoice].parameters[paramName].selectedNotes; // Clear custom selection
            
            // Update piano keyboard if visible
            const pianoContainer = row.querySelector('.piano-container');
            if (pianoContainer && pianoContainer.pianoInstance) {
              pianoContainer.pianoInstance.syncWithSliderRange(minMidi, maxMidi);
            }
            
            console.log(`✅ ${paramName}: ${values[0]}-${values[1]} → MIDI ${minMidi}-${maxMidi}`);
          }
        } else {
          // Handle other parameters normally
          const min = parseFloat(values[0]);
          const max = parseFloat(values[1]);
          
          if (!isNaN(min) && !isNaN(max) && voiceData[currentVoice].parameters[paramName]) {
            voiceData[currentVoice].parameters[paramName].min = min;
            voiceData[currentVoice].parameters[paramName].max = max;
         // Clear any cached values
            delete voiceData[currentVoice].parameters[paramName].currentValue;
            delete voiceData[currentVoice].parameters[paramName].currentTempo;
            delete voiceData[currentVoice].parameters[paramName].currentNote;

            console.log(`✅ ${paramName}: ${min}-${max}`);
          }
        }
      });
    }
  });
  
  // 2. Connect behavior sliders (regular input[type="range"])
const behaviorSliders = parameterSection.querySelectorAll('.behavior-slider-wrapper input[type="range"]');
console.log(`Found ${behaviorSliders.length} behavior sliders to connect`);

behaviorSliders.forEach((slider) => {
  const row = slider.closest('.row-container') || 
            slider.closest('.slider-wrapper')?.closest('.row-container') ||
            slider.closest('.parameter-rollup-content')?.closest('.parameter-rollup');
  const label = row ? (row.querySelector('.parameter-rollup-title') || row.querySelector('.label-container')) : null;
  const paramName = label ? label.textContent.trim() : 'Unknown Behavior';
  
  console.log(`Connecting behavior slider: ${paramName}`);
  
  // Remove any existing event listeners
  slider.oninput = null;
  slider.onchange = null;
  
  // Add new event listener with FIXED TOOLTIP
  slider.oninput = function(e) {
    const value = parseInt(e.target.value);
    
    if (voiceData[currentVoice].parameters[paramName]) {
      voiceData[currentVoice].parameters[paramName].behavior = value;
      
      // FIXED: Update the tooltip properly
      const tooltip = slider.parentElement.querySelector('.behavior-tooltip');
      if (tooltip) {
        tooltip.textContent = value + '%';
        
        // FIXED: Better tooltip position calculation
        const percentage = (value - parseInt(slider.min)) / (parseInt(slider.max) - parseInt(slider.min));
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = 16;
        const offset = percentage * (sliderWidth - thumbWidth) + (thumbWidth / 2);
        
        tooltip.style.left = `${offset}px`;
      }
      
      console.log(`✅ ${paramName} behavior: ${value}%`);
    }
  };
  // FIXED: Wait for rollup animation and layout to fully complete
const initializeTooltipWhenReady = () => {
  // Check if slider is visible and has dimensions
  if (slider.offsetWidth > 0 && slider.offsetHeight > 0) {
    const event = { target: slider };
    slider.oninput(event);
    console.log(`📍 Initialized tooltip for ${paramName} after layout ready`);
  } else {
    // Not ready yet, try again
    setTimeout(initializeTooltipWhenReady, 100);
  }
};

// Wait longer for rollup animation to complete
setTimeout(initializeTooltipWhenReady, 500);

});

  
 // 3. Connect dropdown selectors (Sound, Rhythms, Rests) - WITH SMART FALLBACK
const dropdowns = parameterSection.querySelectorAll('select.param-select, select.sound-select');
console.log(`Found ${dropdowns.length} dropdowns to connect`);

dropdowns.forEach((dropdown) => {
  const row = dropdown.closest('.row-container-content');
  const rollup = row ? row.closest('.parameter-rollup') : null;
  const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
  const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Dropdown';
  
  const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
  const isMinMax = dropdownLabel === 'Minimum' || dropdownLabel === 'Maximum';
  
  console.log(`Connecting dropdown: ${paramName} (${dropdownLabel || 'single'})`);
  
  dropdown.onchange = null;
  
  dropdown.onchange = function(e) {
    const value = parseInt(e.target.value);
    
    if (paramName === 'INSTRUMENT') {
      voiceData[currentVoice].parameters[paramName] = value;
      console.log(`✅ ${paramName}: ${gmSounds[value]}`);
      
    } else if (isMinMax && voiceData[currentVoice].parameters[paramName]) {
      const paramData = voiceData[currentVoice].parameters[paramName];
      
      if (dropdownLabel === 'Minimum') {
        paramData.min = value;
        console.log(`✅ ${paramName} minimum: ${value}`);
      } else if (dropdownLabel === 'Maximum') {
        paramData.max = value;
        console.log(`✅ ${paramName} maximum: ${value}`);
      }
      
      // Check for invalid range and provide feedback
      if (paramData.min > paramData.max && (paramName === 'RHYTHMS' || paramName === 'RESTS')) {
        console.warn(`⚠️ Invalid ${paramName} range: min(${paramData.min}) > max(${paramData.max})`);
        console.warn(`🎵 System will default to Quarter Notes during playback`);
        
        // Visual feedback - briefly highlight both dropdowns
        const allDropdowns = dropdown.parentElement.parentElement.querySelectorAll('select.param-select');
        allDropdowns.forEach(dd => {
          dd.style.backgroundColor = '#fff3cd'; // Light yellow background
          dd.style.border = '2px solid #ffc107'; // Yellow border
          
          setTimeout(() => {
            dd.style.backgroundColor = '';
            dd.style.border = '';
          }, 2000);
        });
        
        // Optional: Show a brief tooltip or message
        showInvalidRangeMessage(dropdown, paramName);
      }
    }
  };
});

/**
 * Show temporary message about invalid range
 */
function showInvalidRangeMessage(dropdown, paramName) {
  const message = document.createElement('div');
  message.style.cssText = `
    position: absolute;
    background: #fff3cd;
    border: 1px solid #ffc107;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    color: #856404;
    max-width: 200px;
  `;
  message.textContent = `Invalid ${paramName} range - will use Quarter Notes`;
  
  // Position near the dropdown
  const rect = dropdown.getBoundingClientRect();
  message.style.left = rect.left + 'px';
  message.style.top = (rect.bottom + 5) + 'px';
  
  document.body.appendChild(message);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}


  
  // 4. Connect multi-dual sliders (like DELAY with Speed/Depth)
  const multiDualContainers = parameterSection.querySelectorAll('.dual-slider');
  console.log(`Found ${multiDualContainers.length} multi-dual slider containers`);
  
  multiDualContainers.forEach((container) => {
    // CORRECT - use same method as other sliders
const row = container.closest('.row-container-content');
const rollup = row ? row.closest('.parameter-rollup') : null;
const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Multi-Dual';

    
    // Skip if this is a regular dual slider (already handled above)
    if (container.querySelectorAll('.slider-wrapper').length < 2) return;
    
    const speedSlider = container.querySelector('.slider-wrapper:first-child .noUi-target');
    const depthSlider = container.querySelector('.slider-wrapper:last-child .noUi-target');
    
    if (speedSlider && speedSlider.noUiSlider) {
      console.log(`Connecting multi-dual SPEED: ${paramName}`);
      
      speedSlider.noUiSlider.off('update');
      speedSlider.noUiSlider.on('update', function(values) {
        const min = parseFloat(values[0]);
        const max = parseFloat(values[1]);
        
        if (!isNaN(min) && !isNaN(max) && voiceData[currentVoice].parameters[paramName]?.speed) {
          voiceData[currentVoice].parameters[paramName].speed.min = min;
          voiceData[currentVoice].parameters[paramName].speed.max = max;
          console.log(`✅ ${paramName} speed: ${min}-${max}`);
        }
      });
    }
    
    if (depthSlider && depthSlider.noUiSlider) {
      console.log(`Connecting multi-dual DEPTH: ${paramName}`);
      
      depthSlider.noUiSlider.off('update');
      depthSlider.noUiSlider.on('update', function(values) {
        const min = parseFloat(values[0]);
        const max = parseFloat(values[1]);
        
        if (!isNaN(min) && !isNaN(max) && voiceData[currentVoice].parameters[paramName]?.depth) {
          voiceData[currentVoice].parameters[paramName].depth.min = min;
          voiceData[currentVoice].parameters[paramName].depth.max = max;
          console.log(`✅ ${paramName} depth: ${min}-${max}`);
        }
      });
    }
  });
  
  // 5. Connect Interactive Piano Keyboards
  const pianoContainers = parameterSection.querySelectorAll('.piano-container');

  pianoContainers.forEach((container) => {
    const row = container.closest('.row-container');
    const label = row ? row.querySelector('.label-container') : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Piano';
    
    if (paramName === 'MELODIC RANGE') {
      console.log('🎹 Piano connection - existing instance?', !!container.pianoInstance);
      
      if (container.pianoInstance) {
        console.log('🎹 Piano already exists - SKIPPING recreation');
        // DON'T recreate or call updateForVoice
      } else {
        console.log('🎹 Creating NEW piano instance');
        container.pianoInstance = new InteractivePiano(container, currentVoice);
      }
    }
  });
  
  // 6. Connect Timing Control Sliders (Duration, Entrance, Exit)
  const timingSliders = parameterSection.querySelectorAll('.timing-slider');
  console.log(`Found ${timingSliders.length} timing control sliders to connect`);
  
  // Find this section and update:
timingSliders.forEach((slider) => {
  const timingContainer = slider.closest('.timing-control-container');
  const controlLabel = timingContainer ? timingContainer.querySelector('.timing-control-label') : null;
  const controlType = controlLabel ? controlLabel.textContent.trim().toLowerCase() : 'unknown';
  
  console.log(`Connecting timing slider: ${controlType}`);
  
  slider.oninput = function(e) {
    const value = parseInt(e.target.value);
    
    // Update voiceData - map "duration" label back to internal "duration" property
    if (voiceData[currentVoice].parameters['LIFE SPAN']) {
      if (controlType === 'duration') {
        voiceData[currentVoice].parameters['LIFE SPAN'].duration = value;
        console.log(`✅ LIFE SPAN duration: ${value}`);
      } else if (controlType === 'entrance') {
        voiceData[currentVoice].parameters['LIFE SPAN'].entrance = value;
        console.log(`✅ LIFE SPAN entrance: ${value}`);
      }
    }
    
    // Update tooltip
    updateTimingTooltip(slider, value);
  };
  
  // Initialize tooltip
  const initialValue = parseInt(slider.value);
  updateTimingTooltip(slider, initialValue);
});
  
  // 7. Connect Timing Repeat Checkbox
  const timingCheckbox = parameterSection.querySelector('.timing-checkbox');
  if (timingCheckbox) {
    console.log('Connecting timing repeat checkbox');
    
    timingCheckbox.onchange = function(e) {
      const checked = e.target.checked;
      
      if (voiceData[currentVoice].parameters['LIFE SPAN']) {
        voiceData[currentVoice].parameters['LIFE SPAN'].repeat = checked;
        console.log(`✅ LIFE SPAN repeat: ${checked}`);
      }
    };
  }
  
  console.log('🎉 ALL PARAMETER CONTROLS CONNECTED! System fully operational:');
  console.log(`   ✅ ${dualSliders.length} dual-range sliders`);
  console.log(`   ✅ ${behaviorSliders.length} behavior sliders`);
  console.log(`   ✅ ${dropdowns.length} dropdown controls`);
  console.log(`   ✅ Multi-dual sliders (DELAY, etc.)`);
  console.log(`   ✅ ${timingSliders.length} timing control sliders`);
  console.log(`   ✅ Timing repeat checkbox`);
}



// =============================================================================
// VOICE MANAGEMENT SYSTEM
// =============================================================================



class Voice {
  constructor(audioContext, voiceIndex, masterGainNode) {
    this.audioContext = audioContext;
    this.voiceIndex = voiceIndex;
    this.masterGainNode = masterGainNode;
    
    // Voice state
    this.isPlaying = false;
    this.isPreviewPlaying = false;
    this.currentlyPlayingNotes = [];
    this.rhythmScheduler = null;
    this.nextScheduledNoteTime = 0;
    
    // Audio chain for this voice
    this.voiceGainNode = audioContext.createGain();
    this.voicePanNode = audioContext.createStereoPanner();
    
    // CONTINUOUS OSCILLATOR - never stops!
    this.continuousOscillator = null;
    this.noteGainNode = null;
    
    // Connect: voice gain -> voice pan -> master
    this.voiceGainNode.connect(this.voicePanNode);
    this.voicePanNode.connect(masterGainNode);
    
    // Set initial voice volume (prevent 16 voices from being too loud)
    this.voiceGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    console.log(`Voice ${voiceIndex + 1} initialized with continuous oscillator`);
  }
  
  /**
   * Initialize the continuous oscillator system
   */
  initializeContinuousOscillator() {
    if (this.continuousOscillator) {
      this.stopContinuousOscillator();
    }
    
    // Create continuous oscillator
    this.continuousOscillator = this.audioContext.createOscillator();
    this.noteGainNode = this.audioContext.createGain();
    
    // Get voice sound type
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    // Set up oscillator
    this.continuousOscillator.type = oscillatorType;
    this.continuousOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // Start at A3
    
    // Connect: oscillator -> note gain -> voice gain -> voice pan -> master
    this.continuousOscillator.connect(this.noteGainNode);
    this.noteGainNode.connect(this.voiceGainNode);
    
    // Start with gain at 0 (silent)
    this.noteGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    
    // Start the oscillator and never stop it!
    this.continuousOscillator.start();
    
    console.log(`Voice ${this.voiceIndex + 1} continuous oscillator started`);
  }
  
  /**
   * Stop the continuous oscillator
   */
  stopContinuousOscillator() {
    if (this.continuousOscillator) {
      try {
        this.continuousOscillator.stop();
        this.continuousOscillator.disconnect();
        this.noteGainNode.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.continuousOscillator = null;
      this.noteGainNode = null;
    }
  }
  
  /**
   * Start this voice playing in multi-voice mode
   */
  startPlaying() {
    if (this.isPlaying) return;
    
    this.initializeContinuousOscillator();
    
    this.isPlaying = true;
    this.nextScheduledNoteTime = this.audioContext.currentTime + 0.1;
    
    // Start rhythmic note scheduling for this voice
    this.scheduleVoiceNotes();
    
    console.log(`Voice ${this.voiceIndex + 1} started playing`);
  }
  
  /**
   * Stop this voice
   */
  stopPlaying() {
    this.isPlaying = false;
    this.isPreviewPlaying = false;
    
    // Clear scheduler
    if (this.rhythmScheduler) {
      clearInterval(this.rhythmScheduler);
      this.rhythmScheduler = null;
    }
    
    // Stop continuous oscillator
    this.stopContinuousOscillator();
    
    console.log(`Voice ${this.voiceIndex + 1} stopped`);
  }
  
  /**
   * Start individual voice preview (for parameter adjustment)
   */
  startPreview() {
    this.stopPlaying(); // Stop multi-voice mode if active
    
    this.initializeContinuousOscillator();
    
    this.isPreviewPlaying = true;
    this.nextScheduledNoteTime = this.audioContext.currentTime + 0.1;
    
    // Start rhythmic playback and parameter evolution for this voice only
    this.scheduleVoiceNotes();
    this.startParameterEvolution();
    
    console.log(`Voice ${this.voiceIndex + 1} preview started`);
  }
  
  /**
   * Stop individual voice preview
   */
  stopPreview() {
    this.isPreviewPlaying = false;
    this.stopPlaying();
    
    console.log(`Voice ${this.voiceIndex + 1} preview stopped`);
  }
  
  /**
   * Schedule notes for this voice
   */
  scheduleVoiceNotes() {
    if (!this.isPlaying && !this.isPreviewPlaying) return;
    
    const scheduleAhead = () => {
      if (!this.isPlaying && !this.isPreviewPlaying) return;
      
      const currentTime = this.audioContext.currentTime;
      const scheduleAheadTime = 0.5;
      
      // Schedule notes while within lookahead window
      while (this.nextScheduledNoteTime < currentTime + scheduleAheadTime) {
        this.nextScheduledNoteTime = this.scheduleNextNote(this.nextScheduledNoteTime);
      }
    };
    
    // Schedule first notes immediately
    scheduleAhead();
    
    // Continue scheduling every 50ms
    this.rhythmScheduler = setInterval(scheduleAhead, 50);
  }
  /**
 * Schedule a single note for this voice
 */
scheduleNextNote(startTime) {
  console.log(`=== VOICE MANAGER: SCHEDULING NOTE FOR VOICE ${this.voiceIndex + 1} ===`);
  
  // Get current parameter values for this voice
  const voiceParams = voiceData[this.voiceIndex].parameters;
  
  // Select rhythm and rest durations
  const rhythmParam = voiceParams['RHYTHMS'];
  const restParam = voiceParams['RESTS'];
  
  const rhythmIndex = this.selectValueInRange(rhythmParam);
  const restIndex = this.selectValueInRange(restParam);
  
  // Use this voice's individual tempo instead of shared tempo
  const voiceTempo = getVoiceTempo(this.voiceIndex);
    console.log(`VoiceClock Voice ${this.voiceIndex + 1} tempo: ${voiceTempo} BPM`); // CHANGED
  
  const noteDuration = getRhythmDuration(rhythmIndex, voiceTempo);
  const restDuration = getRestDuration(restIndex, voiceTempo);
  
  console.log(`VoiceClock Note: ${noteDuration.toFixed(3)}s, Rest: ${restDuration.toFixed(3)}s`); // CHANGED
  
  // Select note frequency
  const noteInfo = selectMidiNote(this.voiceIndex);
  
  // Create scheduled note
  const scheduledNote = this.createScheduledNote(
    noteInfo.frequency,
    noteDuration,
    startTime
  );
  
  if (scheduledNote) {
    this.currentlyPlayingNotes.push(scheduledNote);
  }
  
  // Return next note timing
  return startTime + noteDuration + restDuration;
}

  
  /**
   * Create a scheduled note for this voice
   */
  createScheduledNote(frequency, duration, startTime) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Get voice sound type
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    // Set up oscillator
    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Apply current volume parameter
    const volumeParam = voiceData[this.voiceIndex].parameters['VOLUME'];
    const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
    const gainValue = (currentVolume / 100) * 0.3; // Scale down for multi-voice
    
    // ADSR envelope
    const attackTime = 0.01;
    const releaseTime = 0.1;
    const sustainLevel = gainValue * 0.8;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + attackTime);
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    // Connect through this voice's audio chain
    oscillator.connect(gainNode);
    gainNode.connect(this.voiceGainNode);
    
    // Schedule playback
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    const noteInfo = {
      oscillator,
      gainNode,
      startTime,
      duration,
      frequency
    };
    
    // Clean up when note ends
    oscillator.onended = () => {
      const index = this.currentlyPlayingNotes.indexOf(noteInfo);
      if (index > -1) {
        this.currentlyPlayingNotes.splice(index, 1);
      }
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch (e) {
        // Already disconnected
      }
    };
    
    return noteInfo;
  }
  
  /**
   * Select a value within parameter range considering behavior
   */
  selectValueInRange(param) {
    if (param.behavior > 0) {
      return Math.floor(interpolateParameter(
        (param.min + param.max) / 2,
        param.min,
        param.max,
        param.behavior,
        0.3
      ));
    } else {
      return Math.floor((param.min + param.max) / 2);
    }
  }
  
  /**
   * Start parameter evolution for preview mode
   */
startParameterEvolution() {
  if (this.isPreviewPlaying) {
    console.log('DEBUG: this.voiceIndex =', this.voiceIndex); // Add this line
    // Use existing parameter evolution system
    startTestClock(this.voiceIndex);
  }
}

}

// =============================================================================
// INTERACTIVE PIANO KEYBOARD
// =============================================================================

/**
 * Interactive Piano Keyboard for Melodic Range Selection
 */
class InteractivePiano {
  constructor(container, voiceIndex) {
    this.container = container;
    this.voiceIndex = voiceIndex;
    this.selectedNotes = new Set();
    
    // Drag state
    this.isDragging = false;
    this.dragStartNote = null;
    this.dragMode = null; // 'select' or 'deselect'
    
    this.render();
    this.bindEvents();
    this.loadInitialSelection();
  }
  
  /**
   * Create the piano keyboard HTML - 88 keys (A0 to C8)
   */
  render() {
    this.container.innerHTML = '';
    
    // Create keyboard container
    const keyboard = document.createElement('div');
    keyboard.className = 'piano-keyboard';
    
    // Create all 88 piano keys (MIDI 21-108)
    for (let midiNote = 21; midiNote <= 108; midiNote++) {
      const key = this.createKey(midiNote);
      keyboard.appendChild(key);
    }
    
    this.container.appendChild(keyboard);
    
    // Add info display
    const infoDiv = document.createElement('div');
    infoDiv.className = 'piano-info';
    infoDiv.innerHTML = `
      <span class="selected-range">Selected: None</span>
      <span class="piano-instructions">Click notes or drag to select range</span>
    `;
    this.container.appendChild(infoDiv);
  }
  
  /**
   * Create individual piano key
   */
  createKey(midiNote) {
    const isBlack = this.isBlackKey(midiNote);
    const key = document.createElement('div');
    key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
    key.dataset.midi = midiNote;
    key.title = `${midiNoteNames[midiNote]} (MIDI ${midiNote})`;
    
    return key;
  }
  
  /**
   * Determine if MIDI note is black key
   */
  isBlackKey(midiNote) {
    const noteInOctave = (midiNote - 12) % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave); // C#, D#, F#, G#, A#
  }
  
  /**
   * Load initial selection - WITH SENSIBLE DEFAULTS
   */
  loadInitialSelection() {
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    // Check if this voice has custom selected notes already
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
      // Load previously saved custom selections
      this.selectedNotes.clear();
      melodicParam.selectedNotes.forEach(note => this.selectedNotes.add(note));
      console.log('Loaded custom selections:', Array.from(this.selectedNotes).map(n => midiNoteNames[n]));
    } else {
      // SENSIBLE DEFAULT: Start with Middle C selected
      this.selectedNotes.clear();
      this.selectedNotes.add(60); // Middle C (C4)
      console.log('Starting with default: Middle C selected');
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
  }
  
  /**
   * Bind mouse events for interaction
   */
  bindEvents() {
    const keyboard = this.container.querySelector('.piano-keyboard');
    
    // Mouse down - start interaction
    keyboard.addEventListener('mousedown', (e) => {
      if (!e.target.classList.contains('piano-key')) return;
      
      e.preventDefault();
      const midiNote = parseInt(e.target.dataset.midi);
      
      // Single click: toggle note selection
      this.toggleNote(midiNote);
      
      // Prepare for potential drag
      this.isDragging = false;
      this.dragStartNote = midiNote;
      this.dragMode = this.selectedNotes.has(midiNote) ? 'select' : 'deselect';
      
      // Add global mouse events for dragging
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });
    
    // Prevent text selection
    keyboard.addEventListener('selectstart', (e) => e.preventDefault());
  }
  
  /**
   * Handle mouse move for dragging
   */
  handleMouseMove = (e) => {
    if (!this.dragStartNote) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || !element.classList.contains('piano-key')) return;
    
    const currentNote = parseInt(element.dataset.midi);
    
    // Start dragging mode
    if (!this.isDragging) {
      this.isDragging = true;
      console.log(`Started drag ${this.dragMode} from ${midiNoteNames[this.dragStartNote]}`);
    }
    
    // Select/deselect range
    this.selectRange(this.dragStartNote, currentNote, this.dragMode === 'select');
  }
  
  /**
   * Handle mouse up - end interaction
   */
  handleMouseUp = () => {
    this.isDragging = false;
    this.dragStartNote = null;
    this.dragMode = null;
    
    // Remove global event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  
  /**
   * Toggle single note selection
   */
  toggleNote(midiNote) {
    if (this.selectedNotes.has(midiNote)) {
      this.selectedNotes.delete(midiNote);
      console.log(`Removed: ${midiNoteNames[midiNote]}`);
    } else {
      this.selectedNotes.add(midiNote);
      console.log(`Added: ${midiNoteNames[midiNote]}`);
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
  }
  
  /**
   * Select/deselect range of notes
   */
  selectRange(startNote, endNote, select = true) {
    const minNote = Math.min(startNote, endNote);
    const maxNote = Math.max(startNote, endNote);
    
    for (let note = minNote; note <= maxNote; note++) {
      if (select) {
        this.selectedNotes.add(note);
      } else {
        this.selectedNotes.delete(note);
      }
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
  }
  
  /**
   * Update visual selection on keyboard
   */
  updateVisualSelection() {
    const keys = this.container.querySelectorAll('.piano-key');
    keys.forEach(key => {
      const midiNote = parseInt(key.dataset.midi);
      key.classList.toggle('selected', this.selectedNotes.has(midiNote));
    });
  }
  
  /**
   * Update voiceData with current selection
   */
  updateVoiceData() {
    // Clear any slider-based range when piano is used
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    if (this.selectedNotes.size === 0) {
      // Empty selection - set default but don't create selectedNotes array
      melodicParam.min = 60;
      melodicParam.max = 72;
      delete melodicParam.selectedNotes; // Remove piano control
      console.log('🎹 Piano cleared - reverting to slider control');
      return;
    }
    
    const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
    const min = selectedArray[0];
    const max = selectedArray[selectedArray.length - 1];
    
    // Piano takes control - set both range AND selection
    melodicParam.min = min;
    melodicParam.max = max;
    melodicParam.selectedNotes = selectedArray; // Piano-specific selection
    
    delete melodicParam.currentNote;
    
    console.log(`🎹 Piano controls range: ${midiNoteNames[min]} to ${midiNoteNames[max]} (${selectedArray.length} notes)`);
  }
  
  /**
   * Update info display
   */
  updateInfoDisplay() {
    const infoDiv = this.container.querySelector('.selected-range');
    if (!infoDiv) return;
    
    if (this.selectedNotes.size === 0) {
      infoDiv.textContent = 'Selected: None';
    } else if (this.selectedNotes.size === 1) {
      const note = Array.from(this.selectedNotes)[0];
      infoDiv.textContent = `Selected: ${midiNoteNames[note]}`;
    } else {
      const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
      const min = selectedArray[0];
      const max = selectedArray[selectedArray.length - 1];
      
      // Check if it's a continuous range
      const isContinuous = selectedArray.length === (max - min + 1);
      
      if (isContinuous) {
        infoDiv.textContent = `Selected: ${midiNoteNames[min]} to ${midiNoteNames[max]} (${selectedArray.length} notes)`;
      } else {
        infoDiv.textContent = `Selected: ${selectedArray.length} notes (${midiNoteNames[min]} to ${midiNoteNames[max]})`;
      }
    }
  }
  
  /**
   * Sync piano with slider range changes
   */
  syncWithSliderRange(minMidi, maxMidi) {
    console.log(`🎹 Piano syncing with slider range: MIDI ${minMidi}-${maxMidi}`);
    
    // Clear current selection
    this.selectedNotes.clear();
    
    // Select all notes in the range
    for (let midi = minMidi; midi <= maxMidi; midi++) {
      this.selectedNotes.add(midi);
    }
    
    // Update visual and data
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
    
    console.log(`🎹 Piano now shows ${this.selectedNotes.size} selected notes`);
  }
  
  /**
   * Update for new voice
   */
  updateForVoice(newVoiceIndex) {
    this.voiceIndex = newVoiceIndex;
    this.selectedNotes.clear();
    this.loadInitialSelection();
  }
}

// =============================================================================
// DEBUG AND TESTING FUNCTIONS
// =============================================================================

/**
 * Test melodic range conflict resolution
 */
function testMelodicRangeConflict() {
  console.log('=== TESTING MELODIC RANGE CONFLICT RESOLUTION ===');
  
  const param = voiceData[currentVoice].parameters['MELODIC RANGE'];
  
  console.log('Before test:', {
    min: param.min,
    max: param.max,
    hasSelectedNotes: !!(param.selectedNotes && param.selectedNotes.length),
    selectedNotesCount: param.selectedNotes?.length || 0,
    screenWidth: window.innerWidth,
    isNarrow: window.innerWidth <= 768
  });
  
  // Test 5 note selections
  for (let i = 0; i < 5; i++) {
    const note = selectMidiNote(currentVoice);
    console.log(`Test ${i + 1}: ${note.noteName} (MIDI ${note.midiNote})`);
  }
}

/**
 * Test DELAY slider responsiveness
 */
function testDelaySliders() {
  console.log('=== TESTING DELAY SLIDER RESPONSIVENESS ===');
  
  // Check current DELAY parameter values
  const delayParam = voiceData[currentVoice].parameters['DELAY'];
  console.log('Current DELAY parameter:', delayParam);
  
  console.log('Test sequence:');
  console.log('1. Start Preview');
  console.log('2. Move the DELAY sliders while Preview is playing');
  console.log('3. Watch console for parameter updates');
  console.log('4. You should see DELAY values change in real-time');
  
  console.log('\nExpected: DELAY values should update as you move sliders');
  console.log('Next step: Implement actual audio delay effect');
}



// =============================================================================
// ROLLUP CODE PROPER TAB NAMES
// =============================================================================  // Rollup configuration with proper tab names
const rollupConfig = {
  instrument: {
    title: "INSTRUMENT & SOUND",
    // icon: "🎹",
    expanded: true // Start expanded
  },
    mixing: {
    title: "MIXING & LEVELS",
    // icon: "🎚️", 
    expanded: true // Start expanded
  },
  rhythm: {
    title: "RHYTHM & TIMING", 
    // icon: "🥁",
    expanded: true // Start expanded
  },
  modulation: {
    title: "MODULATION EFFECTS",
    // icon: "🌊",
    expanded: false // Start collapsed
  },
  spatial: {
    title: "SPATIAL EFFECTS",
    //icon: "🏛️",
    expanded: false // Start collapsed
  }
};

// =============================================================================
// ROLL UP CODE
// =============================================================================
// Global rollup state
//let rollupState = {};

// Initialize rollup state - START ALL COLLAPSED
/* function initializeRollupState() {
  Object.keys(rollupConfig).forEach(key => {
    rollupState[key] = false; // CHANGED: All groups start collapsed
  });
}



// Create a rollup section
function createRollup(rollupKey, rollupInfo, parameters, voiceIndex) {
  const rollupContainer = document.createElement('div');
  rollupContainer.className = 'rollup-container';
  rollupContainer.dataset.rollup = rollupKey;
  
  // Rollup header (clickable tab)
  const rollupHeader = document.createElement('div');
  rollupHeader.className = 'rollup-header';
  rollupHeader.onclick = () => toggleRollup(rollupKey);
  
  // Expand/collapse arrow
  const rollupArrow = document.createElement('span');
  rollupArrow.className = 'rollup-arrow';
  rollupArrow.textContent = rollupState[rollupKey] ? '▼' : '▶';
  
  // Tab title
  const rollupTitle = document.createElement('span');
  rollupTitle.className = 'rollup-title';
  rollupTitle.textContent = rollupInfo.title;
  
  // Tab icon/emoji
  const rollupIcon = document.createElement('span');
  rollupIcon.className = 'rollup-icon';
  rollupIcon.textContent = rollupInfo.icon;
  
  rollupHeader.appendChild(rollupArrow);
  rollupHeader.appendChild(rollupTitle);
  rollupHeader.appendChild(rollupIcon);
  
  // Rollup content (collapsible)
  const rollupContent = document.createElement('div');
  rollupContent.className = 'rollup-content';
  rollupContent.style.display = rollupState[rollupKey] ? 'block' : 'none';
  
  // Add parameters to this rollup
  parameters.forEach(param => {
    const parameterRow = createRow(param, voiceIndex);
    rollupContent.appendChild(parameterRow);
  });
  
  rollupContainer.appendChild(rollupHeader);
  rollupContainer.appendChild(rollupContent);
  
  return rollupContainer;
}

// Toggle rollup expand/collapse
function toggleRollup(rollupKey) {
  const rollupContainer = document.querySelector(`[data-rollup="${rollupKey}"]`);
  const rollupArrow = rollupContainer.querySelector('.rollup-arrow');
  const rollupContent = rollupContainer.querySelector('.rollup-content');
  
  // Toggle state
  rollupState[rollupKey] = !rollupState[rollupKey];
  
  if (rollupState[rollupKey]) {
    // Expand
    rollupContent.style.display = 'block';
    rollupArrow.textContent = '▼';
    rollupContainer.classList.add('expanded');
    rollupContainer.classList.remove('collapsed');
  } else {
    // Collapse
    rollupContent.style.display = 'none';
    rollupArrow.textContent = '▶';
    rollupContainer.classList.add('collapsed');
    rollupContainer.classList.remove('expanded');
  }
  
  console.log(`${rollupConfig[rollupKey].title} ${rollupState[rollupKey] ? 'expanded' : 'collapsed'}`);
}

// Expand all rollups
function expandAllRollups() {
  Object.keys(rollupConfig).forEach(key => {
    if (!rollupState[key]) {
      toggleRollup(key);
    }
  });
}

// Collapse all rollups
function collapseAllRollups() {
  Object.keys(rollupConfig).forEach(key => {
    if (rollupState[key]) {
      toggleRollup(key);
    }
  });
} */

// END OF NESTED ROLL UP CODE
// =============================================================================

// =============================================================================
// BEBUGGING TIMING SLIDERS AND TOOLTIPS
// =============================================================================

/**
 * Update tooltip for timing controls (converts value to mm:ss format)
 */
function updateTimingTooltip(slider, value) {
  // Convert 0-100 range to reasonable time values
  // 0 = 0:00, 100 = 5:00 (5 minutes max)
  const totalSeconds = Math.floor((value / 100) * 300); // 0 to 300 seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Find or create tooltip - attach it directly to the slider's parent wrapper
  const sliderWrapper = slider.parentElement; // This should be the timing-slider-wrapper
  let tooltip = sliderWrapper.querySelector('.timing-tooltip');
  
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'timing-tooltip';
    
    // Insert tooltip right after the slider in the DOM
    slider.parentNode.insertBefore(tooltip, slider.nextSibling);
  }
  
  tooltip.textContent = timeString;
  
  // Position tooltip directly above the slider handle
  const percentage = (value - slider.min) / (slider.max - slider.min);
  const sliderWidth = slider.offsetWidth;
  const thumbWidth = 16;
  const offset = percentage * (sliderWidth - thumbWidth) + (thumbWidth / 2);
  
  tooltip.style.left = `${offset}px`;
  
  console.log(`📊 ${slider.closest('.timing-control-container').querySelector('.timing-control-label').textContent} tooltip: ${timeString} (value: ${value})`);
}


/**
 * Debug timing tooltip positioning step by step
 */
function debugTimingTooltips() {
  console.log('=== TIMING TOOLTIP POSITIONING DEBUG ===');
  
  // Find all timing sliders
  const timingSliders = document.querySelectorAll('.timing-slider');
  console.log(`Found ${timingSliders.length} timing sliders`);
  
  timingSliders.forEach((slider, index) => {
    const container = slider.closest('.timing-control-container');
    const label = container ? container.querySelector('.timing-control-label') : null;
    const controlType = label ? label.textContent.trim() : `slider-${index}`;
    
    console.log(`\n--- SLIDER ${index + 1}: ${controlType} ---`);
    
    // Check DOM structure
    console.log('DOM Structure:');
    console.log('  slider.parentElement:', slider.parentElement.className);
    console.log('  slider.parentElement.parentElement:', slider.parentElement.parentElement.className);
    
    // Check current positioning
    console.log('Slider positioning:');
    console.log('  slider.style.position:', getComputedStyle(slider).position);
    console.log('  slider.offsetWidth:', slider.offsetWidth);
    console.log('  slider.offsetLeft:', slider.offsetLeft);
    
    // Check if tooltip exists
    const tooltip = slider.parentElement.querySelector('.timing-tooltip');
    console.log('Tooltip exists:', !!tooltip);
    
    if (tooltip) {
      console.log('Tooltip positioning:');
      console.log('  tooltip.style.position:', getComputedStyle(tooltip).position);
      console.log('  tooltip.style.left:', tooltip.style.left);
      console.log('  tooltip.style.bottom:', getComputedStyle(tooltip).bottom);
      console.log('  tooltip.offsetLeft:', tooltip.offsetLeft);
      console.log('  tooltip.offsetTop:', tooltip.offsetTop);
      
      // Check tooltip's positioning context
      console.log('Tooltip positioning context:');
      console.log('  tooltip.offsetParent:', tooltip.offsetParent ? tooltip.offsetParent.className : 'null');
    }
    
    // Check container positioning
    console.log('Container positioning:');
    console.log('  container.style.position:', getComputedStyle(container).position);
    console.log('  container.style.overflow:', getComputedStyle(container).overflow);
  });
  
  console.log('\n=== EXPECTED vs ACTUAL ===');
  console.log('Expected: Tooltip should be positioned above slider handle');
  console.log('Expected: Tooltip should move with slider handle');
  console.log('Expected: Tooltip should stay within container bounds');
}







/**
 * Diagnostic function to test timing controls connection
 */
function testTimingControls() {
  console.log('=== TIMING CONTROLS DIAGNOSTIC ===');
  
  // Check if LIFE SPAN parameter exists in current voice
  console.log('Current voice:', currentVoice + 1);
  console.log('LIFE SPAN parameter exists:', !!voiceData[currentVoice].parameters['LIFE SPAN']);
  console.log('Current LIFE SPAN values:', voiceData[currentVoice].parameters['LIFE SPAN']);
  
  // Find timing sliders in DOM
  const parameterSection = document.getElementById('parameter-section');
  const timingSliders = parameterSection.querySelectorAll('.timing-slider');
  console.log(`Found ${timingSliders.length} timing sliders in DOM`);
  
  // Test each slider
  timingSliders.forEach((slider, index) => {
    const container = slider.closest('.timing-control-container');
    const label = container ? container.querySelector('.timing-control-label') : null;
    const controlType = label ? label.textContent.trim() : `slider-${index}`;
    
    console.log(`Slider ${index + 1}: ${controlType}`);
    console.log(`  - Current value: ${slider.value}`);
    console.log(`  - Has oninput handler: ${typeof slider.oninput === 'function'}`);
    console.log(`  - Min: ${slider.min}, Max: ${slider.max}`);
  });
  
  // Test checkbox
  const checkbox = parameterSection.querySelector('.timing-checkbox');
  if (checkbox) {
    console.log('Repeat checkbox found:');
    console.log(`  - Checked: ${checkbox.checked}`);
    console.log(`  - Has onchange handler: ${typeof checkbox.onchange === 'function'}`);
  } else {
    console.log('❌ Repeat checkbox NOT found');
  }
  
  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Run this function: testTimingControls()');
  console.log('2. Move the Duration slider');
  console.log('3. Watch console for "✅ LIFE SPAN duration: X" messages');
  console.log('4. Check values again: voiceData[currentVoice].parameters["LIFE SPAN"]');
}

/**
 * Monitor timing control changes in real-time
 */
function monitorTimingChanges() {
  console.log('🔍 MONITORING TIMING CHANGES - Move sliders now!');
  
  const interval = setInterval(() => {
    const currentValues = voiceData[currentVoice].parameters['LIFE SPAN'];
    console.log('Current LIFE SPAN values:', currentValues);
  }, 2000); // Log every 2 seconds
  
  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('⏹️ Stopped monitoring timing changes');
  }, 30000);
  
  return interval;
}

/****************************************************************
 * Open User Guide in new window
 ****************************************************************/
function openUserGuide() {
  // Open in new window with specific dimensions
  const userGuideWindow = window.open(
    'user-guide.html',
    'userGuide',
    'width=900,height=700,scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes'
  );
  
  // Focus the new window
  if (userGuideWindow) {
    userGuideWindow.focus();
  } else {
    // Fallback if popup blocked
    alert('Please allow popups to view the User Guide, or navigate to user-guide.html directly.');
  }
}
/*******************************************************************
//
// Oct 3, 25  TROUBLESHOOTING MASTER CLOCK AND VOICES TEMPOS
// Add this test function to scripts.js */
function testMasterTempoTracking() {
  console.log('=== TESTING MASTER TEMPO TRACKING ===');
  console.log(`Master Tempo: ${masterTempo} BPM`);
  console.log(`Current Voice: ${currentVoice + 1}`);
  
  // Test the current voice
  const voiceTempo = getVoiceTempo(currentVoice);
  console.log(`Voice ${currentVoice + 1} tempo: ${voiceTempo} BPM`);
  
  // Check the voice's parameter settings
  const tempoParam = voiceData[currentVoice].parameters['TEMPO (BPM)'];
  console.log('Voice tempo parameter:', tempoParam);
  
  // Test a few different master tempos
  console.log('\n--- Testing different master tempos ---');
  const originalMaster = masterTempo;
  
  [80, 120, 160, 200].forEach(testTempo => {
    masterTempo = testTempo;
    const result = getVoiceTempo(currentVoice);
    console.log(`Master: ${testTempo} → Voice: ${result} BPM`);
  });
  
  // Restore original
  masterTempo = originalMaster;

}

// Add this diagnostic function
function debugAudioSources() {
  console.log('=== AUDIO SOURCES DIAGNOSTIC ===');
  console.log('audioManager.isPlaying:', audioManager?.isPlaying);
  console.log('isRhythmicPlaybackActive:', isRhythmicPlaybackActive);
  console.log('currentlyPlayingNotes.length:', currentlyPlayingNotes?.length);
  
  // Check if the old continuous oscillator is still running
  if (audioManager && audioManager.testOscillator) {
    console.log('❌ OLD CONTINUOUS OSCILLATOR STILL RUNNING!');
    console.log('This is the sound you hear - it ignores tempo changes');
  }
  
  if (isRhythmicPlaybackActive) {
    console.log('✅ Rhythmic system is active (this responds to tempo)');
  }
}

// INNDER ROLLUP SCRIPTS
// Global rollup state for individual parameters
let parameterRollupState = {};

/**
 * Initialize parameter rollup state - START ALL COLLAPSED
 */
function initializeParameterRollupState() {
  // CHANGED: Start everything collapsed for clean UI
  parameterDefinitions.forEach(param => {
    parameterRollupState[param.name] = false; // All parameters start collapsed
  });
  
  console.log('📕 All parameter rollups initialized as collapsed');
}


/**
 * Create individual parameter rollup
 */
function createParameterRollup(param, voiceIndex) {
  // Initialize state if needed
  if (Object.keys(parameterRollupState).length === 0) {
    initializeParameterRollupState();
  }
  
  const rollupContainer = document.createElement('div');
  rollupContainer.className = `parameter-rollup ${parameterRollupState[param.name] ? 'expanded' : 'collapsed'}`;
  rollupContainer.dataset.parameter = param.name;
  
  // Rollup header (parameter name as clickable tab)
  const rollupHeader = document.createElement('div');
  rollupHeader.className = `parameter-rollup-header ${parameterRollupState[param.name] ? '' : 'collapsed'}`;
  rollupHeader.onclick = () => toggleParameterRollup(param.name);
  
  const rollupTitle = document.createElement('span');
  rollupTitle.className = 'parameter-rollup-title';
  rollupTitle.textContent = param.name;
  
  const rollupArrow = document.createElement('span');
  rollupArrow.className = 'parameter-rollup-arrow';
  rollupArrow.textContent = '▶';
  
  rollupHeader.appendChild(rollupTitle);
  rollupHeader.appendChild(rollupArrow);
  
  // Rollup content (parameter controls)
  const rollupContent = document.createElement('div');
  rollupContent.className = 'parameter-rollup-content';
  
  // Create the parameter controls without the main label
  const parameterContent = createParameterContent(param, voiceIndex);
  rollupContent.appendChild(parameterContent);
  
  rollupContainer.appendChild(rollupHeader);
  rollupContainer.appendChild(rollupContent);
  
  return rollupContainer;
}

/**
 * Create parameter content (controls without the main row wrapper)
 */
function createParameterContent(param, voiceIndex) {
  const contentDiv = document.createElement('div');
  contentDiv.className = 'row-container-content';
  
  // Handle timing controls specially
  if (param.type === 'timing-controls') {
    const timingWrapper = document.createElement('div');
    timingWrapper.className = 'timing-wrapper';
    timingWrapper.appendChild(createTimingControls(param, voiceIndex));
    return timingWrapper;
  }
  
  // Controls container for other parameter types
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  // Range controls
  const range = document.createElement('div');
  range.className = 'range-container';
  
  if (param.type === 'dropdown') {
    range.appendChild(createDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'dual-dropdown') {
    range.appendChild(createDualDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'single-dual') {
    range.appendChild(createDualSlider(param, voiceIndex));
  } else if (param.type === 'multi-dual') {
    range.appendChild(createMultiDualSlider(param, voiceIndex));
  }
  
  controlsContainer.appendChild(range);
  
  // Behavior controls - only for non-dropdown params
  if (param.type !== 'dropdown') {
    const behaviorContainer = createBehaviorSlider(param, voiceIndex);
    controlsContainer.appendChild(behaviorContainer);
  } else {
    const emptyBehavior = document.createElement('div');
    emptyBehavior.className = 'behavior-container';
    controlsContainer.appendChild(emptyBehavior);
  }
  
  contentDiv.appendChild(controlsContainer);
  return contentDiv;
}

/**
 * Toggle individual parameter rollup
 */
function toggleParameterRollup(parameterName) {
  const rollup = document.querySelector(`[data-parameter="${parameterName}"]`);
  if (!rollup) return;
  
  const header = rollup.querySelector('.parameter-rollup-header');
  const arrow = rollup.querySelector('.parameter-rollup-arrow');
  const content = rollup.querySelector('.parameter-rollup-content');
  
  // Toggle state
  parameterRollupState[parameterName] = !parameterRollupState[parameterName];
  
  if (parameterRollupState[parameterName]) {
    // Expand
    rollup.classList.add('expanded');
    rollup.classList.remove('collapsed');
    header.classList.remove('collapsed');
    content.style.display = 'block';
    arrow.textContent = '▼';
    console.log(`📖 Expanded: ${parameterName}`);
  } else {
    // Collapse
    rollup.classList.remove('expanded');
    rollup.classList.add('collapsed');
    header.classList.add('collapsed');
    content.style.display = 'none';
    arrow.textContent = '▶';
    console.log(`📕 Collapsed: ${parameterName}`);
  }
}

/**
 * Expand all parameters
 */
function expandAllParameters() {
  parameterDefinitions.forEach(param => {
    if (!parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
  console.log('📖 All parameters expanded');
}

/**
 * Collapse all parameters
 */
function collapseAllParameters() {
  parameterDefinitions.forEach(param => {
    if (parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
  console.log('📕 All parameters collapsed');
}

/**
 * Create nested group rollup containing individual parameter rollups
 */
function createNestedGroupRollup(rollupKey, rollupInfo, parameters, voiceIndex) {
  const rollupContainer = document.createElement('div');
  rollupContainer.className = 'rollup-container';
  rollupContainer.dataset.rollup = rollupKey;
  
  // Group rollup header (main category)
  const rollupHeader = document.createElement('div');
  rollupHeader.className = 'rollup-header';
  rollupHeader.onclick = () => toggleRollup(rollupKey);
  
  // Group expand/collapse arrow
  const rollupArrow = document.createElement('span');
  rollupArrow.className = 'rollup-arrow';
  rollupArrow.textContent = rollupState[rollupKey] ? '▼' : '▶';
  
  // Group title
  const rollupTitle = document.createElement('span');
  rollupTitle.className = 'rollup-title';
  rollupTitle.textContent = rollupInfo.title;
  
  // Group icon/emoji
  const rollupIcon = document.createElement('span');
  rollupIcon.className = 'rollup-icon';
  rollupIcon.textContent = rollupInfo.icon;
  
  rollupHeader.appendChild(rollupArrow);
  rollupHeader.appendChild(rollupTitle);
  rollupHeader.appendChild(rollupIcon);
  
  // Group rollup content (contains individual parameter rollups)
  const rollupContent = document.createElement('div');
  rollupContent.className = 'rollup-content';
  rollupContent.style.display = rollupState[rollupKey] ? 'block' : 'none';
  
  // Add individual parameter rollups to this group
  parameters.forEach(param => {
    const parameterRollup = createParameterRollup(param, voiceIndex);
    rollupContent.appendChild(parameterRollup);
  });
  
  rollupContainer.appendChild(rollupHeader);
  rollupContainer.appendChild(rollupContent);
  
  return rollupContainer;
}

/**
 * Quick access functions for testing
 */
function expandInstrumentGroup() {
  if (!rollupState['instrument']) toggleRollup('instrument');
  if (!parameterRollupState['INSTRUMENT']) toggleParameterRollup('INSTRUMENT');
  if (!parameterRollupState['MELODIC RANGE']) toggleParameterRollup('MELODIC RANGE');
  console.log('🎹 Instrument group expanded');
}

function expandMixingGroup() {
  if (!rollupState['mixing']) toggleRollup('mixing');
  if (!parameterRollupState['VOLUME']) toggleParameterRollup('VOLUME');
  if (!parameterRollupState['STEREO BALANCE']) toggleParameterRollup('STEREO BALANCE');
  console.log('🎚️ Mixing group expanded');
}

function collapseEverything() {
  collapseAllParameters();
  Object.keys(rollupState).forEach(key => {
    if (rollupState[key]) toggleRollup(key);
  });
  console.log('📕 Everything collapsed - clean slate!');
}

// Add these variables at the top of scripts.js
let tempoTestData = {
  noteTimestamps: [],
  isTestingTempo: false,
  testStartTime: null,
  expectedTempo: null
};

/**
 * Start precise tempo testing - measures actual note timing
 */
function startTempoTest(expectedTempo) {
  console.log(`🎵 STARTING TEMPO TEST - Expected: ${expectedTempo} BPM`);
  
  tempoTestData = {
    noteTimestamps: [],
    isTestingTempo: true,
    testStartTime: Date.now(),
    expectedTempo: expectedTempo
  };
  
  console.log('📊 Tempo test active - will measure next 10 notes');
}

/**
 * Record each note timing for tempo analysis
 */
function recordNoteForTempoTest() {
  if (!tempoTestData.isTestingTempo) return;
  
  const now = Date.now();
  tempoTestData.noteTimestamps.push(now);
  
  console.log(`🎵 Note ${tempoTestData.noteTimestamps.length} at ${now}ms`);
  
  // After 10 notes, calculate actual tempo
  if (tempoTestData.noteTimestamps.length >= 10) {
    calculateActualTempo();
  }
}

/**
 * Calculate actual tempo from recorded note timings
 */
function calculateActualTempo() {
  const timestamps = tempoTestData.noteTimestamps;
  const expectedTempo = tempoTestData.expectedTempo;
  
  if (timestamps.length < 2) {
    console.log('❌ Not enough notes recorded for tempo analysis');
    return;
  }
  
  // Calculate intervals between notes
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  
  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  
  // Convert to BPM (assuming quarter notes)
  const actualTempo = 60000 / avgInterval; // 60,000 ms per minute
  
  console.log('🎵 ===== TEMPO TEST RESULTS =====');
  console.log(`Expected Tempo: ${expectedTempo} BPM`);
  console.log(`Actual Tempo: ${actualTempo.toFixed(1)} BPM`);
  console.log(`Difference: ${(actualTempo - expectedTempo).toFixed(1)} BPM`);
  console.log(`Accuracy: ${((actualTempo / expectedTempo) * 100).toFixed(1)}%`);
  console.log(`Average interval: ${avgInterval.toFixed(1)}ms`);
  console.log(`All intervals:`, intervals.map(i => i.toFixed(0) + 'ms'));
  
  // Reset test
  tempoTestData.isTestingTempo = false;
  
  return {
    expected: expectedTempo,
    actual: actualTempo,
    difference: actualTempo - expectedTempo,
    accuracy: (actualTempo / expectedTempo) * 100
  };
}



// =============================================================================
// SHORTENING FAST NOTES SO THEY ARTICULATE
// =============================================================================
/**
 * Calculate appropriate envelope times based on note duration
 * Ensures fast notes can articulate properly
 */
function getEnvelopeForDuration(noteDurationSeconds) {
  const durationMs = noteDurationSeconds * 1000;
  
  if (durationMs < 50) {
    // Very fast notes (32nd at high BPM): minimal envelope
    return { 
      attack: 0.002,  // 2ms attack
      release: 0.010, // 10ms release
      sustain: 0.8    // 80% of peak volume
    };
  } else if (durationMs < 100) {
    // Fast notes (16th at high BPM): short envelope  
    return { 
      attack: 0.005,  // 5ms attack
      release: 0.020, // 20ms release
      sustain: 0.8    
    };
  } else if (durationMs < 200) {
    // Medium notes: moderate envelope
    return { 
      attack: 0.010,  // 10ms attack
      release: 0.050, // 50ms release
      sustain: 0.8    
    };
  } else {
    // Slow notes: full envelope for smooth sound
    return { 
      attack: 0.015,  // 15ms attack
      release: 0.100, // 100ms release
      sustain: 0.8    
    };
  }
}
// ENDING SHORTENING FAST NOTES
// =============================================================================


//*=============================================================================
//
// Oct 4, 25  ADDING LIFESPAN CONTROLS BELOW
//

/**
 * Convert Life Span slider values to actual time in seconds
 * Slider range 0-100 maps to 0-600 seconds (10 minutes max)
 */
function convertLifeSpanToSeconds(sliderValue) {
  // 0-100 slider maps to 0-300 seconds (5 minutes max)
  const seconds = Math.round((sliderValue / 100) * 300);
  return seconds;
}

/**
 * Convert seconds back to mm:ss format for display
 */
function formatSecondsToMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Test function for time conversion
 */
function testTimeConversion() {
  console.log('=== TESTING TIME CONVERSION ===');
  
  const testValues = [0, 25, 50, 75, 100];
  
  testValues.forEach(sliderValue => {
    const seconds = convertLifeSpanToSeconds(sliderValue);
    const timeString = formatSecondsToMMSS(seconds);
    console.log(`Slider ${sliderValue}% → ${seconds}s → ${timeString}`);
  });
  
  console.log('\nExpected:');
  console.log('0% → 0:00, 25% → 2:30, 50% → 5:00, 75% → 7:30, 100% → 10:00');
}

/**
 * Voice Lifecycle States
 */
const VoiceState = {
  WAITING: 'waiting',     // Before entrance time
  ACTIVE: 'active',       // Playing notes
  SILENT: 'silent',       // After exit, before repeat
  STOPPED: 'stopped'      // Duration expired or no repeat
};


/**
 * Voice Lifecycle Manager - tracks timing for all voices
 */
class VoiceLifecycleManager {
  constructor() {
    this.voiceStates = {}; // Track state for each voice
    this.startTime = 0;    // When playback started
    this.isActive = false; // Whether lifecycle management is running
    
    // Initialize all 16 voices
    for (let i = 0; i < 16; i++) {
      this.voiceStates[i] = {
        state: VoiceState.STOPPED,
        cycleStartTime: 0,
        nextStateTime: 0
      };
    }
    
    console.log('VoiceLifecycleManager initialized');
  }
  


  /**
   * Start lifecycle management for all enabled voices
   */
  start() {
    this.isActive = true;
    this.startTime = Date.now();
    
    // Initialize states for all enabled voices
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (voiceData[voiceIndex].enabled) {
        this.initializeVoiceState(voiceIndex);
      }
    }
    
    console.log('🕐 Voice Lifecycle Management started');
  }
  
  /**
   * Stop lifecycle management
   */
  stop() {
    this.isActive = false;
    
    // Reset all voice states
    for (let i = 0; i < 16; i++) {
      this.voiceStates[i].state = VoiceState.STOPPED;
    }
    
    console.log('🕐 Voice Lifecycle Management stopped');
  }
  
  /**
   * Initialize state for a specific voice
   */
  initializeVoiceState(voiceIndex) {
    const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
    const entranceSeconds = convertLifeSpanToSeconds(lifeSpan.entrance);
    
    this.voiceStates[voiceIndex] = {
      state: entranceSeconds === 0 ? VoiceState.ACTIVE : VoiceState.WAITING,
      cycleStartTime: this.startTime,
      nextStateTime: this.startTime + (entranceSeconds * 1000)
    };
    
    const voiceName = `Voice ${voiceIndex + 1}`;
    const entranceTime = formatSecondsToMMSS(entranceSeconds);
    
    if (entranceSeconds === 0) {
      console.log(`🎵 ${voiceName}: ACTIVE immediately`);
    } else {
      console.log(`⏳ ${voiceName}: WAITING, enters at ${entranceTime}`);
    }
  }
  
  /**
   * Get current state of a voice
   */
  getVoiceState(voiceIndex) {
    return this.voiceStates[voiceIndex]?.state || VoiceState.STOPPED;
  }
  
    /**
   * Check if a voice should be playing notes right now
   */
  shouldVoicePlaying(voiceIndex) {
    return this.getVoiceState(voiceIndex) === VoiceState.ACTIVE;
  }

  /**
   * Update all voice states based on current time
   * Called regularly during playback to transition states
   */
  updateVoiceStates() {
    if (!this.isActive) return;
    
    const currentTime = Date.now();
    
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (!voiceData[voiceIndex].enabled) continue;
      
      const voiceState = this.voiceStates[voiceIndex];
      const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
      
      // Calculate key timing points
      const durationMs = convertLifeSpanToSeconds(lifeSpan.duration) * 1000;
      const entranceMs = convertLifeSpanToSeconds(lifeSpan.entrance) * 1000;
      const exitMs = convertLifeSpanToSeconds(lifeSpan.exit) * 1000;
      
      const cycleElapsed = currentTime - voiceState.cycleStartTime;
      const voiceName = `Voice ${voiceIndex + 1}`;
      
      // State machine logic
      switch (voiceState.state) {
        case VoiceState.WAITING:
          if (cycleElapsed >= entranceMs) {
            voiceState.state = VoiceState.ACTIVE;
            console.log(`🎵 ${voiceName}: ACTIVE (entered at ${formatSecondsToMMSS(cycleElapsed/1000)})`);
          }
          break;
          
        case VoiceState.ACTIVE:
          if (exitMs > 0 && cycleElapsed >= exitMs) {
            voiceState.state = VoiceState.SILENT;
            console.log(`🔇 ${voiceName}: SILENT (exited at ${formatSecondsToMMSS(cycleElapsed/1000)})`);
          } else if (cycleElapsed >= durationMs) {
            if (lifeSpan.repeat) {
              voiceState.state = VoiceState.WAITING;
              voiceState.cycleStartTime = currentTime;
              console.log(`🔄 ${voiceName}: REPEAT CYCLE (duration complete)`);
            } else {
              voiceState.state = VoiceState.STOPPED;
              console.log(`⏹️ ${voiceName}: STOPPED (duration complete, no repeat)`);
            }
          }
          break;
          
        case VoiceState.SILENT:
          if (cycleElapsed >= durationMs) {
            if (lifeSpan.repeat) {
              voiceState.state = VoiceState.WAITING;
              voiceState.cycleStartTime = currentTime;
              console.log(`🔄 ${voiceName}: REPEAT CYCLE (silence period complete)`);
            } else {
              voiceState.state = VoiceState.STOPPED;
              console.log(`⏹️ ${voiceName}: STOPPED (duration complete, no repeat)`);
            }
          }
          break;
      }
    }
  }

// ← This closing brace ends the VoiceLifecycleManager class


}

// Global lifecycle manager instance
// let voiceLifecycleManager = null;

// testing function
function testVoiceLifecycleManager() {
  console.log('=== TESTING VOICE LIFECYCLE MANAGER ===');
  
  // Create a test instance
  if (!voiceLifecycleManager) {
    voiceLifecycleManager = new VoiceLifecycleManager();
  }
  
  // Test with current voice settings
  console.log('\nCurrent voice Life Span settings:');
  const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
  console.log('Duration:', lifeSpan.duration, '→', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.duration)));
  console.log('Entrance:', lifeSpan.entrance, '→', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.entrance)));
  console.log('Exit:', lifeSpan.exit, '→', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.exit)));
  console.log('Repeat:', lifeSpan.repeat);
  
  // Test starting lifecycle management
  console.log('\nTesting lifecycle start...');
  voiceLifecycleManager.start();
  
  // Check voice state
  const state = voiceLifecycleManager.getVoiceState(currentVoice);
  const shouldPlay = voiceLifecycleManager.shouldVoicePlaying(currentVoice);
  
  console.log(`Voice ${currentVoice + 1} state:`, state);
  console.log(`Should be playing:`, shouldPlay);
  
  // Stop for now
  voiceLifecycleManager.stop();
}

function testStateUpdates() {
  console.log('=== TESTING STATE UPDATES ===');
  
  if (!voiceLifecycleManager) {
    voiceLifecycleManager = new VoiceLifecycleManager();
  }
  
  // Set up a quick test scenario
  console.log('Setting up quick test: Voice enters in 3 seconds, exits at 6 seconds...');
  
  // Temporarily modify current voice for quick testing
  const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
  const originalValues = {
    duration: lifeSpan.duration,
    entrance: lifeSpan.entrance,
    exit: lifeSpan.exit,
    repeat: lifeSpan.repeat
  };
  
  // Quick test values (entrance at 5%, exit at 10%, duration at 20%)
  lifeSpan.duration = 20;  // 2 minutes total
  lifeSpan.entrance = 5;   // Enter at 18 seconds  
  lifeSpan.exit = 10;      // Exit at 36 seconds
  lifeSpan.repeat = false;
  
  console.log('Test settings:');
  console.log('Duration:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.duration)));
  console.log('Entrance:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.entrance)));
  console.log('Exit:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.exit)));
  
  // Start lifecycle
  voiceLifecycleManager.start();
  
  // Simulate time passing
  console.log('\nSimulating state updates...');
  voiceLifecycleManager.updateVoiceStates();
  
  // Check initial state
  console.log('Initial state:', voiceLifecycleManager.getVoiceState(currentVoice));
  
  // Restore original values
  Object.assign(lifeSpan, originalValues);
  voiceLifecycleManager.stop();
  
  console.log('Test complete - original values restored');
}

function testMasterClockIntegration() {
  console.log('=== TESTING MASTER CLOCK + LIFECYCLE INTEGRATION ===');
  
  // Create instances if needed
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  if (!voiceLifecycleManager) {
    voiceLifecycleManager = new VoiceLifecycleManager();
  }
  
  // Set up a quick test scenario (voice enters in 3 seconds)
  const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
  const originalValues = {
    duration: lifeSpan.duration,
    entrance: lifeSpan.entrance,
    exit: lifeSpan.exit
  };
  
  // Quick test: entrance in 3 seconds
  lifeSpan.entrance = 0.5; // 0.5% = 3 seconds
  lifeSpan.exit = 1.0;     // 1% = 6 seconds  
  lifeSpan.duration = 2.0; // 2% = 12 seconds
  
  console.log('Test scenario:');
  console.log('- Voice enters at:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.entrance)));
  console.log('- Voice exits at:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.exit)));
  console.log('- Total duration:', formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.duration)));
  
  // Start both systems
  console.log('\nStarting Master Clock and Lifecycle Manager...');
  voiceLifecycleManager.start();
  masterClock.start();
  
  console.log('✅ Both systems running');
  console.log('Initial voice state:', voiceLifecycleManager.getVoiceState(currentVoice));
  
  // Let it run for a few seconds then stop
  setTimeout(() => {
    console.log('\nAfter 5 seconds...');
    console.log('Voice state:', voiceLifecycleManager.getVoiceState(currentVoice));
    
    // Stop and restore
    masterClock.stop();
    voiceLifecycleManager.stop();
    Object.assign(lifeSpan, originalValues);
    
    console.log('Test complete - systems stopped and values restored');
  }, 5000);
  
  console.log('⏳ Test will complete in 5 seconds...');
}

async function testCompleteLifeSpanSystem() {
  console.log('=== TESTING COMPLETE LIFE SPAN SYSTEM ===');
  
  // ENSURE audio is initialized first
  if (!audioManager || !audioManager.isInitialized) {
    console.log('Initializing audio manager...');
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('❌ Audio initialization failed - cannot test audio features');
      return;
    }
    console.log('✅ Audio manager ready');
  }
  
  // Create instances
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  if (!voiceLifecycleManager) {
    voiceLifecycleManager = new VoiceLifecycleManager();
  }
  
  // Set up test scenario with audio
  const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
  const originalValues = {
    duration: lifeSpan.duration,
    entrance: lifeSpan.entrance,
    exit: lifeSpan.exit
  };
  
  // Test: 2 second entrance delay, 5 second exit
  lifeSpan.entrance = 0.33; // ~2 seconds
  lifeSpan.exit = 0.83;     // ~5 seconds  
  lifeSpan.duration = 1.67; // ~10 seconds total
  
  console.log('🎵 AUDIO TEST SCENARIO:');
  console.log('- 0-2s: WAITING (no audio) 🔇');
  console.log('- 2-5s: ACTIVE (playing audio) 🎵');
  console.log('- 5-10s: SILENT (no audio) 🔇');
  console.log('');
  console.log('Expected: You should hear notes ONLY between 2-5 seconds');
  console.log('');
  
  // Start the complete system
  voiceLifecycleManager.start();
  masterClock.start();
  
  // FIXED: Use correct function name
  startRhythmicPlayback(currentVoice);  // Fixed the typo
  
  console.log('✅ Complete system started - listen for audio pattern!');
  
  // Stop after 8 seconds
  setTimeout(() => {
    stopRhythmicPlayback();
    masterClock.stop();
    voiceLifecycleManager.stop();
    Object.assign(lifeSpan, originalValues);
    
    console.log('🎉 COMPLETE TEST FINISHED');
    console.log('Did you hear: Silence → Notes → Silence pattern?');
  }, 8000);
  
  console.log('⏳ Test running for 8 seconds...');
}




function debugLifecycleStates() {
  console.log('=== DEBUGGING LIFECYCLE STATES ===');
  
  if (!voiceLifecycleManager || !voiceLifecycleManager.isActive) {
    console.log('❌ VoiceLifecycleManager not active');
    return;
  }
  
  for (let i = 0; i < 2; i++) { // Check first 2 voices
    if (voiceData[i].enabled) {
      const state = voiceLifecycleManager.getVoiceState(i);
      const shouldPlay = voiceLifecycleManager.shouldVoicePlaying(i);
      const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
      
      console.log(`Voice ${i + 1}:`);
      console.log(`  Current State: ${state}`);
      console.log(`  Should Play: ${shouldPlay}`);
      console.log(`  LifeSpan Settings:`, {
        duration: lifeSpan.duration,
        entrance: lifeSpan.entrance,
        exit: lifeSpan.exit,
        repeat: lifeSpan.repeat
      });
      console.log(`  Entrance Time: ${convertLifeSpanToSeconds(lifeSpan.entrance)} seconds`);
    }
  }
}

/**
 * Test enhanced master clock timing accuracy
 */
function testEnhancedMasterClock() {
  console.log('=== TESTING ENHANCED MASTER CLOCK (1ms resolution) ===');
  
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  console.log('Starting master clock...');
  masterClock.start();
  
  // Test timing accuracy over 5 seconds
  let testCount = 0;
  const testInterval = setInterval(() => {
    testCount++;
    const elapsed = masterClock.getElapsedSeconds();
    const expected = testCount * 1.0; // Expected seconds
    const accuracy = Math.abs(elapsed - expected);
    
    console.log(`Test ${testCount}s: Elapsed=${elapsed.toFixed(3)}s, Expected=${expected}s, Accuracy=±${accuracy.toFixed(3)}s`);
    
    if (testCount >= 5) {
      clearInterval(testInterval);
      masterClock.stop();
      console.log('✅ Enhanced Master Clock test complete');
      
      if (accuracy < 0.01) {
        console.log('🎉 Timing accuracy: EXCELLENT (within 10ms)');
      } else if (accuracy < 0.05) {
        console.log('✅ Timing accuracy: GOOD (within 50ms)');
      } else {
        console.log('⚠️ Timing accuracy: NEEDS IMPROVEMENT');
      }
    }
  }, 1000);
  
  return testInterval;
} // End of test function

/**
 * Individual Voice Clock - Synced to Master Clock
 * Each voice gets its own tempo evolution while staying synchronized to master timing
 */
class VoiceClock {
  constructor(voiceIndex, masterClock) {
    this.voiceIndex = voiceIndex;
    this.masterClock = masterClock;
    
    // Voice timing state
    this.isActive = false;
    this.lastNoteTime = 0;        // When last note was scheduled (master time)
    this.nextNoteTime = 0;        // When next note should be scheduled (master time)
    this.currentTempo = 120;      // Current evolved tempo for this voice
    this.lastTempoUpdate = 0;     // When tempo was last updated
    
    // Life Span state tracking
    this.lifeCycleState = VoiceState.STOPPED;
    this.cycleStartTime = 0;      // When current cycle started (master time)
    
    console.log(`VoiceClock ${this.voiceIndex + 1} initialized and synced to master`);
  }
  

  /**
 * Start this voice clock (called when playback begins) - FIXED LIFE SPAN
 */
start() {
  if (!this.masterClock.isActive()) {
    console.warn(`Voice ${this.voiceIndex + 1}: Cannot start - master clock not running`);
    return;
  }
  
  this.isActive = true;
  const masterTime = this.masterClock.getMasterTime();
  
  // Initialize timing
  this.lastNoteTime = masterTime;
  this.cycleStartTime = masterTime; // When this voice's cycle started
  this.lastTempoUpdate = masterTime;
  
  // Initialize tempo from voice parameters
  this.updateTempo();
  
  // CHECK LIFE SPAN - Don't schedule first note immediately
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const entranceMs = convertLifeSpanToSeconds(lifeSpan.entrance) * 1000;
  
  if (entranceMs === 0) {
    // Enter immediately
    this.lifeCycleState = VoiceState.ACTIVE;
    this.nextNoteTime = masterTime + 100; // Schedule first note 100ms from now
    console.log(`🎵 Voice ${this.voiceIndex + 1} clock started - ACTIVE immediately`);
  } else {
    // Wait for entrance time
    this.lifeCycleState = VoiceState.WAITING;
    this.nextNoteTime = masterTime + entranceMs + 100; // Schedule first note after entrance + 100ms
    console.log(`🎵 Voice ${this.voiceIndex + 1} clock started - WAITING, enters in ${entranceMs/1000}s`);
  }
  
  console.log(`Voice ${this.voiceIndex + 1} settings: tempo ${this.currentTempo} BPM, entrance: ${formatSecondsToMMSS(entranceMs/1000)}`);
}

  
 /**
 * Stop this voice clock - ENHANCED with auto-reset trigger
 */
stop() {
  this.isActive = false;
  this.lifeCycleState = VoiceState.STOPPED;
  
  console.log(`⏹️ Voice ${this.voiceIndex + 1} clock stopped`);
  
  // NEW: Trigger auto-reset check when a voice stops
  if (voiceClockManager) {
    // Use setTimeout to ensure all voice state updates complete first
    setTimeout(() => {
      voiceClockManager.checkForAutoReset();
    }, 100); // Small delay to let state settle
  }
}


  
  /**
   * Update voice tempo (only at note boundaries - per requirement)
   */
  updateTempo() {
    if (!this.isActive) return;
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    const tempoParam = voiceParams['TEMPO (BPM)'];
    
    if (!tempoParam) {
      this.currentTempo = 120; // Default fallback
      return;
    }
    
    // Use evolved tempo if behavior is active
    if (tempoParam.behavior > 0 && tempoParam.currentValue !== undefined) {
      this.currentTempo = Math.round(tempoParam.currentValue);
    } else {
      // Use middle of range if no evolution
      this.currentTempo = Math.round((tempoParam.min + tempoParam.max) / 2);
    }
    
    // Clamp to reasonable bounds
    this.currentTempo = Math.max(40, Math.min(240, this.currentTempo));
    
    this.lastTempoUpdate = this.masterClock.getMasterTime();
  }
  
  /**
   * Update Life Span state based on master clock time
   */
  updateLifeCycleState() {
    if (!this.isActive || !this.masterClock.isActive()) return;
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    const lifeSpan = voiceParams['LIFE SPAN'];
    if (!lifeSpan) return;
    
    // Calculate timing in milliseconds
    const durationMs = convertLifeSpanToSeconds(lifeSpan.duration) * 1000;
    const entranceMs = convertLifeSpanToSeconds(lifeSpan.entrance) * 1000;
    const exitMs = convertLifeSpanToSeconds(lifeSpan.exit) * 1000;
    
    // Time since cycle started
    const cycleElapsed = this.masterClock.getMasterTime() - this.cycleStartTime;
    
    // State machine logic
    let newState = this.lifeCycleState;
    
    if (cycleElapsed < entranceMs) {
      newState = VoiceState.WAITING;
    } else if (exitMs > 0 && cycleElapsed >= exitMs) {
      newState = VoiceState.SILENT;
    } else if (cycleElapsed < durationMs) {
      newState = VoiceState.ACTIVE;
    } else {
      // Duration complete
      if (lifeSpan.repeat) {
        // Start new cycle
        this.cycleStartTime = this.masterClock.getMasterTime();
        newState = VoiceState.WAITING;
        console.log(`🔄 Voice ${this.voiceIndex + 1}: Starting repeat cycle`);
      } else {
        newState = VoiceState.STOPPED;
        this.stop();
        console.log(`⏹️ Voice ${this.voiceIndex + 1}: Duration complete, stopping`);
      }
    }
    
    // Log state changes
    if (newState !== this.lifeCycleState) {
      const stateName = newState.toUpperCase();
      const timeString = formatSecondsToMMSS(cycleElapsed / 1000);
      console.log(`🎵 Voice ${this.voiceIndex + 1}: ${stateName} at ${timeString}`);
    }
    
    this.lifeCycleState = newState;
  }
  
  /**
   * Check if this voice should be playing notes right now
   */
  shouldPlayNote() {
    return this.isActive && this.lifeCycleState === VoiceState.ACTIVE;
  }
  
  /**
   * Check if it's time for the next note
   */
  isTimeForNextNote() {
    if (!this.shouldPlayNote()) return false;
    
    const masterTime = this.masterClock.getMasterTime();
    return masterTime >= this.nextNoteTime;
  }
  
  /**
 * Schedule polyphonic notes for this voice
 */
scheduleNextNote() {
    if (!this.shouldPlayNote()) return;
    
    // Update tempo at note boundary
    this.updateTempo();
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    
    // Get rhythm and rest selections
    const rhythmParam = voiceParams['RHYTHMS'];
    const restParam = voiceParams['RESTS'];
    
    // Calculate note and rest durations
    const rhythmIndex = this.selectValueInRange(rhythmParam);
    const restIndex = this.selectValueInRange(restParam);
    
    const noteDurationMs = this.getRhythmDurationMs(rhythmIndex);
    const restDurationMs = this.getRestDurationMs(restIndex);
    
    // Get polyphonic note selection (returns array)
    const noteInfoArray = selectMidiNote(this.voiceIndex);
    
    // Schedule polyphonic notes
    this.triggerNote(noteInfoArray, noteDurationMs);
    
    // Update timing for next note
    this.lastNoteTime = this.nextNoteTime;
    this.nextNoteTime = this.lastNoteTime + noteDurationMs + restDurationMs;
    
    const noteCount = noteInfoArray.length;
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Scheduled ${noteCount} note${noteCount > 1 ? 's' : ''}, next in ${(noteDurationMs + restDurationMs)}ms`);
}

  
 /**
 * Select value within parameter range considering behavior - ENHANCED with fallback
 */
selectValueInRange(param) {
  if (!param) return 7; // Default to quarter notes (index 7)
  
  // Check for invalid range (min > max) and provide fallback
  if (param.min > param.max) {
    console.warn(`Invalid range detected: min(${param.min}) > max(${param.max}), defaulting to quarter notes`);
    
    // Update the UI dropdowns to reflect the fallback
    this.updateDropdownsToQuarterNotes(param);
    
    return 7; // Quarter notes index
  }
  
  if (param.behavior > 0) {
    return Math.floor(interpolateParameter(
      (param.min + param.max) / 2,
      param.min,
      param.max,
      param.behavior,
      0.3
    ));
  } else {
    return Math.floor((param.min + param.max) / 2);
  }
}

/**
 * Update dropdown displays to show quarter notes fallback
 */
updateDropdownsToQuarterNotes(param) {
  // Find the current voice's rhythm dropdowns
  const parameterSection = document.getElementById('parameter-section');
  const rhythmDropdowns = parameterSection.querySelectorAll('select.param-select');
  
  rhythmDropdowns.forEach(dropdown => {
    const row = dropdown.closest('.row-container-content');
    const rollup = row ? row.closest('.parameter-rollup') : null;
    const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
    const paramName = rollupTitle ? rollupTitle.textContent.trim() : '';
    
    if (paramName === 'RHYTHMS') {
      const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
      
      if (dropdownLabel === 'Minimum' || dropdownLabel === 'Maximum') {
        dropdown.value = 7; // Set to quarter notes
        dropdown.style.backgroundColor = '#ffe6e6'; // Light red background to indicate fallback
        dropdown.style.border = '2px solid #ff9999'; // Red border
        
        // Add a temporary visual indicator
        setTimeout(() => {
          dropdown.style.backgroundColor = '';
          dropdown.style.border = '';
        }, 3000); // Remove styling after 3 seconds
      }
    }
  });
  
  // Also update the parameter data
  param.min = 7; // Quarter notes
  param.max = 7; // Quarter notes
  
  console.log('🎵 Dropdowns updated to Quarter Notes fallback due to invalid range');
}

  
  /**
   * Get rhythm duration in milliseconds using voice's current tempo
   */
  getRhythmDurationMs(rhythmIndex) {
    const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[7]; // Default to quarter notes
    const beatDurationMs = (60 / this.currentTempo) * 1000; // ms per beat
    return rhythmInfo.beats * beatDurationMs;
  }
  
  /**
   * Get rest duration in milliseconds using voice's current tempo
   */
  getRestDurationMs(restIndex) {
    if (restIndex === 0) return 0; // No rests
    
    const restInfo = rhythmDurations[restIndex - 1] || rhythmDurations[7];
    const beatDurationMs = (60 / this.currentTempo) * 1000;
    return restInfo.beats * beatDurationMs;
  }
  
  /**
   * Create note information for this voice
   */
  createNoteInfo() {
    const noteSelection = selectMidiNote(this.voiceIndex);
    return {
      frequency: noteSelection.frequency,
      midiNote: noteSelection.midiNote,
      noteName: noteSelection.noteName,
      voiceIndex: this.voiceIndex,
      tempo: this.currentTempo
    };
  }
  
/**
 * Trigger polyphonic note playback
 */
triggerNote(noteInfoArray, durationMs) {
    if (!audioManager || !audioManager.isInitialized || !audioManager.audioContext) {
        console.warn(`Voice ${this.voiceIndex + 1}: Audio not ready, skipping notes`);
        return;
    }
    
    const startTime = audioManager.audioContext.currentTime + 0.01;
    const durationSeconds = durationMs / 1000;
    const scheduledNotes = [];
    
    // Create audio note for each selected note
    noteInfoArray.forEach((noteInfo, index) => {
        const scheduledNote = this.createScheduledAudioNote(
            noteInfo.frequency,
            durationSeconds,
            startTime,
            index / noteInfoArray.length // Slight timing offset for natural feel
        );
        
        if (scheduledNote) {
            scheduledNotes.push(scheduledNote);
        }
    });
    
    if (scheduledNotes.length > 0) {
        const noteNames = noteInfoArray.map(n => n.noteName).join(', ');
        console.log(`🎵 Voice ${this.voiceIndex + 1}: [${noteNames}] (${scheduledNotes.length} notes) for ${durationMs.toFixed(0)}ms at ${this.currentTempo} BPM`);
    }
    
    return scheduledNotes;
}

/**
 * Comprehensive ADSR-driven note with all ADSR effects
 */
createScheduledAudioNote(frequency, duration, startTime, offset = 0) {
    if (!audioManager || !audioManager.audioContext) return null;
    
    const actualStartTime = startTime + (offset * 0.001);
    
    // Get parameters and ADSR
    const selectedInstrumentIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'];
    const selectedInstrumentName = gmSounds[selectedInstrumentIndex];
    const baseOscillatorType = getOscillatorTypeForGMSound(selectedInstrumentName);
    
    const currentVelocity = this.getCurrentVelocity();
    const velocityNormalized = Math.max(0, Math.min(1, currentVelocity / 127));
    const adsrEnvelope = this.getComprehensiveADSR(duration, velocityNormalized, selectedInstrumentName);
    
    // MOVED UP: Get voice parameters before creating nodes
    const voiceParams = this.getAllCurrentVoiceParameters();

    // Create all audio nodes
    const oscillator = audioManager.audioContext.createOscillator();
    const gainNode = audioManager.audioContext.createGain();
    const panNode = audioManager.audioContext.createStereoPanner();
    const filterNode = audioManager.audioContext.createBiquadFilter();
    
    // Tremolo nodes
    const tremoloLFO = audioManager.audioContext.createOscillator();
    const tremoloGain = audioManager.audioContext.createGain();
    const tremoloDepth = audioManager.audioContext.createGain();
    
    // Chorus nodes
    const chorusDelay1 = audioManager.audioContext.createDelay(0.1);
    const chorusDelay2 = audioManager.audioContext.createDelay(0.1);
    const chorusDelay3 = audioManager.audioContext.createDelay(0.1);
    const chorusLFO1 = audioManager.audioContext.createOscillator();
    const chorusLFO2 = audioManager.audioContext.createOscillator();
    const chorusLFO3 = audioManager.audioContext.createOscillator();
    const chorusGain1 = audioManager.audioContext.createGain();
    const chorusGain2 = audioManager.audioContext.createGain();
    const chorusGain3 = audioManager.audioContext.createGain();
    const chorusDepth1 = audioManager.audioContext.createGain();
    const chorusDepth2 = audioManager.audioContext.createGain();
    const chorusDepth3 = audioManager.audioContext.createGain();
    const chorusMix = audioManager.audioContext.createGain();
    const dryGain = audioManager.audioContext.createGain();
    
    // Phaser nodes (4-stage phaser for rich effect)
    const phaserStage1 = audioManager.audioContext.createBiquadFilter();
    const phaserStage2 = audioManager.audioContext.createBiquadFilter();
    const phaserStage3 = audioManager.audioContext.createBiquadFilter();
    const phaserStage4 = audioManager.audioContext.createBiquadFilter();
    const phaserStages = [phaserStage1, phaserStage2, phaserStage3, phaserStage4];
    const phaserLFO = audioManager.audioContext.createOscillator();
    const phaserDepth = audioManager.audioContext.createGain();
    const phaserFeedback = audioManager.audioContext.createGain();
    const phaserMix = audioManager.audioContext.createGain();
    const phaserDry = audioManager.audioContext.createGain();
    
    // Reverb nodes
    const reverbNode = audioManager.audioContext.createConvolver();
    const reverbGain = audioManager.audioContext.createGain();
    const reverbDry = audioManager.audioContext.createGain();
    const reverbWet = audioManager.audioContext.createGain();
    
    // Delay nodes
    const delayNode = audioManager.audioContext.createDelay(2.0);
    const delayFeedback = audioManager.audioContext.createGain();
    const delayWet = audioManager.audioContext.createGain();
    const delayDry = audioManager.audioContext.createGain();

    // Set oscillator properties
    const velocitySensitiveWaveform = this.getVelocitySensitiveWaveform(baseOscillatorType, velocityNormalized, selectedInstrumentName);
    oscillator.type = velocitySensitiveWaveform;
    oscillator.frequency.setValueAtTime(frequency, actualStartTime);
    
    // Apply ADSR to all effects
    this.applyVolumeADSR(gainNode, adsrEnvelope, voiceParams, actualStartTime, duration);
    this.applyFilterADSR(filterNode, adsrEnvelope, frequency, velocityNormalized, selectedInstrumentName, actualStartTime, duration);
    
    const tremoloIsActive = this.applyTremoloADSR(tremoloLFO, tremoloGain, tremoloDepth, adsrEnvelope, voiceParams, actualStartTime, duration);
    
    const chorusIsActive = this.applyChorusADSR(
        chorusDelay1, chorusDelay2, chorusDelay3,
        chorusLFO1, chorusLFO2, chorusLFO3,
        chorusGain1, chorusGain2, chorusGain3,
        chorusDepth1, chorusDepth2, chorusDepth3,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );
    
    const phaserIsActive = this.applyPhaserADSR(
        phaserStages, phaserLFO, phaserDepth, phaserFeedback,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );
    
    // Apply Reverb ADSR
    const reverbIsActive = this.applyReverbADSR(
        reverbNode, reverbGain, reverbDry, reverbWet,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );

    // Apply Delay ADSR
    const delayIsActive = this.applyDelayADSR(
        delayNode, delayFeedback, delayWet, delayDry,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );
    
    this.applyPanADSR(panNode, adsrEnvelope, voiceParams, actualStartTime, duration);
    
    // Audio chain setup
    oscillator.connect(filterNode);
    let currentNode = filterNode;
    
    // Tremolo connection
    if (tremoloIsActive) {
        tremoloLFO.type = 'sine';
        tremoloLFO.frequency.setValueAtTime(voiceParams.tremoloSpeed, actualStartTime);
        tremoloLFO.start(actualStartTime);
        tremoloLFO.stop(actualStartTime + duration);
        
        tremoloLFO.connect(tremoloDepth);
        tremoloDepth.connect(tremoloGain.gain);
        
        currentNode.connect(tremoloGain);
        currentNode = tremoloGain;
    }
    
    // Chorus connection
    if (chorusIsActive) {
        const chorusWetLevel = Math.min(0.4, voiceParams.chorusDepth);
        const chorusDryLevel = 1.0 - chorusWetLevel;
        
        // Dry path
        dryGain.gain.setValueAtTime(chorusDryLevel, actualStartTime);
        currentNode.connect(dryGain);
        
        // Wet path
        currentNode.connect(chorusDelay1);
        currentNode.connect(chorusDelay2);
        currentNode.connect(chorusDelay3);
        
        chorusDelay1.connect(chorusGain1);
        chorusDelay2.connect(chorusGain2);
        chorusDelay3.connect(chorusGain3);
        
        chorusGain1.connect(chorusMix);
        chorusGain2.connect(chorusMix);
        chorusGain3.connect(chorusMix);
        
        chorusMix.gain.setValueAtTime(chorusWetLevel, actualStartTime);
        
        // Mix dry and wet
        const chorusFinalMix = audioManager.audioContext.createGain();
        chorusFinalMix.gain.setValueAtTime(1.0, actualStartTime);
        
        dryGain.connect(chorusFinalMix);
        chorusMix.connect(chorusFinalMix);
        
        currentNode = chorusFinalMix;
    }
    
    // Phaser connection
    if (phaserIsActive) {
        const phaserWetLevel = Math.min(0.6, voiceParams.phaserDepth);
        const phaserDryLevel = 1.0 - phaserWetLevel;
        
        // Dry path
        phaserDry.gain.setValueAtTime(phaserDryLevel, actualStartTime);
        currentNode.connect(phaserDry);
        
        // Wet path through phaser stages
        let phaserNode = currentNode;
        phaserStages.forEach(stage => {
            phaserNode.connect(stage);
            phaserNode = stage;
        });
        
        // Add feedback from last stage back to first stage
        phaserNode.connect(phaserFeedback);
        phaserFeedback.connect(phaserStage1);
        
        // Mix wet signal
        phaserNode.connect(phaserMix);
        phaserMix.gain.setValueAtTime(phaserWetLevel, actualStartTime);
        
        // Final phaser mix
        const phaserFinalMix = audioManager.audioContext.createGain();
        phaserFinalMix.gain.setValueAtTime(1.0, actualStartTime);
        
        phaserDry.connect(phaserFinalMix);
        phaserMix.connect(phaserFinalMix);
        
        currentNode = phaserFinalMix;
        
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Audio chain WITH phaser (4-stage)`);
    }
    
    // Reverb connection
    if (reverbIsActive) {
        const reverbWetLevel = Math.min(0.6, voiceParams.reverbDepth);
        const reverbDryLevel = 1.0 - reverbWetLevel;
        
        // Set up reverb routing
        reverbDry.gain.setValueAtTime(reverbDryLevel, actualStartTime);
        
        // Connect reverb chain
        currentNode.connect(reverbDry);
        currentNode.connect(reverbNode);
        reverbNode.connect(reverbWet);
        
        // Mix dry and wet
        const reverbFinalMix = audioManager.audioContext.createGain();
        reverbFinalMix.gain.setValueAtTime(1.0, actualStartTime);
        
        reverbDry.connect(reverbFinalMix);
        reverbWet.connect(reverbFinalMix);
        
        currentNode = reverbFinalMix;
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Audio chain WITH reverb`);
    }
    
    // Delay connection  
    if (delayIsActive) {
        const delayWetLevel = Math.min(0.7, voiceParams.delayDepth);
        const delayDryLevel = 1.0 - delayWetLevel;
        
        // Set up delay routing
        delayDry.gain.setValueAtTime(delayDryLevel, actualStartTime);
        
        // Connect delay chain with feedback
        currentNode.connect(delayDry);
        currentNode.connect(delayNode);
        delayNode.connect(delayWet);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode); // Feedback loop
        
        // Mix dry and wet
        const delayFinalMix = audioManager.audioContext.createGain();
        delayFinalMix.gain.setValueAtTime(1.0, actualStartTime);
        
        delayDry.connect(delayFinalMix);
        delayWet.connect(delayFinalMix);
        
        currentNode = delayFinalMix;
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Audio chain WITH delay`);
    }
    
    // Final connection
    currentNode.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioManager.masterGainNode);
    
    // Start oscillator
    oscillator.start(actualStartTime);
    oscillator.stop(actualStartTime + duration);
    
    // Enhanced cleanup
    oscillator.onended = () => {
        try {
            oscillator.disconnect();
            filterNode.disconnect();
            gainNode.disconnect();
            panNode.disconnect();
            
            if (tremoloIsActive) {
                tremoloLFO.disconnect();
                tremoloGain.disconnect();
                tremoloDepth.disconnect();
            }
            
            if (chorusIsActive) {
                chorusDelay1.disconnect();
                chorusDelay2.disconnect();
                chorusDelay3.disconnect();
                chorusLFO1.disconnect();
                chorusLFO2.disconnect();
                chorusLFO3.disconnect();
                chorusGain1.disconnect();
                chorusGain2.disconnect();
                chorusGain3.disconnect();
                chorusDepth1.disconnect();
                chorusDepth2.disconnect();
                chorusDepth3.disconnect();
                chorusMix.disconnect();
                dryGain.disconnect();
            }
            
            if (phaserIsActive) {
                phaserStages.forEach(stage => stage.disconnect());
                phaserLFO.disconnect();
                phaserDepth.disconnect();
                phaserFeedback.disconnect();
                phaserMix.disconnect();
                phaserDry.disconnect();
            }
            
            if (reverbIsActive) {
                reverbNode.disconnect();
                reverbGain.disconnect();
                reverbDry.disconnect();
                reverbWet.disconnect();
            }
            
            if (delayIsActive) {
                delayNode.disconnect();
                delayFeedback.disconnect();
                delayWet.disconnect();
                delayDry.disconnect();
            }
        } catch (e) {
            // Already disconnected
        }
    };
    
    return {
        oscillator,
        filterNode,
        gainNode,
        panNode,
        tremoloActive: tremoloIsActive,
        chorusActive: chorusIsActive,
        phaserActive: phaserIsActive,
        reverbActive: reverbIsActive,
        delayActive: delayIsActive,
        startTime: actualStartTime,
        duration,
        frequency,
        voiceIndex: this.voiceIndex,
        velocity: currentVelocity
    };
}

createScheduledAudioNote(frequency, duration, startTime, offset = 0) {
    if (!audioManager?.audioContext) {
        console.error('❌ No audio context available');
        return null;
    }
    
    const actualStartTime = startTime + (offset * 0.001);
    const voiceParams = this.getAllCurrentVoiceParameters();
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Creating note with diffused reverb`);
    
    const oscillator = audioManager.audioContext.createOscillator();
    const gainNode = audioManager.audioContext.createGain();
    
    // Basic oscillator setup
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, actualStartTime);
    
    // Simple envelope
    gainNode.gain.setValueAtTime(0, actualStartTime);
    gainNode.gain.linearRampToValueAtTime(0.1, actualStartTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, actualStartTime + duration);
    
    oscillator.connect(gainNode);
    // Apply balance first
const panNode = audioManager.audioContext.createStereoPanner();
const currentBalance = voiceParams.balance;
panNode.pan.setValueAtTime(currentBalance, actualStartTime);

// PERFECT DIFFUSED REVERB
if (voiceParams.reverbDepth > 0.001) {
    console.log(`🌊 Applying perfect diffused reverb (${(voiceParams.reverbDepth * 100).toFixed(0)}%)`);
    
    // Dry signal path
    const dryGain = audioManager.audioContext.createGain();
    dryGain.gain.setValueAtTime(0.6, actualStartTime);
    gainNode.connect(dryGain);
    dryGain.connect(panNode);
    
    // Perfect diffused reverb path
    const convolver = audioManager.audioContext.createConvolver();
    const reverbGain = audioManager.audioContext.createGain();
    
    reverbGain.gain.setValueAtTime(voiceParams.reverbDepth * 0.7, actualStartTime);
    
    // Create smooth 2-second impulse response
    const sampleRate = audioManager.audioContext.sampleRate;
    const impulseLength = sampleRate * 2;
    const impulse = audioManager.audioContext.createBuffer(2, impulseLength, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < impulseLength; i++) {
            const decay = Math.pow(1 - (i / impulseLength), 1.5);
            const noise = (Math.random() * 2 - 1);
            channelData[i] = noise * decay * 0.3;
        }
    }
    
    convolver.buffer = impulse;
    
    // Connect reverb path to panNode
    gainNode.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(panNode);
    
    console.log('🌊 Perfect diffused reverb applied');
} else {
    gainNode.connect(panNode);
}

// DELAY PROCESSING
if (voiceParams.delayDepth > 0.001) {
    console.log(`🔄 Voice ${this.voiceIndex + 1}: Applying crisp delay`);
    
    // Create delay nodes
    const delayNode = audioManager.audioContext.createDelay(2.0);
    const delayGain = audioManager.audioContext.createGain();
    const feedbackGain = audioManager.audioContext.createGain();
    const wetGain = audioManager.audioContext.createGain();
    const dryGain = audioManager.audioContext.createGain();
    
    // Convert delay time from ms to seconds
    const delayTimeSeconds = Math.min(voiceParams.delayTime / 1000, 2.0);
    delayNode.delayTime.setValueAtTime(delayTimeSeconds, actualStartTime);
    
    // Setup feedback and gains
    const feedbackAmount = voiceParams.delayFeedback || 0;
    feedbackGain.gain.setValueAtTime(feedbackAmount * 0.7, actualStartTime);
    
    const wetAmount = voiceParams.delayDepth;
    const dryAmount = 1.0 - wetAmount;
    wetGain.gain.setValueAtTime(wetAmount, actualStartTime);
    dryGain.gain.setValueAtTime(dryAmount, actualStartTime);
    
    // Disconnect and reconnect with delay
    panNode.disconnect();
    
    // Dry path
    panNode.connect(dryGain);
    dryGain.connect(audioManager.masterGainNode || audioManager.audioContext.destination);
    
    // Wet path with delay
    panNode.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(wetGain);
    wetGain.connect(audioManager.masterGainNode || audioManager.audioContext.destination);
    
    // Feedback loop
    delayGain.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    
    console.log('🔄 Delay applied');
} else {
    // No delay - connect panNode directly to output
    panNode.connect(audioManager.masterGainNode || audioManager.audioContext.destination);
}


    oscillator.start(actualStartTime);
    oscillator.stop(actualStartTime + duration);
    
    return { oscillator, gainNode, reverbActive: voiceParams.reverbDepth > 0.001 };
}



/**
 * Apply ADSR to volume/gain
 */
applyVolumeADSR(gainNode, envelope, voiceParams, startTime, duration) {
    const baseGain = voiceParams.volume * voiceParams.velocityScale * voiceParams.polyphonyScale;
    const peakGain = baseGain * envelope.peakLevel;
    const sustainGain = baseGain * envelope.sustain;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(peakGain, startTime + envelope.attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainGain), startTime + envelope.decayEnd);
    gainNode.gain.setValueAtTime(sustainGain, startTime + envelope.sustainEnd);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);
}

/**
 * Apply ADSR to filter (brightness evolution)
 */
applyFilterADSR(filterNode, envelope, frequency, velocityNormalized, instrumentName, startTime, duration) {
    filterNode.type = 'lowpass';
    filterNode.Q.setValueAtTime(1.0, startTime);
    
    // Calculate filter cutoff points
    const baseCutoff = frequency * 4;
    const peakCutoff = baseCutoff + (frequency * 8 * envelope.peakLevel);
    const sustainCutoff = baseCutoff + (frequency * 4 * envelope.sustain);
    const releaseCutoff = baseCutoff;
    
    // ADSR for filter cutoff (brightness)
    filterNode.frequency.setValueAtTime(baseCutoff, startTime);
    filterNode.frequency.exponentialRampToValueAtTime(peakCutoff, startTime + envelope.attack);
    filterNode.frequency.exponentialRampToValueAtTime(sustainCutoff, startTime + envelope.decayEnd);
    filterNode.frequency.setValueAtTime(sustainCutoff, startTime + envelope.sustainEnd);
    filterNode.frequency.exponentialRampToValueAtTime(releaseCutoff, startTime + duration);
}


/**
 * Apply ADSR to reverb (convolution reverb with ADSR evolution) - FIXED
 */
applyReverbADSR(reverbNode, reverbGain, reverbDry, reverbWet, envelope, voiceParams, actualStartTime, duration) {
    // Debug: Check reverb parameters
    console.log(`🔍 Debug Reverb: depth=${voiceParams.reverbDepth}, time=${voiceParams.reverbTime}`);
    
    // Check if reverb should be bypassed
    if (voiceParams.reverbDepth <= 0.001) {
        // BYPASS: Set reverb to dry only
        reverbDry.gain.setValueAtTime(1.0, actualStartTime);
        reverbWet.gain.setValueAtTime(0, actualStartTime);
        reverbGain.gain.setValueAtTime(1.0, actualStartTime);
        
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Reverb bypassed (depth = 0)`);
        return false;
    }
    
    // FIXED: Ensure minimum reverb time and proper buffer length
    const sampleRate = audioManager.audioContext.sampleRate;
    const minReverbTime = 0.1; // Minimum 100ms reverb
    const maxReverbTime = 3.0; // Maximum 3 seconds reverb
    const reverbTime = Math.max(minReverbTime, Math.min(maxReverbTime, voiceParams.reverbTime || 1.0));
    const length = Math.floor(sampleRate * reverbTime);
    
    console.log(`🔍 Debug: sampleRate=${sampleRate}, reverbTime=${reverbTime}, bufferLength=${length}`);
    
    // Ensure buffer length is valid
    if (length <= 0) {
        console.warn(`Invalid buffer length: ${length}, bypassing reverb`);
        reverbDry.gain.setValueAtTime(1.0, actualStartTime);
        reverbWet.gain.setValueAtTime(0, actualStartTime);
        return false;
    }
    
    const impulse = audioManager.audioContext.createBuffer(2, length, sampleRate);
    
    // Generate simple reverb impulse response
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const n = length - i;
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 2);
        }
    }
    
    reverbNode.buffer = impulse;
    
    const maxReverbDepth = voiceParams.reverbDepth;
    const reverbDryLevel = 1.0 - maxReverbDepth;
    const reverbWetLevel = maxReverbDepth;
    
    // Reverb send follows ADSR
    const peakReverbSend = reverbWetLevel * envelope.peakLevel;
    const sustainReverbSend = reverbWetLevel * envelope.sustain;
    
    // Dry signal (constant)
    reverbDry.gain.setValueAtTime(reverbDryLevel, actualStartTime);
    
    // Wet signal follows ADSR
    reverbWet.gain.setValueAtTime(0, actualStartTime);
    reverbWet.gain.linearRampToValueAtTime(peakReverbSend, actualStartTime + envelope.attack);
    reverbWet.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainReverbSend), actualStartTime + envelope.decayEnd);
    reverbWet.gain.setValueAtTime(sustainReverbSend, actualStartTime + envelope.sustainEnd);
    reverbWet.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
    
    // Main reverb gain
    reverbGain.gain.setValueAtTime(1.0, actualStartTime);
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Reverb active (depth = ${voiceParams.reverbDepth.toFixed(3)}, time = ${reverbTime.toFixed(2)}s)`);
    return true;
}

/**
 * Apply ADSR to delay (echo effect with ADSR-controlled feedback and mix)
 */
applyDelayADSR(delayNode, delayFeedback, delayWet, delayDry, envelope, voiceParams, actualStartTime, duration) {
    // Check if delay should be bypassed
    // IMPROVED DELAY PROCESSING
if (voiceParams.delayDepth > 0.001) {
    console.log(`🔄 Voice ${this.voiceIndex + 1}: Applying crisp delay (Time: ${voiceParams.delayTime}ms, Mix: ${(voiceParams.delayDepth * 100).toFixed(0)}%, Feedback: ${(voiceParams.delayFeedback * 100).toFixed(0)}%)`);
    
    // Create delay nodes
    const delayNode = audioManager.audioContext.createDelay(2.0);
    const delayGain = audioManager.audioContext.createGain();
    const feedbackGain = audioManager.audioContext.createGain();
    const wetGain = audioManager.audioContext.createGain();
    const dryGain = audioManager.audioContext.createGain();
    
    // Convert delay time from ms to seconds
    const delayTimeSeconds = voiceParams.delayTime / 1000;
    delayNode.delayTime.setValueAtTime(delayTimeSeconds, actualStartTime);
    
    // CRISP feedback with automatic decay for shorter tail
    const feedbackAmount = voiceParams.delayFeedback || 0;
    feedbackGain.gain.setValueAtTime(feedbackAmount * 0.8, actualStartTime); // Reduce initial feedback
    
    // Add automatic feedback decay to shorten tail
    const tailDuration = Math.min(duration * 3, 2.0); // Tail lasts 3x note duration, max 2 seconds
    feedbackGain.gain.exponentialRampToValueAtTime(0.001, actualStartTime + tailDuration);
    
    // LOUDER wet signal for more articulated echoes
    const wetAmount = voiceParams.delayDepth;
    const dryAmount = 1.0 - wetAmount;
    wetGain.gain.setValueAtTime(wetAmount * 1.2, actualStartTime); // Increase wet gain for more punch
    dryGain.gain.setValueAtTime(dryAmount, actualStartTime);
    
    // HIGH-PASS FILTER on delay to make echoes more articulated
    const highpass = audioManager.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, actualStartTime); // Remove muddy low frequencies
    highpass.Q.setValueAtTime(0.7, actualStartTime);
    
    // Reconnect audio chain with improved delay
    panNode.disconnect();
    
    // Dry path (direct signal)
    panNode.connect(dryGain);
    dryGain.connect(audioManager.audioContext.destination);
    
    // Wet path with high-pass filtered delay
    panNode.connect(delayNode);
    delayNode.connect(highpass);        // Add high-pass filter
    highpass.connect(delayGain);
    delayGain.connect(wetGain);
    wetGain.connect(audioManager.audioContext.destination);
    
    // Feedback loop (also high-pass filtered)
    delayGain.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    
    console.log(`🔄 Crisp delay: ${delayTimeSeconds.toFixed(3)}s, ${(wetAmount * 100).toFixed(0)}% wet, ${(feedbackAmount * 100).toFixed(0)}% feedback, ${tailDuration.toFixed(1)}s tail`);
}


    // Set delay time (convert from 0-100% range to seconds)
    const delayTimeSeconds = (voiceParams.delayTime / 100) * 2.0; // 0-100% maps to 0-2 seconds
    delayNode.delayTime.setValueAtTime(delayTimeSeconds, actualStartTime);
    
    const maxDelayDepth = voiceParams.delayDepth;
    const delayDryLevel = 1.0 - maxDelayDepth;
    const delayWetLevel = maxDelayDepth;
    
    // Delay send follows ADSR
    const peakDelaySend = delayWetLevel * envelope.peakLevel;
    const sustainDelaySend = delayWetLevel * envelope.sustain;
    
    // Feedback amount (creates echoing effect)
    const feedbackAmount = Math.min(0.7, maxDelayDepth * 0.6);
    const peakFeedback = feedbackAmount * envelope.peakLevel;
    const sustainFeedback = feedbackAmount * envelope.sustain;
    
    // Dry signal (constant)
    delayDry.gain.setValueAtTime(delayDryLevel, actualStartTime);
    
    // Wet signal follows ADSR
    delayWet.gain.setValueAtTime(0, actualStartTime);
    delayWet.gain.linearRampToValueAtTime(peakDelaySend, actualStartTime + envelope.attack);
    delayWet.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainDelaySend), actualStartTime + envelope.decayEnd);
    delayWet.gain.setValueAtTime(sustainDelaySend, actualStartTime + envelope.sustainEnd);
    delayWet.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
    
    // Feedback follows ADSR (creates evolving echo patterns)
    delayFeedback.gain.setValueAtTime(0, actualStartTime);
    delayFeedback.gain.linearRampToValueAtTime(peakFeedback, actualStartTime + envelope.attack);
    delayFeedback.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainFeedback), actualStartTime + envelope.decayEnd);
    delayFeedback.gain.setValueAtTime(sustainFeedback, actualStartTime + envelope.sustainEnd);
    delayFeedback.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Delay active (depth = ${voiceParams.delayDepth.toFixed(3)}, time = ${delayTimeSeconds.toFixed(3)}s)`);
    return true;
}

/**
 * Apply ADSR to tremolo (intensity evolution) - WITH BYPASS LOGIC
 */
applyTremoloADSR(tremoloLFO, tremoloGain, tremoloDepth, envelope, voiceParams, startTime, duration) {
    // Check if tremolo should be bypassed
    if (voiceParams.tremoloDepth <= 0.001) {
        // BYPASS: Set tremolo to unity gain (no effect)
        tremoloGain.gain.setValueAtTime(1.0, startTime);
        tremoloDepth.gain.setValueAtTime(0, startTime);
        
        // Don't start the LFO if not needed
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Tremolo bypassed (depth = 0)`);
        return false; // Indicates tremolo is bypassed
    }
    
    const maxTremoloDepth = voiceParams.tremoloDepth * 0.5; // Max 50% modulation
    
    // Tremolo depth follows ADSR
    const peakTremoloDepth = maxTremoloDepth * envelope.peakLevel;
    const sustainTremoloDepth = maxTremoloDepth * envelope.sustain;
    
    tremoloDepth.gain.setValueAtTime(0, startTime);
    tremoloDepth.gain.linearRampToValueAtTime(peakTremoloDepth, startTime + envelope.attack);
    tremoloDepth.gain.exponentialRampToValueAtTime(sustainTremoloDepth, startTime + envelope.decayEnd);
    tremoloDepth.gain.setValueAtTime(sustainTremoloDepth, startTime + envelope.sustainEnd);
    tremoloDepth.gain.linearRampToValueAtTime(0, startTime + duration);
    
    // Base gain for tremolo
    tremoloGain.gain.setValueAtTime(1.0, startTime); // Unity gain as base
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Tremolo active (depth = ${voiceParams.tremoloDepth.toFixed(3)})`);
    return true; // Indicates tremolo is active
}

/**
 * Apply ADSR to chorus (pitch/timing modulation with ADSR evolution)
 */
/**
 * Apply ADSR to chorus (FIXED - no forEach)
 */
applyChorusADSR(chorusDelay1, chorusDelay2, chorusDelay3, chorusLFO1, chorusLFO2, chorusLFO3, 
                chorusGain1, chorusGain2, chorusGain3, chorusDepth1, chorusDepth2, chorusDepth3,
                envelope, voiceParams, actualStartTime, duration) {
    
    // Check if chorus should be bypassed
    if (voiceParams.chorusDepth <= 0.001) {
        // BYPASS: Set all chorus gains to zero
        chorusGain1.gain.setValueAtTime(0, actualStartTime);
        chorusGain2.gain.setValueAtTime(0, actualStartTime);
        chorusGain3.gain.setValueAtTime(0, actualStartTime);
        
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Chorus bypassed (depth = 0)`);
        return false;
    }
    
    const maxChorusDepth = voiceParams.chorusDepth * 0.003; // Max 3ms delay modulation
    const chorusSpeed = voiceParams.chorusSpeed;
    
    // Chorus depth follows ADSR
    const peakChorusDepth = maxChorusDepth * envelope.peakLevel;
    const sustainChorusDepth = maxChorusDepth * envelope.sustain;
    
    // Set up chorus voice 1
    chorusDelay1.delayTime.setValueAtTime(0.015, actualStartTime);
    chorusLFO1.type = 'sine';
    chorusLFO1.frequency.setValueAtTime(chorusSpeed, actualStartTime);
    
    chorusDepth1.gain.setValueAtTime(0, actualStartTime);
    chorusDepth1.gain.linearRampToValueAtTime(peakChorusDepth, actualStartTime + envelope.attack);
    chorusDepth1.gain.exponentialRampToValueAtTime(sustainChorusDepth, actualStartTime + envelope.decayEnd);
    chorusDepth1.gain.setValueAtTime(sustainChorusDepth, actualStartTime + envelope.sustainEnd);
    chorusDepth1.gain.linearRampToValueAtTime(0, actualStartTime + duration);
    
    chorusGain1.gain.setValueAtTime(0.3, actualStartTime);
    chorusLFO1.start(actualStartTime);
    chorusLFO1.stop(actualStartTime + duration);
    chorusLFO1.connect(chorusDepth1);
    chorusDepth1.connect(chorusDelay1.delayTime);
    
    // Set up chorus voice 2
    chorusDelay2.delayTime.setValueAtTime(0.025, actualStartTime);
    chorusLFO2.type = 'sine';
    chorusLFO2.frequency.setValueAtTime(chorusSpeed + 0.2, actualStartTime);
    
    chorusDepth2.gain.setValueAtTime(0, actualStartTime);
    chorusDepth2.gain.linearRampToValueAtTime(peakChorusDepth, actualStartTime + envelope.attack);
    chorusDepth2.gain.exponentialRampToValueAtTime(sustainChorusDepth, actualStartTime + envelope.decayEnd);
    chorusDepth2.gain.setValueAtTime(sustainChorusDepth, actualStartTime + envelope.sustainEnd);
    chorusDepth2.gain.linearRampToValueAtTime(0, actualStartTime + duration);
    
    chorusGain2.gain.setValueAtTime(0.3, actualStartTime);
    chorusLFO2.start(actualStartTime);
    chorusLFO2.stop(actualStartTime + duration);
    chorusLFO2.connect(chorusDepth2);
    chorusDepth2.connect(chorusDelay2.delayTime);
    
    // Set up chorus voice 3
    chorusDelay3.delayTime.setValueAtTime(0.035, actualStartTime);
    chorusLFO3.type = 'sine';
    chorusLFO3.frequency.setValueAtTime(chorusSpeed + 0.4, actualStartTime);
    
    chorusDepth3.gain.setValueAtTime(0, actualStartTime);
    chorusDepth3.gain.linearRampToValueAtTime(peakChorusDepth, actualStartTime + envelope.attack);
    chorusDepth3.gain.exponentialRampToValueAtTime(sustainChorusDepth, actualStartTime + envelope.decayEnd);
    chorusDepth3.gain.setValueAtTime(sustainChorusDepth, actualStartTime + envelope.sustainEnd);
    chorusDepth3.gain.linearRampToValueAtTime(0, actualStartTime + duration);
    
    chorusGain3.gain.setValueAtTime(0.3, actualStartTime);
    chorusLFO3.start(actualStartTime);
    chorusLFO3.stop(actualStartTime + duration);
    chorusLFO3.connect(chorusDepth3);
    chorusDepth3.connect(chorusDelay3.delayTime);
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Chorus active (depth = ${voiceParams.chorusDepth.toFixed(3)})`);
    return true;
}

/**
 * Apply ADSR to phaser (all-pass filter frequency sweeping with ADSR evolution)
 */
applyPhaserADSR(phaserStages, phaserLFO, phaserDepth, phaserFeedback, envelope, voiceParams, actualStartTime, duration) {
    // Check if phaser should be bypassed
    if (voiceParams.phaserDepth <= 0.001) {
        // BYPASS: Set phaser depth to zero
        phaserDepth.gain.setValueAtTime(0, actualStartTime);
        phaserFeedback.gain.setValueAtTime(0, actualStartTime);
        
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Phaser bypassed (depth = 0)`);
        return false;
    }
    
    const maxPhaserDepth = voiceParams.phaserDepth * 1000; // Max 1000Hz sweep range
    const phaserSpeed = voiceParams.phaserSpeed;
    
    // Phaser depth follows ADSR
    const peakPhaserDepth = maxPhaserDepth * envelope.peakLevel;
    const sustainPhaserDepth = maxPhaserDepth * envelope.sustain;
    
    // Set up phaser LFO
    phaserLFO.type = 'sine';
    phaserLFO.frequency.setValueAtTime(phaserSpeed, actualStartTime);
    
    // Phaser depth modulation follows ADSR
    phaserDepth.gain.setValueAtTime(0, actualStartTime);
    phaserDepth.gain.linearRampToValueAtTime(peakPhaserDepth, actualStartTime + envelope.attack);
    phaserDepth.gain.exponentialRampToValueAtTime(sustainPhaserDepth, actualStartTime + envelope.decayEnd);
    phaserDepth.gain.setValueAtTime(sustainPhaserDepth, actualStartTime + envelope.sustainEnd);
    phaserDepth.gain.linearRampToValueAtTime(0, actualStartTime + duration);
    
    // Set up phaser stages (all-pass filters)
    const baseFrequency = 800; // Base frequency for phaser sweep
    phaserStages.forEach((stage, index) => {
        stage.type = 'allpass';
        stage.Q.setValueAtTime(10, actualStartTime); // High Q for pronounced effect
        
        // Each stage at different frequency for richer effect
        const stageFreq = baseFrequency + (index * 200);
        stage.frequency.setValueAtTime(stageFreq, actualStartTime);
    });
    
    // Feedback amount (creates more intense phasing)
    const feedbackAmount = Math.min(0.7, voiceParams.phaserDepth * 0.8);
    phaserFeedback.gain.setValueAtTime(feedbackAmount, actualStartTime);
    
    // Connect LFO to modulate all filter frequencies
    phaserLFO.connect(phaserDepth);
    phaserStages.forEach(stage => {
        phaserDepth.connect(stage.frequency);
    });
    
    // Start LFO
    phaserLFO.start(actualStartTime);
    phaserLFO.stop(actualStartTime + duration);
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Phaser active (depth = ${voiceParams.phaserDepth.toFixed(3)}, speed = ${phaserSpeed.toFixed(1)})`);
    return true;
}




/**
 * Create chorus delay network
 */
createChorusNetwork(audioContext) {
    const numChorusVoices = 3; // 3 chorus voices for rich effect
    
    const delays = [];
    const lfos = [];
    const gains = [];
    const depths = [];
    const mixGain = audioContext.createGain();
    
    for (let i = 0; i < numChorusVoices; i++) {
        delays.push(audioContext.createDelay(0.1)); // Max 100ms delay
        lfos.push(audioContext.createOscillator());
        gains.push(audioContext.createGain());
        depths.push(audioContext.createGain());
    }
    
    return {
        delays,
        lfos,
        gains,
        depths,
        mixGain,
        numVoices: numChorusVoices
    };
}


/**
 * Apply ADSR to stereo panning (position evolution)
 */
applyPanADSR(panNode, envelope, voiceParams, startTime, duration) {
    const basePan = voiceParams.balance;
    const panSpread = 0.3; // How much panning can vary during ADSR
    
    // Panning can evolve during note
    const attackPan = basePan + (panSpread * (envelope.peakLevel - 0.5));
    const sustainPan = basePan;
    const releasePan = basePan - (panSpread * envelope.sustain * 0.5);
    
    panNode.pan.setValueAtTime(basePan, startTime);
    panNode.pan.linearRampToValueAtTime(attackPan, startTime + envelope.attack);
    panNode.pan.linearRampToValueAtTime(sustainPan, startTime + envelope.decayEnd);
    panNode.pan.setValueAtTime(sustainPan, startTime + envelope.sustainEnd);
    panNode.pan.linearRampToValueAtTime(releasePan, startTime + duration);
}

/**
 * Calculate reverb send envelope (for future effects chain integration)
 */
calculateReverbSendADSR(envelope, voiceParams) {
    const baseReverbSend = voiceParams.reverb;
    
    return {
        attack: baseReverbSend * 0.3,           // Low reverb during attack
        peak: baseReverbSend * envelope.peakLevel, // Peak reverb
        sustain: baseReverbSend * envelope.sustain, // Sustained reverb
        release: baseReverbSend * 1.2           // Higher reverb during release
    };
}

/**
 * Get current velocity (helper method)
 */
getCurrentVelocity() {
    const attackVelocityParam = voiceData[this.voiceIndex].parameters['ATTACK VELOCITY'];
    
    if (attackVelocityParam && attackVelocityParam.behavior > 0) {
        if (attackVelocityParam.currentValue === undefined) {
            attackVelocityParam.currentValue = (attackVelocityParam.min + attackVelocityParam.max) / 2;
        }
        
        attackVelocityParam.currentValue = interpolateParameter(
            attackVelocityParam.currentValue,
            attackVelocityParam.min,
            attackVelocityParam.max,
            attackVelocityParam.behavior,
            0.15
        );
        
        return attackVelocityParam.currentValue;
    } else if (attackVelocityParam) {
        return (attackVelocityParam.min + attackVelocityParam.max) / 2;
    }
    
    return 64; // Default MIDI velocity
}

/**
 * Enhanced getAllCurrentVoiceParameters with reverb and delay support
 */
getAllCurrentVoiceParameters() {
    const volumeParam = voiceData[this.voiceIndex].parameters['VOLUME'];
    const balanceParam = voiceData[this.voiceIndex].parameters['STEREO BALANCE'];
    const polyphonyParam = voiceData[this.voiceIndex].parameters['POLYPHONY'];
    const tremoloParam = voiceData[this.voiceIndex].parameters['TREMOLO'];
    const chorusParam = voiceData[this.voiceIndex].parameters['CHORUS'];
    const phaserParam = voiceData[this.voiceIndex].parameters['PHASER'];
    const reverbParam = voiceData[this.voiceIndex].parameters['REVERB']; // NEW
    const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];   // NEW
    
    const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
    const currentBalance = balanceParam.currentValue || (balanceParam.min + balanceParam.max) / 2;
    const polyphonyCount = Math.max(1, (polyphonyParam.min + polyphonyParam.max) / 2);
    
    // Tremolo parameters
    let tremoloSpeed = 4.0;
    let tremoloDepth = 0.0;
    
    if (tremoloParam && tremoloParam.speed) {
        tremoloSpeed = (tremoloParam.speed.min + tremoloParam.speed.max) / 2;
        tremoloDepth = (tremoloParam.depth.min + tremoloParam.depth.max) / 2;
    }
    
    // Chorus parameters
    let chorusSpeed = 1.0;
    let chorusDepth = 0.0;
    
    if (chorusParam && chorusParam.speed) {
        chorusSpeed = (chorusParam.speed.min + chorusParam.speed.max) / 2;
        chorusDepth = (chorusParam.depth.min + chorusParam.depth.max) / 2;
    }
    
    // Phaser parameters
    let phaserSpeed = 0.5;
    let phaserDepth = 0.0;
    
    if (phaserParam && phaserParam.speed) {
        phaserSpeed = (phaserParam.speed.min + phaserParam.speed.max) / 2;
        phaserDepth = (phaserParam.depth.min + phaserParam.depth.max) / 2;
    }
    
    // NEW: Reverb parameters (multi-dual)
    let reverbTime = 1.0; // Default 1 second
    let reverbDepth = 0.0; // Default no reverb
    
    if (reverbParam && reverbParam.speed && reverbParam.depth) {
        reverbTime = ((reverbParam.speed.min + reverbParam.speed.max) / 2 / 100) * 3.0; // Convert to 0-3 seconds
        reverbDepth = (reverbParam.depth.min + reverbParam.depth.max) / 2 / 100; // Convert to 0-1
    }
    
    // NEW: Delay parameters (multi-dual)  
    // NEW: Delay parameters (multi-dual)
    let delayTime = 500; // Default 500ms
    let delayDepth = 0.0; // Default no delay
    let delayFeedback = 0.0; // Default no feedback

    if (delayParam && delayParam.speed && delayParam.depth) {
      delayTime = ((delayParam.speed.min + delayParam.speed.max) / 2 / 100) * 2000; // Convert to 0-2000ms
      delayDepth = (delayParam.depth.min + delayParam.depth.max) / 2 / 100; // Convert to 0-1
      
      // Add feedback parameter
      if (delayParam.feedback) {
        delayFeedback = (delayParam.feedback.min + delayParam.feedback.max) / 2 / 100; // Convert to 0-1
      }
}

    
   return {
    volume: (currentVolume / 100) * 0.15,
    balance: Math.max(-1, Math.min(1, currentBalance / 100)),
    polyphonyScale: Math.max(0.1, 1 / Math.sqrt(polyphonyCount)),
    velocityScale: 1.0,
    tremoloSpeed: Math.max(0.5, Math.min(20, tremoloSpeed / 10)),
    tremoloDepth: tremoloDepth / 100,
    chorusSpeed: Math.max(0.2, Math.min(5, chorusSpeed / 20)),
    chorusDepth: chorusDepth / 100,
    phaserSpeed: Math.max(0.1, Math.min(2, phaserSpeed / 50)),
    phaserDepth: phaserDepth / 100,
    reverbTime: reverbTime,     // NEW: 0-3 seconds
    reverbDepth: reverbDepth,   // NEW: 0-1 range
    delayTime: delayTime,       // NEW: 0-2000ms  
    delayDepth: delayDepth,      // NEW: 0-1 range
    delayFeedback: delayFeedback // ADD THIS LINE
};
}

/**
 * ENHANCED DELAY SYSTEM - Creates the perfect delay effect you discovered
 */
createEnhancedDelay(inputNode, delayParams, actualStartTime, duration) {
    console.log('🔍 Creating ENHANCED DELAY (Time + Feedback + Wet/Dry)');
    
    const audioCtx = audioManager.audioContext;
    
    // Extract the three parameters
    const delayTime = delayParams.time / 1000;      // Convert ms to seconds (0-2s)
    const feedback = delayParams.feedback / 100;    // Convert % to 0-1 (0-95%)
    const wetDry = delayParams.wetDry / 100;         // Convert % to 0-1 (0-100%)
    
    // Create multiple delay taps based on the base time
    const delayTaps = [
        delayTime * 0.25,  // Quarter delay
        delayTime * 0.5,   // Half delay  
        delayTime * 0.75,  // Three-quarter delay
        delayTime * 1.0,   // Full delay
        delayTime * 1.25,  // Extended delay 1
        delayTime * 1.5,   // Extended delay 2
        delayTime * 1.75,  // Extended delay 3
        delayTime * 2.0    // Double delay
    ];
    
    const delays = [];
    const gains = [];
    const feedbacks = [];
    
    delayTaps.forEach((time, index) => {
        if (time > 0 && time <= 2.0) { // Valid delay range
            const delay = audioCtx.createDelay(2.0);
            const gain = audioCtx.createGain();
            const feedbackGain = audioCtx.createGain();
            
            delay.delayTime.setValueAtTime(time, actualStartTime);
            
            // Exponential decay like your perfect reverb
            const tapGain = 0.4 * Math.pow(0.75, index);
            const tapFeedback = feedback * Math.pow(0.8, index);
            
            gain.gain.setValueAtTime(tapGain, actualStartTime);
            feedbackGain.gain.setValueAtTime(tapFeedback, actualStartTime);
            
            delays.push(delay);
            gains.push(gain);
            feedbacks.push(feedbackGain);
        }
    });
    
    // Mix controls
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    
    const dryLevel = 1.0 - wetDry;
    const wetLevel = wetDry;
    
    dryGain.gain.setValueAtTime(dryLevel, actualStartTime);
    wetGain.gain.setValueAtTime(wetLevel, actualStartTime);
    
    // Connect network
    inputNode.connect(dryGain);
    
    delays.forEach((delay, index) => {
        inputNode.connect(delay);
        delay.connect(gains[index]);
        
        // Feedback loop (creates the sustaining effect)
        gains[index].connect(feedbacks[index]);
        feedbacks[index].connect(delay);
        
        // Wet output
        gains[index].connect(wetGain);
    });
    
    // Output
    dryGain.connect(audioCtx.destination);
    wetGain.connect(audioCtx.destination);
    
    console.log(`🎵 ENHANCED DELAY: ${delays.length} taps, time=${(delayTime*1000).toFixed(0)}ms, feedback=${(feedback*100).toFixed(0)}%, wet=${(wetDry*100).toFixed(0)}%`);
    
    return { delayActive: true, delays, gains, feedbacks, dryGain, wetGain };
}

/**
 * SUSTAINED DIFFUSE REVERB - Creates extra long ambient tails
 */
/**
 * MAXIMUM SUSTAIN REVERB - Replace in your scripts.js file
 */
createSustainedReverb(inputNode, voiceParams, actualStartTime, duration) {
    console.log('🔍 Creating MAXIMUM SUSTAIN REVERB (infinite-like tail)');
    
    const audioCtx = audioManager.audioContext;
    
    // Dense delay network with maximum feedback
    const denseDelays = [];
    for (let i = 0; i < 32; i++) {
        const time = 0.005 + (Math.random() * 0.145);
        denseDelays.push(time);
    }
    denseDelays.sort((a, b) => a - b);
    
    const delays = [];
    const gains = [];
    const filters = [];
    const feedbacks = [];
    
    denseDelays.forEach((time, index) => {
        const delay = audioCtx.createDelay(0.5);
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        const feedback = audioCtx.createGain();
        
        delay.delayTime.setValueAtTime(time, actualStartTime);
        
        // Quiet individual delays (no articulation)
        const gainValue = 0.15 / Math.sqrt(index + 1);
        gain.gain.setValueAtTime(gainValue, actualStartTime);
        
        // Heavy filtering to blur delays
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000 - (index * 80), actualStartTime);
        filter.Q.setValueAtTime(0.5, actualStartTime);
        
        // MAXIMUM feedback for near-infinite sustain (close to 95% limit)
        const feedbackAmount = 0.94 * Math.pow(0.995, index); // Very high, very slow decay
        feedback.gain.setValueAtTime(feedbackAmount, actualStartTime);
        
        delays.push(delay);
        gains.push(gain);
        filters.push(filter);
        feedbacks.push(feedback);
    });
    
    // All-pass diffusion network (same as before)
    const allpass1 = audioCtx.createBiquadFilter();
    const allpass2 = audioCtx.createBiquadFilter();
    const allpass3 = audioCtx.createBiquadFilter();
    const allpass4 = audioCtx.createBiquadFilter();
    
    allpass1.type = 'allpass';
    allpass1.frequency.setValueAtTime(347, actualStartTime);
    allpass1.Q.setValueAtTime(8, actualStartTime);
    
    allpass2.type = 'allpass';
    allpass2.frequency.setValueAtTime(1013, actualStartTime);
    allpass2.Q.setValueAtTime(6, actualStartTime);
    
    allpass3.type = 'allpass';
    allpass3.frequency.setValueAtTime(1759, actualStartTime);
    allpass3.Q.setValueAtTime(4, actualStartTime);
    
    allpass4.type = 'allpass';
    allpass4.frequency.setValueAtTime(2411, actualStartTime);
    allpass4.Q.setValueAtTime(3, actualStartTime);
    
    // Mix controls
    const preDelay = audioCtx.createDelay(0.1);
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    const diffusionGain = audioCtx.createGain();
    
    preDelay.delayTime.setValueAtTime(0.02, actualStartTime);
    
    const reverbDepth = voiceParams.reverbDepth || 0.8;
    dryGain.gain.setValueAtTime(1.0 - reverbDepth, actualStartTime);
    wetGain.gain.setValueAtTime(reverbDepth, actualStartTime);
    diffusionGain.gain.setValueAtTime(1.0, actualStartTime);
    
    // Connect dry path
    inputNode.connect(dryGain);
    
    // Connect diffused wet path
    inputNode.connect(preDelay);
    preDelay.connect(allpass1);
    allpass1.connect(allpass2);
    allpass2.connect(allpass3);
    allpass3.connect(allpass4);
    allpass4.connect(diffusionGain);
    
    // Connect delay network WITH MAXIMUM FEEDBACK
    delays.forEach((delay, index) => {
        diffusionGain.connect(delay);
        delay.connect(filters[index]);
        filters[index].connect(gains[index]);
        gains[index].connect(wetGain);
        
        // Maximum feedback loop - creates near-infinite sustaining tail
        gains[index].connect(feedbacks[index]);
        feedbacks[index].connect(delay);
    });
    
    // Output
    dryGain.connect(audioCtx.destination);
    wetGain.connect(audioCtx.destination);
    
    console.log(`🎵 MAXIMUM SUSTAIN REVERB: ${delays.length} delays with 94% feedback (near-infinite tail)`);
    
    // DON'T START DECAY FOR 60 SECONDS - let it sustain naturally
    setTimeout(() => {
        feedbacks.forEach((feedback, index) => {
            const currentTime = audioCtx.currentTime;
            const decayTime = 60.0; // 60 second gradual decay
            feedback.gain.exponentialRampToValueAtTime(0.001, currentTime + decayTime);
        });
        console.log('🔄 Reverb feedback gradually decaying over 60 seconds');
    }, (duration + 30.0) * 1000); // Wait 30 seconds before starting decay
    
    return { reverbActive: true, feedbacks };
}


/**
 * Get velocity-sensitive waveform type
 */
getVelocitySensitiveWaveform(baseType, velocityNormalized, instrumentName) {
    // Instrument-specific velocity response
    if (instrumentName.includes('Piano')) {
        // Piano: soft = sine (mellow), hard = square (bright/percussive)
        if (velocityNormalized < 0.3) return 'sine';
        if (velocityNormalized < 0.7) return 'triangle';
        return 'square';
    }
    
    if (instrumentName.includes('String') || instrumentName.includes('Violin') || instrumentName.includes('Cello')) {
        // Strings: soft = sine (bow pressure), hard = sawtooth (aggressive bowing)
        if (velocityNormalized < 0.4) return 'sine';
        return 'sawtooth';
    }
    
    if (instrumentName.includes('Brass') || instrumentName.includes('Trumpet') || instrumentName.includes('Horn')) {
        // Brass: soft = triangle (gentle), hard = square (brassy)
        if (velocityNormalized < 0.5) return 'triangle';
        return 'square';
    }
    
    if (instrumentName.includes('Organ')) {
        // Organ: consistent waveform but different harmonics via filter
        return 'sawtooth';
    }
    
    // Default: use base type with subtle variation
    return baseType;
}

/**
 * Get velocity-sensitive filter cutoff frequency
 */
getVelocitySensitiveFilterCutoff(fundamentalFreq, velocityNormalized, instrumentName) {
    // Base cutoff relative to fundamental frequency
    let baseMultiplier = 4.0; // Default: 4x fundamental
    let velocityRange = 8.0;  // How much velocity affects brightness
    
    // Instrument-specific filter response
    if (instrumentName.includes('Piano')) {
        baseMultiplier = 6.0;
        velocityRange = 12.0; // Piano very velocity sensitive
    } else if (instrumentName.includes('String')) {
        baseMultiplier = 5.0;
        velocityRange = 8.0;  // Strings moderately sensitive
    } else if (instrumentName.includes('Brass')) {
        baseMultiplier = 4.0;
        velocityRange = 10.0; // Brass quite sensitive
    } else if (instrumentName.includes('Flute') || instrumentName.includes('Clarinet')) {
        baseMultiplier = 3.0;
        velocityRange = 4.0;  // Winds less sensitive
    }
    
    // Calculate cutoff: soft playing = darker, hard playing = brighter
    const multiplier = baseMultiplier + (velocityRange * velocityNormalized);
    const cutoff = fundamentalFreq * multiplier;
    
    // Clamp to reasonable range
    return Math.max(200, Math.min(20000, cutoff));
}

/**
 * Get velocity-sensitive ADSR envelope
 */
getVelocitySensitiveEnvelope(duration, velocityNormalized, instrumentName) {
    const durationSeconds = duration;
    let baseEnvelope;
    
    // Get base envelope from existing function
    if (durationSeconds < 0.1) {
        baseEnvelope = { attack: 0.005, decay: 0.020, sustain: 0.7, release: 0.020 };
    } else if (durationSeconds < 0.2) {
        baseEnvelope = { attack: 0.010, decay: 0.040, sustain: 0.8, release: 0.050 };
    } else {
        baseEnvelope = { attack: 0.020, decay: 0.080, sustain: 0.8, release: 0.100 };
    }
    
    // Velocity modifications
    let attackScale = 1.0;
    let peakScale = 1.0;
    let sustainScale = 1.0;
    
    if (instrumentName.includes('Piano')) {
        // Piano: soft = slow attack, hard = fast attack + louder peak
        attackScale = 1.5 - velocityNormalized; // Soft = slower attack
        peakScale = 0.5 + (0.8 * velocityNormalized); // Hard = louder peak
        sustainScale = 0.7 + (0.3 * velocityNormalized);
    } else if (instrumentName.includes('String')) {
        // Strings: soft = gradual, hard = aggressive
        attackScale = 1.3 - (0.5 * velocityNormalized);
        peakScale = 0.6 + (0.6 * velocityNormalized);
        sustainScale = 0.8 + (0.2 * velocityNormalized);
    } else if (instrumentName.includes('Brass')) {
        // Brass: soft = gentle, hard = punchy
        attackScale = 1.2 - (0.4 * velocityNormalized);
        peakScale = 0.4 + (0.8 * velocityNormalized);
        sustainScale = 0.7 + (0.3 * velocityNormalized);
    }
    
    return {
        attack: baseEnvelope.attack * attackScale,
        decay: baseEnvelope.decay,
        sustain: baseEnvelope.sustain * sustainScale,
        release: baseEnvelope.release,
        peakScale: peakScale
    };
}

/**
 * Get comprehensive ADSR envelope with all timing phases
 */
getComprehensiveADSR(duration, velocityNormalized, instrumentName) {
    const durationSeconds = duration;
    
    // Base timing ratios (percentages of total duration)
    let attackRatio = 0.1;   // 10% of duration
    let decayRatio = 0.2;    // 20% of duration  
    let sustainRatio = 0.5;  // 50% of duration
    let releaseRatio = 0.2;  // 20% of duration
    
    // Instrument-specific timing
    if (instrumentName.includes('Piano')) {
        attackRatio = 0.05;  // Fast attack
        decayRatio = 0.3;    // Longer decay
        sustainRatio = 0.4;  // Medium sustain
        releaseRatio = 0.25; // Natural release
    } else if (instrumentName.includes('String')) {
        attackRatio = 0.15;  // Gradual attack (bow pressure)
        decayRatio = 0.1;    // Quick decay
        sustainRatio = 0.65; // Long sustain
        releaseRatio = 0.1;  // Quick release
    } else if (instrumentName.includes('Brass')) {
        attackRatio = 0.08;  // Medium attack
        decayRatio = 0.15;   // Medium decay
        sustainRatio = 0.6;  // Good sustain
        releaseRatio = 0.17; // Natural release
    } else if (instrumentName.includes('Organ')) {
        attackRatio = 0.02;  // Very fast attack
        decayRatio = 0.05;   // Minimal decay
        sustainRatio = 0.88; // Long sustain
        releaseRatio = 0.05; // Quick release
    }
    
    // Calculate actual times
    const attackTime = Math.max(0.005, durationSeconds * attackRatio);
    const decayTime = Math.max(0.01, durationSeconds * decayRatio);
    const sustainTime = Math.max(0.01, durationSeconds * sustainRatio);
    const releaseTime = Math.max(0.005, durationSeconds * releaseRatio);
    
    // Velocity affects levels and curves
    const peakLevel = 0.4 + (0.6 * velocityNormalized);      // Soft=0.4, Hard=1.0
    const sustainLevel = peakLevel * (0.6 + 0.3 * velocityNormalized); // Sustain level
    
    return {
        attack: attackTime,
        decay: decayTime,
        sustain: sustainLevel,
        sustainTime: sustainTime,
        release: releaseTime,
        peakLevel: peakLevel,
        // Timing points
        attackEnd: attackTime,
        decayEnd: attackTime + decayTime,
        sustainEnd: attackTime + decayTime + sustainTime,
        releaseEnd: attackTime + decayTime + sustainTime + releaseTime
    };
}

  
/**
 * Get envelope for note duration (adapted from existing function)
 */
getEnvelopeForDuration(noteDurationSeconds) {
  const durationMs = noteDurationSeconds * 1000;
  
  if (durationMs < 50) {
    return { attack: 0.002, release: 0.010, sustain: 0.8 };
  } else if (durationMs < 100) {
    return { attack: 0.005, release: 0.020, sustain: 0.8 };
  } else if (durationMs < 200) {
    return { attack: 0.010, release: 0.050, sustain: 0.8 };
  } else {
    return { attack: 0.015, release: 0.100, sustain: 0.8 };
  }
}





  
  /**
   * Get current voice status for debugging
   */
  getStatus() {
    return {
      voiceIndex: this.voiceIndex + 1,
      isActive: this.isActive,
      lifeCycleState: this.lifeCycleState,
      currentTempo: this.currentTempo,
      shouldPlay: this.shouldPlayNote(),
      timeToNextNote: Math.max(0, this.nextNoteTime - this.masterClock.getMasterTime())
    };
  }
}





/**
 * Test VoiceClock class with master clock synchronization
 */
function testVoiceClockSync() {
  console.log('=== TESTING VOICE CLOCK SYNCHRONIZATION ===');
  
  // Ensure master clock exists
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  // Create test voice clock
  const testVoiceClock = new VoiceClock(0, masterClock); // Voice 1
  
  // Start master clock
  masterClock.start();
  
  // Start voice clock
  testVoiceClock.start();
  
  // Test for 3 seconds
  let testCount = 0;
  const testInterval = setInterval(() => {
    testCount++;
    const status = testVoiceClock.getStatus();
    
    console.log(`Test ${testCount}s:`, {
      voice: status.voiceIndex,
      active: status.isActive,
      state: status.lifeCycleState,
      tempo: status.currentTempo,
      shouldPlay: status.shouldPlay,
      nextNote: `${status.timeToNextNote}ms`
    });
    
    if (testCount >= 3) {
      clearInterval(testInterval);
      testVoiceClock.stop();
      masterClock.stop();
      console.log('✅ Voice Clock sync test complete');
    }
  }, 1000);
  
  return testInterval;
}

/**
 * Voice Clock Management System
 * Creates and manages 16 individual voice clocks
 */
class VoiceClockManager {
  constructor() {
    this.voiceClocks = [];
    this.masterClock = null;
    this.isInitialized = false;
    this.isManualStop = false; // ADD THIS LINE

    console.log('VoiceClockManager initialized');
  }
  
  /**
   * Initialize 16 voice clocks linked to master clock
   */
  initialize(masterClock) {
    this.masterClock = masterClock;
    this.voiceClocks = [];
    
    // Create 16 voice clocks in loop
    for (let i = 0; i < 16; i++) {
      const voiceClock = new VoiceClock(i, masterClock);
      this.voiceClocks.push(voiceClock);
    }
    
    this.isInitialized = true;
    console.log('🎵 VoiceClockManager: All 16 voice clocks initialized');
  }
  
  /**
   * Start all enabled voice clocks
   */
  startAllVoices() {
    if (!this.isInitialized) {
      console.error('VoiceClockManager not initialized!');
      return;
    }
    
    if (!this.masterClock || !this.masterClock.isActive()) {
      console.error('Master clock not running!');
      return;
    }
    
    let startedCount = 0;
    
    // Start only enabled voices
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        this.voiceClocks[i].start();
        startedCount++;
      }
    }
    
    console.log(`🎵 VoiceClockManager: Started ${startedCount} enabled voice clocks`);
  }
  
  stopAllVoices() {
  this.isManualStop = true; // Flag to prevent auto-reset on manual stop
  
  for (let i = 0; i < 16; i++) {
    this.voiceClocks[i].stop();
  }
  
  console.log('🔇 VoiceClockManager: All voice clocks stopped manually');
  
  // Clear manual stop flag after a brief delay
  setTimeout(() => {
    this.isManualStop = false;
  }, 200);
}
  


  /**
 * Update all voice clocks - ENHANCED with periodic auto-reset checks
 */
/**
 * Performance-optimized voice clock updates
 */
/**
 * Performance-optimized voice updates - Session 10
 */
updateAllVoices() {
  if (!this.isInitialized) return;
  
  const currentTime = this.masterClock.getMasterTime();
  let activeVoiceCount = 0;
  let completedThisCycle = 0;
  
  // Single efficient pass through all voices
  for (let i = 0; i < 16; i++) {
    const voiceClock = this.voiceClocks[i];
    
    // Skip disabled voices entirely - THIS IS THE KEY OPTIMIZATION
    if (!voiceData[i].enabled || !voiceClock.isActive) continue;
    
    activeVoiceCount++;
    const previousState = voiceClock.lifeCycleState;
    
    // Update life cycle state
    voiceClock.updateLifeCycleState();
    
    // Track completions for batched auto-reset
    if (previousState === 'active' && voiceClock.lifeCycleState === 'stopped') {
      completedThisCycle++;
    }
    
    // Schedule notes only when needed
    if (voiceClock.isTimeForNextNote()) {
      voiceClock.scheduleNextNote();
    }
  }
  
  // Debounced auto-reset check
  if (completedThisCycle > 0) {
    if (this.autoResetTimeout) {
      clearTimeout(this.autoResetTimeout);
    }
    this.autoResetTimeout = setTimeout(() => {
      this.checkForAutoReset();
      this.autoResetTimeout = null;
    }, 100);
  }
  
  // Performance monitoring (can be removed later)
  if (activeVoiceCount > 10) {
    console.log(`🔧 High performance: ${activeVoiceCount} voices active`);
  }
}



  
/**
 * Enhanced auto-reset check - triggers when all voices complete naturally
 */
checkForAutoReset() {
  // FIRST: Check if this was a manual stop - exit early if so
  if (this.isManualStop) {
    console.log('🔄 Auto-reset skipped - manual stop detected');
    return;
  }

  // Count active and waiting voices
  let activeCount = 0;
  let waitingCount = 0;
  let enabledCount = 0;
  
  for (let i = 0; i < 16; i++) {
    if (voiceData[i].enabled) {
      enabledCount++;
      const voiceClock = this.voiceClocks[i];
      
      if (voiceClock && voiceClock.isActive) {
        if (voiceClock.lifeCycleState === 'active') {
          activeCount++;
        } else if (voiceClock.lifeCycleState === 'waiting') {
          waitingCount++;
        }
        // Note: 'silent' state doesn't count as active for auto-reset
      }
    }
  }
  
  console.log(`🔍 Auto-reset check: ${enabledCount} enabled, ${activeCount} active, ${waitingCount} waiting`);
  
  // Auto-reset conditions:
  // 1. We have enabled voices (prevents reset if no voices were ever enabled)
  // 2. No voices are currently active or waiting
  // 3. At least one voice has completed its cycle (not just stopped immediately)
  if (enabledCount > 0 && activeCount === 0 && waitingCount === 0) {
    this.performAutoReset();
  }
}


/**
 * Perform the actual auto-reset operation
 */
performAutoReset() {
  console.log('🔄 AUTO-RESET: All voices completed naturally - resetting PLAY button');
  
  // Find and reset the PLAY button
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton && playButton.textContent === 'STOP') {
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    // Stop master clock
    if (masterClock && masterClock.isActive()) {
      masterClock.stop();
    }
    
    // Clean up any remaining voice clocks
    this.stopAllVoices();
    
    console.log('✅ Auto-reset complete - system ready for next composition');
    
    // Optional: User notification
    // You could add a subtle notification here if desired
    // console.log('🎵 Composition completed - ready to play again');
  }
}

  /**
   * Get voice clock by index
   */
  getVoiceClock(voiceIndex) {
    if (voiceIndex < 0 || voiceIndex >= 16) return null;
    return this.voiceClocks[voiceIndex];
  }
  
  /**
   * Get status of all voice clocks
   */
  getAllVoiceStatus() {
    const status = [];
    
    for (let i = 0; i < 16; i++) {
      const voiceClock = this.voiceClocks[i];
      status.push({
        voice: i + 1,
        enabled: voiceData[i].enabled,
        active: voiceClock.isActive,
        state: voiceClock.lifeCycleState,
        tempo: voiceClock.currentTempo,
        shouldPlay: voiceClock.shouldPlayNote()
      });
    }
    

    
    return status;
  }
  
  /**
   * Get count of active voices
   */
  getActiveVoiceCount() {
    return this.voiceClocks.filter(clock => clock.isActive).length;
  }
}
// 


/**
 * Test all 16 voice clocks initialization and management
 */
function testAll16VoiceClocks() {
  console.log('=== TESTING ALL 16 VOICE CLOCKS ===');
  
  // Initialize systems
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  if (!voiceClockManager) {
    voiceClockManager = new VoiceClockManager();
  }
  
  // Initialize voice clock manager with master clock
  voiceClockManager.initialize(masterClock);
  
  // Start master clock
  masterClock.start();
  
  // Enable first 3 voices for testing
  voiceData[0].enabled = true;
  voiceData[1].enabled = true;
  voiceData[2].enabled = true;
  
  // Start voice clocks
  voiceClockManager.startAllVoices();
  
  // Test status every second for 5 seconds
  let testCount = 0;
  const testInterval = setInterval(() => {
    testCount++;
    
    console.log(`\n--- Test ${testCount}s ---`);
    console.log(`Master elapsed: ${masterClock.getElapsedSeconds().toFixed(3)}s`);
    console.log(`Active voice count: ${voiceClockManager.getActiveVoiceCount()}`);
    
    // Show status of first 3 voices
    const allStatus = voiceClockManager.getAllVoiceStatus();
    for (let i = 0; i < 3; i++) {
      const status = allStatus[i];
      console.log(`Voice ${status.voice}: enabled=${status.enabled}, active=${status.active}, state=${status.state}, tempo=${status.tempo}`);
    }
    
    if (testCount >= 5) {
      clearInterval(testInterval);
      voiceClockManager.stopAllVoices();
      masterClock.stop();
      console.log('\n✅ All 16 voice clocks test complete');
    }
  }, 1000);
  
  return testInterval;
}

/**
 * Test voice clocks with actual audio playback
 */
async function testVoiceClocksWithAudio() {
  console.log('=== TESTING VOICE CLOCKS WITH REAL AUDIO ===');
  
  // Initialize audio first
  if (!audioManager || !audioManager.isInitialized) {
    console.log('Initializing audio system...');
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('❌ Audio initialization failed');
      return;
    }
    console.log('✅ Audio system ready');
  }
  
  // Initialize clock systems
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  if (!voiceClockManager) {
    voiceClockManager = new VoiceClockManager();
  }
  
  voiceClockManager.initialize(masterClock);
  
  // Enable only first voice for clean audio test
  voiceData[0].enabled = true;
  voiceData[1].enabled = false;
  voiceData[2].enabled = false;
  
  // Start systems
  masterClock.start();
  voiceClockManager.startAllVoices();
  
  console.log('🎵 Voice clock with audio started - you should hear notes playing!');
  console.log('🎵 Listen for quarter notes with evolving tempo...');
  
  // Let it play for 10 seconds
  setTimeout(() => {
    voiceClockManager.stopAllVoices();
    masterClock.stop();
    console.log('🔇 Audio test complete');
  }, 10000);
}

/**
 * Test polyrhythmic audio with 3 voices
 */
async function testPolyrhythmicAudio() {
  console.log('=== TESTING POLYRHYTHMIC AUDIO (3 Voices) ===');
  
  // Ensure audio is ready
  if (!audioManager || !audioManager.isInitialized) {
    await audioManager.initialize();
  }
  
  if (!masterClock) masterClock = new MasterClock();
  if (!voiceClockManager) voiceClockManager = new VoiceClockManager();
  
  voiceClockManager.initialize(masterClock);
  
  // Enable first 3 voices for polyrhythmic test
  voiceData[0].enabled = true;  // Voice 1
  voiceData[1].enabled = true;  // Voice 2  
  voiceData[2].enabled = true;  // Voice 3
  
  console.log('🎵 Starting 3-voice polyrhythmic test...');
  console.log('🎵 Each voice will have different tempo evolution');
  console.log('🎵 Listen for overlapping rhythmic patterns!');
  
  masterClock.start();
  voiceClockManager.startAllVoices();
  
  // Play for 15 seconds
  setTimeout(() => {
    voiceClockManager.stopAllVoices();
    masterClock.stop();
    console.log('🎉 Polyrhythmic test complete!');
  }, 15000);
}

/**
 * Comprehensive Life Span Timing Diagnostic
 */
function diagLifeSpanTiming() {
  console.log('=== LIFE SPAN TIMING DIAGNOSTIC ===');
  
  // Check if systems are initialized
  console.log('\n--- SYSTEM STATUS ---');
  console.log('Master Clock exists:', !!masterClock);
  console.log('Master Clock active:', masterClock ? masterClock.isActive() : false);
  console.log('VoiceClockManager exists:', !!voiceClockManager);
  console.log('VoiceClockManager initialized:', voiceClockManager ? voiceClockManager.isInitialized : false);
  
  if (masterClock && masterClock.isActive()) {
    console.log('Master Clock elapsed time:', masterClock.getElapsedSeconds().toFixed(3) + 's');
  }
  
  // Check first few voices
  console.log('\n--- VOICE LIFE SPAN SETTINGS ---');
  for (let i = 0; i < 4; i++) {
    const voice = voiceData[i];
    const lifeSpan = voice.parameters['LIFE SPAN'];
    
    console.log(`Voice ${i + 1}:`);
    console.log(`  Enabled: ${voice.enabled}`);
    console.log(`  Duration: ${lifeSpan.duration}% = ${formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.duration))}`);
    console.log(`  Entrance: ${lifeSpan.entrance}% = ${formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.entrance))}`);
    console.log(`  Exit: ${lifeSpan.exit}% = ${formatSecondsToMMSS(convertLifeSpanToSeconds(lifeSpan.exit))}`);
    console.log(`  Repeat: ${lifeSpan.repeat}`);
    
    // Check actual seconds calculation
    const entranceSeconds = convertLifeSpanToSeconds(lifeSpan.entrance);
    const exitSeconds = convertLifeSpanToSeconds(lifeSpan.exit);
    const durationSeconds = convertLifeSpanToSeconds(lifeSpan.duration);
    
    console.log(`  Calculated seconds: Enter=${entranceSeconds}s, Exit=${exitSeconds}s, Duration=${durationSeconds}s`);
  }
  
  // Check voice clock states
  if (voiceClockManager && voiceClockManager.isInitialized) {
    console.log('\n--- VOICE CLOCK STATES ---');
    for (let i = 0; i < 4; i++) {
      const voiceClock = voiceClockManager.getVoiceClock(i);
      if (voiceClock) {
        const status = voiceClock.getStatus();
        console.log(`Voice ${i + 1} Clock:`);
        console.log(`  Active: ${status.isActive}`);
        console.log(`  Life Cycle State: ${status.lifeCycleState || 'undefined'}`);
        console.log(`  Should Play: ${status.shouldPlay}`);
        console.log(`  Current Tempo: ${status.currentTempo} BPM`);
        console.log(`  Time to Next Note: ${status.timeToNextNote}ms`);
        
        // Check cycle timing if active
        if (voiceClock.isActive && voiceClock.cycleStartTime) {
          const masterTime = masterClock ? masterClock.getMasterTime() : Date.now();
          const cycleElapsed = masterTime - voiceClock.cycleStartTime;
          console.log(`  Cycle Elapsed: ${(cycleElapsed/1000).toFixed(3)}s`);
        }
      } else {
        console.log(`Voice ${i + 1} Clock: NOT FOUND`);
      }
    }
  }
  
  // Check VoiceState constants
  console.log('\n--- VOICE STATE CONSTANTS ---');
  if (typeof VoiceState !== 'undefined') {
    console.log('VoiceState defined:', VoiceState);
  } else {
    console.log('❌ VoiceState constants not defined!');
  }
  
  // Test time conversion functions
  console.log('\n--- TIME CONVERSION TEST ---');
  const testValues = [0, 3, 5, 25, 50];
  testValues.forEach(percent => {
    const seconds = convertLifeSpanToSeconds(percent);
    const formatted = formatSecondsToMMSS(seconds);
    console.log(`${percent}% → ${seconds}s → ${formatted}`);
  });
  
  // Recommend test setup
  console.log('\n--- RECOMMENDED TEST SETUP ---');
  console.log('To test Voice 2 entering at 18 seconds:');
  console.log('1. Set Voice 1: Entrance = 0% (immediate)');
  console.log('2. Set Voice 2: Entrance = 3% (18 seconds)');
  console.log('3. Enable both voices');
  console.log('4. Click master PLAY button');
  console.log('5. Voice 1 should start immediately, Voice 2 after 18 seconds');
}

/**
 * Quick Life Span test setup
 */
function setupLifeSpanTest() {
  console.log('=== SETTING UP LIFE SPAN TEST ===');
  
  // Reset all voices first
  for (let i = 0; i < 16; i++) {
    voiceData[i].enabled = false;
  }
  
  // Voice 1: Immediate entry
  voiceData[0].enabled = true;
  voiceData[0].parameters['LIFE SPAN'].entrance = 0;   // 0% = 0 seconds
  voiceData[0].parameters['LIFE SPAN'].exit = 50;      // 50% = 5 minutes
  voiceData[0].parameters['LIFE SPAN'].duration = 100; // 100% = 10 minutes
  
  // Voice 2: 18 second delay entry  
  voiceData[1].enabled = true;
  voiceData[1].parameters['LIFE SPAN'].entrance = 3;   // 3% = 18 seconds
  voiceData[1].parameters['LIFE SPAN'].exit = 50;      // 50% = 5 minutes
  voiceData[1].parameters['LIFE SPAN'].duration = 100; // 100% = 10 minutes
  
  console.log('✅ Test setup complete:');
  console.log(`Voice 1 entrance: ${formatSecondsToMMSS(convertLifeSpanToSeconds(voiceData[0].parameters['LIFE SPAN'].entrance))}`);
  console.log(`Voice 2 entrance: ${formatSecondsToMMSS(convertLifeSpanToSeconds(voiceData[1].parameters['LIFE SPAN'].entrance))}`);
  
  console.log('\nNow click the master PLAY button to test!');
}

/**
 * Monitor voice states in real-time
 */
function monitorVoiceStates() {
  console.log('🔍 MONITORING VOICE STATES - Starting 30-second monitor...');
  
  let monitorCount = 0;
  const monitorInterval = setInterval(() => {
    monitorCount++;
    
    if (masterClock && masterClock.isActive()) {
      const elapsed = masterClock.getElapsedSeconds();
      console.log(`\n--- ${elapsed.toFixed(1)}s elapsed ---`);
      
      for (let i = 0; i < 2; i++) {
        if (voiceData[i].enabled && voiceClockManager) {
          const voiceClock = voiceClockManager.getVoiceClock(i);
          if (voiceClock) {
            console.log(`Voice ${i + 1}: ${voiceClock.lifeCycleState || 'unknown'} - Should play: ${voiceClock.shouldPlayNote()}`);
          }
        }
      }
    } else {
      console.log('Master clock not active');
    }
    
    if (monitorCount >= 30) {
      clearInterval(monitorInterval);
      console.log('⏹️ Monitor stopped after 30 seconds');
    }
  }, 1000);
  
  return monitorInterval;
}
/**
 * Debug melodic range parameter values
 */
function debugMelodicRange() {
  console.log('=== MELODIC RANGE DEBUG ===');
  
  for (let i = 0; i < 2; i++) {
    const melodicParam = voiceData[i].parameters['MELODIC RANGE'];
    console.log(`\nVoice ${i + 1} MELODIC RANGE parameter:`);
    console.log('  Raw parameter:', melodicParam);
    console.log('  Min:', melodicParam.min, `(${midiNoteNames[melodicParam.min] || 'unknown'})`);
    console.log('  Max:', melodicParam.max, `(${midiNoteNames[melodicParam.max] || 'unknown'})`);
    console.log('  Behavior:', melodicParam.behavior);
    console.log('  CurrentNote:', melodicParam.currentNote);
    console.log('  SelectedNotes:', melodicParam.selectedNotes);
  }
  
  // Test the selectMidiNote function directly
  console.log('\n--- TESTING selectMidiNote() ---');
  for (let i = 0; i < 2; i++) {
    const note = selectMidiNote(i);
    console.log(`selectMidiNote(${i}):`, note);
  }
}

// Oct 5 25 Still Getting the MAster Clock working:
// FORCE CONNECT PLAY BUTTON - Add at very end of scripts.js
setTimeout(() => {
  console.log('🔧 FORCING PLAY BUTTON CONNECTION...');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  console.log('Play button found:', !!playButton);
  console.log('Play button text:', playButton?.textContent);
  
  if (playButton) {
    // Remove any existing handlers
    playButton.onclick = null;
    
    // Force connection to new system
    playButton.onclick = toggleMasterPlayback;
    
    console.log('✅ PLAY button force-connected to toggleMasterPlayback');
    console.log('Try clicking PLAY now!');
  } else {
    console.log('❌ PLAY button not found in DOM');
  }
}, 2000); // Wait 2 seconds for DOM to be ready



//
// Oct 7 25  -  POLYPHONY STARTS HERE
//
/**
 * Generate harmonically related notes
 */
// Enhanced version that handles limited ranges better
window.generateHarmonicNotes = function(baseNote, additionalCount, minNote, maxNote) {
    console.log(`Generating ${additionalCount} harmonic notes from range ${midiNoteNames[minNote]}-${midiNoteNames[maxNote]}`);
    
    const harmonicNotes = [];
    const baseMidi = baseNote.midiNote;
    const availableRange = maxNote - minNote + 1;
    
    console.log(`Available range: ${availableRange} semitones`);
    
    // For very limited ranges, use all available notes
    if (availableRange <= 12) { // Less than an octave
        console.log('Using chromatic approach for limited range');
        
        const usedNotes = new Set([baseMidi]);
        
        // Try to use every note in the range
        for (let midi = minNote; midi <= maxNote && harmonicNotes.length < additionalCount; midi++) {
            if (!usedNotes.has(midi)) {
                harmonicNotes.push({
                    midiNote: midi,
                    frequency: midiToFrequency(midi),
                    noteName: midiNoteNames[midi] || `MIDI${midi}`
                });
                usedNotes.add(midi);
                console.log(`Added available note: ${midiNoteNames[midi]}`);
            }
        }
    } else {
        // Use original harmonic approach for wider ranges
        console.log('Using harmonic intervals for wide range');
        const intervals = [3, 4, 7, 10, 12, 15, 16, 19];
        const usedNotes = new Set([baseMidi]);
        
        for (let i = 0; i < additionalCount; i++) {
            let attempts = 0;
            let noteFound = false;
            
            while (attempts < 20 && !noteFound) {
                const intervalIndex = Math.floor(Math.random() * intervals.length);
                const interval = intervals[intervalIndex];
                const direction = Math.random() > 0.5 ? 1 : -1;
                const newMidi = baseMidi + (interval * direction);
                
                if (newMidi >= minNote && newMidi <= maxNote && !usedNotes.has(newMidi)) {
                    harmonicNotes.push({
                        midiNote: newMidi,
                        frequency: midiToFrequency(newMidi),
                        noteName: midiNoteNames[newMidi] || `MIDI${newMidi}`
                    });
                    usedNotes.add(newMidi);
                    noteFound = true;
                    console.log(`Added harmonic note: ${midiNoteNames[newMidi]} (interval: ${interval})`);
                }
                attempts++;
            }
            
            if (!noteFound) {
                console.log(`Could not find valid harmonic note ${i + 1}`);
                break;
            }
        }
    }
    
    console.log(`Generated ${harmonicNotes.length}/${additionalCount} requested notes`);
    return harmonicNotes;
};

console.log('✅ Enhanced generateHarmonicNotes loaded');

/**
 * Select base note with behavior evolution
 */
function selectBaseNote(voiceIndex, minNote, maxNote) {
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    
    // Initialize currentNote if needed
    if (!melodicParam.currentNote || 
        melodicParam.currentNote < minNote || 
        melodicParam.currentNote > maxNote) {
        melodicParam.currentNote = Math.floor((minNote + maxNote) / 2);
    }
    
    // Apply behavior changes
    if (melodicParam.behavior > 0) {
        const newNote = interpolateParameter(
            melodicParam.currentNote,
            minNote,
            maxNote,
            melodicParam.behavior,
            0.15
        );
        melodicParam.currentNote = Math.round(newNote);
    }
    
    // Ensure note stays within bounds
    melodicParam.currentNote = Math.max(minNote, Math.min(maxNote, melodicParam.currentNote));
    
    return {
        midiNote: melodicParam.currentNote,
        frequency: midiToFrequency(melodicParam.currentNote),
        noteName: midiNoteNames[melodicParam.currentNote] || `MIDI${melodicParam.currentNote}`
    };
}

/**
 * Test polyphony with different settings
 */
// async function testPolyphony() {
//     console.log('=== TESTING POLYPHONY IMPLEMENTATION ===');
    
//     // Initialize audio if needed
//     if (!audioManager || !audioManager.isInitialized) {
//         await audioManager.initialize();
//     }
    
//     if (!masterClock) masterClock = new MasterClock();
//     if (!voiceClockManager) voiceClockManager = new VoiceClockManager();
//     voiceClockManager.initialize(masterClock);
    
//     // Set up Voice 1 for polyphonic testing
//     voiceData[0].enabled = true;
//     voiceData[0].parameters['POLYPHONY'].min = 3;
//     voiceData[0].parameters['POLYPHONY'].max = 6;
//     voiceData[0].parameters['POLYPHONY'].behavior = 75;
    
//     // Set a nice melodic range
//     voiceData[0].parameters['MELODIC RANGE'].min = 60; // C4
//     voiceData[0].parameters['MELODIC RANGE'].max = 72; // C5
//     voiceData[0].parameters['MELODIC RANGE'].behavior = 50;
    
//     console.log('🎹 Starting polyphonic test - you should hear 3-6 notes playing simultaneously');
    
//     masterClock.start();
//     voiceClockManager.startAllVoices();
    
//     // Play for 15 seconds
//     setTimeout(() => {
//         voiceClockManager.stopAllVoices();
//         masterClock.stop();
//         console.log('🎹 Polyphonic test complete!');
//     }, 15000);
// }

/**
 * Test chord generation algorithms
 */
function testChordGeneration() {
    console.log('=== TESTING CHORD GENERATION ===');
    
    const baseNote = { midiNote: 60, frequency: 261.63, noteName: 'C4' };
    
    for (let noteCount = 2; noteCount <= 6; noteCount++) {
        console.log(`\nGenerating ${noteCount}-note chords:`);
        
        for (let i = 0; i < 3; i++) {
            const harmonicNotes = generateHarmonicNotes(baseNote, noteCount - 1, 48, 84);
            const allNotes = [baseNote, ...harmonicNotes];
            const noteNames = allNotes.map(n => n.noteName).join(', ');
            console.log(`  Chord ${i + 1}: [${noteNames}]`);
        }
    }
}




/**
 * Master Chord Compendium - Semitone intervals from root
 * Each array represents the intervals above the root note
 */
const chordQualities = {
    // Basic Triads
    major: [0, 4, 7],                    // Root, Major 3rd, Perfect 5th
    minor: [0, 3, 7],                    // Root, Minor 3rd, Perfect 5th
    diminished: [0, 3, 6],               // Root, Minor 3rd, Tritone
    augmented: [0, 4, 8],                // Root, Major 3rd, Augmented 5th
    
    // Suspended Chords
    sus2: [0, 2, 7],                     // Root, 2nd, Perfect 5th
    sus4: [0, 5, 7],                     // Root, 4th, Perfect 5th
    
    // Seventh Chords
    major7: [0, 4, 7, 11],               // Major + Major 7th
    minor7: [0, 3, 7, 10],               // Minor + Minor 7th
    dominant7: [0, 4, 7, 10],            // Major + Minor 7th
    diminished7: [0, 3, 6, 9],           // Diminished + Diminished 7th
    halfDiminished7: [0, 3, 6, 10],      // Diminished + Minor 7th
    augmented7: [0, 4, 8, 10],           // Augmented + Minor 7th
    majorMajor7: [0, 4, 7, 11],          // Major + Major 7th (same as major7)
    
    // Extended Chords
    add9: [0, 4, 7, 14],                 // Major + 9th (no 7th)
    major9: [0, 4, 7, 11, 14],           // Major 7th + 9th
    minor9: [0, 3, 7, 10, 14],           // Minor 7th + 9th
    dominant9: [0, 4, 7, 10, 14],        // Dominant 7th + 9th
    
    major11: [0, 4, 7, 11, 14, 17],      // Major 9th + 11th
    minor11: [0, 3, 7, 10, 14, 17],      // Minor 9th + 11th
    dominant11: [0, 4, 7, 10, 14, 17],   // Dominant 9th + 11th
    
    major13: [0, 4, 7, 11, 14, 17, 21],  // Major 11th + 13th
    minor13: [0, 3, 7, 10, 14, 17, 21],  // Minor 11th + 13th
    dominant13: [0, 4, 7, 10, 14, 17, 21], // Dominant 11th + 13th
    
    // Jazz & Modern Chords
    sixth: [0, 4, 7, 9],                 // Major + 6th
    minorSixth: [0, 3, 7, 9],            // Minor + 6th
    sixNine: [0, 4, 7, 9, 14],           // 6th + 9th
    
    // Altered Dominants
    dom7sharp5: [0, 4, 8, 10],           // Dominant 7th + Augmented 5th
    dom7flat5: [0, 4, 6, 10],            // Dominant 7th + Diminished 5th
    dom7sharp9: [0, 4, 7, 10, 15],       // Dominant 7th + Sharp 9th
    dom7flat9: [0, 4, 7, 10, 13],        // Dominant 7th + Flat 9th
    
    // Quartal/Modern
    quartal: [0, 5, 10, 15],             // Built on 4ths
    cluster: [0, 1, 2, 3],               // Chromatic cluster
    wholeTone: [0, 2, 4, 6, 8, 10]       // Whole tone scale
};

/**
 * Chord categories for different musical styles
 */
const chordCategories = {
    simple: ['major', 'minor', 'sus2', 'sus4'],
    classical: ['major', 'minor', 'diminished', 'augmented', 'dominant7'],
    jazz: ['major7', 'minor7', 'dominant7', 'halfDiminished7', 'major9', 'dominant9'],
    extended: ['major9', 'minor9', 'dominant9', 'major11', 'minor11', 'major13'],
    modern: ['quartal', 'cluster', 'dom7sharp5', 'dom7flat9', 'wholeTone'],
    all: Object.keys(chordQualities)
};

console.log('✅ Master Chord Compendium loaded');
console.log(`📊 Available chord types: ${Object.keys(chordQualities).length}`);
console.log(`🎼 Categories: ${Object.keys(chordCategories).length}`);

//
// END CHORD COMPENDIUM 
//****************************************************************************** */


//
 /* Select chord quality based on polyphony count and musical style
 */
function selectChordQuality(polyphonyCount, behaviorSetting = 50, musicalStyle = 'jazz') {
    // Get chord pool based on polyphony count
    let availableChords = [];
    
    if (polyphonyCount <= 3) {
        // Use triads and simple chords
        availableChords = chordCategories.simple.concat(chordCategories.classical);
    } else if (polyphonyCount <= 5) {
        // Use 7th chords and basic extensions
        availableChords = chordCategories.jazz.concat(['sixth', 'add9']);
    } else {
        // Use extended chords for high polyphony
        availableChords = chordCategories.extended.concat(chordCategories.modern);
    }
    
    // Filter chords that fit the polyphony count
    availableChords = availableChords.filter(chordType => {
        const intervals = chordQualities[chordType];
        return intervals && intervals.length <= polyphonyCount;
    });
    
    // Behavior affects chord complexity preference
    if (behaviorSetting > 75) {
        // High behavior: prefer complex/modern chords
        const complexChords = availableChords.filter(chord => 
            chordCategories.modern.includes(chord) || 
            chordCategories.extended.includes(chord)
        );
        if (complexChords.length > 0) availableChords = complexChords;
    } else if (behaviorSetting < 25) {
        // Low behavior: prefer simple chords
        const simpleChords = availableChords.filter(chord => 
            chordCategories.simple.includes(chord)
        );
        if (simpleChords.length > 0) availableChords = simpleChords;
    }
    
    // Fallback to basic chords if no matches
    if (availableChords.length === 0) {
        availableChords = ['major', 'minor'];
    }
    
    // Select random chord from available options
    const selectedChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    
    return selectedChord;
}

/**
 * Generate chord using the compendium system
 */
function generateMusicalChord(baseNote, polyphonyCount, minNote, maxNote, behaviorSetting = 50) {
    console.log(`🎼 Generating chord: baseNote=${midiNoteNames[baseNote.midiNote]}, polyphony=${polyphonyCount}`);
    
    // Select chord quality
    const chordType = selectChordQuality(polyphonyCount, behaviorSetting);
    const intervals = chordQualities[chordType];
    
    console.log(`Selected chord type: ${chordType} with intervals [${intervals}]`);
    
    const chordNotes = [];
    const baseMidi = baseNote.midiNote;
    
    // Generate notes from intervals
    for (let i = 0; i < Math.min(intervals.length, polyphonyCount); i++) {
        const interval = intervals[i];
        let chordNoteMidi = baseMidi + interval;
        
        // Handle octave wrapping if note goes out of range
        while (chordNoteMidi > maxNote && chordNoteMidi - 12 >= minNote) {
            chordNoteMidi -= 12; // Drop an octave
        }
        while (chordNoteMidi < minNote && chordNoteMidi + 12 <= maxNote) {
            chordNoteMidi += 12; // Raise an octave
        }
        
        // Only add if still in range
        if (chordNoteMidi >= minNote && chordNoteMidi <= maxNote) {
            chordNotes.push({
                midiNote: chordNoteMidi,
                frequency: midiToFrequency(chordNoteMidi),
                noteName: midiNoteNames[chordNoteMidi] || `MIDI${chordNoteMidi}`
            });
        }
    }
    
    console.log(`Generated chord: [${chordNotes.map(n => n.noteName).join(', ')}]`);
    return chordNotes;
}

console.log('✅ Chord quality selection system loaded');

//
//
//  





