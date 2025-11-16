// Parameter definitions
const parameterDefinitions = [
  // INSTRUMENT & SOUND ROLLUP - CORRECTED ORDER
  { name: "INSTRUMENT", type: "dropdown", options: "gm-sounds", rollup: "instrument" },
  { name: "MELODIC RANGE", type: "single-dual", min: 21, max: 108, rollup: "instrument" },
  { name: "POLYPHONY", type: "single-dual", min: 1, max: 16, rollup: "instrument" },
  { name: "ATTACK VELOCITY", type: "single-dual", min: 0, max: 127, rollup: "instrument" },
  { name: "DETUNING", type: "single-dual", min: -50, max: 50, rollup: "instrument" },
  { name: "PORTAMENTO GLIDE TIME", type: "single-dual", min: 0, max: 100, rollup: "instrument" },
  
  // RHYTHM & TIMING ROLLUP
  { name: "TEMPO (BPM)", type: "single-dual", min: 40, max: 240, rollup: "rhythm" },
  { name: "RHYTHMS", type: "checkbox-group", options: "rhythms", rollup: "rhythm" },
  { name: "RESTS", type: "checkbox-group", options: "rests", rollup: "rhythm" },
  { name: "LIFE SPAN", type: "life-span", rollup: "rhythm" },  // NEW PARAMETER
  
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

// Life Span Validation Constants  
const MIN_LIFE_SPAN_MS = 5000;        // 5 seconds minimum
const MAX_LIFE_SPAN_MS = 3600000;     // 60 minutes maximum (1 hour)
const DEFAULT_LIFE_SPAN_MS = 300000;  // 5 minutes default


// Life Span Helper Functions
function formatMsToMMSS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function parseMMSSToMs(timeString) {
  const match = timeString.match(/^(\d+):([0-5]\d)$/);
  if (!match) return null;
  
  const minutes = parseInt(match[1]);
  const seconds = parseInt(match[2]);
  const totalMs = (minutes * 60 + seconds) * 1000;
  
  if (totalMs > MAX_LIFE_SPAN_MS) return null;  // Now correctly 60 minutes
  return totalMs;
}


function calculateBeatsFromTime(timeMs, beatUnit, currentTempo) {
  const timeSeconds = timeMs / 1000;
  const beatDuration = 60 / currentTempo;
  const rhythmInfo = rhythmDurations[beatUnit] || rhythmDurations[7]; // Default to quarter notes
  const unitDuration = rhythmInfo.beats * beatDuration;
  return Math.round(timeSeconds / unitDuration);
}

function createLifeSpanBeatFormatter(voiceIndex, beatUnit) {
  return {
    to: function(timeMs) {
      const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
      const currentTempo = tempoParam ? (tempoParam.min + tempoParam.max) / 2 : 120;
      
      if (timeMs >= 999999999) return '∞ (∞)'; // Handle infinity
      if (timeMs <= 0) return '0 beats (0:00)';
      
      const beats = calculateBeatsFromTime(timeMs, beatUnit, currentTempo);
      const timeStr = formatMsToMMSS(timeMs);
      return `${beats} beats (${timeStr})`;
    },
    from: function(value) {
      if (value === '∞ (∞)') return 999999999;
      const match = value.match(/\((\d+:\d+)\)/);
      if (match) {
        return parseMMSSToMs(match[1]) || 0;
      }
      return parseFloat(value) || 0;
    }
  };
}

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
const rhythmOptions = [
  "Thirty-second Notes",
  "Thirty-second Note Triplets",
  "Sixteenth Notes",
  "Sixteenth Note Triplets", 
  "Eighth Notes",
  "Eighth Note Triplets",
  "Quarter Note Triplets",
  "Quarter Notes",
  "Half Note Triplets",
  "Half Notes",
  "Whole Note Triplets",
  "Whole Note",
  "Two Whole Notes",
  "Three Whole Notes",
  "Four Whole Notes"
];

const restOptions = [
  "No Rests",
  "Thirty-second Notes",
  "Thirty-second Note Triplets",
  "Sixteenth Notes",
  "Sixteenth Note Triplets",
  "Eighth Notes",
  "Eighth Note Triplets",
  "Quarter Note Triplets",
  "Quarter Notes",
  "Half Note Triplets",
  "Half Notes",
  "Whole Note Triplets",
  "Whole Note",
  "Two Whole Notes",
  "Three Whole Notes",
  "Four Whole Notes"
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
class MasterClock {
  constructor() {
    this.resolution = 1;
    this.isRunning = false;
    this.intervalId = null;
    this.startTime = 0;
    this.currentTime = 0;
    this.lastUpdateTime = 0;
    this.lastParameterUpdate = 0;
    
    this.masterStartTime = 0;
    this.elapsedTime = 0;
    
    console.log('Enhanced Master Clock initialized - 1ms resolution for voice coordination');
  }
  
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
    
    this.intervalId = setInterval(() => {
      this.update();
    }, this.resolution);
    
    console.log('🕐 Enhanced Master Clock started - 1ms precision active');
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    
    console.log('🕐 Master Clock stopped');
  }

  update() {
    const now = Date.now();
    this.currentTime = now;
    this.elapsedTime = now - this.masterStartTime;
    
    if (now - this.lastParameterUpdate > 50) {
      this.updateAllParameters();
      this.lastParameterUpdate = now;
    }
    
    if (voiceClockManager && voiceClockManager.isInitialized) {
      voiceClockManager.updateAllVoices();
    }
    
    this.lastUpdateTime = now;
  }
  
  getElapsedTime() {
    return this.elapsedTime;
  }
  
  getElapsedSeconds() {
    return this.elapsedTime / 1000;
  }
  
  getMasterTime() {
    return this.currentTime;
  }
  
  isActive() {
    return this.isRunning;
  }
  
  updateAllParameters() {
    const deltaTime = Math.min((this.currentTime - this.lastUpdateTime) / 1000, 0.05);
    
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (voiceData[voiceIndex] && voiceData[voiceIndex].enabled) {
        this.updateVoiceParameters(voiceIndex, deltaTime);
      }
    }
  }
  
  updateVoiceParameters(voiceIndex, deltaTime) {
    const voice = voiceData[voiceIndex];
    if (!voice) return;
    
    this.updateParameter(voice.parameters['VOLUME'], deltaTime);
    this.updateParameter(voice.parameters['STEREO BALANCE'], deltaTime);
    this.updateParameter(voice.parameters['MELODIC RANGE'], deltaTime);
    this.updateParameter(voice.parameters['ATTACK VELOCITY'], deltaTime);
    this.updateParameter(voice.parameters['DETUNING'], deltaTime);
    this.updateParameter(voice.parameters['PORTAMENTO GLIDE TIME'], deltaTime);
    this.updateParameter(voice.parameters['TEMPO (BPM)'], deltaTime);
    this.updateParameter(voice.parameters['REVERB'], deltaTime);
    this.updateParameter(voice.parameters['DETUNING'], deltaTime);

    this.updateEffectParameter(voice.parameters['TREMOLO'], deltaTime);
    this.updateEffectParameter(voice.parameters['CHORUS'], deltaTime);
    this.updateEffectParameter(voice.parameters['PHASER'], deltaTime);
    this.updateEffectParameter(voice.parameters['DELAY'], deltaTime);
    
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
let voiceClockManager = null;

// Master Clock System Variables
let masterTempo = 120;
let tempoScrollInterval = null;
let tempoScrollDirection = 0;

console.log('Master Clock System initialized at', masterTempo, 'BPM');

// Global state
let currentVoice = 0;
let voiceData = [];

// Initialize voice data structure - WITH SENSIBLE DEFAULTS
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
          min: 1,
          max: 4,
          behavior: 25
        };
      } else if (param.name === 'LIFE SPAN') {
        // Initialize Life Span parameter with defaults
        voice.parameters[param.name] = {
          maxTimeMinutes: 5,
          beatUnit: 7, // Quarter Notes (index in rhythmOptions)
          lifeSpan1: {
            enter: 0,
            exit: 999999999 // Represents infinity
          },
          lifeSpan2: {
            enter: 0,
            exit: 0 // Disabled
          },
          lifeSpan3: {
            enter: 0,
            exit: 0 // Disabled
          },
          repeat: false,
          behavior: 0
        };
      } else if (param.type === 'dropdown') {
        if (param.name === 'INSTRUMENT') {
          voice.parameters[param.name] = 0;
        } else {
          voice.parameters[param.name] = 0;
        }
      } else if (param.type === 'dual-dropdown') {
  voice.parameters[param.name] = {
    min: 0,
    max: 0,
    behavior: 50
  };
} else if (param.type === 'checkbox-group') {
  if (param.name === 'RHYTHMS') {
    voice.parameters[param.name] = {
      selectedValues: [7],  // Default: Quarter notes only
      behavior: 50
    };
    console.log(`🎵 Voice ${i + 1} RHYTHMS initialized: Quarter Notes`);
  } else if (param.name === 'RESTS') {
    voice.parameters[param.name] = {
      selectedValues: [0],  // Default: No rests
      behavior: 50
    };
    console.log(`🎵 Voice ${i + 1} RESTS initialized: No Rests`);
  } else {
    voice.parameters[param.name] = {
      selectedValues: [],
      behavior: 50
    };
  }

      } else if (param.type === 'single-dual') {
        if (typeof param.min === 'undefined' || typeof param.max === 'undefined') {
          console.error(`Missing min/max for parameter: ${param.name}`);
        }
        
        if (param.name === 'MELODIC RANGE') {
          voice.parameters[param.name] = {
            min: 60,
            max: 60,
            behavior: 50,
            selectedNotes: [60]
          };
        } else if (param.name === 'DETUNING') {
          voice.parameters[param.name] = {
            min: 0,
            max: 0,
            behavior: 0
          };
        } else if (param.name === 'PORTAMENTO GLIDE TIME') {
          voice.parameters[param.name] = {
            min: 0,
            max: 0,
            behavior: 0
          };
        } else {
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

        if (param.name === 'TREMOLO' || param.name === 'CHORUS' || param.name === 'PHASER') {
          voice.parameters[param.name] = {
            speed: {
                min: 0,
                max: 0
            },
            depth: {
                min: 0,
                max: 0
            },
            behavior: 0
        };
         } else if (param.name === 'REVERB') {
          voice.parameters[param.name] = {
            speed: {
              min: 0,
              max: 0
            },
            depth: {
              min: 0,
              max: 0
            },
            behavior: 0
          };
        } else if (param.name === 'DELAY') {
          voice.parameters[param.name] = {
            speed: {
              min: 0,
              max: 0
            },
            depth: {
              min: 0,
              max: 0
            },
            feedback: {   
              min: 0,
              max: 0
            },
            behavior: 0
          };
        } else {
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
      }
    });
    
    voiceData.push(voice);
  }
  
  console.log('Voices initialized with sensible defaults:');
  console.log('- Sound: Acoustic Grand Piano');
  console.log('- Melodic Range: Middle C (C4) selected in piano');
  console.log('- Rhythms: Quarter Notes');
  console.log('- Rests: No Rests (continuous playing)');
  console.log('- Life Span: Span 1 active (0 to ∞), Spans 2&3 disabled, no repeat');
  console.log('- Effects: ALL OFF by default (Tremolo, Chorus, Phaser, Reverb, Delay)');
  console.log('- Other parameters: 25%-75% of their ranges');
}

// Life Span UI Creation Functions
function createLifeSpanControl(param, voiceIndex) {
  console.log(`🕐 Creating Life Span control for Voice ${voiceIndex + 1}`);
  
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-slider'; // Use standard class
  
  // GET THE STORED MAX TIME VALUE
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const storedMaxTimeMs = lifeSpanParam.maxTimeMs || 300000; // Default to 5 minutes if not set
  const storedMaxTimeFormatted = formatMsToMMSS(storedMaxTimeMs);
  
  console.log(`📖 Loading stored Max Time for Voice ${voiceIndex + 1}: ${storedMaxTimeFormatted} (${storedMaxTimeMs}ms)`);
  
  // Max Time and Beat Unit Controls
  const settingsRow = document.createElement('div');
  settingsRow.className = 'life-span-settings';
  settingsRow.style.cssText = `
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    width: 100%;
  `;
  settingsRow.innerHTML = `
    <div class="max-time-container" style="flex: 1;">
      <label>Total Time Length:</label>
      <input type="text" class="max-time-input" value="${storedMaxTimeFormatted}" placeholder="0:05" maxlength="5" 
             title="Enter time in MM:SS format (minimum: 0:05, maximum: 60:00)"
             style="width: 100%; padding: 4px; margin-left: 5px;" />
    </div>
    <div class="beat-unit-container" style="flex: 1;">
      <label>Beat Unit:</label>
      <select class="beat-unit-select" style="width: 100%; padding: 4px; margin-left: 5px;">
        ${rhythmOptions.map((option, index) => 
          `<option value="${index}" ${index === lifeSpanParam.beatUnit ? 'selected' : ''}>${option}</option>`
        ).join('')}
      </select>
    </div>
  `;
  wrapper.appendChild(settingsRow);
  
  // Create 3 Life Span sliders with immediate slider creation
  for (let i = 1; i <= 3; i++) {
    const spanContainer = document.createElement('div');
    spanContainer.className = 'slider-wrapper';
    spanContainer.style.cssText = 'width: 100%; margin-bottom: 15px;';
    
    const spanHeader = document.createElement('div');
    spanHeader.className = 'slider-label';
    spanHeader.textContent = `Entrance & Exit ${i}`;
    spanContainer.appendChild(spanHeader);
    
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'life-span-dual-slider';
    sliderWrapper.dataset.spanNumber = i;
    sliderWrapper.style.cssText = 'width: 100%; height: 40px; margin-top: 8px;';
    
    // CREATE THE SLIDER IMMEDIATELY
    const sliderDiv = document.createElement('div');
    sliderWrapper.appendChild(sliderDiv);
    
    // Get Life Span data for this span - use stored maxTimeMs
    const lifeSpanData = voiceData[voiceIndex].parameters['LIFE SPAN'][`lifeSpan${i}`];
    const maxTimeMs = storedMaxTimeMs; // Use stored value
    const beatUnit = lifeSpanParam.beatUnit;
    
    // Create formatter for beat-based tooltips
    const formatter = createLifeSpanBeatFormatter(voiceIndex, beatUnit);
    
    const startEnter = lifeSpanData.enter || 0;
    const startExit = lifeSpanData.exit >= 999999999 ? maxTimeMs : (lifeSpanData.exit || 0);
    
    console.log(`🕐 Creating Life Span ${i} slider with range 0-${formatMsToMMSS(maxTimeMs)}`);
    console.log(`   Start values: enter=${formatMsToMMSS(startEnter)}, exit=${startExit >= 999999999 ? '∞' : formatMsToMMSS(startExit)}`);
    
    try {
      noUiSlider.create(sliderDiv, {
        start: [startEnter, Math.min(startExit, maxTimeMs)],
        connect: true,
        range: { min: 0, max: maxTimeMs },
        step: 1000, // 1 second steps
        tooltips: [true, true],
        format: formatter
      });
      
      console.log(`✅ Life Span ${i} slider created successfully`);
    } catch (error) {
      console.error(`❌ Error creating Life Span ${i} slider:`, error);
    }
    
    spanContainer.appendChild(sliderWrapper);
    wrapper.appendChild(spanContainer);
  }
  
  return wrapper;
}


function createLifeSpanBehaviorContainer(param, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'behavior-container life-span-behavior';
  
  const label = document.createElement('label');
  label.textContent = 'Repeat';
  label.style.cssText = 'display: block; text-align: center; margin-bottom: 8px; font-size: 18px; font-weight: bold;';
  wrapper.appendChild(label);
  
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'life-span-behavior-controls';
  controlsWrapper.style.cssText = 'display: flex; justify-content: center; align-items: center;';
  
  const repeatContainer = document.createElement('div');
  repeatContainer.className = 'repeat-container';
  repeatContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center;';
  
  const repeatCheckbox = document.createElement('input');
  repeatCheckbox.type = 'checkbox';
  repeatCheckbox.className = 'repeat-checkbox';
  repeatCheckbox.style.cssText = `
    width: 20px; 
    height: 20px; 
    cursor: pointer;
    transform: scale(1.2);
  `;
  
  // READ THE STORED VALUE from voiceData
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const storedRepeatValue = lifeSpanParam ? lifeSpanParam.repeat : false;
  repeatCheckbox.checked = storedRepeatValue;
  
  console.log(`📖 Loading stored Repeat value for Voice ${voiceIndex + 1}: ${storedRepeatValue}`);
  
  repeatContainer.appendChild(repeatCheckbox);
  controlsWrapper.appendChild(repeatContainer);
  wrapper.appendChild(controlsWrapper);
  
  return wrapper;
}


function rebuildLifeSpanSliders(container, voiceIndex) {
  console.log('🔄 Rebuilding Life Span sliders with new max time...');
  
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const maxTimeMs = lifeSpanParam.maxTimeMs; // Now directly in milliseconds
  const beatUnit = lifeSpanParam.beatUnit;
  
  console.log(`New max time: ${formatMsToMMSS(maxTimeMs)} (${maxTimeMs}ms)`);
  
  
  // Find all Life Span sliders in this container
  const spanSliders = container.querySelectorAll('.life-span-dual-slider');
  
  spanSliders.forEach((sliderContainer) => {
    const spanNumber = parseInt(sliderContainer.dataset.spanNumber);
    const existingSlider = sliderContainer.querySelector('.noUi-target');
    
    // Get current values before destroying
    let currentEnter = 0;
    let currentExit = 0;
    
    if (existingSlider && existingSlider.noUiSlider) {
      try {
        const values = existingSlider.noUiSlider.get();
        currentEnter = parseLifeSpanValue(values[0]);
        currentExit = parseLifeSpanValue(values[1]);
        
        // Destroy existing slider
        existingSlider.noUiSlider.destroy();
        existingSlider.remove();
        
        console.log(`🗑️ Destroyed Life Span ${spanNumber} slider, preserving values: enter=${formatMsToMMSS(currentEnter)}, exit=${currentExit >= 999999999 ? '∞' : formatMsToMMSS(currentExit)}`);
      } catch (e) {
        console.warn(`Warning destroying Life Span ${spanNumber} slider:`, e);
      }
    } else {
      // Get values from data if no existing slider
      const spanData = lifeSpanParam[`lifeSpan${spanNumber}`];
      currentEnter = spanData.enter || 0;
      currentExit = spanData.exit || 0;
    }
    
    // Clamp existing values to new range
    currentEnter = Math.min(currentEnter, maxTimeMs);
    currentExit = Math.min(currentExit, maxTimeMs);
    
    // Handle infinity case
    if (currentExit >= 999999999) {
      currentExit = maxTimeMs; // Set to new max time
    }
    
    // Update data with clamped values
    lifeSpanParam[`lifeSpan${spanNumber}`].enter = currentEnter;
    lifeSpanParam[`lifeSpan${spanNumber}`].exit = currentExit;
    
    // Create new slider div
    const newSliderDiv = document.createElement('div');
    sliderContainer.appendChild(newSliderDiv);
    
    // Create new formatter with updated beat unit
    const formatter = createLifeSpanBeatFormatter(voiceIndex, beatUnit);
    
    try {
      noUiSlider.create(newSliderDiv, {
        start: [currentEnter, currentExit],
        connect: true,
        range: { min: 0, max: maxTimeMs },
        step: 1000,
        tooltips: [true, true],
        format: formatter
      });
      
      // Reconnect the update handler
      newSliderDiv.noUiSlider.on('update', function(values) {
        const enterValue = values[0];
        const exitValue = values[1];
        
        const enterMs = parseLifeSpanValue(enterValue);
        const exitMs = parseLifeSpanValue(exitValue);
        
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].enter = enterMs;
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].exit = exitMs;
        
        console.log(`✅ Life Span ${spanNumber}: ${formatMsToMMSS(enterMs)} - ${exitMs === 999999999 ? '∞' : formatMsToMMSS(exitMs)}`);
      });
      
      console.log(`✅ Rebuilt Life Span ${spanNumber} slider with new range 0-${formatMsToMMSS(maxTimeMs)}`);
      
    } catch (error) {
      console.error(`❌ Error rebuilding Life Span ${spanNumber} slider:`, error);
    }
  });
  
  console.log(`🎯 All Life Span sliders rebuilt - max time tooltips now show: ${formatMsToMMSS(maxTimeMs)}`);
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

