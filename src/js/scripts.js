// Parameter definitions
const parameterDefinitions = [
  // INSTRUMENT & SOUND ROLLUP - CORRECTED ORDER
  { name: "SOUND", type: "dropdown", options: "gm-sounds", rollup: "instrument" },
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
  { name: "REVERB", type: "single-dual", min: 0, max: 100, rollup: "spatial" },
  { name: "DELAY", type: "multi-dual", min: 0, max: 2000, rollup: "spatial" }
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


// NEW MASTER CLOCK SYSTEM
// =============================================================================
// MASTER CLOCK SYSTEM - High Resolution Parameter Evolution
// =============================================================================

/**
 * High-resolution Master Clock - Continuously evolves all parameters
 * Runs at ~100Hz (10ms intervals) for smooth parameter evolution
 */
class MasterClock {
  constructor() {
    this.resolution = 10; // 10ms = 100Hz update rate for smooth evolution
    this.isRunning = false;
    this.intervalId = null;
    this.startTime = 0;
    this.lastUpdateTime = 0;
    
    console.log('Master Clock initialized - 100Hz parameter evolution');
  }
  
  start() {
    if (this.isRunning) {
      this.stop(); // Stop existing clock first
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    
    this.intervalId = setInterval(() => {
      this.updateAllParameters();
    }, this.resolution);
    
    console.log('🕐 Master Clock started - continuous parameter evolution active');
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    
    console.log('🕐 Master Clock stopped');
  }
  
  updateAllParameters() {
    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - this.lastUpdateTime) / 1000, 0.05);
    
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (voiceData[voiceIndex] && voiceData[voiceIndex].enabled) {
        this.updateVoiceParameters(voiceIndex, deltaTime);
      }
    }
    
    this.lastUpdateTime = currentTime;
  }
  
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
    this.updateParameter(voice.parameters['TEMPO (BPM)'], deltaTime);
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
      if (param.type === 'dropdown') {
        // Set sensible defaults for dropdown parameters
        if (param.name === 'SOUND') {
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
        
        // THIS WAS MISSING - add the actual parameter assignment for multi-dual
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
      } else if (param.type === 'timing-controls') {
        // FIXED - only one parameter assignment for timing controls
        voice.parameters[param.name] = {
          duration: 50,    // Default values
          entrance: 25,
          exit: 25,
          repeat: false
        };
      }
    });
    
    voiceData.push(voice);
  }
  
  // Log the sensible defaults for confirmation
  console.log('Voices initialized with sensible defaults:');
  console.log('- Sound: Acoustic Grand Piano');
  console.log('- Melodic Range: Middle C (C4) selected in piano');
  console.log('- Rhythms: Quarter Notes');
  console.log('- Rests: No Rests (continuous playing)');
  console.log('- Other parameters: 25%-75% of their ranges');
  
  // TEMPORARY: Test what DELAY looks like
  console.log('DELAY parameter for voice 0:', voiceData[0].parameters['DELAY']);
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
  label.textContent = paramName === 'SOUND' ? 'Instrument' : 'Selection';
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
    wrapper.className = 'dual-slider';
    
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
  wrapper.className = 'dual-slider';
  
  const speedWrapper = document.createElement('div');
  speedWrapper.className = 'slider-wrapper';
  
  const speedLabel = document.createElement('div');
  speedLabel.className = 'slider-label';
  speedLabel.textContent = 'Speed';
  speedWrapper.appendChild(speedLabel);
  
  const speedDiv = document.createElement('div');
  const voiceParam = voiceData[voiceIndex].parameters[param.name];
  
  noUiSlider.create(speedDiv, {
    start: [voiceParam.speed.min, voiceParam.speed.max],
    connect: true,
    range: { min: param.min, max: param.max },
    step: 1,
    tooltips: [true, true],
    format: {
      to: value => Math.round(value).toString(),
      from: value => Number(value)
    }
  });
  
  const updateSpeedValues = () => {
    const values = speedDiv.noUiSlider.get();
    const min = Math.round(values[0]);
    const max = Math.round(values[1]);
    voiceData[voiceIndex].parameters[param.name].speed.min = min;
    voiceData[voiceIndex].parameters[param.name].speed.max = max;
  };
  
  speedDiv.noUiSlider.on('update', updateSpeedValues);
  updateSpeedValues();
  
  speedWrapper.appendChild(speedDiv);
  
  const depthWrapper = document.createElement('div');
  depthWrapper.className = 'slider-wrapper';
  
  const depthLabel = document.createElement('div');
  depthLabel.className = 'slider-label';
  depthLabel.textContent = 'Depth';
  depthWrapper.appendChild(depthLabel);
  
  const depthDiv = document.createElement('div');
  
  noUiSlider.create(depthDiv, {
    start: [voiceParam.depth.min, voiceParam.depth.max],
    connect: true,
    range: { min: param.min, max: param.max },
    step: 1,
    tooltips: [true, true],
    format: {
      to: value => Math.round(value).toString(),
      from: value => Number(value)
    }
  });
  
  const updateDepthValues = () => {
    const values = depthDiv.noUiSlider.get();
    const min = Math.round(values[0]);
    const max = Math.round(values[1]);
    voiceData[voiceIndex].parameters[param.name].depth.min = min;
    voiceData[voiceIndex].parameters[param.name].depth.max = max;
  };
  
  depthDiv.noUiSlider.on('update', updateDepthValues);
  updateDepthValues();
  
  depthWrapper.appendChild(depthDiv);
  
  wrapper.appendChild(speedWrapper);
  wrapper.appendChild(depthWrapper);
  
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
  repeatCheckbox.checked = currentTimingData.repeat; // Load from voiceData
  repeatCheckbox.className = 'timing-checkbox';
  
  repeatContainer.appendChild(repeatLabel);
  repeatContainer.appendChild(repeatCheckbox);
  
  // Container 2: Duration
  const durationContainer = document.createElement('div');
  durationContainer.className = 'timing-control-container duration-container';
  
  const durationLabel = document.createElement('div');
  durationLabel.className = 'timing-control-label';
  durationLabel.textContent = 'Duration';
  
  const durationFormatLabel = document.createElement('div');
  durationFormatLabel.className = 'timing-format-label';
  durationFormatLabel.textContent = 'mm:ss';
  
  const durationSlider = document.createElement('input');
  durationSlider.type = 'range';
  durationSlider.min = param.min;
  durationSlider.max = param.max;
  durationSlider.value = currentTimingData.duration; // Load from voiceData
  durationSlider.className = 'timing-slider';
  
  durationContainer.appendChild(durationLabel);
  durationContainer.appendChild(durationFormatLabel);
  durationContainer.appendChild(durationSlider);
  
  // Container 3: Entrance
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
  entranceSlider.min = param.min;
  entranceSlider.max = param.max;
  entranceSlider.value = currentTimingData.entrance; // Load from voiceData
  entranceSlider.className = 'timing-slider';
  
  entranceContainer.appendChild(entranceLabel);
  entranceContainer.appendChild(entranceFormatLabel);
  entranceContainer.appendChild(entranceSlider);
  
  // Container 4: Exit
  const exitContainer = document.createElement('div');
  exitContainer.className = 'timing-control-container exit-container';
  
  const exitLabel = document.createElement('div');
  exitLabel.className = 'timing-control-label';
  exitLabel.textContent = 'Exit';
  
  const exitFormatLabel = document.createElement('div');
  exitFormatLabel.className = 'timing-format-label';
  exitFormatLabel.textContent = 'mm:ss';
  
  const exitSlider = document.createElement('input');
  exitSlider.type = 'range';
  exitSlider.min = param.min;
  exitSlider.max = param.max;
  exitSlider.value = currentTimingData.exit; // Load from voiceData
  exitSlider.className = 'timing-slider';
  
  exitContainer.appendChild(exitLabel);
  exitContainer.appendChild(exitFormatLabel);
  exitContainer.appendChild(exitSlider);
  
  // Add all containers to wrapper
  wrapper.appendChild(repeatContainer);
  wrapper.appendChild(durationContainer);
  wrapper.appendChild(entranceContainer);
  wrapper.appendChild(exitContainer);
  
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


function renderParameters() {
  const parameterSection = document.getElementById('parameter-section');
  
  // Initialize rollup states if needed
  if (Object.keys(rollupState).length === 0) {
    initializeRollupState();
  }
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
  
  // Group parameters by rollup
  const rollupGroups = {};
  parameterDefinitions.forEach(param => {
    const rollupKey = param.rollup;
    if (!rollupGroups[rollupKey]) {
      rollupGroups[rollupKey] = [];
    }
    rollupGroups[rollupKey].push(param);
  });
  
  // Create nested rollup structure (groups containing parameter rollups)
  const rollupOrder = ['instrument', 'mixing', 'rhythm', 'modulation', 'spatial'];
  rollupOrder.forEach(rollupKey => {
    if (rollupGroups[rollupKey]) {
      const groupRollup = createNestedGroupRollup(rollupKey, rollupConfig[rollupKey], rollupGroups[rollupKey], currentVoice);
      parameterSection.appendChild(groupRollup);
    }
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
function previewVoice(voiceIndex) {
  if (!audioManager || !audioManager.isInitialized) {
    console.log('Audio manager not ready');
    return;
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  if (!voiceControls) {
    console.log('Voice controls not found');
    return;
  }
  
  // More robust button selector
  const previewButton = voiceControls.querySelector('button.control-btn') || 
                       voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (!previewButton) {
    console.log('Preview button not found');
    return;
  }
  
  if (previewButton.textContent === 'STOP') {
    // Stop audio and parameter interpolation
    audioManager.stopTestOscillator();
    disableParameterInterpolation();
    
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    console.log(`Voice ${voiceIndex + 1} preview stopped`);
  
  } else {
    // Start audio
    const selectedSoundIndex = voiceData[voiceIndex].parameters['SOUND'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    audioManager.createTestOscillatorWithType(oscillatorType);
    
    // Apply initial parameters
    const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
    const currentVolume = (volumeParam.min + volumeParam.max) / 2;
    audioManager.setVolumeRealTime(currentVolume);
    
    const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
    const currentBalance = (balanceParam.min + balanceParam.max) / 2;
    audioManager.setBalanceRealTime(currentBalance);
    
    // Start parameter interpolation
    enableParameterInterpolation();
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log(`Voice ${voiceIndex + 1} preview started with ${selectedSoundName}`);
  }
}

  
function toggleLockVoice(voiceIndex) {
  voiceData[voiceIndex].locked = !voiceData[voiceIndex].locked;
  renderParameters();
}


// Master multi-voice playback system - ADD THESE BEFORE DOMContentLoaded
async function startMasterPlayback() {
  console.log('=== STARTING MASTER MULTI-VOICE PLAYBACK ===');
  
  // Ensure audio system is initialized
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
  
  // Create voice manager if it doesn't exist
  if (!voiceManager) {
    console.log('Creating VoiceManager...');
    voiceManager = new VoiceManager(audioManager.audioContext, audioManager.masterGainNode);
  }
  
  // Check which voices are enabled
  const enabledVoices = [];
  for (let i = 0; i < 16; i++) {
    if (voiceData[i].enabled) {
      enabledVoices.push(i + 1);
    }
  }
  
  console.log(`Enabled voices: ${enabledVoices.join(', ')}`);
  
  if (enabledVoices.length === 0) {
    console.log('❌ No voices enabled! Please enable at least one voice.');
    alert('Please enable at least one voice by checking the checkboxes in the voice tabs.');
    return;
  }
  
  // Stop any individual previews first
  document.querySelectorAll('.voice-controls button').forEach(button => {
    if (button.textContent === 'STOP') {
      button.click(); // Stop individual previews
    }
  });
  
  // Start all enabled voices playing together
  voiceManager.startAllVoices();
  
  // Update play button state
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
  }
  
  console.log('🎵 Multi-voice playback started!');
}

function stopMasterPlayback() {
  console.log('=== STOPPING MASTER MULTI-VOICE PLAYBACK ===');
  
  if (voiceManager) {
    voiceManager.stopAllVoices();
  }
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
  }
  
  console.log('🔇 Multi-voice playback stopped');
}

async function toggleMasterPlayback() {
  console.log('🎯 PLAY button clicked!'); // Debug log
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    stopMasterPlayback();
  } else {
    await startMasterPlayback();
  }
}

// Master multi-voice playback system
async function startMasterPlayback() {
  console.log('=== STARTING MASTER MULTI-VOICE PLAYBACK ===');
  
  // Ensure audio system is initialized
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
  
  // Create voice manager if it doesn't exist
  if (!voiceManager) {
    console.log('Creating VoiceManager...');
    voiceManager = new VoiceManager(audioManager.audioContext, audioManager.masterGainNode);
  }
  
  // Check which voices are enabled
  const enabledVoices = [];
  for (let i = 0; i < 16; i++) {
    if (voiceData[i].enabled) {
      enabledVoices.push(i + 1);
    }
  }
  
  console.log(`Enabled voices: ${enabledVoices.join(', ')}`);
  
  if (enabledVoices.length === 0) {
    console.log('❌ No voices enabled! Please enable at least one voice.');
    alert('Please enable at least one voice by checking the checkboxes in the voice tabs.');
    return;
  }
  
  // Stop any individual previews first
  document.querySelectorAll('.voice-controls button').forEach(button => {
    if (button.textContent === 'STOP') {
      button.click(); // Stop individual previews
    }
  });
  
  // Start all enabled voices playing together
  voiceManager.startAllVoices();
  
  // Update play button state
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
  }
  
  console.log('🎵 Multi-voice playback started!');
}

function stopMasterPlayback() {
  console.log('=== STOPPING MASTER MULTI-VOICE PLAYBACK ===');
  
  if (voiceManager) {
    voiceManager.stopAllVoices();
  }
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
  }
  
  console.log('🔇 Multi-voice playback stopped');
}