function createCheckboxGroup(optionsType, paramName, voiceIndex) {
  console.log(`🎵 Creating checkbox group for ${paramName}, voice ${voiceIndex + 1}`);
  
  const wrapper = document.createElement('div');
  wrapper.className = 'checkbox-group-container';
  
  let options = [];
  if (optionsType === 'rhythms') options = rhythmOptions;
  else if (optionsType === 'rests') options = restOptions;
  
  const checkboxesWrapper = document.createElement('div');
  checkboxesWrapper.className = 'checkboxes-wrapper';
  
  options.forEach((option, index) => {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${paramName}-${voiceIndex}-${index}`;
    checkbox.value = index;
    checkbox.className = 'rhythm-checkbox';
    
    // Check if this value is selected
    const param = voiceData[voiceIndex].parameters[paramName];
    const selectedValues = param.selectedValues || [];
    checkbox.checked = selectedValues.includes(index);
    
    checkbox.onchange = (e) => {
      updateCheckboxSelection(voiceIndex, paramName, index, e.target.checked);
    };
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = option;
    label.className = 'checkbox-label';
    
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    checkboxesWrapper.appendChild(checkboxContainer);
  });
  
  wrapper.appendChild(checkboxesWrapper);
  
  console.log(`✅ Created ${options.length} checkboxes for ${paramName}`);
  return wrapper;
}

function updateCheckboxSelection(voiceIndex, paramName, index, isChecked) {
  const param = voiceData[voiceIndex].parameters[paramName];
  
  if (!param.selectedValues) {
    param.selectedValues = [];
  }
  
  // SPECIAL CASE: "No Rests" checkbox (index 0 in RESTS parameter)
  if (paramName === 'RESTS') {
    if (index === 0 && isChecked) {
      // "No Rests" was just checked - clear all other rests
      console.log('🎵 "No Rests" checked - clearing all other rest selections');
      param.selectedValues = [0];
      
      // Uncheck all other checkboxes in the UI
      const allCheckboxes = document.querySelectorAll(`input[id^="RESTS-${voiceIndex}-"]`);
      allCheckboxes.forEach(cb => {
        if (parseInt(cb.value) !== 0) {
          cb.checked = false;
        }
      });
      
    } else if (index !== 0 && isChecked) {
      // Another rest was checked - uncheck "No Rests"
      console.log('🎵 Rest value checked - unchecking "No Rests"');
      param.selectedValues = param.selectedValues.filter(v => v !== 0);
      
      // Uncheck "No Rests" in the UI
      const noRestsCheckbox = document.querySelector(`input[id="RESTS-${voiceIndex}-0"]`);
      if (noRestsCheckbox) {
        noRestsCheckbox.checked = false;
      }
      
      // Add the newly checked rest
      if (!param.selectedValues.includes(index)) {
        param.selectedValues.push(index);
        param.selectedValues.sort((a, b) => a - b);
      }
      
    } else if (index === 0 && !isChecked) {
      // "No Rests" was unchecked - just remove it
      param.selectedValues = param.selectedValues.filter(v => v !== 0);
      
    } else {
      // Regular rest unchecked
      param.selectedValues = param.selectedValues.filter(v => v !== index);
    }
  } else {
  // RHYTHMS - normal behavior
  if (isChecked) {
    if (!param.selectedValues.includes(index)) {
      param.selectedValues.push(index);
      param.selectedValues.sort((a, b) => a - b);
    }
  } else {
    param.selectedValues = param.selectedValues.filter(v => v !== index);
    
    // FALLBACK: If all rhythms are now unchecked, auto-check Quarter Notes (index 7)
    if (param.selectedValues.length === 0) {
      console.log('⚠️ All rhythms unchecked - auto-selecting Quarter Notes (index 7)');
      param.selectedValues = [7];
      
      // Check the Quarter Notes checkbox in the UI
      const quarterNotesCheckbox = document.querySelector(`input[id="RHYTHMS-${voiceIndex}-7"]`);
      if (quarterNotesCheckbox) {
        quarterNotesCheckbox.checked = true;
        console.log('✅ Quarter Notes checkbox auto-checked in UI');
      }
    }
  }
}


  const optionsList = paramName === 'RHYTHMS' ? rhythmOptions : restOptions;
  const selectedNames = param.selectedValues.map(i => optionsList[i]);
  
  console.log(`✅ ${paramName} Voice ${voiceIndex + 1} selection (${param.selectedValues.length}):`, selectedNames);
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
        
        setTimeout(() => {
            pianoContainer.pianoInstance = new InteractivePiano(pianoContainer, voiceIndex);
        }, 100);
        
        return wrapper;
    }
    
    const label = document.createElement('div');
    label.className = 'slider-label';
    label.textContent = 'Range';
    wrapper.appendChild(label);
    
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';
    
    const sliderDiv = document.createElement('div');
    
    const voiceParam = voiceData[voiceIndex].parameters[param.name];
    
    if (isNaN(voiceParam.min) || isNaN(voiceParam.max)) {
        voiceParam.min = param.min + (param.max - param.min) * 0.25;
        voiceParam.max = param.min + (param.max - param.min) * 0.75;
    }

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
            
            if (audioManager && audioManager.isPlaying) {
                if (param.name === 'VOLUME') {
                    const currentVolume = (min + max) / 2;
                    audioManager.setVolumeRealTime(currentVolume);
                    console.log(`🔊 Real-time volume update: ${currentVolume}%`);
                } else if (param.name === 'STEREO BALANCE') {
                    const currentBalance = (min + max) / 2;
                    audioManager.setBalanceRealTime(currentBalance);
                    console.log(`🎛️ Real-time balance update: ${currentBalance}%`);
                }
            }
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
  console.log(`🔧 createMultiDualSlider called for ${param.name}, voiceIndex=${voiceIndex}`);
  
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-slider';
  
  const voiceParam = voiceData[voiceIndex].parameters[param.name];
  
  if (!voiceParam) {
    console.error(`Missing parameter data for ${param.name}`);
    return wrapper;
  }
  
  console.log(`   voiceParam for ${param.name}:`, voiceParam);
  
  // SPEED/TIME SLIDER
  const speedWrapper = document.createElement('div');
  speedWrapper.className = 'slider-wrapper';
  
  const speedLabel = document.createElement('div');
  speedLabel.className = 'slider-label';
  
  if (param.name === 'REVERB' || param.name === 'DELAY') {
    speedLabel.textContent = 'Time';
  } else {
    speedLabel.textContent = 'Speed';
  }
  
  speedWrapper.appendChild(speedLabel);
  
  const speedDiv = document.createElement('div');
  
  let speedFormatter = {
    to: value => Math.round(value).toString(),
    from: value => Number(value)
  };
  
if (param.name === 'REVERB') {
  speedFormatter = {
    to: value => {
      if (value <= 1) return '0s';
      const timeSeconds = 0.5 + ((value - 1) / 99) * 5.5;
      return timeSeconds.toFixed(1) + 's';
    },
    from: value => {
      if (value === '0s' || value === '0') return 0;
      const numStr = value.replace('s', '');
      const seconds = parseFloat(numStr);
      if (seconds <= 0.5) return 0;
      return 1 + ((seconds - 0.5) / 5.5) * 99;
    }
  };

} if (param.name === 'DELAY') {
  const musicalFormatter = createDelayTimeFormatter(voiceIndex);
  
  speedFormatter = {
    to: function(value) {
      if (value <= 0.001) return '0ms';
      return musicalFormatter.to(value);
    },
    from: function(value) {
      if (value === '0ms' || value === '0') return 0;
      return musicalFormatter.from(value);
    }
  };
}

  const speedMin = Number(voiceParam.speed?.min) || 0;
  const speedMax = Number(voiceParam.speed?.max) || 0;
  
  console.log(`📊 Creating ${param.name} speed slider: start=[${speedMin}, ${speedMax}]`);
  
  if (speedDiv.noUiSlider) {
    speedDiv.noUiSlider.destroy();
  }

  noUiSlider.create(speedDiv, {
    start: [speedMin, speedMax],
    connect: true,
    range: { min: param.min, max: param.max },
    step: 1,
    tooltips: [true, true],
    format: speedFormatter
  });
  
  const updateSpeedValues = () => {
    if (!speedDiv.noUiSlider) return;
    
    try {
      const values = speedDiv.noUiSlider.get();
      const min = Math.round(Number(speedFormatter.from(values[0])));
      const max = Math.round(Number(speedFormatter.from(values[1])));
      
      voiceData[voiceIndex].parameters[param.name].speed.min = min;
      voiceData[voiceIndex].parameters[param.name].speed.max = max;
      
      console.log(`✅ ${param.name} speed updated: ${min}-${max}`);
    } catch (error) {
      console.warn(`Error updating ${param.name} speed:`, error);
    }
  };
  
  speedDiv.noUiSlider.on('update', updateSpeedValues);
  updateSpeedValues();
  
  speedWrapper.appendChild(speedDiv);
  
  // DEPTH/MIX SLIDER
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
  
  const depthMin = Number(voiceParam.depth?.min) || 0;
  const depthMax = Number(voiceParam.depth?.max) || 0;
  
  console.log(`📊 Creating ${param.name} depth slider: start=[${depthMin}, ${depthMax}]`);
  
  if (depthDiv.noUiSlider) {
    depthDiv.noUiSlider.destroy();
  }

  noUiSlider.create(depthDiv, {
    start: [depthMin, depthMax],
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
    if (!depthDiv.noUiSlider) return;
    
    try {
      const values = depthDiv.noUiSlider.get();
      const min = Math.round(Number(values[0].replace('%', '')));
      const max = Math.round(Number(values[1].replace('%', '')));
      
      voiceData[voiceIndex].parameters[param.name].depth.min = min;
      voiceData[voiceIndex].parameters[param.name].depth.max = max;
      
      console.log(`✅ ${param.name} depth updated: ${min}-${max}%`);
    } catch (error) {
      console.warn(`Error updating ${param.name} depth:`, error);
    }
  };
  
  depthDiv.noUiSlider.on('update', updateDepthValues);
  updateDepthValues();
  
  depthWrapper.appendChild(depthDiv);
  
  wrapper.appendChild(speedWrapper);
  wrapper.appendChild(depthWrapper);
  
  // FEEDBACK SLIDER (for DELAY only)
  if (param.name === 'DELAY') {
    const feedbackWrapper = document.createElement('div');
    feedbackWrapper.className = 'slider-wrapper';
    
    const feedbackLabel = document.createElement('div');
    feedbackLabel.className = 'slider-label';
    feedbackLabel.textContent = 'Feedback';
    feedbackWrapper.appendChild(feedbackLabel);
    
    const feedbackDiv = document.createElement('div');
    
    if (!voiceParam.feedback) {
      voiceParam.feedback = { min: 0, max: 0 };
    }
    
    const feedbackMin = Number(voiceParam.feedback?.min) || 0;
    const feedbackMax = Number(voiceParam.feedback?.max) || 0;
    
    console.log(`📊 Creating ${param.name} feedback slider: start=[${feedbackMin}, ${feedbackMax}]`);
    
    if (feedbackDiv.noUiSlider) {
      feedbackDiv.noUiSlider.destroy();
    }

    noUiSlider.create(feedbackDiv, {
      start: [feedbackMin, feedbackMax],
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
      if (!feedbackDiv.noUiSlider) return;
      
      try {
        const values = feedbackDiv.noUiSlider.get();
        const min = Math.round(Number(values[0].replace('%', '')));
        const max = Math.round(Number(values[1].replace('%', '')));
        
        voiceData[voiceIndex].parameters[param.name].feedback.min = min;
        voiceData[voiceIndex].parameters[param.name].feedback.max = max;
        
        console.log(`✅ ${param.name} feedback updated: ${min}-${max}%`);
      } catch (error) {
        console.warn(`Error updating ${param.name} feedback:`, error);
      }
    };
    
    feedbackDiv.noUiSlider.on('update', updateFeedbackValues);
    updateFeedbackValues();
    
    feedbackWrapper.appendChild(feedbackDiv);
    wrapper.appendChild(feedbackWrapper);
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

function createRow(param, voiceIndex) {
  const row = document.createElement('div');
  row.className = 'row-container';
  
  if (param.name === 'MELODIC RANGE') {
    row.classList.add('melodic-range-row');
  }

  const label = document.createElement('div');
  label.className = 'label-container';
  label.textContent = param.name;
  row.appendChild(label);

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';

  const range = document.createElement('div');
  range.className = 'range-container';

if (param.type === 'dropdown') {
  range.appendChild(createDropdown(param.options, param.name, voiceIndex));
} else if (param.type === 'dual-dropdown') {
  range.appendChild(createDualDropdown(param.options, param.name, voiceIndex));
} else if (param.type === 'checkbox-group') {
  range.appendChild(createCheckboxGroup(param.options, param.name, voiceIndex));
} else if (param.type === 'single-dual') {
  range.appendChild(createDualSlider(param, voiceIndex));
} else if (param.type === 'multi-dual') {
  range.appendChild(createMultiDualSlider(param, voiceIndex));
} else if (param.type === 'life-span') {
  range.appendChild(createLifeSpanControl(param, voiceIndex));
}


  controlsContainer.appendChild(range);

  if (param.type !== 'dropdown' && param.type !== 'life-span') {
    const behaviorContainer = createBehaviorSlider(param, voiceIndex);
    controlsContainer.appendChild(behaviorContainer);
  } else {
    const emptyBehavior = document.createElement('div');
    emptyBehavior.className = 'behavior-container';
    controlsContainer.appendChild(emptyBehavior);
  }

  row.appendChild(controlsContainer);
  return row;
}

// Global rollup state for individual parameters
let parameterRollupState = {};

function initializeParameterRollupState() {
  parameterDefinitions.forEach(param => {
    parameterRollupState[param.name] = false;
  });
  
  console.log('📕 All parameter rollups initialized as collapsed');
}

function renderParameters() {
  const parameterSection = document.getElementById('parameter-section');
  
  if (Object.keys(parameterRollupState).length === 0) {
    initializeParameterRollupState();
  }
  
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
  
  parameterDefinitions.forEach(param => {
    const parameterRollup = createParameterRollup(param, currentVoice);
    parameterSection.appendChild(parameterRollup);
  });
  
  setTimeout(() => {
    connectAllSliders();
  }, 100);
}

function syncVoiceToOthers(sourceVoiceIndex) {
  console.log(`=== SYNCING ALL VOICES TO VOICE ${sourceVoiceIndex + 1} TEMPO ===`);
  
  const sourceTempo = voiceData[sourceVoiceIndex].parameters['TEMPO (BPM)'];
  
  if (!sourceTempo) {
    console.warn('Source voice has no tempo parameter');
    alert('Error: Source voice has no tempo settings to copy.');
    return;
  }
  
  console.log(`Source tempo: ${sourceTempo.min}-${sourceTempo.max} BPM (behavior: ${sourceTempo.behavior}%)`);
  
  let syncedCount = 0;
  for (let i = 0; i < 16; i++) {
    if (i !== sourceVoiceIndex && voiceData[i].parameters['TEMPO (BPM)']) {
      voiceData[i].parameters['TEMPO (BPM)'].min = sourceTempo.min;
      voiceData[i].parameters['TEMPO (BPM)'].max = sourceTempo.max;
      voiceData[i].parameters['TEMPO (BPM)'].behavior = sourceTempo.behavior;
      
      delete voiceData[i].parameters['TEMPO (BPM)'].currentTempo;
      delete voiceData[i].parameters['TEMPO (BPM)'].currentValue;
      
      syncedCount++;
    }
  }
  
  console.log(`✅ Synced ${syncedCount} voices to Voice ${sourceVoiceIndex + 1} tempo settings`);
  
  if (currentVoice !== sourceVoiceIndex) {
    renderParameters();
    setTimeout(() => {
      connectAllSliders();
    }, 100);
  }
  
  const syncButton = document.querySelector('.sync-btn');
  if (syncButton) {
    const originalText = syncButton.textContent;
    const originalColor = syncButton.style.backgroundColor;
    
    syncButton.style.backgroundColor = '#28a745';
    syncButton.style.color = 'white';
    syncButton.textContent = 'SYNCED!';
    
    setTimeout(() => {
      syncButton.style.backgroundColor = originalColor;
      syncButton.style.color = '';
      syncButton.textContent = originalText;
    }, 1500);
  }
  
  alert(`✅ Success!\n\nCopied Voice ${sourceVoiceIndex + 1} tempo settings to ${syncedCount} other voices.\n\nTempo: ${sourceTempo.min}-${sourceTempo.max} BPM\nBehavior: ${sourceTempo.behavior}%`);
}
  
function toggleLockVoice(voiceIndex) {
  voiceData[voiceIndex].locked = !voiceData[voiceIndex].locked;
  renderParameters();
}

async function toggleMasterPlayback() {
  console.log('🎯 MASTER PLAY clicked (Fixed Version)');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    console.log('=== STOPPING MASTER PLAYBACK (New System) ===');
    
    if (voiceClockManager) {
      voiceClockManager.stopAllVoices();
    }
    
    if (masterClock) {
      masterClock.stop();
    }
    
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    console.log('✅ Master playback stopped (New System)');
    
  } else {
    console.log('=== STARTING MASTER PLAYBACK (New System) ===');
    
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
    
    if (!masterClock) {
      masterClock = new MasterClock();
    }
    
    if (!voiceClockManager) {
      voiceClockManager = new VoiceClockManager();
      voiceClockManager.initialize(masterClock);
    }
    
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
    
    console.log('🕐 Starting master clock...');
    masterClock.start();
    
    console.log('⏳ Waiting for master clock to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('🎵 Starting voice clocks...');
    voiceClockManager.startAllVoices();
    
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
    
    console.log(`🎉 Master playback started with ${enabledVoices.length} voices!`);
  }
}

function stopMasterPlayback() {
  console.log('=== STOPPING MASTER MULTI-VOICE PLAYBACK ===');
  
  if (voiceClockManager) {
    voiceClockManager.stopAllVoices();
  }
  
  if (masterClock) {
    masterClock.stop();
  }
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  if (playButton) {
    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
  }
  
  console.log('✅ Multi-voice playback stopped');
}

// SCHEDULE NOTE FUNCTION  
function scheduleNote(frequency, duration, startTime, voiceIndex) {
  recordNoteForTempoTest();

  if (!audioManager || !audioManager.isInitialized) {
    return null;
  }
  
  const oscillator = audioManager.audioContext.createOscillator();
  const gainNode = audioManager.audioContext.createGain();
  const panNode = audioManager.audioContext.createStereoPanner();
  
  const selectedSoundIndex = voiceData[voiceIndex].parameters['INSTRUMENT'];
  const selectedSoundName = gmSounds[selectedSoundIndex];
  const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
  
  oscillator.type = oscillatorType;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
  const gainValue = currentVolume / 100;
  
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  const currentBalance = balanceParam.currentValue || (balanceParam.min + balanceParam.max) / 2;
  const panValue = Math.max(-1, Math.min(1, currentBalance / 100));
  
  const envelope = getEnvelopeForDuration(duration);
  const sustainLevel = gainValue * envelope.sustain;
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, startTime + envelope.attack);
  gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - envelope.release);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
  
  panNode.pan.setValueAtTime(panValue, startTime);
  
  oscillator.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioManager.masterGainNode);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
  
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

async function previewVoice(voiceIndex) {
  console.log(`=== PREVIEW VOICE ${voiceIndex + 1} (New Clock System) ===`);
  
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
    
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.stop();
    }
    
    if (voiceClockManager.getActiveVoiceCount() === 0) {
      masterClock.stop();
    }
    
    audioManager.isPlaying = false;
    
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview stopped`);
    
  } else {
    console.log(`Starting preview for Voice ${voiceIndex + 1}...`);
    
    if (voiceClockManager.getActiveVoiceCount() > 0) {
      voiceClockManager.stopAllVoices();
    }
    
    if (!masterClock.isActive()) {
      masterClock.start();
    }

    audioManager.isPlaying = true;

    const originalEnabled = voiceData[voiceIndex].enabled;
    voiceData[voiceIndex].enabled = true;
    
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      voiceClock.start();
    }
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log(`✅ Voice ${voiceIndex + 1} preview started with new clock system`);
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

function interpolateParameter(currentValue, minRange, maxRange, behaviorSetting, deltaTime) {
  if (behaviorSetting <= 0) return currentValue;
  
  const range = maxRange - minRange;
  const behaviorFactor = Math.pow(behaviorSetting / 100, 1.5);
  const maxChangePercent = behaviorFactor * 0.4;
  const maxChange = range * maxChangePercent * (deltaTime * 10);
  const randomFactor = (Math.random() - 0.5) * 2;
  let change = maxChange * randomFactor;
  
  if (currentValue <= minRange && change < 0) {
    change = Math.abs(change);
  } else if (currentValue >= maxRange && change > 0) {
    change = -Math.abs(change);
  }
  
  const newValue = Math.max(minRange, Math.min(maxRange, currentValue + change));
  return newValue;
}

function updateVoiceParameters(voiceIndex) {
  if (!voiceData[voiceIndex] || !voiceData[voiceIndex].enabled) {
    return;
  }
  
  const currentTime = Date.now();
  const deltaTime = Math.min((currentTime - lastUpdateTime) / 1000, 0.2);
  
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  if (volumeParam && volumeParam.behavior > 0) {
    if (!volumeParam.currentValue) {
      volumeParam.currentValue = (volumeParam.min + volumeParam.max) / 2;
    }
    
    volumeParam.currentValue = interpolateParameter(
      volumeParam.currentValue,
      volumeParam.min,
      volumeParam.max,
      volumeParam.behavior,
      deltaTime
    );
    
    if (voiceIndex === currentVoice && audioManager && audioManager.isPlaying) {
      audioManager.setVolumeRealTime(volumeParam.currentValue);
    }
  }
  
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  if (balanceParam && balanceParam.behavior > 0) {
    if (!balanceParam.currentValue) {
      balanceParam.currentValue = (balanceParam.min + balanceParam.max) / 2;
    }
    
    balanceParam.currentValue = interpolateParameter(
      balanceParam.currentValue,
      balanceParam.min,
      balanceParam.max,
      balanceParam.behavior,
      deltaTime
    );
    
    if (voiceIndex === currentVoice && audioManager && audioManager.isPlaying) {
      audioManager.setBalanceRealTime(balanceParam.currentValue);
    }
  }
}

function resetParameterValues() {
  for (let i = 0; i < 16; i++) {
    if (voiceData[i]) {
      Object.keys(voiceData[i].parameters).forEach(paramName => {
        const param = voiceData[i].parameters[paramName];
        if (param && typeof param === 'object' && 'currentValue' in param) {
          delete param.currentValue;
        }
      });
    }
  }
}

function startParameterInterpolation() {
  if (!isParameterInterpolationActive) {
    return;
  }
  
  for (let i = 0; i < 16; i++) {
    if (voiceData[i] && voiceData[i].enabled) {
      updateVoiceParameters(i);
    }
  }
  
  lastUpdateTime = Date.now();
  
  if (currentVoice >= 0 && currentVoice < 16) {
    updateCurrentVoiceSliders();
  }
}

function updateCurrentVoiceSliders() {
  const parameterSection = document.getElementById('parameter-section');
  const sliders = parameterSection.querySelectorAll('[data-nouislider]');
  
  sliders.forEach(slider => {
    if (slider.noUiSlider) {
      try {
        const sliderWrapper = slider.closest('.row-container');
        if (!sliderWrapper) return;
        
        const labelElement = sliderWrapper.querySelector('.label-container');
        if (!labelElement) return;
        
        const paramName = labelElement.textContent.trim();
        const paramData = voiceData[currentVoice].parameters[paramName];
        
        if (paramData && typeof paramData.min !== 'undefined' && typeof paramData.max !== 'undefined') {
          slider.noUiSlider.set([paramData.min, paramData.max]);
        }
      } catch (error) {
        // Silent error handling
      }
    }
  });
}

// Rhythm system variables
const rhythmDurations = {
  0: { name: "Thirty-second Notes", beats: 0.125 },
  1: { name: "Thirty-second Note Triplets", beats: 1/12 },
  2: { name: "Sixteenth Notes", beats: 0.25 },
  3: { name: "Sixteenth Note Triplets", beats: 1/6 },
  4: { name: "Eighth Notes", beats: 0.5 },
  5: { name: "Eighth Note Triplets", beats: 1/3 },
  6: { name: "Quarter Note Triplets", beats: 2/3 },
  7: { name: "Quarter Notes", beats: 1 },
  8: { name: "Half Note Triplets", beats: 4/3 },
  9: { name: "Half Notes", beats: 2 },
  10: { name: "Whole Note Triplets", beats: 8/3 },
  11: { name: "Whole Note", beats: 4 },
  12: { name: "Two Whole Notes", beats: 8 },
  13: { name: "Three Whole Notes", beats: 12 },
  14: { name: "Four Whole Notes", beats: 16 }
};

let noteScheduler = null;
let nextNoteTime = 0;
let isRhythmicPlaybackActive = false;

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

function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

window.selectMidiNote = function(voiceIndex) {
    console.log(`🎼 ENHANCED selectMidiNote called for Voice ${voiceIndex + 1} (Musical Chord System)`);
    
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    const polyphonyParam = voiceData[voiceIndex].parameters['POLYPHONY'];
    
    console.log('Polyphony param:', polyphonyParam);
    
    let noteCount = 1;
    
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
    
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
        console.log('Using piano selection');
        const availableNotes = [...melodicParam.selectedNotes];
        
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
        
        let currentNote = melodicParam.currentNote;
        if (!currentNote || currentNote < currentMin || currentNote > currentMax) {
            currentNote = Math.floor((currentMin + currentMax) / 2);
            melodicParam.currentNote = currentNote;
        }
        
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
        
        currentNote = Math.max(currentMin, Math.min(currentMax, currentNote));
        
        const baseNote = {
            midiNote: currentNote,
            frequency: midiToFrequency(currentNote),
            noteName: midiNoteNames[currentNote] || `MIDI${currentNote}`
        };
        
        const behaviorSetting = melodicParam.behavior || 50;
        const musicalChord = generateMusicalChord(baseNote, noteCount, currentMin, currentMax, behaviorSetting);
        
        console.log(`Returning ${musicalChord.length} musical chord notes:`, musicalChord.map(n => n.noteName));
        return musicalChord;
    }
};