async function toggleMasterPlayback() {
  console.log('🎯 PLAY button clicked!');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    stopMasterPlayback();
  } else {
    await startMasterPlayback();
  }
}





// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();

  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  // Connect sliders and PLAY button after UI is ready
  setTimeout(() => {
    connectAllSliders();
  
    // Connect PLAY button
    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    if (playButton) {
      playButton.onclick = toggleMasterPlayback;
      console.log('✅ Master PLAY button connected to toggleMasterPlayback');
    } else {
      console.log('❌ PLAY button not found during connection');
    }
  }, 200);

  
  document.addEventListener('click', initializeAudioOnFirstClick, { once: true });



  
// Connect Master Clock tempo buttons with click-and-hold
setTimeout(() => {
  const tempoUpBtn = document.getElementById('tempo-up');
  const tempoDownBtn = document.getElementById('tempo-down');
  
  if (tempoUpBtn) {
    // Remove old onclick
    tempoUpBtn.onclick = null;
    
    // Add new mouse events for click-and-hold
    tempoUpBtn.addEventListener('mousedown', () => startTempoScroll(1));
    tempoUpBtn.addEventListener('mouseup', stopTempoScroll);
    tempoUpBtn.addEventListener('mouseleave', stopTempoScroll);
    
    // Add touch events for mobile
    tempoUpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startTempoScroll(1);
    });
    tempoUpBtn.addEventListener('touchend', stopTempoScroll);
    
    console.log('✅ Master tempo UP button connected with click-and-hold');
  }
  
  if (tempoDownBtn) {
    // Remove old onclick
    tempoDownBtn.onclick = null;
    
    // Add new mouse events for click-and-hold
    tempoDownBtn.addEventListener('mousedown', () => startTempoScroll(-1));
    tempoDownBtn.addEventListener('mouseup', stopTempoScroll);
    tempoDownBtn.addEventListener('mouseleave', stopTempoScroll);
    
    // Add touch events for mobile
    tempoDownBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startTempoScroll(-1);
    });
    tempoDownBtn.addEventListener('touchend', stopTempoScroll);
    
    console.log('✅ Master tempo DOWN button connected with click-and-hold');
  }
  
  // Initialize display
  updateMasterTempoDisplay();
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
function interpolateParameter(currentValue, minRange, maxRange, behaviorSetting, deltaTime) {
  // Calculate maximum possible change based on behavior setting and time
  const maxChange = (maxRange - minRange) * (behaviorSetting / 100) * deltaTime;
  
  // Generate random factor between -1 and 1
  const randomFactor = (Math.random() - 0.5) * 2;
  
  // Calculate actual change
  const change = maxChange * randomFactor;
  
  // Apply change while respecting boundaries
  return Math.max(minRange, Math.min(maxRange, currentValue + change));
}