// Note scheduling variables
let currentlyPlayingNotes = [];
let nextScheduledNoteTime = 0;
let rhythmScheduler = null;

function getEnvelopeForDuration(noteDurationSeconds) {
  const durationMs = noteDurationSeconds * 1000;
  
  if (durationMs < 50) {
    return { 
      attack: 0.002,
      release: 0.010,
      sustain: 0.8
    };
  } else if (durationMs < 100) {
    return { 
      attack: 0.005,
      release: 0.020,
      sustain: 0.8    
    };
  } else if (durationMs < 200) {
    return { 
      attack: 0.010,
      release: 0.050,
      sustain: 0.8    
    };
  } else {
    return { 
      attack: 0.015,
      release: 0.100,
      sustain: 0.8    
    };
  }
}

// Voice Management System
class Voice {
  constructor(audioContext, voiceIndex, masterGainNode) {
    this.audioContext = audioContext;
    this.voiceIndex = voiceIndex;
    this.masterGainNode = masterGainNode;
    
    this.isPlaying = false;
    this.isPreviewPlaying = false;
    this.currentlyPlayingNotes = [];
    this.rhythmScheduler = null;
    this.nextScheduledNoteTime = 0;
    
    this.voiceGainNode = audioContext.createGain();
    this.voicePanNode = audioContext.createStereoPanner();
    
    this.continuousOscillator = null;
    this.noteGainNode = null;
    
    this.voiceGainNode.connect(this.voicePanNode);
    this.voicePanNode.connect(masterGainNode);
    
    this.voiceGainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    console.log(`Voice ${voiceIndex + 1} initialized with continuous oscillator`);
  }
  
  initializeContinuousOscillator() {
    if (this.continuousOscillator) {
      this.stopContinuousOscillator();
    }
    
    this.continuousOscillator = this.audioContext.createOscillator();
    this.noteGainNode = this.audioContext.createGain();
    
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    this.continuousOscillator.type = oscillatorType;
    this.continuousOscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
    
    this.continuousOscillator.connect(this.noteGainNode);
    this.noteGainNode.connect(this.voiceGainNode);
    
    this.noteGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.continuousOscillator.start();
    
    console.log(`Voice ${this.voiceIndex + 1} continuous oscillator started`);
  }
  
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
  
  startPlaying() {
    if (this.isPlaying) return;
    
    this.initializeContinuousOscillator();
    
    this.isPlaying = true;
    this.nextScheduledNoteTime = this.audioContext.currentTime + 0.1;
    
    this.scheduleVoiceNotes();
    
    console.log(`Voice ${this.voiceIndex + 1} started playing`);
  }
  
  stopPlaying() {
    this.isPlaying = false;
    this.isPreviewPlaying = false;
    
    if (this.rhythmScheduler) {
      clearInterval(this.rhythmScheduler);
      this.rhythmScheduler = null;
    }
    
    this.stopContinuousOscillator();
    
    console.log(`Voice ${this.voiceIndex + 1} stopped`);
  }
  
  startPreview() {
    this.stopPlaying();
    
    this.initializeContinuousOscillator();
    
    this.isPreviewPlaying = true;
    this.nextScheduledNoteTime = this.audioContext.currentTime + 0.1;
    
    this.scheduleVoiceNotes();
    this.startParameterEvolution();
    
    console.log(`Voice ${this.voiceIndex + 1} preview started`);
  }
  
  stopPreview() {
    this.isPreviewPlaying = false;
    this.stopPlaying();
    
    console.log(`Voice ${this.voiceIndex + 1} preview stopped`);
  }
  
  scheduleVoiceNotes() {
    if (!this.isPlaying && !this.isPreviewPlaying) return;
    
    const scheduleAhead = () => {
      if (!this.isPlaying && !this.isPreviewPlaying) return;
      
      const currentTime = this.audioContext.currentTime;
      const scheduleAheadTime = 0.5;
      
      while (this.nextScheduledNoteTime < currentTime + scheduleAheadTime) {
        this.nextScheduledNoteTime = this.scheduleNextNote(this.nextScheduledNoteTime);
      }
    };
    
    scheduleAhead();
    this.rhythmScheduler = setInterval(scheduleAhead, 50);
  }

  scheduleNextNote(startTime) {
    console.log(`=== VOICE MANAGER: SCHEDULING NOTE FOR VOICE ${this.voiceIndex + 1} ===`);
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    
    const rhythmParam = voiceParams['RHYTHMS'];
    const restParam = voiceParams['RESTS'];
    
    const rhythmIndex = this.selectValueInRange(rhythmParam);
    const restIndex = this.selectValueInRange(restParam);
    
    const voiceTempo = getVoiceTempo(this.voiceIndex);
    console.log(`VoiceClock Voice ${this.voiceIndex + 1} tempo: ${voiceTempo} BPM`);
    
    const noteDuration = getRhythmDuration(rhythmIndex, voiceTempo);
    const restDuration = getRestDuration(restIndex, voiceTempo);
    
    console.log(`VoiceClock Note: ${noteDuration.toFixed(3)}s, Rest: ${restDuration.toFixed(3)}s`);
    
    const noteInfo = selectMidiNote(this.voiceIndex);
    
    const scheduledNote = this.createScheduledNote(
      noteInfo.frequency,
      noteDuration,
      startTime
    );
    
    if (scheduledNote) {
      this.currentlyPlayingNotes.push(scheduledNote);
    }
    
    return startTime + noteDuration + restDuration;
  }
  
  createScheduledNote(frequency, duration, startTime) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    const selectedSoundIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'];
    const selectedSoundName = gmSounds[selectedSoundIndex];
    const oscillatorType = getOscillatorTypeForGMSound(selectedSoundName);
    
    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    const volumeParam = voiceData[this.voiceIndex].parameters['VOLUME'];
    const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
    const gainValue = (currentVolume / 100) * 0.3;
    
    const attackTime = 0.01;
    const releaseTime = 0.1;
    const sustainLevel = gainValue * 0.8;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + attackTime);
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.voiceGainNode);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    const noteInfo = {
      oscillator,
      gainNode,
      startTime,
      duration,
      frequency
    };
    
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
  
  selectValueInRange(param) {
    console.log('🔍 selectValueInRange called, param:', param);

    // NEW: Handle checkbox-based selection
    if (param.selectedValues && Array.isArray(param.selectedValues)) {
      console.log('🎵 Using selectedValues:', param.selectedValues);
      console.log('🎵 selectValueInRange called with:', param.selectedValues);  // DEBUG LINE
    
    if (param.selectedValues.length === 0) {
      console.warn('No rhythmic values selected, defaulting to Quarter Notes');
      return 7;
    }
      if (param.selectedValues.length === 0) {
        console.warn('No rhythmic values selected, defaulting to Quarter Notes');
        return 7; // Fallback to quarter notes if nothing selected
      }
      
      if (param.behavior > 0) {
        // Behavior > 0: Random selection from checked values
        const randomIndex = Math.floor(Math.random() * param.selectedValues.length);
        const selectedValue = param.selectedValues[randomIndex];
        return selectedValue;
      } else {
        // Behavior = 0: Always use first selected value
        return param.selectedValues[0];
      }
    }
    
    // OLD: Fallback for range-based (backwards compatibility)
    console.warn('Using legacy min/max range selection');
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

  
  startParameterEvolution() {
    if (this.isPreviewPlaying) {
      console.log('DEBUG: this.voiceIndex =', this.voiceIndex);
      startTestClock(this.voiceIndex);
    }
  }
}

// INTERACTIVE PIANO KEYBOARD
class InteractivePiano {
  constructor(container, voiceIndex) {
    this.container = container;
    this.voiceIndex = voiceIndex;
    this.selectedNotes = new Set();
    
    this.isDragging = false;
    this.dragStartNote = null;
    this.dragMode = null;
    
    this.render();
    this.bindEvents();
    this.loadInitialSelection();
  }
  
  render() {
    this.container.innerHTML = '';
    
    const keyboard = document.createElement('div');
    keyboard.className = 'piano-keyboard';
    
    for (let midiNote = 21; midiNote <= 108; midiNote++) {
      const key = this.createKey(midiNote);
      keyboard.appendChild(key);
    }
    
    this.container.appendChild(keyboard);
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'piano-info';
    infoDiv.innerHTML = `
      <span class="selected-range">Selected: None</span>
      <span class="piano-instructions">Click notes or drag to select range</span>
    `;
    this.container.appendChild(infoDiv);
  }
  
  createKey(midiNote) {
    const isBlack = this.isBlackKey(midiNote);
    const key = document.createElement('div');
    key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
    key.dataset.midi = midiNote;
    key.title = `${midiNoteNames[midiNote]} (MIDI ${midiNote})`;
    
    return key;
  }
  
  isBlackKey(midiNote) {
    const noteInOctave = (midiNote - 12) % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  }
  
  loadInitialSelection() {
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
      this.selectedNotes.clear();
      melodicParam.selectedNotes.forEach(note => this.selectedNotes.add(note));
      console.log('Loaded custom selections:', Array.from(this.selectedNotes).map(n => midiNoteNames[n]));
    } else {
      this.selectedNotes.clear();
      this.selectedNotes.add(60);
      console.log('Starting with default: Middle C selected');
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
  }
  
  bindEvents() {
    const keyboard = this.container.querySelector('.piano-keyboard');
    
    keyboard.addEventListener('mousedown', (e) => {
      if (!e.target.classList.contains('piano-key')) return;
      
      e.preventDefault();
      const midiNote = parseInt(e.target.dataset.midi);
      
      this.toggleNote(midiNote);
      
      this.isDragging = false;
      this.dragStartNote = midiNote;
      this.dragMode = this.selectedNotes.has(midiNote) ? 'select' : 'deselect';
      
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });
    
    keyboard.addEventListener('selectstart', (e) => e.preventDefault());
  }
  
  handleMouseMove = (e) => {
    if (!this.dragStartNote) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || !element.classList.contains('piano-key')) return;
    
    const currentNote = parseInt(element.dataset.midi);
    
    if (!this.isDragging) {
      this.isDragging = true;
      console.log(`Started drag ${this.dragMode} from ${midiNoteNames[this.dragStartNote]}`);
    }
    
    this.selectRange(this.dragStartNote, currentNote, this.dragMode === 'select');
  }
  
  handleMouseUp = () => {
    this.isDragging = false;
    this.dragStartNote = null;
    this.dragMode = null;
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  
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
  
  updateVisualSelection() {
    const keys = this.container.querySelectorAll('.piano-key');
    keys.forEach(key => {
      const midiNote = parseInt(key.dataset.midi);
      key.classList.toggle('selected', this.selectedNotes.has(midiNote));
    });
  }
  
  updateVoiceData() {
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    if (this.selectedNotes.size === 0) {
      melodicParam.min = 60;
      melodicParam.max = 72;
      delete melodicParam.selectedNotes;
      console.log('🎹 Piano cleared - reverting to slider control');
      return;
    }
    
    const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
    const min = selectedArray[0];
    const max = selectedArray[selectedArray.length - 1];
    
    melodicParam.min = min;
    melodicParam.max = max;
    melodicParam.selectedNotes = selectedArray;
    
    delete melodicParam.currentNote;
    
    console.log(`🎹 Piano controls range: ${midiNoteNames[min]} to ${midiNoteNames[max]} (${selectedArray.length} notes)`);
  }
  
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
      
      const isContinuous = selectedArray.length === (max - min + 1);
      
      if (isContinuous) {
        infoDiv.textContent = `Selected: ${midiNoteNames[min]} to ${midiNoteNames[max]} (${selectedArray.length} notes)`;
      } else {
        infoDiv.textContent = `Selected: ${selectedArray.length} notes (${midiNoteNames[min]} to ${midiNoteNames[max]})`;
      }
    }
  }
  
  syncWithSliderRange(minMidi, maxMidi) {
    console.log(`🎹 Piano syncing with slider range: MIDI ${minMidi}-${maxMidi}`);
    
    this.selectedNotes.clear();
    
    for (let midi = minMidi; midi <= maxMidi; midi++) {
      this.selectedNotes.add(midi);
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
    
    console.log(`🎹 Piano now shows ${this.selectedNotes.size} selected notes`);
  }
  
  updateForVoice(newVoiceIndex) {
    this.voiceIndex = newVoiceIndex;
    this.selectedNotes.clear();
    this.loadInitialSelection();
  }
}

// Get tempo for a specific voice
function getVoiceTempo(voiceIndex) {
  const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
  
  if (!tempoParam) {
    console.warn(`Voice ${voiceIndex + 1}: No TEMPO parameter found`);
    return masterTempo;
  }
  
  let baseTempo = (tempoParam.min + tempoParam.max) / 2;
  
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
  } else {
    console.log('❌ Audio manager initialization failed');
  }
}

// Global variables for parameter interpolation
let parameterUpdateTimer = null;
let isParameterInterpolationActive = false;
let lastUpdateTime = Date.now();

// Enhanced generateHarmonicNotes
window.generateHarmonicNotes = function(baseNote, additionalCount, minNote, maxNote) {
    console.log(`Generating ${additionalCount} harmonic notes from range ${midiNoteNames[minNote]}-${midiNoteNames[maxNote]}`);
    
    const harmonicNotes = [];
    const baseMidi = baseNote.midiNote;
    const availableRange = maxNote - minNote + 1;
    
    console.log(`Available range: ${availableRange} semitones`);
    
    if (availableRange <= 12) {
        console.log('Using chromatic approach for limited range');
        
        const usedNotes = new Set([baseMidi]);
        
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

function selectBaseNote(voiceIndex, minNote, maxNote) {
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    
    if (!melodicParam.currentNote || 
        melodicParam.currentNote < minNote || 
        melodicParam.currentNote > maxNote) {
        melodicParam.currentNote = Math.floor((minNote + maxNote) / 2);
    }
    
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
    
    melodicParam.currentNote = Math.max(minNote, Math.min(maxNote, melodicParam.currentNote));
    
    return {
        midiNote: melodicParam.currentNote,
        frequency: midiToFrequency(melodicParam.currentNote),
        noteName: midiNoteNames[melodicParam.currentNote] || `MIDI${melodicParam.currentNote}`
    };
}

// Master Chord Compendium
const chordQualities = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
    diminished7: [0, 3, 6, 9],
    halfDiminished7: [0, 3, 6, 10],
    augmented7: [0, 4, 8, 10],
    majorMajor7: [0, 4, 7, 11],
    add9: [0, 4, 7, 14],
    major9: [0, 4, 7, 11, 14],
    minor9: [0, 3, 7, 10, 14],
    dominant9: [0, 4, 7, 10, 14],
    major11: [0, 4, 7, 11, 14, 17],
    minor11: [0, 3, 7, 10, 14, 17],
    dominant11: [0, 4, 7, 10, 14, 17],
    major13: [0, 4, 7, 11, 14, 17, 21],
    minor13: [0, 3, 7, 10, 14, 17, 21],
    dominant13: [0, 4, 7, 10, 14, 17, 21],
    sixth: [0, 4, 7, 9],
    minorSixth: [0, 3, 7, 9],
    sixNine: [0, 4, 7, 9, 14],
    dom7sharp5: [0, 4, 8, 10],
    dom7flat5: [0, 4, 6, 10],
    dom7sharp9: [0, 4, 7, 10, 15],
    dom7flat9: [0, 4, 7, 10, 13],
    quartal: [0, 5, 10, 15],
    cluster: [0, 1, 2, 3],
    wholeTone: [0, 2, 4, 6, 8, 10]
};

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

function selectChordQuality(polyphonyCount, behaviorSetting = 50, musicalStyle = 'jazz') {
    let availableChords = [];
    
    if (polyphonyCount <= 3) {
        availableChords = chordCategories.simple.concat(chordCategories.classical);
    } else if (polyphonyCount <= 5) {
        availableChords = chordCategories.jazz.concat(['sixth', 'add9']);
    } else {
        availableChords = chordCategories.extended.concat(chordCategories.modern);
    }
    
    availableChords = availableChords.filter(chordType => {
        const intervals = chordQualities[chordType];
        return intervals && intervals.length <= polyphonyCount;
    });
    
    if (behaviorSetting > 75) {
        const complexChords = availableChords.filter(chord => 
            chordCategories.modern.includes(chord) || 
            chordCategories.extended.includes(chord)
        );
        if (complexChords.length > 0) availableChords = complexChords;
    } else if (behaviorSetting < 25) {
        const simpleChords = availableChords.filter(chord => 
            chordCategories.simple.includes(chord)
        );
        if (simpleChords.length > 0) availableChords = simpleChords;
    }
    
    if (availableChords.length === 0) {
        availableChords = ['major', 'minor'];
    }
    
    const selectedChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    
    return selectedChord;
}

function generateMusicalChord(baseNote, polyphonyCount, minNote, maxNote, behaviorSetting = 50) {
    console.log(`🎼 Generating chord: baseNote=${midiNoteNames[baseNote.midiNote]}, polyphony=${polyphonyCount}`);
    
    const chordType = selectChordQuality(polyphonyCount, behaviorSetting);
    const intervals = chordQualities[chordType];
    
    console.log(`Selected chord type: ${chordType} with intervals [${intervals}]`);
    
    const chordNotes = [];
    const baseMidi = baseNote.midiNote;
    
    for (let i = 0; i < Math.min(intervals.length, polyphonyCount); i++) {
        const interval = intervals[i];
        let chordNoteMidi = baseMidi + interval;
        
        while (chordNoteMidi > maxNote && chordNoteMidi - 12 >= minNote) {
            chordNoteMidi -= 12;
        }
        while (chordNoteMidi < minNote && chordNoteMidi + 12 <= maxNote) {
            chordNoteMidi += 12;
        }
        
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

// Individual Voice Clock - Synced to Master Clock WITH LIFE SPAN INTEGRATION
class VoiceClock {
  constructor(voiceIndex, masterClock) {
    this.voiceIndex = voiceIndex;
    this.masterClock = masterClock;
    
    this.isActive = false;
    this.lastNoteTime = 0;
    this.nextNoteTime = 0;
    this.currentTempo = 120;
    this.lastTempoUpdate = 0;
    
    console.log(`VoiceClock ${this.voiceIndex + 1} initialized and synced to master`);
  }
  
  start() {
    if (!this.masterClock.isActive()) {
      console.warn(`Voice ${this.voiceIndex + 1}: Cannot start - master clock not running`);
      return;
    }
    
    this.isActive = true;
    const masterTime = this.masterClock.getMasterTime();
    
    this.lastNoteTime = masterTime;
    this.lastTempoUpdate = masterTime;
    
    this.updateTempo();
    
    // Schedule first note 100ms from now
    this.nextNoteTime = masterTime + 100;
    
    console.log(`🎵 Voice ${this.voiceIndex + 1} clock started with Life Span integration`);
    console.log(`Voice ${this.voiceIndex + 1} settings: tempo ${this.currentTempo} BPM`);
  }
  
  stop() {
    this.isActive = false;
    
    console.log(`⏹️ Voice ${this.voiceIndex + 1} clock stopped`);
    
    if (voiceClockManager) {
      setTimeout(() => {
        voiceClockManager.checkForAutoReset();
      }, 100);
    }
  }
  
  updateTempo() {
    if (!this.isActive) return;
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    const tempoParam = voiceParams['TEMPO (BPM)'];
    
    if (!tempoParam) {
      this.currentTempo = 120;
      return;
    }
    
    if (tempoParam.behavior > 0 && tempoParam.currentValue !== undefined) {
      this.currentTempo = Math.round(tempoParam.currentValue);
    } else {
      this.currentTempo = Math.round((tempoParam.min + tempoParam.max) / 2);
    }
    
    this.currentTempo = Math.max(40, Math.min(240, this.currentTempo));
    
    this.lastTempoUpdate = this.masterClock.getMasterTime();
  }
  
  shouldPlayNote() {
    if (!this.isActive) return false;
    
    // Get elapsed time since master clock started
    const elapsedMs = this.masterClock.getElapsedTime();
    
    // Check Life Span timing
    return this.isInLifeSpan(elapsedMs);
  }
  
isInLifeSpan(elapsedMs) {
  const lifeSpanParam = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpanParam) {
    return true; // No Life Span parameter - play continuously
  }
  
  // Collect all active spans
  let activeSpans = [];
  for (let i = 1; i <= 3; i++) {
    const span = lifeSpanParam[`lifeSpan${i}`];
    if (span && span.exit > 0) {
      activeSpans.push({
        enter: span.enter || 0,
        exit: span.exit >= 999999999 ? Infinity : span.exit,
        number: i
      });
    }
  }
  
  if (activeSpans.length === 0) {
    return false; // No active spans
  }
  
  // SIMPLE REPEAT LOGIC: If repeat is enabled, just keep cycling
  if (lifeSpanParam.repeat) {
    // Find the maximum exit time for cycle length
    let maxExitTime = 0;
    let hasInfiniteSpan = false;
    
    for (const span of activeSpans) {
      if (span.exit === Infinity) {
        hasInfiniteSpan = true;
      } else {
        maxExitTime = Math.max(maxExitTime, span.exit);
      }
    }
    
    // If any span is infinite, always play
    if (hasInfiniteSpan) {
      console.log(`🔄 Voice ${this.voiceIndex + 1}: Infinite repeat - always playing`);
      return true;
    }
    
    // If no valid cycle time, don't play
    if (maxExitTime <= 0) {
      return false;
    }
    
    // Calculate position within current cycle
    const cyclePosition = elapsedMs % maxExitTime;
    const cycleNumber = Math.floor(elapsedMs / maxExitTime) + 1;
    
    // Check if we're in any active span at this cycle position
    for (const span of activeSpans) {
      if (cyclePosition >= span.enter && cyclePosition < span.exit) {
        console.log(`🔄 Voice ${this.voiceIndex + 1}: Cycle ${cycleNumber} - in span ${span.number} at ${formatMsToMMSS(cyclePosition)}`);
        return true;
      }
    }
    
    console.log(`🔄 Voice ${this.voiceIndex + 1}: Cycle ${cycleNumber} - outside spans at ${formatMsToMMSS(cyclePosition)}`);
    return false;
  }
  
  // NON-REPEAT: Check spans once
  for (const span of activeSpans) {
    if (elapsedMs >= span.enter && (elapsedMs < span.exit || span.exit === Infinity)) {
      console.log(`🕐 Voice ${this.voiceIndex + 1}: In Life Span ${span.number} at ${formatMsToMMSS(elapsedMs)}`);
      return true;
    }
  }
  
  console.log(`🔇 Voice ${this.voiceIndex + 1}: Outside all Life Spans at ${formatMsToMMSS(elapsedMs)}`);
  return false;
}


   
  isTimeForNextNote() {
    if (!this.shouldPlayNote()) return false;
    
    const masterTime = this.masterClock.getMasterTime();
    return masterTime >= this.nextNoteTime;
  }
  
scheduleNextNote() {
  const elapsedMs = this.masterClock.getElapsedTime();
  const shouldPlay = this.shouldPlayNote();
  
  // CRITICAL DEBUG: Log the repeat status
  const lifeSpanParam = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const repeatEnabled = lifeSpanParam ? lifeSpanParam.repeat : false;
  
  if (!shouldPlay) {
    console.log(`🔇 Voice ${this.voiceIndex + 1} @ ${formatMsToMMSS(elapsedMs)}: shouldPlay=false, repeat=${repeatEnabled}`);
    
    // If repeat is enabled, this should NEVER happen after the first cycle starts
    if (repeatEnabled && elapsedMs > 1000) {
      console.error(`🚨 BUG: Voice ${this.voiceIndex + 1} with Repeat=true stopped playing at ${formatMsToMMSS(elapsedMs)}!`);
    }
    
    // Still schedule the next check in 100ms
    this.nextNoteTime = this.masterClock.getMasterTime() + 100;
    return;
  }

  // Rest of the function continues...
  console.log(`🎵 Voice ${this.voiceIndex + 1} @ ${formatMsToMMSS(elapsedMs)}: Playing (repeat=${repeatEnabled})`);
  
  this.updateTempo();
  
  const voiceParams = voiceData[this.voiceIndex].parameters;
  
  const rhythmParam = voiceParams['RHYTHMS'];
  const restParam = voiceParams['RESTS'];
  
  const rhythmIndex = this.selectValueInRange(rhythmParam);
  const restIndex = this.selectValueInRange(restParam);

  console.log('🔍 DEBUG rhythmParam:', rhythmParam);  // ADD THIS
  console.log('🔍 DEBUG restParam:', restParam);      // ADD THIS
  
  const noteDurationMs = this.getRhythmDurationMs(rhythmIndex);
  const restDurationMs = this.getRestDurationMs(restIndex);

  console.log('🔍 DEBUG rhythmIndex:', rhythmIndex);  // ADD THIS
  console.log('🔍 DEBUG restIndex:', restIndex);      // ADD THIS
  
  const noteInfoArray = selectMidiNote(this.voiceIndex);
  
  this.triggerNote(noteInfoArray, noteDurationMs);
  
  this.lastNoteTime = this.nextNoteTime;
  this.nextNoteTime = this.lastNoteTime + noteDurationMs + restDurationMs;
  
  const noteCount = noteInfoArray.length;
  console.log(`🎵 Voice ${this.voiceIndex + 1} @ ${formatMsToMMSS(elapsedMs)}: Scheduled ${noteCount} note${noteCount > 1 ? 's' : ''}, next in ${(noteDurationMs + restDurationMs)}ms`);
}

  
  selectValueInRange(param) {
    console.log('🔍 selectValueInRange called with param:', param);
    
    // NEW: Handle checkbox-based selection
    if (param.selectedValues && Array.isArray(param.selectedValues)) {
      console.log('🎵 selectedValues array:', param.selectedValues);
      
      if (param.selectedValues.length === 0) {
        console.warn('⚠️ No rhythmic values selected, defaulting to Quarter Notes (7)');
        return 7;
      }
      
      let selectedValue;
      
      if (param.behavior > 0) {
        // Random selection from checked values
        const randomIndex = Math.floor(Math.random() * param.selectedValues.length);
        selectedValue = param.selectedValues[randomIndex];
        console.log(`🎲 Behavior ${param.behavior}%: randomly selected index ${randomIndex} = value ${selectedValue}`);
      } else {
        // Always use first selected value
        selectedValue = param.selectedValues[0];
        console.log(`📌 Behavior 0%: using first value ${selectedValue}`);
      }
      
      // Make sure we return a number
      const result = parseInt(selectedValue);
      console.log(`✅ Returning: ${result} (type: ${typeof result})`);
      return result;
    }
    
    // OLD: Fallback for range-based
    console.warn('⚠️ Using legacy min/max range selection');
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


  updateDropdownsToQuarterNotes(param) {
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
          dropdown.value = 7;
          dropdown.style.backgroundColor = '#ffe6e6';
          dropdown.style.border = '2px solid #ff9999';
          
          setTimeout(() => {
            dropdown.style.backgroundColor = '';
            dropdown.style.border = '';
          }, 3000);
        }
      }
    });
    
    param.min = 7;
    param.max = 7;
    
    console.log('🎵 Dropdowns updated to Quarter Notes fallback due to invalid range');
  }
  
  getRhythmDurationMs(rhythmIndex) {
    const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[7];
    const beatDurationMs = (60 / this.currentTempo) * 1000;
    return rhythmInfo.beats * beatDurationMs;
  }
  
  getRestDurationMs(restIndex) {
    if (restIndex === 0) return 0;
    
    const restInfo = rhythmDurations[restIndex - 1] || rhythmDurations[7];
    const beatDurationMs = (60 / this.currentTempo) * 1000;
    return restInfo.beats * beatDurationMs;
  }
  
  triggerNote(noteInfoArray, durationMs) {
    if (!audioManager || !audioManager.isInitialized || !audioManager.audioContext) {
        console.warn(`Voice ${this.voiceIndex + 1}: Audio not ready, skipping notes`);
        return;
    }
    
    const startTime = audioManager.audioContext.currentTime + 0.01;
    const durationSeconds = durationMs / 1000;
    const scheduledNotes = [];
    
    noteInfoArray.forEach((noteInfo, index) => {
        const scheduledNote = this.createScheduledAudioNote(
            noteInfo.frequency,
            durationSeconds,
            startTime,
            index / noteInfoArray.length
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

  createScheduledAudioNote(frequency, duration, startTime, offset = 0) {
    if (!audioManager || !audioManager.audioContext) return null;
    
    const actualStartTime = startTime + (offset * 0.001);
    
    console.log(`🔍 === CREATING NOTE: Voice ${this.voiceIndex + 1} ===`);
    console.log(`   Frequency: ${frequency}Hz, Duration: ${duration.toFixed(3)}s`);
      
    const selectedInstrumentIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'] || 0;
    const selectedInstrumentName = gmSounds[selectedInstrumentIndex] || 'Acoustic Grand Piano';
    const baseOscillatorType = getOscillatorTypeForGMSound(selectedInstrumentName);

    const currentVelocity = this.getCurrentVelocity();
    const velocityNormalized = Math.max(0, Math.min(1, currentVelocity / 127));
    const adsrEnvelope = this.getComprehensiveADSR(duration, velocityNormalized, selectedInstrumentName);
    
    const voiceParams = this.getAllCurrentVoiceParameters();

    console.log(`🎛️ Effect Parameters:`);
    console.log(`   Reverb: time=${voiceParams.reverbTime.toFixed(2)}s, depth=${(voiceParams.reverbDepth*100).toFixed(0)}%`);
    console.log(`   Delay: time=${voiceParams.delayTime.toFixed(0)}ms, depth=${(voiceParams.delayDepth*100).toFixed(0)}%, feedback=${(voiceParams.delayFeedback*100).toFixed(0)}%`);

    const oscillator = audioManager.audioContext.createOscillator();
    const gainNode = audioManager.audioContext.createGain();
    const panNode = audioManager.audioContext.createStereoPanner();
    const filterNode = audioManager.audioContext.createBiquadFilter();
    
    const tremoloLFO = audioManager.audioContext.createOscillator();
    const tremoloGain = audioManager.audioContext.createGain();
    const tremoloDepth = audioManager.audioContext.createGain();
    const tremoloWet = audioManager.audioContext.createGain();
    const tremoloDry = audioManager.audioContext.createGain();

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
    
    const reverbNode = audioManager.audioContext.createConvolver();
    const reverbGain = audioManager.audioContext.createGain();
    const reverbDry = audioManager.audioContext.createGain();
    const reverbWet = audioManager.audioContext.createGain();
    
    const delayNode = audioManager.audioContext.createDelay(2.0);
    const delayFeedback = audioManager.audioContext.createGain();
    const delayWet = audioManager.audioContext.createGain();
    const delayDry = audioManager.audioContext.createGain();

    const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
    const delayTimeValue = (delayParam.speed?.min + delayParam.speed?.max) / 2 || 0;
    const delayDepthValue = (delayParam.depth?.min + delayParam.depth?.max) / 2 || 0;

    if (delayDepthValue > 0.001) {
        const delayTimeSeconds = (100 + (delayTimeValue / 100) * 1900) / 1000;
        const clampedDelayTime = Math.min(delayTimeSeconds, 2.0);
        
        delayNode.delayTime.cancelScheduledValues(audioManager.audioContext.currentTime);
        delayNode.delayTime.value = clampedDelayTime;
        
        console.log(`🔧 DELAY TIME SET DIRECTLY: ${delayNode.delayTime.value.toFixed(3)}s`);
    }

      const velocitySensitiveWaveform = this.getVelocitySensitiveWaveform(baseOscillatorType, velocityNormalized, selectedInstrumentName);
      oscillator.type = velocitySensitiveWaveform;

      const portamentoTime = this.getCurrentPortamentoTime();
      this.applyPortamento(oscillator, frequency, actualStartTime, portamentoTime);

      this.applyDetuning(oscillator, actualStartTime, duration);

    this.applyVolumeADSR(gainNode, adsrEnvelope, voiceParams, actualStartTime, duration);
    this.applyFilterADSR(filterNode, adsrEnvelope, frequency, velocityNormalized, selectedInstrumentName, actualStartTime, duration);
    
    const tremoloIsActive = this.applyTremoloADSR(tremoloLFO, tremoloGain, tremoloDepth, tremoloWet, tremoloDry, adsrEnvelope, voiceParams, actualStartTime, duration);
    
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
    
    const reverbIsActive = this.applyReverbADSR(
        reverbNode, reverbDry, reverbWet,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );

    const delayIsActive = this.applyDelayADSR(
        delayNode, delayFeedback, delayWet, delayDry,
        adsrEnvelope, voiceParams, actualStartTime, duration
    );
    
    this.applyPanADSR(panNode, adsrEnvelope, voiceParams, actualStartTime, duration);

    // Build audio chain
    let audioChain = oscillator;
    console.log(`🔗 Building audio chain...`);

    oscillator.connect(filterNode);
    console.log(`   ✓ oscillator → filter`);
    audioChain = filterNode;

    audioChain.connect(gainNode);
    console.log(`   ✓ chain → gain (ADSR)`);
    audioChain = gainNode;

    if (reverbIsActive) {
        console.log(`   🏛️ Connecting REVERB...`);
        const reverbMixer = audioManager.audioContext.createGain();
        reverbMixer.gain.value = 1.0;
        
        audioChain.connect(reverbDry);
        audioChain.connect(reverbNode);
        reverbNode.connect(reverbWet);
        
        reverbDry.connect(reverbMixer);
        reverbWet.connect(reverbMixer);
        
        console.log(`      ✓ reverb connected`);
        audioChain = reverbMixer;
    }

    if (delayIsActive) {
        console.log(`   🔄 Connecting DELAY...`);
        const delayMixer = audioManager.audioContext.createGain();
        delayMixer.gain.value = 1.0;
        
        audioChain.connect(delayDry);
        audioChain.connect(delayNode);
        
        delayNode.connect(delayWet);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode);
        
        delayDry.connect(delayMixer);
        delayWet.connect(delayMixer);
        
        console.log(`      ✓ delay connected`);
        audioChain = delayMixer;
    }

    audioChain.connect(panNode);
    console.log(`   ✓ chain → pan → master`);
    panNode.connect(audioManager.masterGainNode);
    console.log(`🔗 Audio chain complete!\n`);

    if (audioManager.isPlaying) {
        audioManager.previewGainNodes.add(gainNode);
        audioManager.previewPanNodes.add(panNode);
        
        if (tremoloIsActive && audioManager.previewEffectGainNodes) {
            audioManager.previewEffectGainNodes.add(tremoloGain);
        }
        if (chorusIsActive && audioManager.previewEffectGainNodes) {
            audioManager.previewEffectGainNodes.add(chorusGain1);
            audioManager.previewEffectGainNodes.add(chorusGain2);
            audioManager.previewEffectGainNodes.add(chorusGain3);
        }
        
        const userVolumeMultiplier = audioManager.currentUserVolume / 100;
        const userPanValue = Math.max(-1, Math.min(1, audioManager.currentUserBalance / 100));
        
        panNode.pan.setValueAtTime(userPanValue, actualStartTime);
    }

    oscillator.start(actualStartTime);
    oscillator.stop(actualStartTime + duration);

    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        filterNode.disconnect();
        
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
        
        if (reverbIsActive || delayIsActive) {
          let maxTailTime = 1000;
          
          if (reverbIsActive) {
            const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
            const timeValue = (reverbParam.speed?.min + reverbParam.speed?.max) / 2 || 0;
            const reverbTime = 0.5 + (timeValue / 100) * 5.5;
            
            const reverbTail = reverbTime * 15000;
            maxTailTime = Math.max(maxTailTime, reverbTail);
            
            console.log(`🏛️ Extended reverb tail: ${(reverbTail/1000).toFixed(1)}s for ${reverbTime.toFixed(1)}s reverb time`);
          }

          if (delayIsActive) {
            const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
            const timeValue = (delayParam.speed?.min + delayParam.speed?.max) / 2 || 0;
            const feedbackValue = (delayParam.feedback?.min + delayParam.feedback?.max) / 2 || 0;
            
            const delayTimeSeconds = (100 + (timeValue / 100) * 1900) / 1000;
            const feedbackAmount = feedbackValue / 100;
            
            const delayTail = this.calculateDelayTailTime(delayTimeSeconds, feedbackAmount);
            maxTailTime = Math.max(maxTailTime, delayTail);
            
            console.log(`🧹 Delay tail calculated: ${(delayTail/1000).toFixed(2)}s (feedback=${(feedbackAmount*100).toFixed(0)}%)`);
          }
          
          console.log(`🧹 Scheduling cleanup in ${(maxTailTime/1000).toFixed(2)}s`);
          
          setTimeout(() => {
            try {
              if (reverbIsActive) {
                reverbNode.disconnect();
                reverbDry.disconnect();
                reverbWet.disconnect();
              }
              
              if (delayIsActive) {
                delayNode.disconnect();
                delayFeedback.disconnect();
                delayWet.disconnect();
                delayDry.disconnect();
              }
              
              gainNode.disconnect();
              panNode.disconnect();
              
              console.log('🧹 Cleanup completed after tail');
            } catch (e) {
              console.warn('Cleanup warning:', e);
            }
          }, maxTailTime);
        } else {
          gainNode.disconnect();
          panNode.disconnect();
        }
        
        if (audioManager.previewGainNodes) {
          audioManager.previewGainNodes.delete(gainNode);
        }
        if (audioManager.previewPanNodes) {
          audioManager.previewPanNodes.delete(panNode);
        }
        
      } catch (e) {
        console.warn('Cleanup warning:', e);
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

  // Add all the ADSR application methods here
  applyVolumeADSR(gainNode, envelope, voiceParams, startTime, duration) {
    const velocityMultiplier = voiceParams.velocityScale || 1.0;
    const baseGain = voiceParams.volume * velocityMultiplier * voiceParams.polyphonyScale;
    
    const volumeBoost = 8.0;
    const peakGain = baseGain * envelope.peakLevel * volumeBoost;
    const sustainGain = baseGain * envelope.sustain * volumeBoost;
    
    console.log(`🔊 BOOSTED Velocity: ${(velocityMultiplier * 100).toFixed(0)}%, Peak Gain: ${peakGain.toFixed(3)} (8x boost)`);
    
    const minAudibleGain = 0.1;
    const finalPeakGain = Math.max(minAudibleGain, peakGain);
    const finalSustainGain = Math.max(minAudibleGain * 0.7, sustainGain);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(finalPeakGain, startTime + envelope.attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, finalSustainGain), startTime + envelope.decayEnd);
    gainNode.gain.setValueAtTime(finalSustainGain, startTime + envelope.sustainEnd);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);
    
    console.log(`🔊 Final gains: peak=${finalPeakGain.toFixed(3)}, sustain=${finalSustainGain.toFixed(3)}`);
  }

  applyFilterADSR(filterNode, envelope, frequency, velocityNormalized, instrumentName, startTime, duration) {
    filterNode.type = 'lowpass';
    
    const velocityQ = 0.5 + (velocityNormalized * 8.0);
    filterNode.Q.setValueAtTime(velocityQ, startTime);
    
    console.log(`🔆 Velocity: ${(velocityNormalized * 100).toFixed(0)}% → Filter Q: ${velocityQ.toFixed(1)} (brightness)`);
    
    const baseCutoff = frequency * 2;
    const velocityMultiplier = 2 + (velocityNormalized * 18);
    const peakCutoff = frequency * velocityMultiplier * envelope.peakLevel;
    const sustainCutoff = frequency * velocityMultiplier * envelope.sustain * 0.7;
    const releaseCutoff = baseCutoff;
    
    console.log(`🔆 Cutoff range: ${baseCutoff.toFixed(0)}Hz → ${peakCutoff.toFixed(0)}Hz (${velocityMultiplier.toFixed(1)}x fundamental)`);
    
    filterNode.frequency.setValueAtTime(baseCutoff, startTime);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, peakCutoff), startTime + envelope.attack);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, sustainCutoff), startTime + envelope.decayEnd);
    filterNode.frequency.setValueAtTime(sustainCutoff, startTime + envelope.sustainEnd);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, releaseCutoff), startTime + duration);
  }

  applyTremoloADSR(tremoloLFO, tremoloGain, tremoloDepth, tremoloWet, tremoloDry, adsrEnvelope, voiceParams, actualStartTime, duration) {
    if (voiceParams.tremoloDepth <= 0.001) {
      tremoloGain.gain.setValueAtTime(1.0, actualStartTime);
      console.log(`🎵 Voice ${this.voiceIndex + 1}: Tremolo bypassed (depth = 0)`);
      return false;
    }
    
    tremoloLFO.type = 'sine';
    tremoloLFO.frequency.setValueAtTime(voiceParams.tremoloSpeed, actualStartTime);
    
    const modulationDepth = voiceParams.tremoloDepth * 0.5;
    
    tremoloGain.gain.setValueAtTime(1.0, actualStartTime);
    tremoloDepth.gain.setValueAtTime(modulationDepth, actualStartTime);
    
    tremoloLFO.connect(tremoloDepth);
    tremoloDepth.connect(tremoloGain.gain);
    
    try {
      tremoloLFO.start(actualStartTime);
      tremoloLFO.stop(actualStartTime + duration);
    } catch (e) {
      console.warn(`Tremolo LFO start warning:`, e.message);
    }
    
    console.log(`🎵 Voice ${this.voiceIndex + 1}: Tremolo active (speed = ${voiceParams.tremoloSpeed.toFixed(1)}Hz, depth = ${(voiceParams.tremoloDepth * 100).toFixed(0)}%)`);
    return true;
  }

  applyDelayADSR(delayNode, delayFeedback, delayWet, delayDry, envelope, voiceParams, actualStartTime, duration) {
    const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
    const timeValue = (delayParam.speed?.min + delayParam.speed?.max) / 2 || 0;
    const mixValue = (delayParam.depth?.min + delayParam.depth?.max) / 2 || 0;
    const feedbackValue = (delayParam.feedback?.min + delayParam.feedback?.max) / 2 || 0;
    
    const delayDepth = mixValue / 100;
    
    if (delayDepth <= 0.001) {
        return false;
    }
    
    const delayDryLevel = 1.0 - (delayDepth * 0.9);
    const delayWetLevel = delayDepth * 2.5;
    
    const delayTimeMs = 100 + (timeValue / 100) * 1900;
    const delayTimeSeconds = delayTimeMs / 1000;
    
    let feedbackLevel = feedbackValue / 100;
    
    if (delayTimeMs > 1800) {
        feedbackLevel = Math.min(feedbackLevel, 0.85);
        console.log(`🔧 Very long delay (${delayTimeMs.toFixed(0)}ms): feedback capped at 85%`);
    } else if (delayTimeMs > 1500) {
        feedbackLevel = Math.min(feedbackLevel, 0.88);
    } else if (delayTimeMs > 1000) {
        feedbackLevel = Math.min(feedbackLevel, 0.90);
    } else {
        feedbackLevel = Math.min(feedbackLevel, 0.92);
    }
    
    delayDry.gain.value = delayDryLevel;
    delayWet.gain.value = delayWetLevel;
    delayFeedback.gain.value = feedbackLevel;
    
    const expectedTail = this.calculateDelayTailTime(delayTimeSeconds, feedbackLevel);
    
    console.log(`🔧 DELAY SET: time=${delayTimeMs.toFixed(0)}ms, dry=${delayDryLevel.toFixed(2)}, wet=${delayWetLevel.toFixed(2)}, feedback=${(feedbackLevel*100).toFixed(0)}% → tail=${(expectedTail/1000).toFixed(1)}s`);
    
    return true;
  }

  applyReverbADSR(reverbNode, reverbDry, reverbWet, envelope, voiceParams, actualStartTime, duration) {
    const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
    const timeValue = (reverbParam.speed?.min + reverbParam.speed?.max) / 2 || 0;
    const mixValue = (reverbParam.depth?.min + reverbParam.depth?.max) / 2 || 0;
    
    const reverbDepth = mixValue / 100;
    
    if (reverbDepth <= 0.001) {
        return false;
    }
    
    const reverbTime = 0.5 + (timeValue / 100) * 5.5;
    const sampleRate = audioManager.audioContext.sampleRate;
    const length = Math.floor(sampleRate * reverbTime);
    
    if (length <= 0) {
        return false;
    }
    
    const impulse = audioManager.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            const n = length - i;
            const amplitude = 5.0 * (Math.random() * 2 - 1) * Math.pow(n / length, 0.9);
            channelData[i] = amplitude;
        }
    }

    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        
        const earlyReflectionTime = Math.min(Math.floor(sampleRate * 0.05), length);
        
        for (let i = 0; i < earlyReflectionTime; i++) {
            const earlyBoost = 3.0;
            channelData[i] *= earlyBoost;
        }
        
        for (let i = earlyReflectionTime; i < length; i++) {
            const n = length - i;
            const amplitude = 5.0 * (Math.random() * 2 - 1) * Math.pow(n / length, 0.9);
            channelData[i] = amplitude;
        }
    }

    reverbNode.buffer = impulse;
    
    const reverbDryLevel = 1.0 - (reverbDepth * 0.8);
    const reverbWetLevel = reverbDepth * 2.0;
    
    reverbDry.gain.value = reverbDryLevel;
    reverbWet.gain.value = reverbWetLevel;
    
    console.log(`🔧 REVERB SET: dry=${reverbDryLevel.toFixed(2)}, wet=${reverbWetLevel.toFixed(2)}, time=${reverbTime.toFixed(2)}s (immediate, constant)`);
    
    return true;
  }

  applyChorusADSR(chorusDelay1, chorusDelay2, chorusDelay3, chorusLFO1, chorusLFO2, chorusLFO3, 
                  chorusGain1, chorusGain2, chorusGain3, chorusDepth1, chorusDepth2, chorusDepth3,
                  adsrEnvelope, voiceParams, actualStartTime, duration) {
      
      if (voiceParams.chorusDepth <= 0.001) {
          chorusGain1.gain.setValueAtTime(0, actualStartTime);
          chorusGain2.gain.setValueAtTime(0, actualStartTime);
          chorusGain3.gain.setValueAtTime(0, actualStartTime);
          console.log(`🎵 Voice ${this.voiceIndex + 1}: Chorus bypassed (depth = 0)`);
          return false;
      }
      
      const baseDelayTime = 0.020;
      const maxChorusDepth = voiceParams.chorusDepth * 0.008;
      const chorusSpeed = voiceParams.chorusSpeed;
      
      const peakChorusDepth = maxChorusDepth * adsrEnvelope.peakLevel;
      const sustainChorusDepth = maxChorusDepth * adsrEnvelope.sustain;
      
      // Voice 1
      chorusDelay1.delayTime.setValueAtTime(baseDelayTime, actualStartTime);
      chorusLFO1.type = 'sine';
      chorusLFO1.frequency.setValueAtTime(chorusSpeed * 0.8, actualStartTime);
      
      chorusDepth1.gain.setValueAtTime(0, actualStartTime);
      chorusDepth1.gain.linearRampToValueAtTime(peakChorusDepth, actualStartTime + adsrEnvelope.attack);
      chorusDepth1.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainChorusDepth), actualStartTime + adsrEnvelope.decayEnd);
      chorusDepth1.gain.setValueAtTime(sustainChorusDepth, actualStartTime + adsrEnvelope.sustainEnd);
      chorusDepth1.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
      
      chorusGain1.gain.setValueAtTime(0.35, actualStartTime);
      
      try {
          chorusLFO1.start(actualStartTime);
          chorusLFO1.stop(actualStartTime + duration);
          chorusLFO1.connect(chorusDepth1);
          chorusDepth1.connect(chorusDelay1.delayTime);
      } catch (e) {
          console.warn(`Chorus LFO1 start warning:`, e.message);
      }
      
      // Voice 2
      chorusDelay2.delayTime.setValueAtTime(baseDelayTime * 1.6, actualStartTime);
      chorusLFO2.type = 'sine';
      chorusLFO2.frequency.setValueAtTime(chorusSpeed * 1.1, actualStartTime);
      
      chorusDepth2.gain.setValueAtTime(0, actualStartTime);
      chorusDepth2.gain.linearRampToValueAtTime(peakChorusDepth * 1.2, actualStartTime + adsrEnvelope.attack);
      chorusDepth2.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainChorusDepth * 1.2), actualStartTime + adsrEnvelope.decayEnd);
      chorusDepth2.gain.setValueAtTime(sustainChorusDepth * 1.2, actualStartTime + adsrEnvelope.sustainEnd);
      chorusDepth2.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
      
      chorusGain2.gain.setValueAtTime(0.30, actualStartTime);
      
      try {
          chorusLFO2.start(actualStartTime);
          chorusLFO2.stop(actualStartTime + duration);
          chorusLFO2.connect(chorusDepth2);
          chorusDepth2.connect(chorusDelay2.delayTime);
      } catch (e) {
          console.warn(`Chorus LFO2 start warning:`, e.message);
      }
      
      // Voice 3
      chorusDelay3.delayTime.setValueAtTime(baseDelayTime * 2.4, actualStartTime);
      chorusLFO3.type = 'sine';
      chorusLFO3.frequency.setValueAtTime(chorusSpeed * 1.3, actualStartTime);
      
      chorusDepth3.gain.setValueAtTime(0, actualStartTime);
      chorusDepth3.gain.linearRampToValueAtTime(peakChorusDepth * 0.9, actualStartTime + adsrEnvelope.attack);
      chorusDepth3.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainChorusDepth * 0.9), actualStartTime + adsrEnvelope.decayEnd);
      chorusDepth3.gain.setValueAtTime(sustainChorusDepth * 0.9, actualStartTime + adsrEnvelope.sustainEnd);
      chorusDepth3.gain.linearRampToValueAtTime(0.001, actualStartTime + duration);
      
      chorusGain3.gain.setValueAtTime(0.35, actualStartTime);
      
      try {
          chorusLFO3.start(actualStartTime);
          chorusLFO3.stop(actualStartTime + duration);
          chorusLFO3.connect(chorusDepth3);
          chorusDepth3.connect(chorusDelay3.delayTime);
      } catch (e) {
          console.warn(`Chorus LFO3 start warning:`, e.message);
      }
      
      console.log(`🎵 Voice ${this.voiceIndex + 1}: Enhanced Chorus active (speed = ${chorusSpeed.toFixed(2)}Hz, depth = ${(voiceParams.chorusDepth * 100).toFixed(0)}%, 3 voices: 20ms/32ms/48ms)`);
      return true;
  }

  applyPhaserADSR(phaserStages, phaserLFO, phaserDepth, phaserFeedback, adsrEnvelope, voiceParams, actualStartTime, duration) {
      if (voiceParams.phaserDepth <= 0.001) {
          phaserDepth.gain.setValueAtTime(0, actualStartTime);
          phaserFeedback.gain.setValueAtTime(0, actualStartTime);
          console.log(`🎵 Voice ${this.voiceIndex + 1}: Phaser bypassed (depth = 0)`);
          return false;
      }
      
      const maxPhaserDepth = voiceParams.phaserDepth * 800;
      const phaserSpeed = voiceParams.phaserSpeed;
      
      const peakPhaserDepth = maxPhaserDepth * adsrEnvelope.peakLevel;
      const sustainPhaserDepth = maxPhaserDepth * adsrEnvelope.sustain;
      
      phaserLFO.type = 'sine';
      phaserLFO.frequency.setValueAtTime(phaserSpeed, actualStartTime);
      
      phaserDepth.gain.setValueAtTime(0, actualStartTime);
      phaserDepth.gain.linearRampToValueAtTime(peakPhaserDepth, actualStartTime + adsrEnvelope.attack);
      phaserDepth.gain.exponentialRampToValueAtTime(Math.max(1, sustainPhaserDepth), actualStartTime + adsrEnvelope.decayEnd);
      phaserDepth.gain.setValueAtTime(sustainPhaserDepth, actualStartTime + adsrEnvelope.sustainEnd);
      phaserDepth.gain.linearRampToValueAtTime(1, actualStartTime + duration);
      
      const baseFrequency = 300;
      
      phaserStages.forEach((stage, index) => {
          stage.type = 'allpass';
          
          const stageQ = 3 + (voiceParams.phaserDepth * 6);
          stage.Q.setValueAtTime(stageQ, actualStartTime);
          
          const frequencyMultiplier = Math.pow(2.2, index);
          const stageFreq = baseFrequency * frequencyMultiplier;
          stage.frequency.setValueAtTime(stageFreq, actualStartTime);
          
          console.log(`  Phaser Stage ${index + 1}: ${stageFreq.toFixed(0)}Hz, Q=${stageQ.toFixed(1)}`);
      });
      
      const feedbackAmount = Math.min(0.55, voiceParams.phaserDepth * 0.7);
      phaserFeedback.gain.setValueAtTime(feedbackAmount, actualStartTime);
      
      phaserLFO.connect(phaserDepth);
      phaserStages.forEach(stage => {
          phaserDepth.connect(stage.frequency);
      });
      
      try {
          phaserLFO.start(actualStartTime);
          phaserLFO.stop(actualStartTime + duration);
      } catch (e) {
          console.warn(`Phaser LFO start warning:`, e.message);
      }
      
      console.log(`🎵 Voice ${this.voiceIndex + 1}: Enhanced Phaser active (speed = ${phaserSpeed.toFixed(2)}Hz, depth = ${(voiceParams.phaserDepth * 100).toFixed(0)}%, sweep: 300-${(baseFrequency * Math.pow(2.2, 3)).toFixed(0)}Hz)`);
      return true;
  }

  applyPanADSR(panNode, envelope, voiceParams, startTime, duration) {
      const basePan = voiceParams.balance;
      const panSpread = 0.3;
      
      const attackPan = basePan + (panSpread * (envelope.peakLevel - 0.5));
      const sustainPan = basePan;
      const releasePan = basePan - (panSpread * envelope.sustain * 0.5);
      
      panNode.pan.setValueAtTime(basePan, startTime);
      panNode.pan.linearRampToValueAtTime(attackPan, startTime + envelope.attack);
      panNode.pan.linearRampToValueAtTime(sustainPan, startTime + envelope.decayEnd);
      panNode.pan.setValueAtTime(sustainPan, startTime + envelope.sustainEnd);
      panNode.pan.linearRampToValueAtTime(releasePan, startTime + duration);
  }

  calculateReverbSendADSR(envelope, voiceParams) {
      const baseReverbSend = voiceParams.reverb;
      
      return {
          attack: baseReverbSend * 0.3,
          peak: baseReverbSend * envelope.peakLevel,
          sustain: baseReverbSend * envelope.sustain,
          release: baseReverbSend * 1.2
      };
  }

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
      
      return 64;
  }

  getAllCurrentVoiceParameters() {
    const volumeParam = voiceData[this.voiceIndex].parameters['VOLUME'];
    const balanceParam = voiceData[this.voiceIndex].parameters['STEREO BALANCE'];
    const polyphonyParam = voiceData[this.voiceIndex].parameters['POLYPHONY'];
    const tremoloParam = voiceData[this.voiceIndex].parameters['TREMOLO'];
    const chorusParam = voiceData[this.voiceIndex].parameters['CHORUS'];
    const phaserParam = voiceData[this.voiceIndex].parameters['PHASER'];
    const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
    const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
    
    const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
    const currentBalance = balanceParam.currentValue || (balanceParam.min + balanceParam.max) / 2;
    const polyphonyCount = Math.max(1, (polyphonyParam.min + polyphonyParam.max) / 2);
    
    let tremoloSpeed = 4.0;
    let tremoloDepth = 0.0;
    
    if (tremoloParam && tremoloParam.speed) {
        const speedSlider = (tremoloParam.speed.min + tremoloParam.speed.max) / 2;
        const depthSlider = (tremoloParam.depth.min + tremoloParam.depth.max) / 2;
        
        tremoloSpeed = 0.5 + (speedSlider / 100) * 11.5;
        tremoloDepth = (depthSlider / 100) * 0.8;
    }
    
    let chorusSpeed = 1.0;
    let chorusDepth = 0.0;
    
    if (chorusParam && chorusParam.speed) {
        const speedSlider = (chorusParam.speed.min + chorusParam.speed.max) / 2;
        const depthSlider = (chorusParam.depth.min + chorusParam.depth.max) / 2;
        
        chorusSpeed = 0.2 + (speedSlider / 100) * 2.8;
        chorusDepth = (depthSlider / 100) * 0.7;
    }
    
    let phaserSpeed = 0.5;
    let phaserDepth = 0.0;
    
    if (phaserParam && phaserParam.speed) {
        const speedSlider = (phaserParam.speed.min + phaserParam.speed.max) / 2;
        const depthSlider = (phaserParam.depth.min + phaserParam.depth.max) / 2;
        
        phaserSpeed = 0.1 + (speedSlider / 100) * 1.9;
        phaserDepth = (depthSlider / 100) * 0.8;
    }
    
    let reverbTime = 1.0;
    let reverbDepth = 0.0;
    
    if (reverbParam && reverbParam.speed && reverbParam.depth) {
        const timeSlider = (reverbParam.speed.min + reverbParam.speed.max) / 2;
        const depthSlider = (reverbParam.depth.min + reverbParam.depth.max) / 2;
        
        reverbTime = 0.1 + (timeSlider / 100) * 3.9;
        reverbDepth = (depthSlider / 100) * 0.7;
    }
    
    let delayTime = 500;
    let delayDepth = 0.0;
    let delayFeedback = 0.0;
    
    if (delayParam && delayParam.speed && delayParam.depth) {
        const timeSlider = (delayParam.speed.min + delayParam.speed.max) / 2;
        const depthSlider = (delayParam.depth.min + delayParam.depth.max) / 2;
        
        delayTime = 50 + (timeSlider / 100) * 1950;
        delayDepth = (depthSlider / 100) * 0.7;
        
        if (delayParam.feedback) {
            const feedbackSlider = (delayParam.feedback.min + delayParam.feedback.max) / 2;
            delayFeedback = (feedbackSlider / 100) * 0.75;
        }
    }
    
    return {
        volume: (currentVolume / 100) * 0.15,
        balance: Math.max(-1, Math.min(1, currentBalance / 100)),
        polyphonyScale: Math.max(0.1, 1 / Math.sqrt(polyphonyCount)),
        velocityScale: this.getCurrentVelocity() / 127,
        
        tremoloSpeed: tremoloSpeed,
        tremoloDepth: tremoloDepth,
        
        chorusSpeed: chorusSpeed,
        chorusDepth: chorusDepth,
        
        phaserSpeed: phaserSpeed,
        phaserDepth: phaserDepth,
        
        reverbTime: reverbTime,
        reverbDepth: reverbDepth,
        
        delayTime: delayTime,
        delayDepth: delayDepth,
        delayFeedback: delayFeedback
    };
  }

  getVelocitySensitiveWaveform(baseType, velocityNormalized, instrumentName) {
      if (instrumentName.includes('Piano')) {
          if (velocityNormalized < 0.3) {
              console.log(`🎹 Piano soft (${(velocityNormalized * 100).toFixed(0)}%): sine wave (pure/mellow)`);
              return 'sine';
          }
          if (velocityNormalized < 0.7) {
              console.log(`🎹 Piano medium (${(velocityNormalized * 100).toFixed(0)}%): triangle wave (warm)`);
              return 'triangle';
          }
          console.log(`🎹 Piano hard (${(velocityNormalized * 100).toFixed(0)}%): square wave (bright/percussive)`);
          return 'square';
      }
      
      if (instrumentName.includes('String') || instrumentName.includes('Violin') || instrumentName.includes('Cello')) {
          if (velocityNormalized < 0.4) {
              console.log(`🎻 Strings soft (${(velocityNormalized * 100).toFixed(0)}%): sine (gentle bowing)`);
              return 'sine';
          }
          console.log(`🎻 Strings hard (${(velocityNormalized * 100).toFixed(0)}%): sawtooth (aggressive)`);
          return 'sawtooth';
      }
      
      if (instrumentName.includes('Brass') || instrumentName.includes('Trumpet') || instrumentName.includes('Horn')) {
          if (velocityNormalized < 0.5) {
              console.log(`🎺 Brass soft (${(velocityNormalized * 100).toFixed(0)}%): triangle (gentle)`);
              return 'triangle';
          }
          console.log(`🎺 Brass hard (${(velocityNormalized * 100).toFixed(0)}%): square (brassy)`);
          return 'square';
      }
      
      if (instrumentName.includes('Guitar')) {
          if (velocityNormalized < 0.3) {
              console.log(`🎸 Guitar soft (${(velocityNormalized * 100).toFixed(0)}%): triangle (fingerpicked)`);
              return 'triangle';
          }
          console.log(`🎸 Guitar hard (${(velocityNormalized * 100).toFixed(0)}%): sawtooth (picked)`);
          return 'sawtooth';
      }
      
      console.log(`🎨 ${instrumentName} (${(velocityNormalized * 100).toFixed(0)}%): using base type "${baseType}"`);
      return baseType;
  }

  getVelocitySensitiveFilterCutoff(fundamentalFreq, velocityNormalized, instrumentName) {
      let baseMultiplier = 4.0;
      let velocityRange = 8.0;
      
      if (instrumentName.includes('Piano')) {
          baseMultiplier = 6.0;
          velocityRange = 12.0;
      } else if (instrumentName.includes('String')) {
          baseMultiplier = 5.0;
          velocityRange = 8.0;
      } else if (instrumentName.includes('Brass')) {
          baseMultiplier = 4.0;
          velocityRange = 10.0;
      } else if (instrumentName.includes('Flute') || instrumentName.includes('Clarinet')) {
          baseMultiplier = 3.0;
          velocityRange = 4.0;
      }
      
      const multiplier = baseMultiplier + (velocityRange * velocityNormalized);
      const cutoff = fundamentalFreq * multiplier;
      
      return Math.max(200, Math.min(20000, cutoff));
  }

  getVelocitySensitiveEnvelope(duration, velocityNormalized, instrumentName) {
      const durationSeconds = duration;
      let baseEnvelope;
      
      if (durationSeconds < 0.1) {
          baseEnvelope = { attack: 0.005, decay: 0.020, sustain: 0.7, release: 0.020 };
      } else if (durationSeconds < 0.2) {
          baseEnvelope = { attack: 0.010, decay: 0.040, sustain: 0.8, release: 0.050 };
      } else {
          baseEnvelope = { attack: 0.020, decay: 0.080, sustain: 0.8, release: 0.100 };
      }
      
      let attackScale = 1.0;
      let peakScale = 1.0;
      let sustainScale = 1.0;
      
      if (instrumentName.includes('Piano')) {
          attackScale = 1.5 - velocityNormalized;
          peakScale = 0.5 + (0.8 * velocityNormalized);
          sustainScale = 0.7 + (0.3 * velocityNormalized);
      } else if (instrumentName.includes('String')) {
          attackScale = 1.3 - (0.5 * velocityNormalized);
          peakScale = 0.6 + (0.6 * velocityNormalized);
          sustainScale = 0.8 + (0.2 * velocityNormalized);
      } else if (instrumentName.includes('Brass')) {
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

  getComprehensiveADSR(duration, velocityNormalized, instrumentName) {
      const durationSeconds = duration;
      
      let attackRatio = 0.1;
      let decayRatio = 0.2;
      let sustainRatio = 0.5;
      let releaseRatio = 0.2;
      
      if (instrumentName.includes('Piano')) {
          attackRatio = 0.05;
          decayRatio = 0.3;
          sustainRatio = 0.4;
          releaseRatio = 0.25;
      } else if (instrumentName.includes('String')) {
          attackRatio = 0.15;
          decayRatio = 0.1;
          sustainRatio = 0.65;
          releaseRatio = 0.1;
      } else if (instrumentName.includes('Brass')) {
          attackRatio = 0.08;
          decayRatio = 0.15;
          sustainRatio = 0.6;
          releaseRatio = 0.17;
      } else if (instrumentName.includes('Organ')) {
          attackRatio = 0.02;
          decayRatio = 0.05;
          sustainRatio = 0.88;
          releaseRatio = 0.05;
      }
      
      const attackTime = Math.max(0.005, durationSeconds * attackRatio);
      const decayTime = Math.max(0.01, durationSeconds * decayRatio);
      const sustainTime = Math.max(0.01, durationSeconds * sustainRatio);
      const releaseTime = Math.max(0.005, durationSeconds * releaseRatio);
      
      const peakLevel = 0.4 + (0.6 * velocityNormalized);
      const sustainLevel = peakLevel * (0.6 + 0.3 * velocityNormalized);
      
      return {
          attack: attackTime,
          decay: decayTime,
          sustain: sustainLevel,
          sustainTime: sustainTime,
          release: releaseTime,
          peakLevel: peakLevel,
          attackEnd: attackTime,
          decayEnd: attackTime + decayTime,
          sustainEnd: attackTime + decayTime + sustainTime,
          releaseEnd: attackTime + decayTime + sustainTime + releaseTime
      };
  }

  applyPortamento(oscillator, targetFrequency, startTime, portamentoTime) {
      const voiceParams = voiceData[this.voiceIndex].parameters;
      const portamentoParam = voiceParams['PORTAMENTO GLIDE TIME'];
      
      if (!portamentoParam || portamentoTime <= 0.001) {
          oscillator.frequency.setValueAtTime(targetFrequency, startTime);
          return;
      }
      
      const currentFrequency = this.lastPortamentoFrequency || targetFrequency;
      
      oscillator.frequency.setValueAtTime(currentFrequency, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(20, targetFrequency),
          startTime + portamentoTime
      );
      
      this.lastPortamentoFrequency = targetFrequency;
      
      console.log(`🎯 Portamento: ${currentFrequency.toFixed(1)}Hz → ${targetFrequency.toFixed(1)}Hz over ${(portamentoTime*1000).toFixed(0)}ms`);
  }

  getCurrentPortamentoTime() {
      const portamentoParam = voiceData[this.voiceIndex].parameters['PORTAMENTO GLIDE TIME'];
      
      if (!portamentoParam) return 0;
      
      let portamentoValue;
      if (portamentoParam.behavior > 0 && portamentoParam.currentValue !== undefined) {
          portamentoValue = portamentoParam.currentValue;
      } else {
          portamentoValue = (portamentoParam.min + portamentoParam.max) / 2;
      }
      
      const portamentoMs = (portamentoValue / 100) * 1000;
      return portamentoMs / 1000;
  }

  applyDetuning(oscillator, startTime, duration) {
      console.log(`🔍 DEBUG: applyDetuning called for Voice ${this.voiceIndex + 1}`);
      
      const detuningParam = voiceData[this.voiceIndex].parameters['DETUNING'];
      
      if (!detuningParam) {
          console.log(`❌ No detuning parameter found for Voice ${this.voiceIndex + 1}`);
          return;
      }
      
      console.log(`🔍 Detuning parameter:`, detuningParam);
      
      let detuningValue;
      if (detuningParam.behavior > 0) {
          if (detuningParam.currentValue === undefined) {
              detuningParam.currentValue = (detuningParam.min + detuningParam.max) / 2;
          }
          
          detuningParam.currentValue = interpolateParameter(
              detuningParam.currentValue,
              detuningParam.min,
              detuningParam.max,
              detuningParam.behavior,
              0.1
          );
          
          detuningValue = detuningParam.currentValue;
      } else {
          detuningValue = (detuningParam.min + detuningParam.max) / 2;
      }
      
      console.log(`🔍 Calculated detuning value: ${detuningValue}`);
      
      const detuneCents = Math.max(-50, Math.min(50, detuningValue));
      
      console.log(`🔍 Final detune cents: ${detuneCents}`);
      console.log(`🔍 Oscillator exists: ${!!oscillator}`);
      console.log(`🔍 Oscillator.detune exists: ${!!(oscillator && oscillator.detune)}`);
      
      if (!oscillator || !oscillator.detune) {
          console.log(`❌ Oscillator or detune property not available`);
          return;
      }
      
      try {
          oscillator.detune.setValueAtTime(detuneCents, startTime);
          console.log(`✅ Detune set to ${detuneCents} cents at time ${startTime}`);
          
          if (duration > 0.5 && Math.abs(detuneCents) > 5) {
              const microDetune = detuneCents * 0.1;
              oscillator.detune.linearRampToValueAtTime(
                  detuneCents + microDetune, 
                  startTime + duration * 0.3
              );
              oscillator.detune.linearRampToValueAtTime(
                  detuneCents - microDetune, 
                  startTime + duration * 0.7
              );
              oscillator.detune.linearRampToValueAtTime(
                  detuneCents, 
                  startTime + duration
              );
              console.log(`🎵 Added micro-detuning evolution: ±${microDetune.toFixed(1)} cents`);
          }
          
      } catch (error) {
          console.error(`❌ Error setting detune:`, error);
      }
      
      console.log(`🎵 Voice ${this.voiceIndex + 1}: Detuning applied ${detuneCents.toFixed(1)} cents`);
  }

  calculateDelayTailTime(delayTime, feedback) {
      const minAudibleAmplitude = 0.001;
      
      if (feedback < 0.01) {
          return delayTime * 1000;
      }
      
      const numberOfEchoes = Math.log(minAudibleAmplitude) / Math.log(feedback);
      
      let tailTime = numberOfEchoes * delayTime * 1000;
      
      const MAX_TAIL_TIME = 60000;
      const WARN_TAIL_TIME = 45000;
      
      if (tailTime > WARN_TAIL_TIME) {
          const echoCount = Math.floor(numberOfEchoes);
          console.log(`🔄 Long delay tail: ${(tailTime/1000).toFixed(1)}s (${echoCount} echoes)`);
      }
      
      return Math.min(tailTime * 1.5, MAX_TAIL_TIME);
  }

  getStatus() {
      return {
          voiceIndex: this.voiceIndex + 1,
          isActive: this.isActive,
          currentTempo: this.currentTempo,
          shouldPlay: this.shouldPlayNote(),
          timeToNextNote: Math.max(0, this.nextNoteTime - this.masterClock.getMasterTime()),
          elapsedTime: formatMsToMMSS(this.masterClock.getElapsedTime())
      };
  }
}

// Voice Clock Management System
class VoiceClockManager {
  constructor() {
    this.voiceClocks = [];
    this.masterClock = null;
    this.isInitialized = false;
    this.isManualStop = false;

    console.log('VoiceClockManager initialized with Life Span integration');
  }
  
  initialize(masterClock) {
    this.masterClock = masterClock;
    this.voiceClocks = [];
    
    for (let i = 0; i < 16; i++) {
      const voiceClock = new VoiceClock(i, masterClock);
      this.voiceClocks.push(voiceClock);
    }
    
    this.isInitialized = true;
    console.log('🎵 VoiceClockManager: All 16 voice clocks initialized with Life Span support');
  }
  
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
    
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        this.voiceClocks[i].start();
        startedCount++;
      }
    }
    
    console.log(`🎵 VoiceClockManager: Started ${startedCount} enabled voice clocks with Life Span timing`);
  }
  
  stopAllVoices() {
    this.isManualStop = true;
    
    for (let i = 0; i < 16; i++) {
      this.voiceClocks[i].stop();
    }
    
    console.log('🔇 VoiceClockManager: All voice clocks stopped manually');
    
    setTimeout(() => {
      this.isManualStop = false;
    }, 200);
  }