// Replace the updateVoiceParameters and updateCurrentVoiceSliders functions

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
 * Main parameter interpolation update loop
 * FIXED: Removed problematic slider updates
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
  
  // Display current parameter values in console for debugging
  if (currentVoice >= 0 && currentVoice < 16) {
    const volumeParam = voiceData[currentVoice].parameters['VOLUME'];
    const balanceParam = voiceData[currentVoice].parameters['STEREO BALANCE'];
    
    if (volumeParam && volumeParam.currentValue !== undefined) {
      console.log(`Voice ${currentVoice + 1} - Volume: ${Math.round(volumeParam.currentValue)}%, Balance: ${Math.round(balanceParam.currentValue || 0)}%`);
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
 * Enhanced disable function with cleanup
 */
function disableParameterInterpolation() {
  isParameterInterpolationActive = false;
  
  if (parameterUpdateTimer) {
    clearInterval(parameterUpdateTimer);
    parameterUpdateTimer = null;
  }
  
  // Reset all parameter evolution values
  resetParameterValues();
  
  console.log('Parameter interpolation disabled');
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

/**
 * Start parameter interpolation system
 */
// Add this debugging version to test what's happening
// Replace the enableParameterInterpolation function with this debug version

function enableParameterInterpolation() {
  console.log('=== ENABLING PARAMETER INTERPOLATION ===');
  
  if (parameterUpdateTimer) {
    clearInterval(parameterUpdateTimer);
  }
  
  isParameterInterpolationActive = true;
  lastUpdateTime = Date.now();
  
  // Check current voice parameters before starting
  console.log('Current voice:', currentVoice);
  console.log('Voice data:', voiceData[currentVoice]);
  console.log('Volume param:', voiceData[currentVoice].parameters['VOLUME']);
  console.log('Balance param:', voiceData[currentVoice].parameters['STEREO BALANCE']);
  
  // Update every 100ms for smooth parameter evolution
  parameterUpdateTimer = setInterval(() => {
    console.log('Timer tick - isActive:', isParameterInterpolationActive);
    startParameterInterpolation();
  }, 100);
  
  console.log('Parameter interpolation timer started');
}





/* MASTER TEMPO CONTROLS */
/* Update Master Tempo Display */


function updateMasterTempoDisplay() {
  const display = document.getElementById('master-tempo-display');
  if (display) {
    display.textContent = `${masterTempo} BPM`;
    console.log(`Master tempo updated to: ${masterTempo} BPM`);
  }
}

/**
 * Increase Master Tempo
 */
function increaseMasterTempo() {
  if (masterTempo < 240) { // Max tempo limit
    masterTempo += 1;
    updateMasterTempoDisplay();
    console.log(`Master tempo updated to: ${masterTempo} BPM`);
  } else {
    console.log('Maximum tempo reached (240 BPM)');
  }
}

/**
 * Decrease Master Tempo
 */
function decreaseMasterTempo() {
  if (masterTempo > 40) { // Min tempo limit
    masterTempo -= 1;
    updateMasterTempoDisplay();
    console.log(`Master tempo updated to: ${masterTempo} BPM`);
  } else {
    console.log('Minimum tempo reached (40 BPM)');
  }
}

/**
 * Update Master Tempo Display
 */
function updateMasterTempoDisplay() {
  const display = document.getElementById('master-tempo-display');
  if (display) {
    display.textContent = `${masterTempo} BPM`;
    console.log(`Master tempo updated to: ${masterTempo} BPM`);
  }
}

// ADD THE NEW FUNCTIONS HERE:
/**
 * Start tempo scrolling in specified direction
 */
/**
 * Start tempo scrolling in specified direction - IMPROVED DEBOUNCING
 */
function startTempoScroll(direction) {
  // Stop any existing scroll
  stopTempoScroll();
  
  tempoScrollDirection = direction;
  
  // Initial change (immediate response)
  if (direction > 0) {
    increaseMasterTempo();
  } else {
    decreaseMasterTempo();
  }
  
  // IMPROVED TIMING: Less sensitive click-and-hold
  setTimeout(() => {
    if (tempoScrollDirection !== 0) {
      tempoScrollInterval = setInterval(() => {
        if (tempoScrollDirection > 0) {
          increaseMasterTempo();
        } else if (tempoScrollDirection < 0) {
          decreaseMasterTempo();
        }
      }, 120); // CHANGED: Slower repeat from 100ms to 120ms
    }
  }, 750); // CHANGED: Longer delay from 500ms to 750ms - must hold longer before rapid scrolling starts
}


/**
 * Stop tempo scrolling
 */
function stopTempoScroll() {
  tempoScrollDirection = 0;
  if (tempoScrollInterval) {
    clearInterval(tempoScrollInterval);
    tempoScrollInterval = null;
  }
}









/* END MASTER TEMPO CONTROLS


/**
 * Updated preview function using simple test clock
 // Replace the existing previewVoice function with this unified version
 */

/**
 * Updated preview function using Master Clock architecture
 */
async function previewVoice(voiceIndex) {
  console.log('=== PREVIEW VOICE (Master Clock system) ===', voiceIndex);
  
  if (!audioManager || !audioManager.isInitialized) {
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('Failed to initialize audio manager');
      return;
    }
    console.log('Audio manager ready');
  }
  
  // Initialize master clock if needed
  if (!masterClock) {
    masterClock = new MasterClock();
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (previewButton.textContent === 'STOP') {
    console.log('Stopping all playback...');
    
    // Stop rhythmic playback
    stopRhythmicPlayback();
    
    // Stop master clock
    masterClock.stop();
    
    // Stop any old continuous tone
    if (audioManager.isPlaying) {
      audioManager.stopTestOscillator();
    }
    
    // Reset parameters
    resetParameterValues();
    
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    console.log('All playback stopped');
  
  } else {
    console.log('Starting Master Clock preview...');
    
    // Stop any existing playback first
    stopRhythmicPlayback();
    masterClock.stop();
    if (audioManager.isPlaying) {
      audioManager.stopTestOscillator();
    }
    
    // Show current parameter settings
    const rhythmParam = voiceData[voiceIndex].parameters['RHYTHMS'];
    const restParam = voiceData[voiceIndex].parameters['RESTS'];
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
    const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
    
    console.log('Voice settings:', {
      rhythm: `${rhythmParam.min}-${rhythmParam.max} (behavior: ${rhythmParam.behavior}%)`,
      rest: `${restParam.min}-${restParam.max} (behavior: ${restParam.behavior}%)`,
      melodic: `MIDI ${melodicParam.min}-${melodicParam.max} (behavior: ${melodicParam.behavior}%)`,
      volume: `${volumeParam.min}-${volumeParam.max}% (behavior: ${volumeParam.behavior}%)`,
      balance: `${balanceParam.min}-${balanceParam.max}% (behavior: ${balanceParam.behavior}%)`
    });
    
    // Start Master Clock for continuous parameter evolution
    masterClock.start();
    
    // Start rhythmic note patterns
    startRhythmicPlayback(voiceIndex);
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log('Master Clock preview started');
  }
}






/**
 * Stop parameter interpolation system
 */
function disableParameterInterpolation() {
  isParameterInterpolationActive = false;
  
  if (parameterUpdateTimer) {
    clearInterval(parameterUpdateTimer);
    parameterUpdateTimer = null;
  }
  
  console.log('Parameter interpolation disabled');
}

/**
 * Enhanced preview function with parameter interpolation
 */
function previewVoiceWithInterpolation(voiceIndex) {
  if (!audioManager || !audioManager.isInitialized) {
    return;
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (previewButton.textContent === 'STOP') {
    // Stop audio and parameter interpolation
    audioManager.stopTestOscillator();
    disableParameterInterpolation();
    
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
  
  } else {
    // Start audio
    const selectedSoundIndex = voiceData[voiceIndex].parameters['SOUND'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    audioManager.createTestOscillatorWithType(oscillatorType);
    
    // Apply initial parameters
    const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
    const currentVolume = (volumeParam.min + volumeParam.max) / 2;
    audioManager.setVolumeRealTime(currentVolume);
    
    const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
    const currentBalance = (balanceParam.min + balanceParam.max) / 2;
    audioManager.setBalanceRealTime(currentBalance);
    
    // Start parameter interpolation
    enableParameterInterpolation();
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
  }
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
 * Select random MIDI note within melodic range and behavior
 */
// Replace the selectMidiNote function with this fixed version


/**
 * Enhanced selectMidiNote function - WITH ERROR HANDLING
 */
function selectMidiNote(voiceIndex) {
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    
    // Check if we have custom selected notes from piano
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
        // Pick random note from actual selected notes
        const selectedArray = melodicParam.selectedNotes;
        const randomIndex = Math.floor(Math.random() * selectedArray.length);
        const selectedMidi = selectedArray[randomIndex];
        
        const frequency = midiToFrequency(selectedMidi);
        const noteName = midiNoteNames[selectedMidi] || `MIDI${selectedMidi}`;
        
        return { midiNote: selectedMidi, frequency, noteName };
    }
    
    // ERROR HANDLING: Check if we have a valid range
    const currentMin = Math.round(melodicParam.min);
    const currentMax = Math.round(melodicParam.max);
    
    if (isNaN(currentMin) || isNaN(currentMax) || currentMin > currentMax) {
        console.warn(`Voice ${voiceIndex + 1}: Invalid melodic range, using Middle C`);
        const frequency = midiToFrequency(60); // Middle C
        return { midiNote: 60, frequency, noteName: 'C4' };
    }
    
    // Initialize currentNote if needed
    if (!melodicParam.currentNote || 
        melodicParam.currentNote < currentMin || 
        melodicParam.currentNote > currentMax) {
        melodicParam.currentNote = Math.floor((currentMin + currentMax) / 2);
    }
    
    // Apply behavior changes
    if (melodicParam.behavior > 0) {
        const newNote = interpolateParameter(
            melodicParam.currentNote,
            currentMin,
            currentMax,
            melodicParam.behavior,
            0.15
        );
        
        melodicParam.currentNote = Math.round(newNote);
    }
    
    // Ensure note stays within bounds
    melodicParam.currentNote = Math.max(currentMin, Math.min(currentMax, melodicParam.currentNote));
    
    // ERROR HANDLING: Final validation
    if (isNaN(melodicParam.currentNote) || melodicParam.currentNote < 21 || melodicParam.currentNote > 108) {
        console.error(`Voice ${voiceIndex + 1}: Invalid note ${melodicParam.currentNote}, using Middle C`);
        melodicParam.currentNote = 60;
    }
    
    const frequency = midiToFrequency(melodicParam.currentNote);
    const noteName = midiNoteNames[melodicParam.currentNote] || `MIDI${melodicParam.currentNote}`;
    
    return { midiNote: melodicParam.currentNote, frequency, noteName };
}



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
  const selectedSoundIndex = voiceData[voiceIndex].parameters['SOUND'];
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
 * Schedule a rhythm pattern for a voice - WITH ERROR HANDLING
 */
function scheduleRhythmPattern(voiceIndex, startTime) {
    const rhythmParam = voiceData[voiceIndex].parameters['RHYTHMS'];
    const restParam = voiceData[voiceIndex].parameters['RESTS'];
    
    // DEBUGGING THE CLOCKS:
    console.log(`=== SCHEDULING NOTE FOR VOICE ${voiceIndex + 1} ===`);
    const voiceTempo = getVoiceTempo(voiceIndex);
    console.log(`Voice tempo calculated: ${voiceTempo} BPM`);
    console.log(`Master tempo: ${masterTempo} BPM`);
    // END DEBUG CLOCK

    // ERROR HANDLING: Check for valid rhythm/rest selections
    if (rhythmParam.min === 0 && rhythmParam.max === 0) {
        console.warn(`Voice ${voiceIndex + 1}: No rhythm selected, using default eighth notes`);
        rhythmParam.min = 4; // Eighth notes
        rhythmParam.max = 4;
    }
    
   // Only handle truly invalid values
if (restParam.min < 0 || restParam.max < 0 || 
    restParam.min > 15 || restParam.max > 15) {
    console.warn(`Voice ${voiceIndex + 1}: Invalid rest range, using no rests`);
    restParam.min = 0; // No rests
    restParam.max = 0;
}

    
    // Select rhythm and rest within behavior ranges
    let rhythmIndex, restIndex;
    
    if (rhythmParam.behavior > 0) {
        rhythmIndex = Math.floor(interpolateParameter(
            (rhythmParam.min + rhythmParam.max) / 2,
            rhythmParam.min,
            rhythmParam.max,
            rhythmParam.behavior,
            0.5
        ));
    } else {
        rhythmIndex = Math.floor((rhythmParam.min + rhythmParam.max) / 2);
    }
    
    if (restParam.behavior > 0) {
        restIndex = Math.floor(interpolateParameter(
            (restParam.min + restParam.max) / 2,
            restParam.min,
            restParam.max,
            restParam.behavior,
            0.5
        ));
    } else {
        restIndex = Math.floor((restParam.min + restParam.max) / 2);
    }
    
    // Ensure valid ranges:
    // Rhythms: 0-14 (no invalid index 0 anymore)
    rhythmIndex = Math.max(0, Math.min(14, rhythmIndex));
    // Rests: 0-15 (index 0 is valid "No Rests")
    restIndex = Math.max(0, Math.min(15, restIndex));

    // Get durations using the already-calculated voice tempo
    const noteDuration = getRhythmDuration(rhythmIndex, voiceTempo);
    const restDuration = getRestDuration(restIndex, voiceTempo);

    // Add more detailed logging
    console.log(`Rhythm index: ${rhythmIndex}, Rest index: ${restIndex}`);
    console.log(`Note duration: ${noteDuration.toFixed(3)}s, Rest duration: ${restDuration.toFixed(3)}s`);

    // ERROR HANDLING: Validate durations
    if (isNaN(noteDuration) || noteDuration <= 0) {
        console.error(`Invalid note duration for rhythm index ${rhythmIndex}`);
        return startTime + 0.5; // Default 500ms fallback
    }
    
    if (isNaN(restDuration) || restDuration < 0) {
        console.error(`Invalid rest duration for rest index ${restIndex}`);
        return startTime + noteDuration + 0.1; // Small default rest
    }
    
    // Select note within melodic range
    const noteInfo = selectMidiNote(voiceIndex);
    
    // ERROR HANDLING: Check if we got a valid note
    if (!noteInfo || !noteInfo.frequency || isNaN(noteInfo.frequency)) {
        console.error(`Voice ${voiceIndex + 1}: Invalid note selected, skipping`);
        return startTime + noteDuration + restDuration;
    }
    
    // Schedule the note with current parameter values
    const scheduledNote = scheduleNote(noteInfo.frequency, noteDuration, startTime, voiceIndex);
    
    console.log(`✅ Scheduled: ${noteInfo.noteName} for ${noteDuration.toFixed(3)}s, rest ${restDuration.toFixed(3)}s`);
    
    // Return when the next note should be scheduled
    return startTime + noteDuration + restDuration;
}




/**
 * Rhythmic pattern scheduler - replaces continuous tone
 */
function startRhythmicPlayback(voiceIndex) {
  if (rhythmScheduler) {
    clearInterval(rhythmScheduler);
  }
  
  console.log(`=== STARTING RHYTHMIC PLAYBACK FOR VOICE ${voiceIndex + 1} ===`);
  
  isRhythmicPlaybackActive = true;
  nextScheduledNoteTime = audioManager.audioContext.currentTime + 0.1; // Start slightly in future
  
  // Schedule notes ahead of time for smooth playback
  function scheduleAhead() {
    if (!isRhythmicPlaybackActive) return;
    
    const currentTime = audioManager.audioContext.currentTime;
    const scheduleAheadTime = 0.5; // Schedule 500ms ahead
    
    // Schedule notes while we're within the lookahead window
    while (nextScheduledNoteTime < currentTime + scheduleAheadTime) {
      nextScheduledNoteTime = scheduleRhythmPattern(voiceIndex, nextScheduledNoteTime);
    }
  }
  
  // Check for new notes to schedule every 50ms
  rhythmScheduler = setInterval(scheduleAhead, 50);
  
  // Schedule first note immediately
  scheduleAhead();
}

/**
 * Stop rhythmic playback
 */
function stopRhythmicPlayback() {
  console.log('=== STOPPING RHYTHMIC PLAYBACK ===');
  
  isRhythmicPlaybackActive = false;
  
  if (rhythmScheduler) {
    clearInterval(rhythmScheduler);
    rhythmScheduler = null;
  }
  
  // Stop all currently playing notes
  currentlyPlayingNotes.forEach(note => {
    try {
      note.oscillator.stop();
    } catch (e) {
      // Already stopped
    }
  });
  
  currentlyPlayingNotes = [];
  nextScheduledNoteTime = 0;
}

/**
 * Updated preview function with rhythmic playback
 */
async function previewVoiceRhythmic(voiceIndex) {
  console.log('=== PREVIEW VOICE (rhythmic) ===', voiceIndex);
  
  if (!audioManager || !audioManager.isInitialized) {
    if (!audioManager) {
      audioManager = new AudioManager();
    }
    await audioManager.initialize();
    
    if (!audioManager.isInitialized) {
      console.log('Failed to initialize audio manager');
      return;
    }
    console.log('Audio manager ready');
  }
  
  const voiceControls = document.querySelector('.voice-controls');
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  
  if (previewButton.textContent === 'STOP') {
    console.log('Stopping rhythmic preview...');
    stopRhythmicPlayback();
    // ← stopTestClock() DELETED
    resetParameterValues();
    
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
  
  } else {
    console.log('Starting rhythmic preview...');
    
    // Show current parameter settings
    const rhythmParam = voiceData[voiceIndex].parameters['RHYTHMS'];
    const restParam = voiceData[voiceIndex].parameters['RESTS'];
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    
    console.log('Settings:', {
      rhythm: `${rhythmParam.min}-${rhythmParam.max} (behavior: ${rhythmParam.behavior}%)`,
      rest: `${restParam.min}-${restParam.max} (behavior: ${restParam.behavior}%)`,
      melodic: `${melodicParam.min}-${melodicParam.max} (behavior: ${melodicParam.behavior}%)`
    });
    
    // ← startTestClock(voiceIndex) DELETED
    
    // Start rhythmic note pattern
    startRhythmicPlayback(voiceIndex);
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log('Rhythmic preview started');
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


  
 // 3. Connect dropdown selectors (Sound, Rhythms, Rests) - WITH VALIDATION
const dropdowns = parameterSection.querySelectorAll('select.param-select, select.sound-select');
console.log(`Found ${dropdowns.length} dropdowns to connect`);

dropdowns.forEach((dropdown) => {
  // CORRECT - use same method as TEMPO sliders
const row = dropdown.closest('.row-container-content');
const rollup = row ? row.closest('.parameter-rollup') : null;
const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Dropdown';

  
  // Determine if this is min/max dropdown or single dropdown
  const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
  const isMinMax = dropdownLabel === 'Minimum' || dropdownLabel === 'Maximum';
  
  console.log(`Connecting dropdown: ${paramName} (${dropdownLabel || 'single'})`);
  
  // Remove existing event listeners
  dropdown.onchange = null;
  
  // Add new event listener WITH VALIDATION
  dropdown.onchange = function(e) {
    const value = parseInt(e.target.value);
    
    if (paramName === 'SOUND') {
      // Single dropdown for sound selection
      voiceData[currentVoice].parameters[paramName] = value;
      console.log(`✅ ${paramName}: ${gmSounds[value]}`);
      
    } else if (isMinMax && voiceData[currentVoice].parameters[paramName]) {
      // Dual dropdown (Rhythms/Rests) WITH VALIDATION
      const paramData = voiceData[currentVoice].parameters[paramName];
      
      if (dropdownLabel === 'Minimum') {
        // Check if new minimum is <= current maximum
        if (value <= paramData.max) {
          paramData.min = value;
          console.log(`✅ ${paramName} minimum: ${value}`);
        } else {
          // Invalid: minimum > maximum
          dropdown.value = paramData.min; // Reset to previous valid value
          console.warn(`❌ VALIDATION ERROR: ${paramName} minimum (${value}) cannot be greater than maximum (${paramData.max})`);
          alert('Minimum must be less than Maximum.');
        }
        
      } else if (dropdownLabel === 'Maximum') {
        // Check if new maximum is >= current minimum
        if (value >= paramData.min) {
          paramData.max = value;
          console.log(`✅ ${paramName} maximum: ${value}`);
        } else {
          // Invalid: maximum < minimum
          dropdown.value = paramData.max; // Reset to previous valid value
          console.warn(`❌ VALIDATION ERROR: ${paramName} maximum (${value}) cannot be less than minimum (${paramData.min})`);
          alert('Minimum must be less than Maximum.');
        }
      }
    }
  };
});

  
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
  
  timingSliders.forEach((slider) => {
    const timingContainer = slider.closest('.timing-control-container');
    const controlLabel = timingContainer ? timingContainer.querySelector('.timing-control-label') : null;
    const controlType = controlLabel ? controlLabel.textContent.trim().toLowerCase() : 'unknown';
    
    console.log(`Connecting timing slider: ${controlType}`);
    
    // Remove existing event listeners
    slider.oninput = null;
    slider.onchange = null;
    
    // Add new event listeners with tooltips
    slider.oninput = function(e) {
      const value = parseInt(e.target.value);
      
      // Update voiceData
      if (voiceData[currentVoice].parameters['LIFE SPAN']) {
        voiceData[currentVoice].parameters['LIFE SPAN'][controlType] = value;
        console.log(`✅ LIFE SPAN ${controlType}: ${value}`);
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

class VoiceManager {
  constructor(audioContext, masterGainNode) {
    this.audioContext = audioContext;
    this.masterGainNode = masterGainNode;
    this.voices = [];
    this.isPlaying = false;
    
    // Create 16 independent voice instances
    for (let i = 0; i < 16; i++) {
      this.voices.push(new Voice(audioContext, i, masterGainNode));
    }
    
    console.log('VoiceManager initialized with 16 voices');
  }
  
  /**
   * Start all enabled voices playing together
   */
  startAllVoices() {
    if (this.isPlaying) {
      this.stopAllVoices();
    }
    
    this.isPlaying = true;
    
    // Start each enabled voice
    this.voices.forEach((voice, index) => {
      if (voiceData[index].enabled) {
        voice.startPlaying();
        console.log(`Started voice ${index + 1}`);
      }
    });
    
    console.log('Multi-voice playback started');
  }
  
  /**
   * Stop all voices
   */
  stopAllVoices() {
    this.isPlaying = false;
    
    this.voices.forEach((voice, index) => {
      voice.stopPlaying();
    });
    
    console.log('All voices stopped');
  }
  
  
  
  /**
   * Get enabled voices for coordination
   */
  getEnabledVoices() {
    return this.voices.filter((voice, index) => voiceData[index].enabled);
  }
}

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
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['SOUND'];
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
  console.log(`VoiceManager Voice ${this.voiceIndex + 1} tempo: ${voiceTempo} BPM (Master: ${masterTempo} BPM)`);
  
  const noteDuration = getRhythmDuration(rhythmIndex, voiceTempo);
  const restDuration = getRestDuration(restIndex, voiceTempo);
  
  console.log(`VoiceManager Note: ${noteDuration.toFixed(3)}s, Rest: ${restDuration.toFixed(3)}s`);
  
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
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['SOUND'];
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

// Global voice manager instance
let voiceManager = null;

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
    icon: "🎹",
    expanded: true // Start expanded
  },
    mixing: {
    title: "MIXING & LEVELS",
    icon: "🎚️", 
    expanded: true // Start expanded
  },
  rhythm: {
    title: "RHYTHM & TIMING", 
    icon: "🥁",
    expanded: true // Start expanded
  },
  modulation: {
    title: "MODULATION EFFECTS",
    icon: "🌊",
    expanded: false // Start collapsed
  },
  spatial: {
    title: "SPATIAL EFFECTS",
    icon: "🏛️",
    expanded: false // Start collapsed
  }
};

// =============================================================================
// ROLL UP CODE
// =============================================================================
// Global rollup state
let rollupState = {};

// Initialize rollup state - START ALL COLLAPSED
function initializeRollupState() {
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
}

// END ROLL UP CODE
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
  updateMasterTempoDisplay();
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
  if (!parameterRollupState['SOUND']) toggleParameterRollup('SOUND');
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
// =============================================================================




