updateAllVoices() {
  if (!this.isInitialized) return;
  
  const currentTime = this.masterClock.getMasterTime();
  let activeVoiceCount = 0;
  let voicesCompletedNaturally = 0;
  let previewVoicesCompleted = [];
  
  for (let i = 0; i < 16; i++) {
    const voiceClock = this.voiceClocks[i];
    
    if (!voiceData[i].enabled || !voiceClock.isActive) continue;
    
    // Check if this voice should play AND if it has actually completed
    const shouldPlay = voiceClock.shouldPlayNote();
    const hasCompleted = this.hasVoiceCompletedLifeSpan(i);
    
    if (hasCompleted && !shouldPlay) {
      // Voice has ACTUALLY completed its Life Span - auto-stop it
      console.log(`🏁 Voice ${i + 1} completed its Life Span - auto-stopping`);
      
      // Check if this was a preview voice
      const voiceControls = document.querySelector('.voice-controls');
      const previewButton = voiceControls ? voiceControls.querySelector('button[onclick*="previewVoice"]') : null;
      const isCurrentVoicePreview = (currentVoice === i && previewButton && previewButton.textContent === 'STOP');
      
      if (isCurrentVoicePreview) {
        previewVoicesCompleted.push(i);
      }
      
      voiceClock.stop();
      voicesCompletedNaturally++;
      continue;
    } else if (!shouldPlay) {
      // Voice is waiting to start (Enter time > current time) - keep it active but don't count as playing
      console.log(`⏳ Voice ${i + 1} waiting to enter Life Span`);
    }
    
    activeVoiceCount++;
    
    // Schedule notes when needed AND when Life Span allows it
    if (voiceClock.isTimeForNextNote()) {
      voiceClock.scheduleNextNote();
    }
  }
  
  // Handle preview button resets
  previewVoicesCompleted.forEach(voiceIndex => {
    console.log(`🎯 Processing completion for Voice ${voiceIndex + 1}`);
    this.resetPreviewButton(voiceIndex);
  });
  
// Auto-reset check for main PLAY button - only if ALL enabled voices have completed
const totalEnabledVoices = voiceData.filter(voice => voice.enabled).length;

if (voicesCompletedNaturally > 0 && activeVoiceCount === 0 && voicesCompletedNaturally === totalEnabledVoices) {
  console.log(`🔄 ALL ${totalEnabledVoices} enabled voices completed naturally - triggering auto-reset in 1 second`);
  setTimeout(() => {
    this.performAutoReset();
  }, 1000);
} else if (voicesCompletedNaturally > 0 && activeVoiceCount > 0) {
  console.log(`📊 ${voicesCompletedNaturally} voice(s) completed, but ${activeVoiceCount} still active (some have Repeat enabled) - continuing playback`);
}

  
  if (activeVoiceCount > 10) {
    console.log(`🔧 High performance: ${activeVoiceCount} voices active with Life Span timing`);
  }
}

resetPreviewButton(voiceIndex) {
  console.log(`🔄 Auto-resetting PREVIEW button for Voice ${voiceIndex + 1}`);
  
  const voiceControls = document.querySelector('.voice-controls');
  if (!voiceControls) return;
  
  const previewButton = voiceControls.querySelector('button[onclick*="previewVoice"]');
  if (!previewButton) return;
  
  if (currentVoice === voiceIndex && previewButton.textContent === 'STOP') {
    previewButton.textContent = 'PREVIEW';
    previewButton.style.backgroundColor = '';
    previewButton.style.color = '';
    
    // Green flash for completion
    previewButton.style.backgroundColor = '#28a745';
    previewButton.style.color = 'white';
    
    setTimeout(() => {
      previewButton.style.backgroundColor = '';
      previewButton.style.color = '';
    }, 1500);
    
    // Stop master clock if no other voices active
    const activeVoiceCount = this.getActiveVoiceCount();
    if (activeVoiceCount === 0 && this.masterClock && this.masterClock.isActive()) {
      this.masterClock.stop();
    }
    
    console.log(`✅ Voice ${voiceIndex + 1} preview completed (non-repeating)`);
  }
}


hasVoiceCompletedLifeSpan(voiceIndex) {
  const elapsedMs = this.masterClock.getElapsedTime();
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpanParam) return false;
  
  // CRITICAL CHECK: If repeat is enabled, NEVER complete
  if (lifeSpanParam.repeat) {
    console.log(`🔄 Voice ${voiceIndex + 1}: Repeat enabled - NEVER completing (elapsed: ${formatMsToMMSS(elapsedMs)})`);
    return false;
  }
  
  let hasAnyActiveSpan = false;
  let hasPassedAllSpans = true;
  
  // Check all 3 Life Spans
  for (let i = 1; i <= 3; i++) {
    const span = lifeSpanParam[`lifeSpan${i}`];
    
    if (!span || span.exit <= 0) continue; // Skip disabled spans
    
    hasAnyActiveSpan = true;
    
    const exitTime = span.exit >= 999999999 ? Infinity : span.exit;
    
    // If we haven't passed this span's exit time, we haven't completed everything
    if (elapsedMs < exitTime) {
      hasPassedAllSpans = false;
    }
  }
  
  const completed = hasAnyActiveSpan && hasPassedAllSpans;
  
  console.log(`🏁 Voice ${voiceIndex + 1} completion check: hasSpans=${hasAnyActiveSpan}, passedAll=${hasPassedAllSpans}, completed=${completed}`);
  
  return completed;
}




  checkForAutoReset() {
    if (this.isManualStop) {
      console.log('🔄 Auto-reset skipped - manual stop detected');
      return;
    }

    let activeCount = 0;
    let waitingCount = 0;
    let enabledCount = 0;
    
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        enabledCount++;
        const voiceClock = this.voiceClocks[i];
        
        if (voiceClock && voiceClock.isActive) {
          activeCount++; // Simplified: if voice clock is active, count it
        }
      }
    }
    
    console.log(`🔍 Auto-reset check: ${enabledCount} enabled, ${activeCount} active, ${waitingCount} waiting`);
    
    // Simple auto-reset: if no voices are active (they completed naturally)
    if (enabledCount > 0 && activeCount === 0) {
      this.performAutoReset();
    }
  }

  performAutoReset() {
    console.log('🔄 AUTO-RESET: All voices completed naturally - resetting PLAY button');
    
    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    if (playButton && playButton.textContent === 'STOP') {
      playButton.textContent = 'PLAY';
      playButton.style.backgroundColor = '';
      playButton.style.color = '';
      
      if (masterClock && masterClock.isActive()) {
        masterClock.stop();
      }
      
      this.stopAllVoices();
      
      console.log('✅ Auto-reset complete - system ready for next composition');
    }
  }
  
  getVoiceClock(voiceIndex) {
    if (voiceIndex < 0 || voiceIndex >= 16) return null;
    return this.voiceClocks[voiceIndex];
  }
  
  getAllVoiceStatus() {
    const status = [];
    
    for (let i = 0; i < 16; i++) {
      const voiceClock = this.voiceClocks[i];
      status.push({
        voice: i + 1,
        enabled: voiceData[i].enabled,
        active: voiceClock.isActive,
        tempo: voiceClock.currentTempo,
        shouldPlay: voiceClock.shouldPlayNote(),
        elapsedTime: formatMsToMMSS(masterClock?.getElapsedTime() || 0)
      });
    }
    
    return status;
  }
  
  getActiveVoiceCount() {
    return this.voiceClocks.filter(clock => clock.isActive).length;
  }
}

function createParameterRollup(param, voiceIndex) {
  if (Object.keys(parameterRollupState).length === 0) {
    initializeParameterRollupState();
  }
  
  const rollupContainer = document.createElement('div');
  rollupContainer.className = `parameter-rollup ${parameterRollupState[param.name] ? 'expanded' : 'collapsed'}`;
  rollupContainer.dataset.parameter = param.name;
  
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
  
  const rollupContent = document.createElement('div');
  rollupContent.className = 'parameter-rollup-content';
  
  const parameterContent = createParameterContent(param, voiceIndex);
  rollupContent.appendChild(parameterContent);
  
  rollupContainer.appendChild(rollupHeader);
  rollupContainer.appendChild(rollupContent);
  
  return rollupContainer;
}

function createParameterContent(param, voiceIndex) {
  const contentDiv = document.createElement('div');
  contentDiv.className = 'row-container-content';
  
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'controls-container';
  
  const range = document.createElement('div');
  range.className = 'range-container';
  
  if (param.type === 'dropdown') {
    range.appendChild(createDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'dual-dropdown') {
    range.appendChild(createDualDropdown(param.options, param.name, voiceIndex));
  } else if (param.type === 'checkbox-group') {
    range.appendChild(createCheckboxGroup(param.options, param.name, voiceIndex));
  } else if (param.type === 'single-dual') {
    range.appendChild(createDualSlider(param, voiceIndex));
  } else if (param.type === 'multi-dual') {
    range.appendChild(createMultiDualSlider(param, voiceIndex));
  } else if (param.type === 'life-span') {
    range.appendChild(createLifeSpanControl(param, voiceIndex));
  }

  
  controlsContainer.appendChild(range);
  
  // Handle behavior container - LIFE SPAN gets special treatment
  if (param.type === 'life-span') {
    const lifeSpanBehavior = createLifeSpanBehaviorContainer(param, voiceIndex);
    controlsContainer.appendChild(lifeSpanBehavior);
  } else if (param.type !== 'dropdown') {
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

function toggleParameterRollup(parameterName) {
  const rollup = document.querySelector(`[data-parameter="${parameterName}"]`);
  if (!rollup) return;
  
  const header = rollup.querySelector('.parameter-rollup-header');
  const arrow = rollup.querySelector('.parameter-rollup-arrow');
  const content = rollup.querySelector('.parameter-rollup-content');
  
  parameterRollupState[parameterName] = !parameterRollupState[parameterName];
  
  if (parameterRollupState[parameterName]) {
    rollup.classList.add('expanded');
    rollup.classList.remove('collapsed');
    header.classList.remove('collapsed');
    content.style.display = 'block';
    arrow.textContent = '▼';
    console.log(`📖 Expanded: ${parameterName}`);
  } else {
    rollup.classList.remove('expanded');
    rollup.classList.add('collapsed');
    header.classList.add('collapsed');
    content.style.display = 'none';
    arrow.textContent = '▶';
    console.log(`📕 Collapsed: ${parameterName}`);
  }
}

function expandAllParameters() {
  parameterDefinitions.forEach(param => {
    if (!parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
  console.log('📖 All parameters expanded');
}

function collapseAllParameters() {
  parameterDefinitions.forEach(param => {
    if (parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
  console.log('📕 All parameters collapsed');
}

function createNestedGroupRollup(rollupKey, rollupInfo, parameters, voiceIndex) {
  const rollupContainer = document.createElement('div');
  rollupContainer.className = 'rollup-container';
  rollupContainer.dataset.rollup = rollupKey;
  
  const rollupHeader = document.createElement('div');
  rollupHeader.className = 'rollup-header';
  rollupHeader.onclick = () => toggleRollup(rollupKey);
  
  const rollupArrow = document.createElement('span');
  rollupArrow.className = 'rollup-arrow';
  rollupArrow.textContent = rollupState[rollupKey] ? '▼' : '▶';
  
  const rollupTitle = document.createElement('span');
  rollupTitle.className = 'rollup-title';
  rollupTitle.textContent = rollupInfo.title;
  
  const rollupIcon = document.createElement('span');
  rollupIcon.className = 'rollup-icon';
  rollupIcon.textContent = rollupInfo.icon;
  
  rollupHeader.appendChild(rollupArrow);
  rollupHeader.appendChild(rollupTitle);
  rollupHeader.appendChild(rollupIcon);
  
  const rollupContent = document.createElement('div');
  rollupContent.className = 'rollup-content';
  rollupContent.style.display = rollupState[rollupKey] ? 'block' : 'none';
  
  parameters.forEach(param => {
    const parameterRollup = createParameterRollup(param, voiceIndex);
    rollupContent.appendChild(parameterRollup);
  });
  
  rollupContainer.appendChild(rollupHeader);
  rollupContainer.appendChild(rollupContent);
  
  return rollupContainer;
}

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

function recordNoteForTempoTest() {
  if (!tempoTestData.isTestingTempo) return;
  
  const now = Date.now();
  tempoTestData.noteTimestamps.push(now);
  
  console.log(`🎵 Note ${tempoTestData.noteTimestamps.length} at ${now}ms`);
  
  if (tempoTestData.noteTimestamps.length >= 10) {
    calculateActualTempo();
  }
}

function calculateActualTempo() {
  const timestamps = tempoTestData.noteTimestamps;
  const expectedTempo = tempoTestData.expectedTempo;
  
  if (timestamps.length < 2) {
    console.log('❌ Not enough notes recorded for tempo analysis');
    return;
  }
  
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const actualTempo = 60000 / avgInterval;
  
  console.log('🎵 ===== TEMPO TEST RESULTS =====');
  console.log(`Expected Tempo: ${expectedTempo} BPM`);
  console.log(`Actual Tempo: ${actualTempo.toFixed(1)} BPM`);
  console.log(`Difference: ${(actualTempo - expectedTempo).toFixed(1)} BPM`);
  console.log(`Accuracy: ${((actualTempo / expectedTempo) * 100).toFixed(1)}%`);
  console.log(`Average interval: ${avgInterval.toFixed(1)}ms`);
  console.log(`All intervals:`, intervals.map(i => i.toFixed(0) + 'ms'));
  
  tempoTestData.isTestingTempo = false;
  
  return {
    expected: expectedTempo,
    actual: actualTempo,
    difference: actualTempo - expectedTempo,
    accuracy: (actualTempo / expectedTempo) * 100
  };
}

// Connect UI sliders to voice parameters - UPDATED FOR LIFE SPAN
function connectAllSliders() {
  console.log('=== CONNECTING ALL PARAMETER CONTROLS (WITH LIFE SPAN) ===');
  console.log('Current voice:', currentVoice);
  console.log('VoiceData exists:', !!voiceData);
  console.log('Parameter section exists:', !!document.getElementById('parameter-section'));
  
  const parameterSection = document.getElementById('parameter-section');
  
  // 1. Connect dual-range sliders
  const dualSliders = parameterSection.querySelectorAll('.noUi-target');
  console.log(`Found ${dualSliders.length} dual-range sliders to connect`);
  
  dualSliders.forEach((slider, index) => {
    if (slider.noUiSlider) {
      const row = slider.closest('.row-container-content');
      const rollup = row ? row.closest('.parameter-rollup') : null;
      const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
      const paramName = rollupTitle ? rollupTitle.textContent.trim() : `Unknown ${index}`;

      console.log(`Connecting dual-slider: ${paramName}`);
      
      slider.noUiSlider.off('update');
      
      slider.noUiSlider.on('update', function(values) {
        if (paramName === 'MELODIC RANGE') {
          const minMidi = convertNoteNameToMidi(values[0]);
          const maxMidi = convertNoteNameToMidi(values[1]);
          
          if (!isNaN(minMidi) && !isNaN(maxMidi)) {
            voiceData[currentVoice].parameters[paramName].min = minMidi;
            voiceData[currentVoice].parameters[paramName].max = maxMidi;
            delete voiceData[currentVoice].parameters[paramName].currentNote;
            delete voiceData[currentVoice].parameters[paramName].selectedNotes;
            
            const pianoContainer = row.querySelector('.piano-container');
            if (pianoContainer && pianoContainer.pianoInstance) {
              pianoContainer.pianoInstance.syncWithSliderRange(minMidi, maxMidi);
            }
            
            console.log(`✅ ${paramName}: ${values[0]}-${values[1]} → MIDI ${minMidi}-${maxMidi}`);
          }
        } else {
          const min = parseFloat(values[0]);
          const max = parseFloat(values[1]);
          
          if (!isNaN(min) && !isNaN(max) && voiceData[currentVoice].parameters[paramName]) {
            voiceData[currentVoice].parameters[paramName].min = min;
            voiceData[currentVoice].parameters[paramName].max = max;
            delete voiceData[currentVoice].parameters[paramName].currentValue;
            delete voiceData[currentVoice].parameters[paramName].currentTempo;
            delete voiceData[currentVoice].parameters[paramName].currentNote;

            console.log(`✅ ${paramName}: ${min}-${max}`);
          }
        }
      });
    }
  });
  
  // 2. Connect behavior sliders
  const behaviorSliders = parameterSection.querySelectorAll('.behavior-slider-wrapper input[type="range"]');
  console.log(`Found ${behaviorSliders.length} behavior sliders to connect`);

  behaviorSliders.forEach((slider) => {
    const row = slider.closest('.row-container') || 
              slider.closest('.slider-wrapper')?.closest('.row-container') ||
              slider.closest('.parameter-rollup-content')?.closest('.parameter-rollup');
    const label = row ? (row.querySelector('.parameter-rollup-title') || row.querySelector('.label-container')) : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Behavior';
    
    console.log(`Connecting behavior slider: ${paramName}`);
    
    slider.oninput = null;
    slider.onchange = null;
    
    slider.oninput = function(e) {
      const value = parseInt(e.target.value);
      
      if (voiceData[currentVoice].parameters[paramName]) {
        voiceData[currentVoice].parameters[paramName].behavior = value;
        
        const tooltip = slider.parentElement.querySelector('.behavior-tooltip');
        if (tooltip) {
          tooltip.textContent = value + '%';
          
          const percentage = (value - parseInt(slider.min)) / (parseInt(slider.max) - parseInt(slider.min));
          const sliderWidth = slider.offsetWidth;
          const thumbWidth = 16;
          const offset = percentage * (sliderWidth - thumbWidth) + (thumbWidth / 2);
          
          tooltip.style.left = `${offset}px`;
        }
        
        console.log(`✅ ${paramName} behavior: ${value}%`);
      }
    };
    
    const initializeTooltipWhenReady = () => {
      if (slider.offsetWidth > 0 && slider.offsetHeight > 0) {
        const event = { target: slider };
        slider.oninput(event);
        console.log(`📍 Initialized tooltip for ${paramName} after layout ready`);
      } else {
        setTimeout(initializeTooltipWhenReady, 100);
      }
    };

    setTimeout(initializeTooltipWhenReady, 500);
  });

  // 3. Connect dropdown selectors
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
        
        const soundName = gmSounds[value];
        const waveType = getOscillatorTypeForGMSound(soundName);
        
        console.log(`✅ INSTRUMENT changed to index ${value}: ${soundName} → ${waveType} wave`);
        console.log(`   Stored value:`, voiceData[currentVoice].parameters[paramName]);
        console.log(`   Type check:`, typeof voiceData[currentVoice].parameters[paramName]);
        
      } else if (isMinMax && voiceData[currentVoice].parameters[paramName]) {
        const paramData = voiceData[currentVoice].parameters[paramName];
        
        if (dropdownLabel === 'Minimum') {
          paramData.min = value;
          console.log(`✅ ${paramName} minimum: ${value}`);
        } else if (dropdownLabel === 'Maximum') {
          paramData.max = value;
          console.log(`✅ ${paramName} maximum: ${value}`);
        }
        
        if (paramData.min > paramData.max && (paramName === 'RHYTHMS' || paramName === 'RESTS')) {
          console.warn(`⚠️ Invalid ${paramName} range: min(${paramData.min}) > max(${paramData.max})`);
          console.warn(`🎵 System will default to Quarter Notes during playback`);
          
          const allDropdowns = dropdown.parentElement.parentElement.querySelectorAll('select.param-select');
          allDropdowns.forEach(dd => {
            dd.style.backgroundColor = '#fff3cd';
            dd.style.border = '2px solid #ffc107';
            
            setTimeout(() => {
              dd.style.backgroundColor = '';
              dd.style.border = '';
            }, 2000);
          });
          
          showInvalidRangeMessage(dropdown, paramName);
        }
      }
    };
    
    if (paramName === 'INSTRUMENT') {
      dropdown.value = voiceData[currentVoice].parameters[paramName] || 0;
      console.log(`📍 INSTRUMENT dropdown initialized to: ${dropdown.value} (${gmSounds[dropdown.value]})`);
    }
  });

  // 4. Connect multi-dual sliders
  const multiDualContainers = parameterSection.querySelectorAll('.dual-slider');
  console.log(`Found ${multiDualContainers.length} multi-dual slider containers`);

  multiDualContainers.forEach((container) => {
    const rollup = container.closest('.parameter-rollup');
    const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
    const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Multi-Dual';
    
    if (container.querySelectorAll('.slider-wrapper').length < 2) return;
    
    console.log(`🔧 Connecting multi-dual sliders for: ${paramName}`);

    const allSliders = container.querySelectorAll('.noUi-target');
    console.log(`  Found ${allSliders.length} sliders in ${paramName} container`);
    
    allSliders.forEach((slider, sliderIndex) => {
      if (slider.noUiSlider) {
        const sliderWrapper = slider.closest('.slider-wrapper');
        const label = sliderWrapper ? sliderWrapper.querySelector('.slider-label') : null;
        const labelText = label ? label.textContent.trim().toLowerCase() : '';
        
        console.log(`  🔗 Connecting ${paramName} slider ${sliderIndex}: "${labelText}"`);
        
        slider.noUiSlider.off('update');
        
        slider.noUiSlider.on('update', function(values) {
          let min, max;
          
          if (values[0].includes('ms') || values[0].includes('s')) {
            min = parseFloat(values[0].replace(/[ms%s]/g, ''));
            max = parseFloat(values[1].replace(/[ms%s]/g, ''));
          } else if (values[0].includes('%')) {
            min = parseFloat(values[0].replace('%', ''));
            max = parseFloat(values[1].replace('%', ''));
          } else {
            min = Math.round(Number(values[0]));
            max = Math.round(Number(values[1]));
          }
          
          if (isNaN(min) || isNaN(max)) {
            console.warn(`❌ Invalid values for ${paramName} slider ${sliderIndex}: [${values[0]}, ${values[1]}]`);
            return;
          }
          
          const voiceParam = voiceData[currentVoice].parameters[paramName];
          if (!voiceParam) {
            console.warn(`❌ Parameter ${paramName} not found in voiceData`);
            return;
          }
          
          if (sliderIndex === 0) {
            if (!voiceParam.speed) voiceParam.speed = { min: 0, max: 0 };
            voiceParam.speed.min = min;
            voiceParam.speed.max = max;
            console.log(`✅ ${paramName} speed/time: ${min}-${max}`);
            
          } else if (sliderIndex === 1) {
            if (!voiceParam.depth) voiceParam.depth = { min: 0, max: 0 };
            voiceParam.depth.min = min;
            voiceParam.depth.max = max;
            console.log(`✅ ${paramName} depth/mix: ${min}-${max}%`);
            
          } else if (sliderIndex === 2) {
            if (!voiceParam.feedback) voiceParam.feedback = { min: 0, max: 0 };
            voiceParam.feedback.min = min;
            voiceParam.feedback.max = max;
            console.log(`✅ ${paramName} feedback: ${min}-${max}%`);
            
          } else {
            console.warn(`❌ Unknown slider index ${sliderIndex} for ${paramName}`);
          }
          
          console.log(`🔍 Updated ${paramName} parameter:`, voiceParam);
        });
      }
    });
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
      } else {
        console.log('🎹 Creating NEW piano instance');
        container.pianoInstance = new InteractivePiano(container, currentVoice);
      }
    }
  });

// 6. Connect Life Span Controls - UPDATED for new layout
const lifeSpanContainers = parameterSection.querySelectorAll('.life-span-settings');
const actualContainers = [];
lifeSpanContainers.forEach(settings => {
  const container = settings.closest('.dual-slider');
  if (container) actualContainers.push(container);
});
console.log(`Found ${actualContainers.length} Life Span controls to connect`);

actualContainers.forEach((container) => {
  console.log('🕐 Connecting Life Span control...');
  
  // Find the behavior container for this Life Span parameter
  const parameterRollup = container.closest('.parameter-rollup');
  const behaviorContainer = parameterRollup ? parameterRollup.querySelector('.life-span-behavior') : null;
  
  // Connect Max Time input
  // Connect Max Time input
  const maxTimeInput = container.querySelector('.max-time-input');
  if (maxTimeInput) {
    maxTimeInput.oninput = function(e) {
      const value = e.target.value;
      
      // Check for missing leading zero (e.g., ":30", ":15")
      if (value.match(/^:\d{2}$/)) {
        // Visual feedback - format error
        e.target.style.borderColor = '#ffc107';
        e.target.style.backgroundColor = '#fffbf0';
        console.warn(`❌ Missing leading zero: ${value} → should be "0${value}"`);
        
        // Show helpful message
        let messageDiv = container.querySelector('.format-hint');
        if (!messageDiv) {
          messageDiv = document.createElement('div');
          messageDiv.className = 'format-hint';
          messageDiv.style.cssText = `
            font-size: 12px; 
            color: #856404; 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 4px 8px; 
            border-radius: 3px; 
            margin-top: 4px; 
            text-align: center;
          `;
          e.target.parentElement.appendChild(messageDiv);
        }
        messageDiv.textContent = `Please use MM:SS format - try "0${value}" instead`;
        
        // Clear message after 4 seconds
        setTimeout(() => {
          if (messageDiv && messageDiv.parentElement) {
            messageDiv.parentElement.removeChild(messageDiv);
          }
          e.target.style.borderColor = '';
          e.target.style.backgroundColor = '';
        }, 4000);
        
        return; // Exit early, don't process further
      }
      
      // Remove any existing format hint when user types correctly
      const existingHint = container.querySelector('.format-hint');
      if (existingHint) {
        existingHint.parentElement.removeChild(existingHint);
      }
      
      const parsedMs = parseMMSSToMs(value);
      const MINIMUM_TIME_MS = 5000; // 5 seconds minimum
      const MAXIMUM_TIME_MS = 3600000; // 60 minutes maximum
      
      if (parsedMs !== null && parsedMs >= MINIMUM_TIME_MS && parsedMs <= MAXIMUM_TIME_MS) {
        // Update the data with milliseconds
        voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeMs = parsedMs;
        
        // Visual feedback - valid input
        e.target.style.borderColor = '#28a745';
        e.target.style.backgroundColor = '#f8fff8';
        
        console.log(`✅ Life Span max time: ${value} (${parsedMs}ms = ${(parsedMs/1000).toFixed(1)} seconds)`);
        
        // IMMEDIATELY rebuild all sliders with new range
        rebuildLifeSpanSliders(container, currentVoice);
        
        // Clear visual feedback after 2 seconds
        setTimeout(() => {
          e.target.style.borderColor = '';
          e.target.style.backgroundColor = '';
        }, 2000);
        
      } else {
        // Visual feedback - invalid input
        e.target.style.borderColor = '#dc3545';
        e.target.style.backgroundColor = '#fff8f8';
        
        if (parsedMs !== null && parsedMs < MINIMUM_TIME_MS) {
          console.warn(`❌ Time too short: ${value} (minimum: 0:05)`);
        } else if (parsedMs !== null && parsedMs > MAXIMUM_TIME_MS) {
          console.warn(`❌ Time too long: ${value} (maximum: 60:00)`);
        } else {
          console.warn(`❌ Invalid time format: ${value} - use MM:SS format`);
        }
        
        // Clear invalid feedback after 3 seconds
        setTimeout(() => {
          e.target.style.borderColor = '';
          e.target.style.backgroundColor = '';
        }, 3000);
      }
    };
    
    // Also trigger on Enter key for immediate feedback
    maxTimeInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        e.target.blur(); // Trigger the oninput handler
      }
    };
    
    // Set placeholder to show minimum time
    maxTimeInput.placeholder = "0:05";
    maxTimeInput.title = "Enter time in MM:SS format (minimum: 0:05, maximum: 60:00)";
  }

  
  // Connect Beat Unit dropdown

const beatUnitSelect = container.querySelector('.beat-unit-select');
if (beatUnitSelect) {
  beatUnitSelect.onchange = function(e) {
    const value = parseInt(e.target.value);
    voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit = value;
    console.log(`✅ Life Span beat unit: ${rhythmOptions[value]}`);
    
    // Rebuild sliders to update tooltips with new beat unit
    rebuildLifeSpanSliders(container, currentVoice);
  };
}

  
  // Connect Repeat checkbox (now in behavior area)
  const repeatCheckbox = behaviorContainer ? behaviorContainer.querySelector('.repeat-checkbox') : null;
  if (repeatCheckbox) {
    repeatCheckbox.onchange = function(e) {
      voiceData[currentVoice].parameters['LIFE SPAN'].repeat = e.target.checked;
      console.log(`✅ Life Span repeat: ${e.target.checked}`);
    };
  }
  
  // Connect existing Life Span sliders (they should already exist now)
  const spanSliders = container.querySelectorAll('.life-span-dual-slider');
  console.log(`Found ${spanSliders.length} Life Span sliders to connect`);
  
  spanSliders.forEach((sliderContainer) => {
    const spanNumber = parseInt(sliderContainer.dataset.spanNumber);
    const slider = sliderContainer.querySelector('.noUi-target');
    
    if (slider && slider.noUiSlider) {
      console.log(`🔧 Connecting Life Span ${spanNumber} slider events`);
      
      slider.noUiSlider.off('update');
      slider.noUiSlider.on('update', function(values) {
        const enterValue = values[0];
        const exitValue = values[1];
        
        // Parse values (could be in format "120 beats (2:00)" or "∞ (∞)")
        const enterMs = parseLifeSpanValue(enterValue);
        const exitMs = parseLifeSpanValue(exitValue);
        
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].enter = enterMs;
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].exit = exitMs;
        
        console.log(`✅ Life Span ${spanNumber}: ${formatMsToMMSS(enterMs)} - ${exitMs === 999999999 ? '∞' : formatMsToMMSS(exitMs)}`);
      });
    } else {
      console.warn(`❌ Life Span ${spanNumber} slider not found or not initialized`);
    }
  });
}); //This was the missing closing bracket for the lifeSpanContainers.forEach
  
  console.log('🎉 ALL PARAMETER CONTROLS CONNECTED! System fully operational:');
  console.log(`   ✅ ${dualSliders.length} dual-range sliders`);
  console.log(`   ✅ ${behaviorSliders.length} behavior sliders`);
  console.log(`   ✅ ${dropdowns.length} dropdown controls`);
  console.log(`   ✅ Multi-dual sliders (DELAY, etc.)`);
  console.log(`   ✅ ${lifeSpanContainers.length} Life Span controls`);
} // <- This closes the connectAllSliders function


function createLifeSpanSlider(container, spanNumber) {
  console.log(`🕐 Creating Life Span ${spanNumber} slider`);
  
  const lifeSpanData = voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`];
  const maxTimeMs = voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeMinutes * 60 * 1000;
  const beatUnit = voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit;
  
  const sliderDiv = document.createElement('div');
  container.appendChild(sliderDiv);
  
  // Create formatter for beat-based tooltips
  const formatter = createLifeSpanBeatFormatter(currentVoice, beatUnit);
  
  const startEnter = lifeSpanData.enter || 0;
  const startExit = lifeSpanData.exit >= 999999999 ? maxTimeMs : lifeSpanData.exit;
  
  noUiSlider.create(sliderDiv, {
    start: [startEnter, startExit],
    connect: true,
    range: { min: 0, max: maxTimeMs },
    step: 1000, // 1 second steps
    tooltips: [true, true],
    format: formatter
  });
  
  console.log(`✅ Life Span ${spanNumber} slider created with range 0-${formatMsToMMSS(maxTimeMs)}`);
}

function updateLifeSpanTooltips(container) {
  console.log('🕐 Updating Life Span tooltips for new beat unit');
  
  const spanSliders = container.querySelectorAll('.life-span-dual-slider .noUi-target');
  const beatUnit = voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit;
  
  spanSliders.forEach((slider) => {
    if (slider.noUiSlider) {
      const newFormatter = createLifeSpanBeatFormatter(currentVoice, beatUnit);
      
      // Update the formatter
      slider.noUiSlider.updateOptions({
        format: newFormatter
      });
      
      console.log('✅ Updated tooltip formatter for beat unit change');
    }
  });
}

function parseLifeSpanValue(value) {
  if (value === '∞ (∞)' || value === 'Infinity') return 999999999;
  
  const match = value.match(/\((\d+:\d+)\)/);
  if (match) {
    return parseMMSSToMs(match[1]) || 0;
  }
  
  return parseFloat(value) || 0;
}

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
  
  const rect = dropdown.getBoundingClientRect();
  message.style.left = rect.left + 'px';
  message.style.top = (rect.bottom + 5) + 'px';
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    if (message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }, 3000);
}

function convertNoteNameToMidi(noteName) {
  for (let [midi, name] of Object.entries(midiNoteNames)) {
    if (name === noteName) {
      return parseInt(midi);
    }
  }
  return 60;
}

function openUserGuide() {
  const userGuideWindow = window.open(
    'user-guide.html',
    'userGuide',
    'width=900,height=700,scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes'
  );
  
  if (userGuideWindow) {
    userGuideWindow.focus();
  } else {
    alert('Please allow popups to view the User Guide, or navigate to user-guide.html directly.');
  }
}

function testMasterTempoTracking() {
  console.log('=== TESTING MASTER TEMPO TRACKING ===');
  console.log(`Master Tempo: ${masterTempo} BPM`);
  console.log(`Current Voice: ${currentVoice + 1}`);
  
  const voiceTempo = getVoiceTempo(currentVoice);
  console.log(`Voice ${currentVoice + 1} tempo: ${voiceTempo} BPM`);
  
  const tempoParam = voiceData[currentVoice].parameters['TEMPO (BPM)'];
  console.log('Voice tempo parameter:', tempoParam);
  
  console.log('\n--- Testing different master tempos ---');
  const originalMaster = masterTempo;
  
  [80, 120, 160, 200].forEach(testTempo => {
    masterTempo = testTempo;
    const result = getVoiceTempo(currentVoice);
    console.log(`Master: ${testTempo} → Voice: ${result} BPM`);
  });
  
  masterTempo = originalMaster;
}

function debugAudioSources() {
  console.log('=== AUDIO SOURCES DIAGNOSTIC ===');
  console.log('audioManager.isPlaying:', audioManager?.isPlaying);
  console.log('isRhythmicPlaybackActive:', isRhythmicPlaybackActive);
  console.log('currentlyPlayingNotes.length:', currentlyPlayingNotes?.length);
  
  if (audioManager && audioManager.testOscillator) {
    console.log('❌ OLD CONTINUOUS OSCILLATOR STILL RUNNING!');
    console.log('This is the sound you hear - it ignores tempo changes');
  }
  
  if (isRhythmicPlaybackActive) {
    console.log('✅ Rhythmic system is active (this responds to tempo)');
  }
}

function delayTimeToMusicalNote(delayTimeMs, tempo) {
    const delayTimeSeconds = delayTimeMs / 1000;
    const beatDuration = 60 / tempo;
    const delayInBeats = delayTimeSeconds / beatDuration;
    
    const musicalNotes = [
        { name: "Thirty-second Note", beats: 0.125, symbol: "1/32" },
        { name: "Thirty-second Triplet", beats: 1/12, symbol: "1/32T" },
        { name: "Sixteenth Note", beats: 0.25, symbol: "1/16" },
        { name: "Sixteenth Triplet", beats: 1/6, symbol: "1/16T" },
        { name: "Eighth Note", beats: 0.5, symbol: "1/8" },
        { name: "Eighth Triplet", beats: 1/3, symbol: "1/8T" },
        { name: "Dotted Eighth", beats: 0.75, symbol: "1/8." },
        { name: "Quarter Triplet", beats: 2/3, symbol: "1/4T" },
        { name: "Quarter Note", beats: 1.0, symbol: "1/4" },
        { name: "Dotted Quarter", beats: 1.5, symbol: "1/4." },
        { name: "Half Triplet", beats: 4/3, symbol: "1/2T" },
        { name: "Half Note", beats: 2.0, symbol: "1/2" },
        { name: "Dotted Half", beats: 3.0, symbol: "1/2." },
        { name: "Whole Triplet", beats: 8/3, symbol: "1/1T" },
        { name: "Whole Note", beats: 4.0, symbol: "1/1" },
        { name: "Two Whole Notes", beats: 8.0, symbol: "2/1" }
    ];
    
    let closestNote = musicalNotes[0];
    let smallestDiff = Math.abs(delayInBeats - musicalNotes[0].beats);
    
    for (const note of musicalNotes) {
        const diff = Math.abs(delayInBeats - note.beats);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestNote = note;
        }
    }
    
    const tolerance = 0.05;
    const isExact = smallestDiff < (closestNote.beats * tolerance);
    
    return {
        noteName: closestNote.name,
        symbol: closestNote.symbol,
        exact: isExact,
        delayInBeats: delayInBeats.toFixed(2),
        closestBeats: closestNote.beats
    };
}

function formatDelayTooltip(delayTimeMs, tempo) {
    const musical = delayTimeToMusicalNote(delayTimeMs, tempo);
    
    if (musical.exact) {
        return `${delayTimeMs.toFixed(0)}ms = ${musical.symbol} (${musical.noteName})`;
    } else {
        return `${delayTimeMs.toFixed(0)}ms ≈ ${musical.symbol} (${musical.noteName})`;
    }
}

function createDelayTimeFormatter(voiceIndex) {
    return {
        to: function(value) {
            const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
            const currentTempo = tempoParam ? 
                (tempoParam.min + tempoParam.max) / 2 : 120;
            
            const delayTimeMs = 100 + (value / 100) * 1900;
            
            return formatDelayTooltip(delayTimeMs, currentTempo);
        },
        from: function(value) {
            const match = value.match(/(\d+)ms/);
            if (match) {
                const delayTimeMs = parseFloat(match[1]);
                return ((delayTimeMs - 100) / 1900) * 100;
            }
            return parseFloat(value);
        }
    };
}

function resetAdvancedParameterDefaults() {
    console.log('=== RESETTING ADVANCED PARAMETER DEFAULTS (ENHANCED) ===');
    
    for (let i = 0; i < 16; i++) {
        if (voiceData[i].parameters['DETUNING']) {
            voiceData[i].parameters['DETUNING'].min = 0;
            voiceData[i].parameters['DETUNING'].max = 0;
            voiceData[i].parameters['DETUNING'].behavior = 0;
            delete voiceData[i].parameters['DETUNING'].currentValue;
        }
        
        if (voiceData[i].parameters['PORTAMENTO GLIDE TIME']) {
            voiceData[i].parameters['PORTAMENTO GLIDE TIME'].min = 0;
            voiceData[i].parameters['PORTAMENTO GLIDE TIME'].max = 0;
            voiceData[i].parameters['PORTAMENTO GLIDE TIME'].behavior = 0;
            delete voiceData[i].parameters['PORTAMENTO GLIDE TIME'].currentValue;
        }
    }
    
    console.log('🔄 Re-rendering UI...');
    renderParameters();
    
    setTimeout(() => {
        console.log('🔗 Reconnecting sliders...');
        connectAllSliders();
        
        setTimeout(() => {
            forceUpdateAdvancedParameterSliders();
        }, 100);
    }, 200);
    
    console.log('✅ Advanced parameters reset to proper defaults');
    console.log('- DETUNING: 0 to 0 cents (perfectly in tune)');
    console.log('- PORTAMENTO: 0 to 0 (no gliding)');
}

function forceUpdateAdvancedParameterSliders() {
    console.log('🎯 Force updating advanced parameter sliders...');
    
    const parameterSection = document.getElementById('parameter-section');
    const allSliders = parameterSection.querySelectorAll('.noUi-target');
    
    allSliders.forEach(slider => {
        if (slider.noUiSlider) {
            try {
                const rollup = slider.closest('.parameter-rollup');
                const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
                const paramName = rollupTitle ? rollupTitle.textContent.trim() : '';
                
                if (paramName === 'DETUNING' || paramName === 'PORTAMENTO GLIDE TIME') {
                    slider.noUiSlider.set([0, 0]);
                    console.log(`✅ Forced ${paramName} slider to [0, 0]`);
                }
            } catch (e) {
                // Slider might not be ready, skip it
            }
        }
    });
    
    const behaviorSliders = parameterSection.querySelectorAll('.behavior-slider-wrapper input[type="range"]');
    behaviorSliders.forEach(slider => {
        const rollup = slider.closest('.parameter-rollup');
        const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
        const paramName = rollupTitle ? rollupTitle.textContent.trim() : '';
        
        if (paramName === 'DETUNING' || paramName === 'PORTAMENTO GLIDE TIME') {
            slider.value = 0;
            const tooltip = slider.parentElement.querySelector('.behavior-tooltip');
            if (tooltip) {
                tooltip.textContent = '0%';
            }
            console.log(`✅ Forced ${paramName} behavior to 0%`);
        }
    });
}

// PresetManager Class
class PresetManager {
    constructor() {
        this.currentPreset = null;
        this.presetLibrary = new Map();
        this.isModified = false;
        
        console.log('🎼 PresetManager initialized');

        this.loadFromLocalStorage();
    }
    
    captureCurrentState(presetName, description = "") {
        console.log(`📸 Capturing current state as "${presetName}"`);
        
        const preset = {
            name: presetName,
            description: description,
            timestamp: new Date().toISOString(),
            version: "1.0",
            type: "user",
            voices: []
        };
        
        for (let i = 0; i < 16; i++) {
            const voiceSnapshot = {
                enabled: voiceData[i].enabled,
                locked: voiceData[i].locked,
                parameters: this.deepClone(voiceData[i].parameters)
            };
            
            preset.voices.push(voiceSnapshot);
        }
        
        preset.globalSettings = {
            currentVoice: currentVoice,
            masterTempo: masterTempo || 120
        };
        
        console.log(`✅ Captured preset with ${preset.voices.filter(v => v.enabled).length} enabled voices`);
        return preset;
    }
    
    async applyPreset(preset) {
        console.log(`🎼 Loading preset: "${preset.name}"`);
        
        try {
            if (masterClock && masterClock.isActive()) {
                console.log('⏹️ Stopping current playback...');
                toggleMasterPlayback();
            }
            
            for (let i = 0; i < 16; i++) {
                if (preset.voices[i]) {
                    voiceData[i].enabled = preset.voices[i].enabled;
                    voiceData[i].locked = preset.voices[i].locked;
                    voiceData[i].parameters = this.deepClone(preset.voices[i].parameters);
                    
                    console.log(`   Voice ${i + 1}: ${preset.voices[i].enabled ? 'enabled' : 'disabled'}`);
                }
            }
            
            if (preset.globalSettings) {
                currentVoice = preset.globalSettings.currentVoice || 0;
                masterTempo = preset.globalSettings.masterTempo || 120;
                
                console.log(`   Current voice set to: ${currentVoice + 1}`);
                console.log(`   Master tempo set to: ${masterTempo} BPM`);
            }
            
            console.log('🔄 Updating UI...');
            createVoiceTabs();
            renderParameters();
            
            setTimeout(() => {
                connectAllSliders();
                console.log(`✅ Preset "${preset.name}" loaded successfully`);
            }, 200);
            
            this.currentPreset = preset;
            this.isModified = false;
            
            return true;
            
        } catch (error) {
            console.error('❌ Error loading preset:', error);
            return false;
        }
    }

    savePreset(preset) {
        this.presetLibrary.set(preset.name, preset);
        this.saveToLocalStorage();
        
        console.log(`💾 Preset "${preset.name}" saved to library and localStorage`);
        console.log(`📚 Total presets in library: ${this.presetLibrary.size}`);
        
        return true;
    }

    getAllPresets() {
        return Array.from(this.presetLibrary.values());
    }

    getPreset(name) {
        return this.presetLibrary.get(name) || null;
    }
    
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    saveToLocalStorage() {
        try {
            const presetsArray = Array.from(this.presetLibrary.values());
            const jsonData = JSON.stringify(presetsArray, null, 2);
            localStorage.setItem('tunersComposerPresets', jsonData);
            console.log(`💾 Saved ${presetsArray.length} presets to localStorage`);
            return true;
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('tunersComposerPresets');
            if (savedData) {
                const presetsArray = JSON.parse(savedData);
                
                this.presetLibrary.clear();
                
                presetsArray.forEach(preset => {
                    this.presetLibrary.set(preset.name, preset);
                });
                
                console.log(`📚 Loaded ${presetsArray.length} presets from localStorage`);
                return true;
            } else {
                console.log('📚 No saved presets found in localStorage');
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            return false;
        }
    }

    exportPresetsToFile() {
        try {
            const presetsArray = Array.from(this.presetLibrary.values());
            const jsonData = JSON.stringify(presetsArray, null, 2);
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = `tuners-composer-presets-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`📤 Exported ${presetsArray.length} presets to file`);
            alert(`📤 Exported ${presetsArray.length} presets to download folder!`);
            return true;
        } catch (error) {
            console.error('❌ Error exporting presets:', error);
            return false;
        }
    }

    clearAllPresets() {
        const confirmClear = confirm(`⚠️ This will delete ALL saved presets permanently. 

Are you sure you want to continue?`);
        
        if (confirmClear) {
            this.presetLibrary.clear();
            localStorage.removeItem('tunersComposerPresets');
            console.log('🗑️ All presets cleared');
            alert('🗑️ All presets have been deleted.');
            return true;
        }
        return false;
    }
}

// Global preset manager instance
let presetManager = null;

// File Functions
async function saveCompositionToFile() {
    console.log('💾 Opening native Save dialog...');
    
    try {
        if ('showSaveFilePicker' in window) {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `tune-${new Date().toISOString().split('T')[0]}.json`,
                types: [{
                    description: "Tuners' Composer files",
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            const preset = presetManager.captureCurrentState(
                "Composition",
                "Tuners' Composer file"
            );
            
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(preset, null, 2));
            await writable.close();
            
            console.log('✅ File saved successfully via File System Access API');
            
        } else {
            fallbackSaveMethod();
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('❌ Save cancelled by user');
        } else {
            console.error('❌ Error saving file:', error);
            fallbackSaveMethod();
        }
    }
}

function fallbackSaveMethod() {
    console.log('📁 Using fallback save method...');
    
    const proceed = confirm(`💾 Your browser will download the composition file.

The file will be saved to your default Downloads folder.
You can then move it to your preferred location.

Continue with save?`);
    
    if (!proceed) return;
    
    const preset = presetManager.captureCurrentState(
        "Composition",
        "Tuners' Composer file"
    );
    
    const jsonData = JSON.stringify(preset, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `composition-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('💾 File downloaded to your Downloads folder!');
}

function openCompositionFromFile() {
    console.log('📂 Opening native Open dialog...');
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('❌ No file selected');
            return;
        }
        
        console.log(`📖 Loading file: ${file.name}`);
        
        try {
            const fileContent = await readFileAsText(file);
            const preset = JSON.parse(fileContent);
            
            if (!preset.voices || !Array.isArray(preset.voices)) {
                throw new Error('Invalid preset file format');
            }
            
            await presetManager.applyPreset(preset);
            
            console.log(`✅ Successfully loaded: ${preset.name || file.name}`);
            alert(`✅ Successfully loaded: ${preset.name || file.name}`);
            
        } catch (error) {
            console.error('❌ Error loading file:', error);
            alert(`❌ Error loading file: ${error.message}`);
        }
        
        document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

async function createNewComposition() {
    console.log('📄 Creating new composition...');
    
    try {
        if (masterClock && masterClock.isActive()) {
            console.log('⏹️ Stopping current playback...');
            toggleMasterPlayback();
        }
        
        const hasEnabledVoices = voiceData.some(voice => voice.enabled);
        if (hasEnabledVoices) {
            const proceed = confirm(`📄 Create New Composition?

This will reset all voices and parameters to default settings.
Any unsaved work will be lost.

Continue?`);
            
            if (!proceed) {
                console.log('❌ New composition cancelled by user');
                return;
            }
        }
        
        const newButton = document.querySelector('#file-controls button:nth-child(1)');
        let originalText = 'NEW';
        let originalBgColor = '';
        let originalTextColor = '';
        
        if (newButton) {
            originalText = newButton.textContent;
            originalBgColor = newButton.style.backgroundColor;
            originalTextColor = newButton.style.color;
            
            newButton.textContent = 'RESETTING...';
            newButton.disabled = true;
            newButton.style.backgroundColor = 'coral';
            newButton.style.color = 'white';
        }
        
        console.log('🔄 Resetting all systems to defaults...');
        
        currentVoice = 0;
        masterTempo = 120;
        
        initializeVoices();
        
        if (voiceClockManager && voiceClockManager.isInitialized) {
            voiceClockManager.stopAllVoices();
        }
        
        if (presetManager) {
            presetManager.currentPreset = null;
            presetManager.isModified = false;
        }
        
        console.log('🎨 Updating UI...');
        createVoiceTabs();
        renderParameters();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        resetAdvancedParameterDefaults();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        connectAllSliders();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const buttonToRestore = document.querySelector('#file-controls button:nth-child(1)');
        if (buttonToRestore) {
            buttonToRestore.textContent = originalText;
            buttonToRestore.disabled = false;
            buttonToRestore.style.backgroundColor = '#28a745';
            buttonToRestore.style.color = 'white';
            
            setTimeout(() => {
                const finalButton = document.querySelector('#file-controls button:nth-child(1)');
                if (finalButton) {
                    finalButton.style.backgroundColor = originalBgColor;
                    finalButton.style.color = originalTextColor;
                }
            }, 2000);
        }
        
        console.log('✅ New composition created successfully with Life Span defaults!');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating new composition:', error);
        
        const errorButton = document.querySelector('#file-controls button:nth-child(1)');
        if (errorButton) {
            errorButton.textContent = 'NEW';
            errorButton.disabled = false;
            errorButton.style.backgroundColor = '#dc3545';
            errorButton.style.color = 'white';
            
            setTimeout(() => {
                errorButton.style.backgroundColor = '';
                errorButton.style.color = '';
            }, 3000);
        }
        
        alert('❌ Error creating new composition. Please refresh the page.');
        return false;
    }
}

function resetNewButton() {
    console.log('🚨 Emergency: Resetting NEW button...');
    
    const newButton = document.querySelector('#file-controls button:nth-child(1)');
    if (newButton) {
        newButton.textContent = 'NEW';
        newButton.disabled = false;
        newButton.style.backgroundColor = '';
        newButton.style.color = '';
        
        console.log('✅ NEW button reset to normal state');
    } else {
        console.log('❌ NEW button not found');
    }
}

// Initialize systems on page load
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();
  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  presetManager = new PresetManager();
  console.log('✅ PresetManager ready');

  setTimeout(() => {
      const openButton = document.querySelector('#file-controls button:nth-child(2)');
      if (openButton) {
          openButton.onclick = openCompositionFromFile;
          console.log('✅ OPEN button connected to native file dialog');
      }
      
      const saveButton = document.querySelector('#file-controls button:nth-child(3)');
      if (saveButton) {
          saveButton.onclick = saveCompositionToFile;
          console.log('✅ SAVE button connected to native save dialog');
      }
  }, 300);

  setTimeout(() => {
      const newButton = document.querySelector('#file-controls button:nth-child(1)');
      if (newButton) {
          newButton.onclick = createNewComposition;
          console.log('✅ NEW button connected to composition reset');
      } else {
          console.log('❌ NEW button not found');
      }
  }, 300);

  setTimeout(() => {
    resetAdvancedParameterDefaults();
  }, 500);

  document.addEventListener('click', initializeAudioOnFirstClick, { once: true });
  
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

// FORCE CONNECT PLAY BUTTON
setTimeout(() => {
  console.log('🔧 FORCING PLAY BUTTON CONNECTION...');
  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  console.log('Play button found:', !!playButton);
  console.log('Play button text:', playButton?.textContent);
  
  if (playButton) {
    playButton.onclick = null;
    playButton.onclick = toggleMasterPlayback;
    
    console.log('✅ PLAY button force-connected to toggleMasterPlayback');
    console.log('Try clicking PLAY now!');
  } else {
    console.log('❌ PLAY button not found in DOM');
  }
}, 2000);

console.log('✅ Enhanced scripts.js loaded - Life Span system fully integrated');
console.log('🕐 Life Span features:');
console.log('   - 3 dual sliders with Enter/Exit times');
console.log('   - Repeat checkbox for cycling');
console.log('   - Max time input (MM:SS format)');
console.log('   - Beat unit dropdown for musical tooltips');
console.log('   - Integration with voice clock timing system');
