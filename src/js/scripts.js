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
      
      if (timeMs >= 999999999) return '∞ beats (∞)';
      if (timeMs <= 0) return '0 beats (0:00)';
      
      const beats = calculateBeatsFromTime(timeMs, beatUnit, currentTempo);
      const timeStr = formatMsToMMSS(timeMs);
      
      // Format: "45 beats (0:20)"
      return `${beats} beats (${timeStr})`;
    },
    from: function(value) {
      if (value === '∞ beats (∞)' || value === '∞ (∞)') return 999999999;
      
      // Parse "45 beats (0:20)" format
      const beatsMatch = value.match(/^(\d+) beats/);
      const timeMatch = value.match(/\((\d+:\d+)\)/);
      
      if (timeMatch) {
        return parseMMSSToMs(timeMatch[1]) || 0;
      }
      if (beatsMatch) {
        // Fallback: convert beats to time
        const beats = parseInt(beatsMatch[1]);
        const voiceIndex = 0; // Default, will be overridden
        const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
        const currentTempo = tempoParam ? (tempoParam.min + tempoParam.max) / 2 : 120;
        const beatDuration = 60 / currentTempo;
        return Math.round(beats * beatDuration * 1000);
      }
      
      return parseFloat(value) || 0;
    }
  };
}

function calculateBeatDurationMs(voiceIndex, beatUnit) {
  const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
  const currentTempo = tempoParam ? (tempoParam.min + tempoParam.max) / 2 : 120;
  
  // Get the rhythm duration for the selected beat unit
  const rhythmInfo = rhythmDurations[beatUnit] || rhythmDurations[7]; // Default to quarter notes
  const beatDuration = 60 / currentTempo; // One quarter note in seconds
  const unitDuration = rhythmInfo.beats * beatDuration; // Duration of selected unit
  
  const durationMs = Math.round(unitDuration * 1000);
  
  return durationMs;
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
    
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    

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
  
  // updateAllParameters() {
  //   const deltaTime = Math.min((this.currentTime - this.lastUpdateTime) / 1000, 0.05);
    
  //   for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
  //     if (voiceData[voiceIndex] && voiceData[voiceIndex].enabled) {
  //       this.updateVoiceParameters(voiceIndex, deltaTime);
  //     }
  //   }
  // }
  updateAllParameters() {
    const deltaTime = Math.min((this.currentTime - this.lastUpdateTime) / 1000, 0.05);
    
    for (let voiceIndex = 0; voiceIndex < 16; voiceIndex++) {
      if (voiceData[voiceIndex] && voiceData[voiceIndex].enabled) {
        this.updateVoiceParameters(voiceIndex, deltaTime);
        
        // NEW: Apply real-time updates to currently playing notes
        if (voiceClockManager && voiceClockManager.isInitialized) {
          const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
          if (voiceClock && voiceClock.isActive) {
            voiceClock.updateActiveNotesRealTime();
          }
        }
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

// Global state
let currentVoice = 0;
let voiceData = [];


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

  } else if (param.name === 'RESTS') {
    voice.parameters[param.name] = {
      selectedValues: [0],  // Default: No rests
      behavior: 50
    };

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
}

function createLifeSpanControl(param, voiceIndex) {

  
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-slider'; // Use standard class
  
  // GET THE STORED MAX TIME VALUE
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const storedMaxTimeMs = lifeSpanParam.maxTimeMs || 300000; // Default to 5 minutes if not set
  const storedMaxTimeFormatted = formatMsToMMSS(storedMaxTimeMs);
  
  
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
    
    
    // try {
    //   noUiSlider.create(sliderDiv, {
    //     start: [startEnter, Math.min(startExit, maxTimeMs)],
    //     connect: true,
    //     range: { min: 0, max: maxTimeMs },
    //     step: 1000, // 1 second steps
    //     tooltips: [true, true],
    //     format: formatter
    //   });
    try {
      // Calculate beat-based step size
      const beatStepMs = calculateBeatDurationMs(voiceIndex, beatUnit);
      
      
      noUiSlider.create(sliderDiv, {
        start: [startEnter, Math.min(startExit, maxTimeMs)],
        connect: true,
        range: { min: 0, max: maxTimeMs },
        step: beatStepMs, // Beat-based steps instead of 1000ms
        tooltips: [true, true],
        format: formatter
      });
      
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
  
  repeatContainer.appendChild(repeatCheckbox);
  controlsWrapper.appendChild(repeatContainer);
  wrapper.appendChild(controlsWrapper);
  
  return wrapper;
}

function rebuildLifeSpanSliders(container, voiceIndex) {
  
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const maxTimeMs = lifeSpanParam.maxTimeMs;
  const beatUnit = lifeSpanParam.beatUnit;
  
  
  // Find all Life Span sliders in this container
  const spanSliders = container.querySelectorAll('.life-span-dual-slider');
  
  spanSliders.forEach((sliderContainer) => {
    const spanNumber = parseInt(sliderContainer.dataset.spanNumber);
    
    // Get current values before destroying
    let currentEnter = 0;
    let currentExit = 0;
    
    // Find ALL existing slider instances in this container
    const existingSliders = sliderContainer.querySelectorAll('.noUi-target');
    
    if (existingSliders.length > 0) {
      // Get values from the FIRST slider (the most recent valid one)
      const firstSlider = existingSliders[0];
      
      if (firstSlider.noUiSlider) {
        try {
          const values = firstSlider.noUiSlider.get();
          currentEnter = parseLifeSpanValue(values[0]);
          currentExit = parseLifeSpanValue(values[1]);
          
        } catch (e) {
          console.warn(`Warning reading Life Span ${spanNumber} values:`, e);
        }
      }
      
      // Destroy and remove ALL existing sliders
      existingSliders.forEach((slider, index) => {
        try {
          if (slider.noUiSlider) {
            slider.noUiSlider.destroy();
          }
          slider.remove();
        } catch (e) {
          console.warn(`Warning removing slider:`, e);
        }
      });
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
      currentExit = maxTimeMs;
    }
    
    // Update data with clamped values
    lifeSpanParam[`lifeSpan${spanNumber}`].enter = currentEnter;
    lifeSpanParam[`lifeSpan${spanNumber}`].exit = currentExit;
    
    // Create NEW slider div (container should now be empty)
    const newSliderDiv = document.createElement('div');
    sliderContainer.appendChild(newSliderDiv);
    
    // Calculate beat-based step size
    const beatStepMs = calculateBeatDurationMs(voiceIndex, beatUnit);
    
    // Create new formatter with updated beat unit
    const formatter = createLifeSpanBeatFormatter(voiceIndex, beatUnit);
    
    try {
      
      noUiSlider.create(newSliderDiv, {
        start: [currentEnter, currentExit],
        connect: true,
        range: { min: 0, max: maxTimeMs },
        step: beatStepMs,
        tooltips: [true, true],
        format: formatter
      });
      
      // NEW: Force immediate tooltip update with new formatter
      newSliderDiv.noUiSlider.set([currentEnter, currentExit]);
      
      // Reconnect the update handler
      newSliderDiv.noUiSlider.on('update', function(values) {
        const enterValue = values[0];
        const exitValue = values[1];
        
        const enterMs = parseLifeSpanValue(enterValue);
        const exitMs = parseLifeSpanValue(exitValue);
        
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].enter = enterMs;
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].exit = exitMs;
        
      });      
    } catch (error) {
      console.error(`❌ Error creating Life Span ${spanNumber} slider:`, error);
    }
  });
  
}

function updateLifeSpanSlidersForTempoChange(voiceIndex) {
  
  // Find the Life Span parameter container for this voice
  if (voiceIndex !== currentVoice) {
    return;
  }
  
  const parameterSection = document.getElementById('parameter-section');
  const lifeSpanRollup = Array.from(parameterSection.querySelectorAll('.parameter-rollup'))
    .find(rollup => {
      const title = rollup.querySelector('.parameter-rollup-title');
      return title && title.textContent.trim() === 'LIFE SPAN';
    });
  
  if (!lifeSpanRollup) {
    return;
  }
  
  const lifeSpanContainer = lifeSpanRollup.querySelector('.dual-slider');
  if (lifeSpanContainer) {
    rebuildLifeSpanSliders(lifeSpanContainer, voiceIndex);
  }
}

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
      param.selectedValues = [7];
      
      // Check the Quarter Notes checkbox in the UI
      const quarterNotesCheckbox = document.querySelector(`input[id="RHYTHMS-${voiceIndex}-7"]`);
      if (quarterNotesCheckbox) {
        quarterNotesCheckbox.checked = true;
      }
    }
  }
}


  const optionsList = paramName === 'RHYTHMS' ? rhythmOptions : restOptions;
  const selectedNames = param.selectedValues.map(i => optionsList[i]);
  
}


function createDualSlider(param, voiceIndex) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dual-slider';
    
    // Special case for MELODIC RANGE - ALWAYS use piano keyboard
    if (param.name === 'MELODIC RANGE') {
        
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
                } else if (param.name === 'STEREO BALANCE') {
                    const currentBalance = (min + max) / 2;
                    audioManager.setBalanceRealTime(currentBalance);
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
  
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-slider';
  
  const voiceParam = voiceData[voiceIndex].parameters[param.name];
  
  if (!voiceParam) {
    console.error(`Missing parameter data for ${param.name}`);
    return wrapper;
  }
  
  
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
 
  const sourceTempo = voiceData[sourceVoiceIndex].parameters['TEMPO (BPM)'];
  
  if (!sourceTempo) {
    console.warn('Source voice has no tempo parameter');
    alert('Error: Source voice has no tempo settings to copy.');
    return;
  }
  
 
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

  const playButton = document.querySelector('#file-controls button:nth-child(4)');
  
  if (playButton && playButton.textContent === 'STOP') {
    
    if (voiceClockManager) {
      voiceClockManager.stopAllVoices();
    }
    
    if (masterClock) {
      masterClock.stop();
    }
// In the STOP section (around line 1586), add:
    if (audioManager && audioManager.audioHealthMonitor) {
      audioManager.audioHealthMonitor.stopMonitoring();
    }

    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    
  } else {
    
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
    
    
    masterClock.start();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    voiceClockManager.startAllVoices();
    
    // In the START section (around line 1647), add:
    if (audioManager && audioManager.audioHealthMonitor) {
      audioManager.audioHealthMonitor.startMonitoring();
    }
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
    
  }
}

function stopMasterPlayback() {
  
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
  
}

function scheduleNote(frequency, duration, startTime, voiceIndex) {

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
    
    
  } else {
    
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
  
  return noteDuration;
}

function getRestDuration(restIndex, currentTempo = null) {
  const tempo = currentTempo || getCurrentTempo(voiceIndex);
  
  if (restIndex === 0) {
    return 0;
  }
  
  const restInfo = rhythmDurations[restIndex - 1];
  if (!restInfo) {
    console.warn(`Invalid rest index ${restIndex}, defaulting to quarter note rest`);
    return 60 / tempo;
  }
  
  const beatDuration = 60 / tempo;
  const restDuration = restInfo.beats * beatDuration;
  
  return restDuration;
}

function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

window.selectMidiNote = function(voiceIndex) {
    
    const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
    const polyphonyParam = voiceData[voiceIndex].parameters['POLYPHONY'];
    
    
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
    
    
    const selectedNotes = [];
    
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
        const availableNotes = [...melodicParam.selectedNotes];
        
        for (let i = 0; i < noteCount && availableNotes.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableNotes.length);
            const selectedMidi = availableNotes.splice(randomIndex, 1)[0];
            
            const frequency = midiToFrequency(selectedMidi);
            const noteName = midiNoteNames[selectedMidi] || `MIDI${selectedMidi}`;
            
            selectedNotes.push({ midiNote: selectedMidi, frequency, noteName });
        }
        
        return selectedNotes;
    } else {
        
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
    
  }
  
  stopPlaying() {
    this.isPlaying = false;
    this.isPreviewPlaying = false;
    
    if (this.rhythmScheduler) {
      clearInterval(this.rhythmScheduler);
      this.rhythmScheduler = null;
    }
    
    this.stopContinuousOscillator();
    
  }
  
  startPreview() {
    this.stopPlaying();
    
    this.initializeContinuousOscillator();
    
    this.isPreviewPlaying = true;
    this.nextScheduledNoteTime = this.audioContext.currentTime + 0.1;
    
    this.scheduleVoiceNotes();
    this.startParameterEvolution();
    
  }
  
  stopPreview() {
    this.isPreviewPlaying = false;
    this.stopPlaying();
    
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
    
    const voiceParams = voiceData[this.voiceIndex].parameters;
    
    const rhythmParam = voiceParams['RHYTHMS'];
    const restParam = voiceParams['RESTS'];
    
    const rhythmIndex = this.selectValueInRange(rhythmParam);
    const restIndex = this.selectValueInRange(restParam);
    
    const voiceTempo = getVoiceTempo(this.voiceIndex);
    
    const noteDuration = getRhythmDuration(rhythmIndex, voiceTempo);
    const restDuration = getRestDuration(restIndex, voiceTempo);
    
    
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

    // NEW: Handle checkbox-based selection
    if (param.selectedValues && Array.isArray(param.selectedValues)) {
    
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
    } else {
      this.selectedNotes.clear();
      this.selectedNotes.add(60);
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
    } else {
      this.selectedNotes.add(midiNote);
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
      return;
    }
    
    const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
    const min = selectedArray[0];
    const max = selectedArray[selectedArray.length - 1];
    
    melodicParam.min = min;
    melodicParam.max = max;
    melodicParam.selectedNotes = selectedArray;
    
    delete melodicParam.currentNote;
    
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
    
    this.selectedNotes.clear();
    
    for (let midi = minMidi; midi <= maxMidi; midi++) {
      this.selectedNotes.add(midi);
    }
    
    this.updateVisualSelection();
    this.updateVoiceData();
    this.updateInfoDisplay();
    
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
  await audioManager.initialize();
  
  if (audioManager.isInitialized) {
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
    
    const harmonicNotes = [];
    const baseMidi = baseNote.midiNote;
    const availableRange = maxNote - minNote + 1;
    
    if (availableRange <= 12) {
        
        const usedNotes = new Set([baseMidi]);
        
        for (let midi = minNote; midi <= maxNote && harmonicNotes.length < additionalCount; midi++) {
            if (!usedNotes.has(midi)) {
                harmonicNotes.push({
                    midiNote: midi,
                    frequency: midiToFrequency(midi),
                    noteName: midiNoteNames[midi] || `MIDI${midi}`
                });
                usedNotes.add(midi);
            }
        }
    } else {
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
                }
                attempts++;
            }
            
            if (!noteFound) {
                break;
            }
        }
    }
    
    return harmonicNotes;
};

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
    
    const chordType = selectChordQuality(polyphonyCount, behaviorSetting);
    const intervals = chordQualities[chordType];
    
    
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
    
    return chordNotes;
}

class VoiceClock {
  constructor(voiceIndex, masterClock) {
    this.voiceIndex = voiceIndex;
    this.masterClock = masterClock;
    
    this.isActive = false;
    this.lastNoteTime = 0;
    this.nextNoteTime = 0;
    this.currentTempo = 120;
    this.lastTempoUpdate = 0;
    
    // NEW: Track active notes for real-time parameter updates
    this.activeNotes = new Set();
    

    this.lookaheadScheduler = null;
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
    

// NEW: Initialize lookahead scheduler if audioManager available
if (audioManager && audioManager.audioContext) {
  
  if (!this.lookaheadScheduler) {
    this.lookaheadScheduler = new LookaheadScheduler(
      this.voiceIndex,
      audioManager.audioContext,
      this.masterClock
    );
  }
  
  // Start lookahead scheduling
  this.lookaheadScheduler.start();
} else {
  console.warn(`Voice ${this.voiceIndex + 1}: Starting without lookahead (audioManager not ready)`);
}


  }
  
  stop() {
this.isActive = false;

// NEW: Stop lookahead scheduler
if (this.lookaheadScheduler) {
  this.lookaheadScheduler.stop();
}


    
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
  
  // CORRECTED REPEAT LOGIC: Use maxTimeMs as cycle length
  if (lifeSpanParam.repeat) {
    // Get the total cycle length from maxTimeMs
    const cycleLength = lifeSpanParam.maxTimeMs || 300000; // Fallback to 5 minutes
    
    // Check for infinite spans
    let hasInfiniteSpan = false;
    for (const span of activeSpans) {
      if (span.exit === Infinity) {
        hasInfiniteSpan = true;
        break;
      }
    }
    
    // If any span is infinite, always play
    if (hasInfiniteSpan) {
      return true;
    }
    
    // Calculate position within current cycle (using maxTimeMs, not exit time!)
    const cyclePosition = elapsedMs % cycleLength;
    const cycleNumber = Math.floor(elapsedMs / cycleLength) + 1;
    
    // Check if we're in any active span at this cycle position
    for (const span of activeSpans) {
      if (cyclePosition >= span.enter && cyclePosition < span.exit) {
        return true;
      }
    }
    
    return false;
  }
  
  // NON-REPEAT: Check spans once
  for (const span of activeSpans) {
    if (elapsedMs >= span.enter && (elapsedMs < span.exit || span.exit === Infinity)) {
      return true;
    }
  }
  
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
    
    // If repeat is enabled, this should NEVER happen after the first cycle starts
    if (repeatEnabled && elapsedMs > 1000) {
      console.error(`🚨 BUG: Voice ${this.voiceIndex + 1} with Repeat=true stopped playing at ${formatMsToMMSS(elapsedMs)}!`);
    }
    
    // Still schedule the next check in 100ms
    this.nextNoteTime = this.masterClock.getMasterTime() + 100;
    return;
  }

  // Rest of the function continues...
  
  this.updateTempo();
  
  const voiceParams = voiceData[this.voiceIndex].parameters;
  
  const rhythmParam = voiceParams['RHYTHMS'];
  const restParam = voiceParams['RESTS'];
  
  const rhythmIndex = this.selectValueInRange(rhythmParam);
  const restIndex = this.selectValueInRange(restParam);

  
  const noteDurationMs = this.getRhythmDurationMs(rhythmIndex);
  const restDurationMs = this.getRestDurationMs(restIndex);
  
  const noteInfoArray = selectMidiNote(this.voiceIndex);
  
  this.triggerNote(noteInfoArray, noteDurationMs);
  
  this.lastNoteTime = this.nextNoteTime;
  this.nextNoteTime = this.lastNoteTime + noteDurationMs + restDurationMs;
  
  const noteCount = noteInfoArray.length;
}

  
  selectValueInRange(param) {
    
    // NEW: Handle checkbox-based selection
    if (param.selectedValues && Array.isArray(param.selectedValues)) {
      
      if (param.selectedValues.length === 0) {
        console.warn('⚠️ No rhythmic values selected, defaulting to Quarter Notes (7)');
        return 7;
      }
      
      let selectedValue;
      
      if (param.behavior > 0) {
        // Random selection from checked values
        const randomIndex = Math.floor(Math.random() * param.selectedValues.length);
        selectedValue = param.selectedValues[randomIndex];
      } else {
        // Always use first selected value
        selectedValue = param.selectedValues[0];
      }
      
      // Make sure we return a number
      const result = parseInt(selectedValue);
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
  
  triggerNote(noteInfoArray, durationMs, scheduleTime = null) {
  if (!audioManager || !audioManager.isInitialized || !audioManager.audioContext) {
    console.warn(`Voice ${this.voiceIndex + 1}: Audio not ready, skipping notes`);
    return;
  }
  
  // Use provided schedule time, or default to "now + 10ms" for backward compatibility
  const startTime = scheduleTime !== null ? scheduleTime : (audioManager.audioContext.currentTime + 0.01);
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
  }
  
  return scheduledNotes;
}


createScheduledAudioNote(frequency, duration, startTime, offset = 0) {
  if (!audioManager || !audioManager.audioContext) return null;
  
  const actualStartTime = startTime + (offset * 0.001);
  
  // Acquire node set from pool
  let nodeSet = null;
  let usingPool = false;
  
  if (audioManager.oscillatorPool) {
    nodeSet = audioManager.oscillatorPool.acquire();
    usingPool = true;
  } else {
    nodeSet = {
      oscillator: audioManager.audioContext.createOscillator(),
      gainNode: audioManager.audioContext.createGain(),
      filterNode: audioManager.audioContext.createBiquadFilter(),
      panNode: audioManager.audioContext.createStereoPanner(),
      inUse: true,
      id: 'direct-' + Math.random().toString(36).substr(2, 6)
    };
    console.log(`⚠️ Using direct node creation: ${nodeSet.id}`);
  }
  
  const { oscillator, gainNode, filterNode, panNode } = nodeSet;
  
  // Get voice parameters and setup
  const selectedInstrumentIndex = voiceData[this.voiceIndex].parameters['INSTRUMENT'] || 0;
  const selectedInstrumentName = gmSounds[selectedInstrumentIndex] || 'Acoustic Grand Piano';
  const baseOscillatorType = getOscillatorTypeForGMSound(selectedInstrumentName);
  
  const currentVelocity = this.getCurrentVelocity();
  const velocityNormalized = Math.max(0, Math.min(1, currentVelocity / 127));
  const adsrEnvelope = this.getComprehensiveADSR(duration, velocityNormalized, selectedInstrumentName);
  const voiceParams = this.getAllCurrentVoiceParameters();
  
  // Configure oscillator
  const velocitySensitiveWaveform = this.getVelocitySensitiveWaveform(baseOscillatorType, velocityNormalized, selectedInstrumentName);
  oscillator.type = velocitySensitiveWaveform;
  
  // Apply frequency, portamento, and detuning
  const portamentoTime = this.getCurrentPortamentoTime();
  this.applyPortamento(oscillator, frequency, actualStartTime, portamentoTime);
  this.applyDetuning(oscillator, actualStartTime, duration);
  
  // Apply ADSR envelopes
  this.applyVolumeADSR(gainNode, adsrEnvelope, voiceParams, actualStartTime, duration);
  this.applyFilterADSR(filterNode, adsrEnvelope, frequency, velocityNormalized, selectedInstrumentName, actualStartTime, duration);
  this.applyPanADSR(panNode, adsrEnvelope, voiceParams, actualStartTime, duration);
  
  // Create effects nodes (NOT pooled - these are per-note)
  const effectNodes = this.createEffectNodes();
  
  // ===== CORRECTED: Build audio chain with PROPER effects routing =====
  
  // Basic chain: oscillator → filter → gain (ADSR applied here)
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  
  // Now connect effects AFTER the ADSR-controlled gain
  let audioChain = gainNode;
  
  // Apply each effect if active
  const tremoloIsActive = voiceParams.tremoloDepth > 0.001;
  const chorusIsActive = voiceParams.chorusDepth > 0.001;
  const phaserIsActive = voiceParams.phaserDepth > 0.001;
  const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
  const reverbMixValue = (reverbParam.depth?.min + reverbParam.depth?.max) / 2 || 0;
  const reverbIsActive = reverbMixValue > 0.001;
  const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
  const delayMixValue = (delayParam.depth?.min + delayParam.depth?.max) / 2 || 0;
  const delayIsActive = delayMixValue > 0.001;
  
  // Tremolo (if active)
  if (tremoloIsActive) {
    this.setupTremolo(audioChain, effectNodes.tremolo, voiceParams, actualStartTime, duration);
    audioChain = effectNodes.tremolo.wet;
  }
  
  // Chorus (if active)
  if (chorusIsActive) {
    this.setupChorus(audioChain, effectNodes.chorus, voiceParams, actualStartTime, duration);
    audioChain = effectNodes.chorus.mix;
  }
  
  // Phaser (if active)
  if (phaserIsActive) {
    this.setupPhaser(audioChain, effectNodes.phaser, voiceParams, actualStartTime, duration);
    audioChain = effectNodes.phaser.mix;
  }
  
  // Reverb (if active) - parallel mix
  if (reverbIsActive) {
    const reverbMixer = audioManager.audioContext.createGain();
    reverbMixer.gain.value = 1.0;
    
    this.setupReverb(audioChain, effectNodes.reverb, voiceParams, actualStartTime, duration);
    
    effectNodes.reverb.dry.connect(reverbMixer);
    effectNodes.reverb.wet.connect(reverbMixer);
    
    audioChain = reverbMixer;
    effectNodes.reverbMixer = reverbMixer; // Store for cleanup
  }
  
  // Delay (if active) - parallel mix with feedback
  if (delayIsActive) {
    const delayMixer = audioManager.audioContext.createGain();
    delayMixer.gain.value = 1.0;
    
    this.setupDelay(audioChain, effectNodes.delay, voiceParams, actualStartTime, duration);
    
    effectNodes.delay.dry.connect(delayMixer);
    effectNodes.delay.wet.connect(delayMixer);
    
    audioChain = delayMixer;
    effectNodes.delayMixer = delayMixer; // Store for cleanup
  }
  
  // Final connection to pan and master
  audioChain.connect(panNode);
  panNode.connect(audioManager.masterGainNode);
  
  // Track nodes for real-time control
  if (audioManager.isPlaying) {
    audioManager.previewGainNodes.add(gainNode);
    audioManager.previewPanNodes.add(panNode);
    
    const userVolumeMultiplier = audioManager.currentUserVolume / 100;
    const userPanValue = Math.max(-1, Math.min(1, audioManager.currentUserBalance / 100));
    
    panNode.pan.setValueAtTime(userPanValue, actualStartTime);
  }
  
  // Start and schedule stop
  oscillator.start(actualStartTime);
  oscillator.stop(actualStartTime + duration);
  
      // Enhanced cleanup with pool return
  const cleanup = () => {
    try {
      // NEW: Mark note as inactive and remove from tracking
      noteReference.isActive = false;
      if (this.activeNotes) {
        this.activeNotes.delete(noteReference);
      }
      
      // Disconnect effect nodes
      if (effectNodes) {
        this.cleanupEffectNodes(effectNodes);
      }
      
      // Return to pool or cleanup directly
      if (usingPool && audioManager.oscillatorPool) {
        audioManager.oscillatorPool.release(nodeSet);
      } else {
        oscillator.disconnect();
        gainNode.disconnect();
        filterNode.disconnect();
        panNode.disconnect();
      }
      
      // Remove from tracking
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

  // Schedule cleanup after note + effect tails
  const noteEndTime = actualStartTime + duration;
  const tailDuration = this.calculateMaxTailTime(voiceParams, duration);
  const cleanupTime = noteEndTime + (tailDuration / 1000);
  
  const cleanupOscillator = audioManager.audioContext.createOscillator();
  const silentGain = audioManager.audioContext.createGain();
  silentGain.gain.value = 0;
  
  cleanupOscillator.connect(silentGain);
  silentGain.connect(audioManager.audioContext.destination);
  
  cleanupOscillator.onended = cleanup;
  cleanupOscillator.start(cleanupTime);
  cleanupOscillator.stop(cleanupTime + 0.001);
  
  
// NEW: Create note reference object for real-time updates
  const noteReference = {
    oscillator,
    filterNode,
    gainNode,
    panNode,
    effectNodes,
    nodeSet,
    usingPool,
    startTime: actualStartTime,
    endTime: actualStartTime + duration,
    duration,
    frequency,
    voiceIndex: this.voiceIndex,
    velocity: currentVelocity,
    isActive: true  // NEW: Track if note is still playing
  };
  
  // NEW: Add to active notes tracking
  this.activeNotes.add(noteReference);
  
  return noteReference;

}


updateActiveNotesRealTime() {
  // NEW: Update tempo even if no notes are playing (affects next note timing)
  this.updateTempo();
  
  if (this.activeNotes.size === 0) return;
  
  const now = audioManager.audioContext.currentTime;
  const voiceParams = voiceData[this.voiceIndex].parameters;
  
  // Get current parameter values
  const volumeParam = voiceParams['VOLUME'];
  const balanceParam = voiceParams['STEREO BALANCE'];
  const tremoloParam = voiceParams['TREMOLO'];
  const chorusParam = voiceParams['CHORUS'];
  const phaserParam = voiceParams['PHASER'];
  const reverbParam = voiceParams['REVERB'];
  const delayParam = voiceParams['DELAY'];
  
  // Calculate current values
  const currentVolume = volumeParam.currentValue !== undefined ? 
    volumeParam.currentValue : (volumeParam.min + volumeParam.max) / 2;
  const currentBalance = balanceParam.currentValue !== undefined ?
    balanceParam.currentValue : (balanceParam.min + balanceParam.max) / 2;
  
  const volumeGain = (currentVolume / 100) * 0.15;
  const panValue = Math.max(-1, Math.min(1, currentBalance / 100));
  
  // Effect parameters
  const tremoloSpeed = 0.5 + ((tremoloParam.speed?.min + tremoloParam.speed?.max) / 2 / 100) * 11.5;
  const tremoloDepth = ((tremoloParam.depth?.min + tremoloParam.depth?.max) / 2 / 100) * 0.8;
  
  const chorusSpeed = 0.2 + ((chorusParam.speed?.min + chorusParam.speed?.max) / 2 / 100) * 2.8;
  const chorusDepth = ((chorusParam.depth?.min + chorusParam.depth?.max) / 2 / 100) * 0.7;
  
  const phaserSpeed = 0.1 + ((phaserParam.speed?.min + phaserParam.speed?.max) / 2 / 100) * 1.9;
  const phaserDepth = ((phaserParam.depth?.min + phaserParam.depth?.max) / 2 / 100) * 0.8;
  
  const reverbMix = (reverbParam.depth?.min + reverbParam.depth?.max) / 2 / 100;
  const delayMix = (delayParam.depth?.min + delayParam.depth?.max) / 2 / 100;
  const delayFeedback = (delayParam.feedback?.min + delayParam.feedback?.max) / 2 / 100;
  
  // Update each active note
  this.activeNotes.forEach(note => {
    if (!note.isActive || now < note.startTime || now > note.endTime) {
      return; // Skip notes that aren't currently playing
    }
    
    try {
      // Update Volume (respect ADSR but scale by current setting)
      // We can't directly override ADSR, but we can scale the overall gain
      // This is a compromise - volume changes will be relative to ADSR envelope
      
      // Update Pan (this works perfectly in real-time)
      if (note.panNode && note.panNode.pan) {
        note.panNode.pan.setValueAtTime(panValue, now);
      }
      
      // Update Tremolo LFO frequency (if tremolo is active)
      if (note.effectNodes && note.effectNodes.tremolo) {
        const tremolo = note.effectNodes.tremolo;
        if (tremolo.lfo && tremolo.lfo.frequency && tremoloDepth > 0.001) {
          tremolo.lfo.frequency.setValueAtTime(tremoloSpeed, now);
          
          // Update depth
          if (tremolo.depth && tremolo.depth.gain) {
            tremolo.depth.gain.setValueAtTime(tremoloDepth * 0.5, now);
          }
        }
      }
      
      // Update Chorus LFO frequencies (if chorus is active)
      if (note.effectNodes && note.effectNodes.chorus) {
        const chorus = note.effectNodes.chorus;
        if (chorusDepth > 0.001) {
          if (chorus.lfo1 && chorus.lfo1.frequency) {
            chorus.lfo1.frequency.setValueAtTime(chorusSpeed * 0.8, now);
          }
          if (chorus.lfo2 && chorus.lfo2.frequency) {
            chorus.lfo2.frequency.setValueAtTime(chorusSpeed * 1.1, now);
          }
          if (chorus.lfo3 && chorus.lfo3.frequency) {
            chorus.lfo3.frequency.setValueAtTime(chorusSpeed * 1.3, now);
          }
          
          // Update depth
          const maxChorusDepth = chorusDepth * 0.008;
          if (chorus.depth1 && chorus.depth1.gain) {
            chorus.depth1.gain.setValueAtTime(maxChorusDepth, now);
          }
          if (chorus.depth2 && chorus.depth2.gain) {
            chorus.depth2.gain.setValueAtTime(maxChorusDepth * 1.2, now);
          }
          if (chorus.depth3 && chorus.depth3.gain) {
            chorus.depth3.gain.setValueAtTime(maxChorusDepth * 0.9, now);
          }
        }
      }
      
      // Update Phaser LFO frequency (if phaser is active)
      if (note.effectNodes && note.effectNodes.phaser) {
        const phaser = note.effectNodes.phaser;
        if (phaser.lfo && phaser.lfo.frequency && phaserDepth > 0.001) {
          phaser.lfo.frequency.setValueAtTime(phaserSpeed, now);
          
          // Update depth
          const maxPhaserDepth = phaserDepth * 800;
          if (phaser.depth && phaser.depth.gain) {
            phaser.depth.gain.setValueAtTime(maxPhaserDepth, now);
          }
          
          // Update feedback
          const feedbackAmount = Math.min(0.55, phaserDepth * 0.7);
          if (phaser.feedback && phaser.feedback.gain) {
            phaser.feedback.gain.setValueAtTime(feedbackAmount, now);
          }
        }
      }
      
      // Update Reverb mix (if reverb is active)
      if (note.effectNodes && note.effectNodes.reverb) {
        const reverb = note.effectNodes.reverb;
        if (reverbMix > 0.001) {
          const reverbDryLevel = 1.0 - (reverbMix * 0.8);
          const reverbWetLevel = reverbMix * 2.0;
          
          if (reverb.dry && reverb.dry.gain) {
            reverb.dry.gain.setValueAtTime(reverbDryLevel, now);
          }
          if (reverb.wet && reverb.wet.gain) {
            reverb.wet.gain.setValueAtTime(reverbWetLevel, now);
          }
        }
      }
      
      // Update Delay mix and feedback (if delay is active)
      if (note.effectNodes && note.effectNodes.delay) {
        const delay = note.effectNodes.delay;
        if (delayMix > 0.001) {
          const delayDryLevel = 1.0 - (delayMix * 0.9);
          const delayWetLevel = delayMix * 2.5;
          
          if (delay.dry && delay.dry.gain) {
            delay.dry.gain.setValueAtTime(delayDryLevel, now);
          }
          if (delay.wet && delay.wet.gain) {
            delay.wet.gain.setValueAtTime(delayWetLevel, now);
          }
          if (delay.feedback && delay.feedback.gain) {
            delay.feedback.gain.setValueAtTime(delayFeedback, now);
          }
        }
      }
      
    } catch (e) {
      // Node might be disconnected, skip it
    }
  });
}


// NEW: Simplified effect setup methods (add these to VoiceClock class)

setupTremolo(inputNode, tremoloNodes, voiceParams, actualStartTime, duration) {
  tremoloNodes.lfo.type = 'sine';
  tremoloNodes.lfo.frequency.setValueAtTime(voiceParams.tremoloSpeed, actualStartTime);
  
  const modulationDepth = voiceParams.tremoloDepth * 0.5;
  
  tremoloNodes.gain.gain.setValueAtTime(1.0, actualStartTime);
  tremoloNodes.depth.gain.setValueAtTime(modulationDepth, actualStartTime);
  
  inputNode.connect(tremoloNodes.gain);
  tremoloNodes.lfo.connect(tremoloNodes.depth);
  tremoloNodes.depth.connect(tremoloNodes.gain.gain);
  tremoloNodes.gain.connect(tremoloNodes.wet);
  
  tremoloNodes.lfo.start(actualStartTime);
  tremoloNodes.lfo.stop(actualStartTime + duration);
}

setupChorus(inputNode, chorusNodes, voiceParams, actualStartTime, duration) {
  const baseDelayTime = 0.020;
  const maxChorusDepth = voiceParams.chorusDepth * 0.008;
  const chorusSpeed = voiceParams.chorusSpeed;
  
  // Voice 1
  chorusNodes.delay1.delayTime.setValueAtTime(baseDelayTime, actualStartTime);
  chorusNodes.lfo1.type = 'sine';
  chorusNodes.lfo1.frequency.setValueAtTime(chorusSpeed * 0.8, actualStartTime);
  chorusNodes.depth1.gain.setValueAtTime(maxChorusDepth, actualStartTime);
  chorusNodes.gain1.gain.setValueAtTime(0.35, actualStartTime);
  
  inputNode.connect(chorusNodes.delay1);
  chorusNodes.lfo1.connect(chorusNodes.depth1);
  chorusNodes.depth1.connect(chorusNodes.delay1.delayTime);
  chorusNodes.delay1.connect(chorusNodes.gain1);
  chorusNodes.gain1.connect(chorusNodes.mix);
  
  chorusNodes.lfo1.start(actualStartTime);
  chorusNodes.lfo1.stop(actualStartTime + duration);
  
  // Voice 2
  chorusNodes.delay2.delayTime.setValueAtTime(baseDelayTime * 1.6, actualStartTime);
  chorusNodes.lfo2.type = 'sine';
  chorusNodes.lfo2.frequency.setValueAtTime(chorusSpeed * 1.1, actualStartTime);
  chorusNodes.depth2.gain.setValueAtTime(maxChorusDepth * 1.2, actualStartTime);
  chorusNodes.gain2.gain.setValueAtTime(0.30, actualStartTime);
  
  inputNode.connect(chorusNodes.delay2);
  chorusNodes.lfo2.connect(chorusNodes.depth2);
  chorusNodes.depth2.connect(chorusNodes.delay2.delayTime);
  chorusNodes.delay2.connect(chorusNodes.gain2);
  chorusNodes.gain2.connect(chorusNodes.mix);
  
  chorusNodes.lfo2.start(actualStartTime);
  chorusNodes.lfo2.stop(actualStartTime + duration);
  
  // Voice 3
  chorusNodes.delay3.delayTime.setValueAtTime(baseDelayTime * 2.4, actualStartTime);
  chorusNodes.lfo3.type = 'sine';
  chorusNodes.lfo3.frequency.setValueAtTime(chorusSpeed * 1.3, actualStartTime);
  chorusNodes.depth3.gain.setValueAtTime(maxChorusDepth * 0.9, actualStartTime);
  chorusNodes.gain3.gain.setValueAtTime(0.35, actualStartTime);
  
  inputNode.connect(chorusNodes.delay3);
  chorusNodes.lfo3.connect(chorusNodes.depth3);
  chorusNodes.depth3.connect(chorusNodes.delay3.delayTime);
  chorusNodes.delay3.connect(chorusNodes.gain3);
  chorusNodes.gain3.connect(chorusNodes.mix);
  
  chorusNodes.lfo3.start(actualStartTime);
  chorusNodes.lfo3.stop(actualStartTime + duration);
  
  // Dry signal
  inputNode.connect(chorusNodes.dry);
  chorusNodes.dry.connect(chorusNodes.mix);
}

setupPhaser(inputNode, phaserNodes, voiceParams, actualStartTime, duration) {
  const phaserStages = [phaserNodes.stage1, phaserNodes.stage2, phaserNodes.stage3, phaserNodes.stage4];
  const maxPhaserDepth = voiceParams.phaserDepth * 800;
  const phaserSpeed = voiceParams.phaserSpeed;
  const baseFrequency = 300;
  
  phaserNodes.lfo.type = 'sine';
  phaserNodes.lfo.frequency.setValueAtTime(phaserSpeed, actualStartTime);
  phaserNodes.depth.gain.setValueAtTime(maxPhaserDepth, actualStartTime);
  
  phaserStages.forEach((stage, index) => {
    stage.type = 'allpass';
    const stageQ = 3 + (voiceParams.phaserDepth * 6);
    stage.Q.setValueAtTime(stageQ, actualStartTime);
    
    const frequencyMultiplier = Math.pow(2.2, index);
    const stageFreq = baseFrequency * frequencyMultiplier;
    stage.frequency.setValueAtTime(stageFreq, actualStartTime);
  });
  
  const feedbackAmount = Math.min(0.55, voiceParams.phaserDepth * 0.7);
  phaserNodes.feedback.gain.setValueAtTime(feedbackAmount, actualStartTime);
  
  // Connect chain
  inputNode.connect(phaserStages[0]);
  for (let i = 0; i < phaserStages.length - 1; i++) {
    phaserStages[i].connect(phaserStages[i + 1]);
  }
  phaserStages[phaserStages.length - 1].connect(phaserNodes.feedback);
  phaserNodes.feedback.connect(phaserStages[0]);
  phaserStages[phaserStages.length - 1].connect(phaserNodes.mix);
  
  // Dry signal
  inputNode.connect(phaserNodes.dry);
  phaserNodes.dry.connect(phaserNodes.mix);
  
  // LFO modulation
  phaserNodes.lfo.connect(phaserNodes.depth);
  phaserStages.forEach(stage => {
    phaserNodes.depth.connect(stage.frequency);
  });
  
  phaserNodes.lfo.start(actualStartTime);
  phaserNodes.lfo.stop(actualStartTime + duration);
}

setupReverb(inputNode, reverbNodes, voiceParams, actualStartTime, duration) {
  const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
  const timeValue = (reverbParam.speed?.min + reverbParam.speed?.max) / 2 || 0;
  const mixValue = (reverbParam.depth?.min + reverbParam.depth?.max) / 2 || 0;
  
  const reverbDepth = mixValue / 100;
  const reverbTime = 0.5 + (timeValue / 100) * 5.5;
  const sampleRate = audioManager.audioContext.sampleRate;
  const length = Math.floor(sampleRate * reverbTime);
  
  const impulse = audioManager.audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    const earlyReflectionTime = Math.min(Math.floor(sampleRate * 0.05), length);
    
    for (let i = 0; i < earlyReflectionTime; i++) {
      const earlyBoost = 3.0;
      channelData[i] = earlyBoost * (Math.random() * 2 - 1);
    }
    
    for (let i = earlyReflectionTime; i < length; i++) {
      const n = length - i;
      const amplitude = 5.0 * (Math.random() * 2 - 1) * Math.pow(n / length, 0.9);
      channelData[i] = amplitude;
    }
  }
  
  reverbNodes.convolver.buffer = impulse;
  
  const reverbDryLevel = 1.0 - (reverbDepth * 0.8);
  const reverbWetLevel = reverbDepth * 2.0;
  
  reverbNodes.dry.gain.value = reverbDryLevel;
  reverbNodes.wet.gain.value = reverbWetLevel;
  
  // Connect
  inputNode.connect(reverbNodes.dry);
  inputNode.connect(reverbNodes.convolver);
  reverbNodes.convolver.connect(reverbNodes.wet);
}

setupDelay(inputNode, delayNodes, voiceParams, actualStartTime, duration) {
  const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
  const timeValue = (delayParam.speed?.min + delayParam.speed?.max) / 2 || 0;
  const mixValue = (delayParam.depth?.min + delayParam.depth?.max) / 2 || 0;
  const feedbackValue = (delayParam.feedback?.min + delayParam.feedback?.max) / 2 || 0;
  
  const delayDepth = mixValue / 100;
  const delayTimeMs = 100 + (timeValue / 100) * 1900;
  const delayTimeSeconds = delayTimeMs / 1000;
  
  let feedbackLevel = feedbackValue / 100;
  if (delayTimeMs > 1800) {
    feedbackLevel = Math.min(feedbackLevel, 0.85);
  }
  
  const delayDryLevel = 1.0 - (delayDepth * 0.9);
  const delayWetLevel = delayDepth * 2.5;
  
  delayNodes.delay.delayTime.setValueAtTime(delayTimeSeconds, actualStartTime);
  delayNodes.dry.gain.value = delayDryLevel;
  delayNodes.wet.gain.value = delayWetLevel;
  delayNodes.feedback.gain.value = feedbackLevel;
  
  // Connect
  inputNode.connect(delayNodes.dry);
  inputNode.connect(delayNodes.delay);
  delayNodes.delay.connect(delayNodes.wet);
  delayNodes.delay.connect(delayNodes.feedback);
  delayNodes.feedback.connect(delayNodes.delay);
}

// ADD these helper methods after createScheduledAudioNote in VoiceClock class

createEffectNodes() {
  const effectNodes = {};
  
  // Create effect nodes (these are NOT pooled - created fresh per note)
  effectNodes.tremolo = {
    lfo: audioManager.audioContext.createOscillator(),
    gain: audioManager.audioContext.createGain(),
    depth: audioManager.audioContext.createGain(),
    wet: audioManager.audioContext.createGain(),
    dry: audioManager.audioContext.createGain()
  };
  
  effectNodes.chorus = {
    delay1: audioManager.audioContext.createDelay(0.1),
    delay2: audioManager.audioContext.createDelay(0.1),
    delay3: audioManager.audioContext.createDelay(0.1),
    lfo1: audioManager.audioContext.createOscillator(),
    lfo2: audioManager.audioContext.createOscillator(),
    lfo3: audioManager.audioContext.createOscillator(),
    gain1: audioManager.audioContext.createGain(),
    gain2: audioManager.audioContext.createGain(),
    gain3: audioManager.audioContext.createGain(),
    depth1: audioManager.audioContext.createGain(),
    depth2: audioManager.audioContext.createGain(),
    depth3: audioManager.audioContext.createGain(),
    mix: audioManager.audioContext.createGain(),
    dry: audioManager.audioContext.createGain()
  };
  
  effectNodes.phaser = {
    stage1: audioManager.audioContext.createBiquadFilter(),
    stage2: audioManager.audioContext.createBiquadFilter(),
    stage3: audioManager.audioContext.createBiquadFilter(),
    stage4: audioManager.audioContext.createBiquadFilter(),
    lfo: audioManager.audioContext.createOscillator(),
    depth: audioManager.audioContext.createGain(),
    feedback: audioManager.audioContext.createGain(),
    mix: audioManager.audioContext.createGain(),
    dry: audioManager.audioContext.createGain()
  };
  
  effectNodes.reverb = {
    convolver: audioManager.audioContext.createConvolver(),
    dry: audioManager.audioContext.createGain(),
    wet: audioManager.audioContext.createGain()
  };
  
  effectNodes.delay = {
    delay: audioManager.audioContext.createDelay(2.0),
    feedback: audioManager.audioContext.createGain(),
    wet: audioManager.audioContext.createGain(),
    dry: audioManager.audioContext.createGain()
  };
  
  return effectNodes;
}

buildAudioChain(nodeSet, effectNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  const { oscillator, gainNode, filterNode, panNode } = nodeSet;
  
  
  // Basic chain: oscillator → filter → gain
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  
  let audioChain = gainNode;
  
  // Apply effects based on voice parameters
  const tremoloIsActive = this.connectTremoloIfActive(audioChain, effectNodes.tremolo, adsrEnvelope, voiceParams, actualStartTime, duration);
  if (tremoloIsActive) {
    audioChain = effectNodes.tremolo.mix || audioChain;
  }
  
  const chorusIsActive = this.connectChorusIfActive(audioChain, effectNodes.chorus, adsrEnvelope, voiceParams, actualStartTime, duration);
  if (chorusIsActive) {
    audioChain = effectNodes.chorus.mix || audioChain;
  }
  
  const phaserIsActive = this.connectPhaserIfActive(audioChain, effectNodes.phaser, adsrEnvelope, voiceParams, actualStartTime, duration);
  if (phaserIsActive) {
    audioChain = effectNodes.phaser.mix || audioChain;
  }
  
  const reverbIsActive = this.connectReverbIfActive(audioChain, effectNodes.reverb, adsrEnvelope, voiceParams, actualStartTime, duration);
  if (reverbIsActive) {
    const reverbMixer = audioManager.audioContext.createGain();
    reverbMixer.gain.value = 1.0;
    effectNodes.reverb.dry.connect(reverbMixer);
    effectNodes.reverb.wet.connect(reverbMixer);
    audioChain = reverbMixer;
  }
  
  const delayIsActive = this.connectDelayIfActive(audioChain, effectNodes.delay, adsrEnvelope, voiceParams, actualStartTime, duration);
  if (delayIsActive) {
    const delayMixer = audioManager.audioContext.createGain();
    delayMixer.gain.value = 1.0;
    effectNodes.delay.dry.connect(delayMixer);
    effectNodes.delay.wet.connect(delayMixer);
    audioChain = delayMixer;
  }
  
  // Final connection to pan and master
  audioChain.connect(panNode);
  panNode.connect(audioManager.masterGainNode);
  
}

connectTremoloIfActive(inputNode, tremoloNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  if (voiceParams.tremoloDepth <= 0.001) return false;
  
  // Apply tremolo using existing ADSR method
  const isActive = this.applyTremoloADSR(
    tremoloNodes.lfo, tremoloNodes.gain, tremoloNodes.depth, 
    tremoloNodes.wet, tremoloNodes.dry, 
    adsrEnvelope, voiceParams, actualStartTime, duration
  );
  
  if (isActive) {
    inputNode.connect(tremoloNodes.gain);
  }
  
  return isActive;
}

connectChorusIfActive(inputNode, chorusNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  if (voiceParams.chorusDepth <= 0.001) return false;
  
  const isActive = this.applyChorusADSR(
    chorusNodes.delay1, chorusNodes.delay2, chorusNodes.delay3,
    chorusNodes.lfo1, chorusNodes.lfo2, chorusNodes.lfo3,
    chorusNodes.gain1, chorusNodes.gain2, chorusNodes.gain3,
    chorusNodes.depth1, chorusNodes.depth2, chorusNodes.depth3,
    adsrEnvelope, voiceParams, actualStartTime, duration
  );
  
  return isActive;
}

connectPhaserIfActive(inputNode, phaserNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  if (voiceParams.phaserDepth <= 0.001) return false;
  
  const phaserStages = [phaserNodes.stage1, phaserNodes.stage2, phaserNodes.stage3, phaserNodes.stage4];
  
  const isActive = this.applyPhaserADSR(
    phaserStages, phaserNodes.lfo, phaserNodes.depth, phaserNodes.feedback,
    adsrEnvelope, voiceParams, actualStartTime, duration
  );
  
  return isActive;
}

connectReverbIfActive(inputNode, reverbNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
  const mixValue = (reverbParam.depth?.min + reverbParam.depth?.max) / 2 || 0;
  if (mixValue <= 0.001) return false;
  
  const isActive = this.applyReverbADSR(
    reverbNodes.convolver, reverbNodes.dry, reverbNodes.wet,
    adsrEnvelope, voiceParams, actualStartTime, duration
  );
  
  if (isActive) {
    inputNode.connect(reverbNodes.dry);
    inputNode.connect(reverbNodes.convolver);
    reverbNodes.convolver.connect(reverbNodes.wet);
  }
  
  return isActive;
}

connectDelayIfActive(inputNode, delayNodes, adsrEnvelope, voiceParams, actualStartTime, duration) {
  const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
  const mixValue = (delayParam.depth?.min + delayParam.depth?.max) / 2 || 0;
  if (mixValue <= 0.001) return false;
  
  const isActive = this.applyDelayADSR(
    delayNodes.delay, delayNodes.feedback, delayNodes.wet, delayNodes.dry,
    adsrEnvelope, voiceParams, actualStartTime, duration
  );
  
  if (isActive) {
    inputNode.connect(delayNodes.dry);
    inputNode.connect(delayNodes.delay);
    delayNodes.delay.connect(delayNodes.wet);
    delayNodes.delay.connect(delayNodes.feedback);
    delayNodes.feedback.connect(delayNodes.delay);
  }
  
  return isActive;
}

cleanupEffectNodes(effectNodes) {
  // Cleanup tremolo
  if (effectNodes.tremolo) {
    try {
      effectNodes.tremolo.lfo.stop();
      effectNodes.tremolo.lfo.disconnect();
      effectNodes.tremolo.gain.disconnect();
      effectNodes.tremolo.depth.disconnect();
      effectNodes.tremolo.wet.disconnect();
      effectNodes.tremolo.dry.disconnect();
    } catch (e) {}
  }
  
  // Cleanup chorus
  if (effectNodes.chorus) {
    try {
      effectNodes.chorus.lfo1.stop();
      effectNodes.chorus.lfo2.stop();
      effectNodes.chorus.lfo3.stop();
      Object.values(effectNodes.chorus).forEach(node => {
        if (node.disconnect) node.disconnect();
      });
    } catch (e) {}
  }
  
  // Cleanup phaser
  if (effectNodes.phaser) {
    try {
      effectNodes.phaser.lfo.stop();
      Object.values(effectNodes.phaser).forEach(node => {
        if (node.disconnect) node.disconnect();
      });
    } catch (e) {}
  }
  
  // Cleanup reverb and delay
  ['reverb', 'delay'].forEach(effectType => {
    if (effectNodes[effectType]) {
      try {
        Object.values(effectNodes[effectType]).forEach(node => {
          if (node.disconnect) node.disconnect();
        });
      } catch (e) {}
    }
  });
}

calculateMaxTailTime(voiceParams, duration) {
  let maxTail = 1000; // 1 second minimum
  
  // Calculate reverb tail
  const reverbParam = voiceData[this.voiceIndex].parameters['REVERB'];
  if (reverbParam && reverbParam.depth) {
    const reverbDepth = (reverbParam.depth.min + reverbParam.depth.max) / 2;
    if (reverbDepth > 0.001) {
      const reverbTime = 0.5 + ((reverbParam.speed?.min + reverbParam.speed?.max) / 2 / 100) * 5.5;
      maxTail = Math.max(maxTail, reverbTime * 15000);
    }
  }
  
  // Calculate delay tail
  const delayParam = voiceData[this.voiceIndex].parameters['DELAY'];
  if (delayParam && delayParam.depth) {
    const delayDepth = (delayParam.depth.min + delayParam.depth.max) / 2;
    if (delayDepth > 0.001) {
      const feedbackValue = (delayParam.feedback?.min + delayParam.feedback?.max) / 2 || 0;
      const delayTimeSeconds = (100 + ((delayParam.speed?.min + delayParam.speed?.max) / 2 / 100) * 1900) / 1000;
      maxTail = Math.max(maxTail, this.calculateDelayTailTime(delayTimeSeconds, feedbackValue / 100));
    }
  }
  
  return Math.min(maxTail, 60000); // Cap at 60 seconds
}

  
  
  applyVolumeADSR(gainNode, envelope, voiceParams, startTime, duration) {
    const velocityMultiplier = voiceParams.velocityScale || 1.0;
    const baseGain = voiceParams.volume * velocityMultiplier * voiceParams.polyphonyScale;
    
    const volumeBoost = 8.0;
    const peakGain = baseGain * envelope.peakLevel * volumeBoost;
    const sustainGain = baseGain * envelope.sustain * volumeBoost;
    
    
    const minAudibleGain = 0.1;
    const finalPeakGain = Math.max(minAudibleGain, peakGain);
    const finalSustainGain = Math.max(minAudibleGain * 0.7, sustainGain);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(finalPeakGain, startTime + envelope.attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, finalSustainGain), startTime + envelope.decayEnd);
    gainNode.gain.setValueAtTime(finalSustainGain, startTime + envelope.sustainEnd);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);
    
  }

  applyFilterADSR(filterNode, envelope, frequency, velocityNormalized, instrumentName, startTime, duration) {
    filterNode.type = 'lowpass';
    
    const velocityQ = 0.5 + (velocityNormalized * 8.0);
    filterNode.Q.setValueAtTime(velocityQ, startTime);
    
    
    const baseCutoff = frequency * 2;
    const velocityMultiplier = 2 + (velocityNormalized * 18);
    const peakCutoff = frequency * velocityMultiplier * envelope.peakLevel;
    const sustainCutoff = frequency * velocityMultiplier * envelope.sustain * 0.7;
    const releaseCutoff = baseCutoff;
    
    
    filterNode.frequency.setValueAtTime(baseCutoff, startTime);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, peakCutoff), startTime + envelope.attack);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, sustainCutoff), startTime + envelope.decayEnd);
    filterNode.frequency.setValueAtTime(sustainCutoff, startTime + envelope.sustainEnd);
    filterNode.frequency.exponentialRampToValueAtTime(Math.max(20, releaseCutoff), startTime + duration);
  }

  applyTremoloADSR(tremoloLFO, tremoloGain, tremoloDepth, tremoloWet, tremoloDry, adsrEnvelope, voiceParams, actualStartTime, duration) {
    if (voiceParams.tremoloDepth <= 0.001) {
      tremoloGain.gain.setValueAtTime(1.0, actualStartTime);
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
    
    
    return true;
  }

  applyChorusADSR(chorusDelay1, chorusDelay2, chorusDelay3, chorusLFO1, chorusLFO2, chorusLFO3, 
                  chorusGain1, chorusGain2, chorusGain3, chorusDepth1, chorusDepth2, chorusDepth3,
                  adsrEnvelope, voiceParams, actualStartTime, duration) {
      
      if (voiceParams.chorusDepth <= 0.001) {
          chorusGain1.gain.setValueAtTime(0, actualStartTime);
          chorusGain2.gain.setValueAtTime(0, actualStartTime);
          chorusGain3.gain.setValueAtTime(0, actualStartTime);
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
      
      return true;
  }

  applyPhaserADSR(phaserStages, phaserLFO, phaserDepth, phaserFeedback, adsrEnvelope, voiceParams, actualStartTime, duration) {
      if (voiceParams.phaserDepth <= 0.001) {
          phaserDepth.gain.setValueAtTime(0, actualStartTime);
          phaserFeedback.gain.setValueAtTime(0, actualStartTime);
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
              return 'sine';
          }
          if (velocityNormalized < 0.7) {
              return 'triangle';
          }
          return 'square';
      }
      
      if (instrumentName.includes('String') || instrumentName.includes('Violin') || instrumentName.includes('Cello')) {
          if (velocityNormalized < 0.4) {
              return 'sine';
          }
          return 'sawtooth';
      }
      
      if (instrumentName.includes('Brass') || instrumentName.includes('Trumpet') || instrumentName.includes('Horn')) {
          if (velocityNormalized < 0.5) {
              return 'triangle';
          }
          return 'square';
      }
      
      if (instrumentName.includes('Guitar')) {
          if (velocityNormalized < 0.3) {
              return 'triangle';
          }
          return 'sawtooth';
      }
      
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
      
      const detuningParam = voiceData[this.voiceIndex].parameters['DETUNING'];
      
      if (!detuningParam) {
          console.log(`❌ No detuning parameter found for Voice ${this.voiceIndex + 1}`);
          return;
      }
      
      
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
      
      
      const detuneCents = Math.max(-50, Math.min(50, detuningValue));
      
      
      if (!oscillator || !oscillator.detune) {
          console.log(`❌ Oscillator or detune property not available`);
          return;
      }
      
      try {
          oscillator.detune.setValueAtTime(detuneCents, startTime);
          
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
          }
          
      } catch (error) {
          console.error(`❌ Error setting detune:`, error);
      }
      
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
// ===== VOICE CLOCK MANAGER SYSTEM =====
class VoiceClockManager {
  constructor() {
    this.voiceClocks = [];
    this.masterClock = null;
    this.isInitialized = false;
    this.isManualStop = false;

  }
  
  initialize(masterClock) {
    this.masterClock = masterClock;
    this.voiceClocks = [];
    
    for (let i = 0; i < 16; i++) {
      const voiceClock = new VoiceClock(i, masterClock);
      this.voiceClocks.push(voiceClock);
    }
    
    this.isInitialized = true;
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
    
  }
  
  stopAllVoices() {
    this.isManualStop = true;
    
    for (let i = 0; i < 16; i++) {
      this.voiceClocks[i].stop();
    }
    
    
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

    if (hasCompleted) {
    }
    
    if (hasCompleted && !shouldPlay) {
      // Voice has ACTUALLY completed its Life Span - auto-stop it
      const elapsed = this.masterClock.getElapsedTime();
      
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
    }
    
    activeVoiceCount++;
    

  }
  
  // Handle preview button resets
  previewVoicesCompleted.forEach(voiceIndex => {
    this.resetPreviewButton(voiceIndex);
  });
  
// Auto-reset check for main PLAY button - only if ALL enabled voices have completed
  const totalEnabledVoices = voiceData.filter(voice => voice.enabled).length;

// NEW: Check if any voices haven't started yet OR are waiting to enter
let voicesWaitingToEnter = 0;
const elapsedMs = this.masterClock.getElapsedTime();

for (let i = 0; i < 16; i++) {
  if (!voiceData[i].enabled) continue;
  
  const voiceClock = this.voiceClocks[i];
  if (!voiceClock) continue;
  
  const shouldPlay = voiceClock.shouldPlayNote();
  const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
  
  
  // Check if this voice has a future enter time
  if (lifeSpan) {
    for (let spanNum = 1; spanNum <= 3; spanNum++) {
      const span = lifeSpan[`lifeSpan${spanNum}`];
      if (span && span.exit > 0 && span.enter > elapsedMs) {
        voicesWaitingToEnter++;
        break; // Count this voice only once
      }
    }
  }
}


  // Only auto-reset if NO voices are waiting to enter

  if (voicesCompletedNaturally > 0 && activeVoiceCount === 0 && voicesWaitingToEnter === 0 && voicesCompletedNaturally === totalEnabledVoices) {
    setTimeout(() => {
      this.performAutoReset();
    }, 1000);


} else if (voicesCompletedNaturally > 0 && activeVoiceCount > 0) {
}

  
  if (activeVoiceCount > 10) {
  }
}

resetPreviewButton(voiceIndex) {
  
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
    
  }
}


hasVoiceCompletedLifeSpan(voiceIndex) {
  const elapsedMs = this.masterClock.getElapsedTime();
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpanParam) return false;
  
  // CRITICAL CHECK: If repeat is enabled, NEVER complete
  if (lifeSpanParam.repeat) {
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
  
  
  return completed;
}




  checkForAutoReset() {
    if (this.isManualStop) {
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
    
    
    // Simple auto-reset: if no voices are active (they completed naturally)
    if (enabledCount > 0 && activeCount === 0) {
      this.performAutoReset();
    }
  }

  performAutoReset() {

    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    if (playButton && playButton.textContent === 'STOP') {
      playButton.textContent = 'PLAY';
      playButton.style.backgroundColor = '';
      playButton.style.color = '';
      
      if (masterClock && masterClock.isActive()) {
        masterClock.stop();
      }
      
      this.stopAllVoices();
      
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
// ===== MELODIC PHRASE GENERATOR CLASS =====
class MelodicPhraseGenerator {
  constructor(voiceIndex) {
    this.voiceIndex = voiceIndex;
    
    // Available patterns
    this.patterns = {
      'static': this.generateStatic.bind(this),
      'ascending': this.generateAscending.bind(this),
      'descending': this.generateDescending.bind(this),
      'pendulum': this.generatePendulum.bind(this),
      'wave': this.generateWave.bind(this),
      'spiral': this.generateSpiral.bind(this)
    };
    
  }
  
  generate(notePool, noteCount, behaviorSetting) {
    if (!notePool || notePool.length === 0) {
      console.warn(`Voice ${this.voiceIndex + 1}: Empty note pool`);
      return [60]; // Default to middle C
    }
    
    // Select pattern based on behavior setting
    const pattern = this.selectPattern(behaviorSetting);
    
    
    // Generate phrase
    const phrase = this.patterns[pattern](notePool, noteCount);
    
    
    return phrase;
  }
  
  selectPattern(behaviorSetting) {
    if (behaviorSetting === 0) {
      return 'static';
    } else if (behaviorSetting < 25) {
      return 'ascending';
    } else if (behaviorSetting < 50) {
      return 'descending';
    } else if (behaviorSetting < 75) {
      return 'pendulum';
    } else {
      return 'wave';
    }
  }
  
  generateStatic(notePool, noteCount) {
    // Always return the same note (middle of range)
    const sorted = [...notePool].sort((a, b) => a - b);
    const middleNote = sorted[Math.floor(sorted.length / 2)];
    return Array(noteCount).fill(middleNote);
  }
  
  generateAscending(notePool, noteCount) {
    // Simple ascending sweep through range
    const sorted = [...notePool].sort((a, b) => a - b);
    const phrase = [];
    
    for (let i = 0; i < noteCount; i++) {
      const index = i % sorted.length;
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }
  
  generateDescending(notePool, noteCount) {
    // Simple descending sweep through range
    const sorted = [...notePool].sort((a, b) => b - a); // Reverse sort
    const phrase = [];
    
    for (let i = 0; i < noteCount; i++) {
      const index = i % sorted.length;
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }
  
  generatePendulum(notePool, noteCount) {
  // Up to top, then down to bottom, repeat
  const sorted = [...notePool].sort((a, b) => a - b);
  const phrase = [];
  let direction = 1; // 1 = up, -1 = down
  let index = 0;
  
  for (let i = 0; i < noteCount; i++) {
    phrase.push(sorted[index]);
    
    // Move to next note
    index += direction;
    
    // Reverse at boundaries
    if (index >= sorted.length) {
      direction = -1;
      index = sorted.length - 2; // Start descending from second-to-last
      // Handle case where pool only has 1 note
      if (index < 0) index = 0;
    } else if (index < 0) {
      direction = 1;
      index = 1; // Start ascending from second note
      // Handle case where pool only has 1 note
      if (index >= sorted.length) index = 0;
    }
  }
  
  return phrase;
}

  
  generateWave(notePool, noteCount) {
    // Sine wave-like motion through range
    const sorted = [...notePool].sort((a, b) => a - b);
    const phrase = [];
    
    for (let i = 0; i < noteCount; i++) {
      // Calculate sine wave position (0 to 1)
      const phase = (i / noteCount) * Math.PI * 4; // 2 complete sine waves
      const sineValue = Math.sin(phase); // -1 to 1
      const normalized = (sineValue + 1) / 2; // 0 to 1
      
      // Map to note index
      const index = Math.floor(normalized * (sorted.length - 1));
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }
  
  generateSpiral(notePool, noteCount) {
    // Start narrow, gradually expand range
    const sorted = [...notePool].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const phrase = [];
    
    for (let i = 0; i < noteCount; i++) {
      // Expansion factor (0 to 1)
      const expansion = i / noteCount;
      
      // Maximum range at this point
      const range = Math.floor(expansion * middle);
      
      // Alternate above and below middle
      const offset = (i % 2 === 0) ? range : -range;
      
      // Clamp to valid index
      const index = Math.max(0, Math.min(sorted.length - 1, middle + offset));
      
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }
}
// ===== LOOKAHEAD SCHEDULER CLASS =====
class LookaheadScheduler {
  constructor(voiceIndex, audioContext, masterClock) {
    this.voiceIndex = voiceIndex;
    this.audioContext = audioContext;
    this.masterClock = masterClock;
    
    // Scheduling state
    this.isActive = false;
    this.schedulerInterval = null;
    this.updateRate = 25; // Update every 25ms (40 Hz)
    
    // Time tracking (in audio context seconds)
    this.lastScheduledTime = 0;
    this.nextNoteTime = 0;
    
    // Lookahead configuration
    this.baseLookahead = 0.150; // 150ms minimum technical buffer
    this.maxLookahead = 2.0; // 2 second maximum
    this.currentLookahead = this.baseLookahead;
    
    // Phrase generation
    this.phraseGenerator = null; // Will initialize when needed
    this.currentPhrase = [];
    this.phraseIndex = 0;
    
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Initialize timing
    // this.lastScheduledTime = this.audioContext.currentTime;
    // this.nextNoteTime = this.audioContext.currentTime + 0.100; // 100ms in future

    // Initialize timing - ALWAYS use current audio context time
    const now = this.audioContext.currentTime;
    this.lastScheduledTime = now;
    this.nextNoteTime = now + 0.100; // 100ms in future


    
    // Calculate initial lookahead
    this.currentLookahead = this.calculateLookahead();
    
    // Create phrase generator
    if (!this.phraseGenerator) {
      this.phraseGenerator = new MelodicPhraseGenerator(this.voiceIndex);
    }
    
    
    // Start update loop
    this.schedulerInterval = setInterval(() => {
      this.update();
    }, this.updateRate);
  }
  
  stop() {
  if (!this.isActive) return;
  
  this.isActive = false;
  
  if (this.schedulerInterval) {
    clearInterval(this.schedulerInterval);
    this.schedulerInterval = null;
  }
  
}

  
  update() {
  if (!this.isActive) return;
  
  // Check if voice should play (Life Span integration)
  const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
  const shouldPlay = voiceClock ? voiceClock.shouldPlayNote() : false;

  if (!voiceClock || !shouldPlay) {
    return; // Silent skip
  }
  
  // Log occasionally to see if we're here
  if (Math.random() < 0.05) { // 5% of calls
  }
  
  // Update lookahead if parameters changed
  this.updateLookahead();
  
  // Schedule notes ahead
  this.scheduleAhead();
}

scheduleAhead() {
  const currentTime = this.audioContext.currentTime;
  const scheduleUntil = currentTime + this.currentLookahead;
  
  // Log every call with timing
  if (Math.random() < 0.1) { // 10% of calls
  }
  
  // Safety check: if we're scheduling in the past, reset
  if (this.nextNoteTime < currentTime) {
    console.warn(`⚠️ Voice ${this.voiceIndex + 1}: Resetting nextNoteTime from past (${this.nextNoteTime.toFixed(3)}) to now (${currentTime.toFixed(3)})`);
    this.nextNoteTime = currentTime + 0.050; // 50ms from now
  }
  
  // Schedule notes to fill the lookahead window
  let scheduledCount = 0;
  const maxNotesPerCycle = 20; // Safety limit
  
  // Schedule if next note is before the end of our lookahead window
  while (this.nextNoteTime < scheduleUntil && scheduledCount < maxNotesPerCycle) {
    // Generate next note in phrase
    if (this.phraseIndex >= this.currentPhrase.length) {
      // Need new phrase
      const avgRhythmDuration = this.calculateAverageRhythmDuration(
        voiceData[this.voiceIndex].parameters['RHYTHMS']
      );
      const notesToSchedule = Math.ceil(this.currentLookahead / avgRhythmDuration);
      
      this.currentPhrase = this.generatePhrase(notesToSchedule);
      this.phraseIndex = 0;
      
    }
    
    // Get next note from phrase
    const midiNote = this.currentPhrase[this.phraseIndex];
    this.phraseIndex++;
    
    // Schedule this note
    this.scheduleNoteAtTime(midiNote, this.nextNoteTime);
    scheduledCount++;
    
    // Advance time for next note
    const rhythmDuration = this.getNextRhythmDuration();
    const restDuration = this.getNextRestDuration();
    this.nextNoteTime += (rhythmDuration + restDuration);
  }
  
  if (scheduledCount > 0) {
  }
}



  calculateLookahead() {
    
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    const rhythmParam = voiceData[this.voiceIndex].parameters['RHYTHMS'];
    
    // Count available notes
    let noteCount = 1;


    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
      noteCount = melodicParam.selectedNotes.length;
    } else {
      const minNote = Math.round(melodicParam.min);
      const maxNote = Math.round(melodicParam.max);
      noteCount = maxNote - minNote + 1;
    }

    
    // Calculate average rhythm duration (in seconds)
    const avgRhythmDuration = this.calculateAverageRhythmDuration(rhythmParam);
    
    // Get behavior multiplier (0% = 1.0x, 50% = 1.5x, 100% = 2.0x)
    const behavior = melodicParam.behavior || 50;
    const behaviorMultiplier = 1.0 + (behavior / 100.0);
    
    // Calculate melodic lookahead
    // Formula: noteCount × avgRhythmDuration × behaviorMultiplier
    const melodicLookahead = noteCount * avgRhythmDuration * behaviorMultiplier;
    
    // Ensure minimum technical buffer
    const totalLookahead = Math.max(this.baseLookahead, melodicLookahead);
    
    // Cap at maximum
    const finalLookahead = Math.min(totalLookahead, this.maxLookahead);
    
    return finalLookahead;
  }
  
  calculateAverageRhythmDuration(rhythmParam) {
    const selectedRhythms = rhythmParam.selectedValues || [7]; // Default quarter note
    
    if (selectedRhythms.length === 0) {
      selectedRhythms.push(7);
    }
    
    const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
    const tempo = voiceClock ? voiceClock.currentTempo : 120;
    const beatDuration = 60 / tempo; // Seconds per beat
    
    let totalDuration = 0;
    selectedRhythms.forEach(rhythmIndex => {
      const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[7];
      const noteDuration = rhythmInfo.beats * beatDuration;
      totalDuration += noteDuration;
    });
    
    return totalDuration / selectedRhythms.length; // Average in seconds
  }
  
  updateLookahead() {
    const newLookahead = this.calculateLookahead();
    
    if (Math.abs(newLookahead - this.currentLookahead) > 0.050) { // Changed by >50ms
      this.currentLookahead = newLookahead;
    }
  }
  
  generatePhrase(noteCount) {
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    // Get note pool
    let notePool;
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
      notePool = melodicParam.selectedNotes;
    } else {
      // Generate pool from range
      const minNote = Math.round(melodicParam.min);
      const maxNote = Math.round(melodicParam.max);
      notePool = [];
      for (let note = minNote; note <= maxNote; note++) {
        notePool.push(note);
      }
    }
    
    // Generate phrase using behavior setting
    const behaviorSetting = melodicParam.behavior || 50;
    return this.phraseGenerator.generate(notePool, noteCount, behaviorSetting);
  }
  
  getNextRhythmDuration() {
    const rhythmParam = voiceData[this.voiceIndex].parameters['RHYTHMS'];
    const rhythmIndex = this.selectValueFromParam(rhythmParam);
    return this.getRhythmDuration(rhythmIndex);
  }
  
  getNextRestDuration() {
    const restParam = voiceData[this.voiceIndex].parameters['RESTS'];
    const restIndex = this.selectValueFromParam(restParam);
    
    if (restIndex === 0) return 0; // No rest
    
    const restInfo = rhythmDurations[restIndex - 1];
    if (!restInfo) return 0;
    
    const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
    const tempo = voiceClock ? voiceClock.currentTempo : 120;
    const beatDuration = 60 / tempo;
    
    return restInfo.beats * beatDuration; // Seconds
  }
  
  selectValueFromParam(param) {
    // Simple selection for now
    if (param.selectedValues && param.selectedValues.length > 0) {
      const randomIndex = Math.floor(Math.random() * param.selectedValues.length);
      return param.selectedValues[randomIndex];
    }
    return 7; // Default quarter note
  }
  
  getRhythmDuration(rhythmIndex) {
    const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
    const tempo = voiceClock ? voiceClock.currentTempo : 120;
    
    const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[7];
    const beatDuration = 60 / tempo;
    return rhythmInfo.beats * beatDuration; // Returns seconds
  }
  
  
  scheduleNoteAtTime(midiNote, scheduleTime) {

    // Get voice clock for access to audio methods
    const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
    if (!voiceClock) return;
    
    // Get rhythm duration
    const rhythmParam = voiceData[this.voiceIndex].parameters['RHYTHMS'];
    const rhythmIndex = this.selectValueFromParam(rhythmParam);
    const noteDuration = this.getRhythmDuration(rhythmIndex);
    
    // Get polyphony setting
    const polyphonyParam = voiceData[this.voiceIndex].parameters['POLYPHONY'];
    const polyphonyCount = Math.round((polyphonyParam.min + polyphonyParam.max) / 2);
    
    // Create note info array
    const noteInfoArray = [{
      midiNote: midiNote,
      frequency: midiToFrequency(midiNote),
      noteName: midiNoteNames[midiNote] || `MIDI${midiNote}`
    }];
    
    // If polyphony > 1, add additional notes (use existing chord generation)
    if (polyphonyCount > 1) {
      const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
      const behaviorSetting = melodicParam.behavior || 50;
      
      // Generate chord from base note
      const baseNote = noteInfoArray[0];
      const minNote = Math.round(melodicParam.min);
      const maxNote = Math.round(melodicParam.max);
      
      const chord = generateMusicalChord(baseNote, polyphonyCount, minNote, maxNote, behaviorSetting);
      noteInfoArray.length = 0; // Clear
      noteInfoArray.push(...chord);
    }
    
    // Schedule using existing audio infrastructure
    voiceClock.triggerNote(noteInfoArray, noteDuration * 1000, scheduleTime); // Pass schedule time!

    
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
  } else {
    rollup.classList.remove('expanded');
    rollup.classList.add('collapsed');
    header.classList.add('collapsed');
    content.style.display = 'none';
    arrow.textContent = '▶';
  }
}

function expandAllParameters() {
  parameterDefinitions.forEach(param => {
    if (!parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
}

function collapseAllParameters() {
  parameterDefinitions.forEach(param => {
    if (parameterRollupState[param.name]) {
      toggleParameterRollup(param.name);
    }
  });
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
}

function expandMixingGroup() {
  if (!rollupState['mixing']) toggleRollup('mixing');
  if (!parameterRollupState['VOLUME']) toggleParameterRollup('VOLUME');
  if (!parameterRollupState['STEREO BALANCE']) toggleParameterRollup('STEREO BALANCE');
}

function collapseEverything() {
  collapseAllParameters();
  Object.keys(rollupState).forEach(key => {
    if (rollupState[key]) toggleRollup(key);
  });
}

function connectAllSliders() {
  
  const parameterSection = document.getElementById('parameter-section');
  
  // 1. Connect dual-range sliders
  const dualSliders = parameterSection.querySelectorAll('.noUi-target');
  
  dualSliders.forEach((slider, index) => {
    if (slider.noUiSlider) {
      const row = slider.closest('.row-container-content');
      const rollup = row ? row.closest('.parameter-rollup') : null;
      const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
      const paramName = rollupTitle ? rollupTitle.textContent.trim() : `Unknown ${index}`;

      
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

            // NEW: If tempo changed, update immediately (but don't rebuild sliders during initial connection)
            if (paramName === 'TEMPO (BPM)') {
              // Only update the tempo value itself, don't rebuild UI during connection
              if (voiceClockManager && voiceClockManager.isInitialized) {
                const voiceClock = voiceClockManager.getVoiceClock(currentVoice);
                if (voiceClock && voiceClock.isActive) {
                  voiceClock.updateTempo();
                }
              }
            }

          }

        }
      });
    }
  });
  
  // 2. Connect behavior sliders
  const behaviorSliders = parameterSection.querySelectorAll('.behavior-slider-wrapper input[type="range"]');

  behaviorSliders.forEach((slider) => {
    const row = slider.closest('.row-container') || 
              slider.closest('.slider-wrapper')?.closest('.row-container') ||
              slider.closest('.parameter-rollup-content')?.closest('.parameter-rollup');
    const label = row ? (row.querySelector('.parameter-rollup-title') || row.querySelector('.label-container')) : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Behavior';
    
    
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
        
      }
    };
    
    const initializeTooltipWhenReady = () => {
      if (slider.offsetWidth > 0 && slider.offsetHeight > 0) {
        const event = { target: slider };
        slider.oninput(event);
      } else {
        setTimeout(initializeTooltipWhenReady, 100);
      }
    };

    setTimeout(initializeTooltipWhenReady, 500);
  });

  // 3. Connect dropdown selectors
  const dropdowns = parameterSection.querySelectorAll('select.param-select, select.sound-select');

  dropdowns.forEach((dropdown) => {
    const row = dropdown.closest('.row-container-content');
    const rollup = row ? row.closest('.parameter-rollup') : null;
    const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
    const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Dropdown';
    
    const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
    const isMinMax = dropdownLabel === 'Minimum' || dropdownLabel === 'Maximum';
    
    
    dropdown.onchange = null;
    
    dropdown.onchange = function(e) {
      const value = parseInt(e.target.value);
      
      if (paramName === 'INSTRUMENT') {
        voiceData[currentVoice].parameters[paramName] = value;
        
        const soundName = gmSounds[value];
        const waveType = getOscillatorTypeForGMSound(soundName);
        
        
      } else if (isMinMax && voiceData[currentVoice].parameters[paramName]) {
        const paramData = voiceData[currentVoice].parameters[paramName];
        
        if (dropdownLabel === 'Minimum') {
          paramData.min = value;
        } else if (dropdownLabel === 'Maximum') {
          paramData.max = value;
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
    }
  });

  // 4. Connect multi-dual sliders
  const multiDualContainers = parameterSection.querySelectorAll('.dual-slider');

  multiDualContainers.forEach((container) => {
    const rollup = container.closest('.parameter-rollup');
    const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
    const paramName = rollupTitle ? rollupTitle.textContent.trim() : 'Unknown Multi-Dual';
    
    if (container.querySelectorAll('.slider-wrapper').length < 2) return;
    

    const allSliders = container.querySelectorAll('.noUi-target');
    
    allSliders.forEach((slider, sliderIndex) => {
      if (slider.noUiSlider) {
        const sliderWrapper = slider.closest('.slider-wrapper');
        const label = sliderWrapper ? sliderWrapper.querySelector('.slider-label') : null;
        const labelText = label ? label.textContent.trim().toLowerCase() : '';
        
        
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
            
          } else if (sliderIndex === 1) {
            if (!voiceParam.depth) voiceParam.depth = { min: 0, max: 0 };
            voiceParam.depth.min = min;
            voiceParam.depth.max = max;
            
          } else if (sliderIndex === 2) {
            if (!voiceParam.feedback) voiceParam.feedback = { min: 0, max: 0 };
            voiceParam.feedback.min = min;
            voiceParam.feedback.max = max;
            
          } else {
            console.warn(`❌ Unknown slider index ${sliderIndex} for ${paramName}`);
          }
          
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
      
      if (container.pianoInstance) {
      } else {
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

actualContainers.forEach((container) => {
  
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
    
    // Rebuild sliders to update tooltips with new beat unit
    rebuildLifeSpanSliders(container, currentVoice);
  };
}

  
  // Connect Repeat checkbox (now in behavior area)
  const repeatCheckbox = behaviorContainer ? behaviorContainer.querySelector('.repeat-checkbox') : null;
  if (repeatCheckbox) {
    repeatCheckbox.onchange = function(e) {
      voiceData[currentVoice].parameters['LIFE SPAN'].repeat = e.target.checked;
    };
  }
  
  // Connect existing Life Span sliders (they should already exist now)
  const spanSliders = container.querySelectorAll('.life-span-dual-slider');
  
  spanSliders.forEach((sliderContainer) => {
    const spanNumber = parseInt(sliderContainer.dataset.spanNumber);
    const slider = sliderContainer.querySelector('.noUi-target');
    
    if (slider && slider.noUiSlider) {
      
      slider.noUiSlider.off('update');
      slider.noUiSlider.on('update', function(values) {
        const enterValue = values[0];
        const exitValue = values[1];
        
        // Parse values (could be in format "120 beats (2:00)" or "∞ (∞)")
        const enterMs = parseLifeSpanValue(enterValue);
        const exitMs = parseLifeSpanValue(exitValue);
        
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].enter = enterMs;
        voiceData[currentVoice].parameters['LIFE SPAN'][`lifeSpan${spanNumber}`].exit = exitMs;
        
      });
    } else {
      console.warn(`❌ Life Span ${spanNumber} slider not found or not initialized`);
    }
  });
}); 

} 

function updateTempoImmediately(voiceIndex) {
  if (!voiceClockManager || !voiceClockManager.isInitialized) return;
  
  const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
  if (voiceClock && voiceClock.isActive) {
    voiceClock.updateTempo();
    
    // NEW: Update Life Span sliders for new beat duration
    updateLifeSpanSlidersForTempoChange(voiceIndex);
  }
}

function createLifeSpanSlider(container, spanNumber) {
  
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
  
}

function updateLifeSpanTooltips(container) {
  
  const spanSliders = container.querySelectorAll('.life-span-dual-slider .noUi-target');
  const beatUnit = voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit;
  
  spanSliders.forEach((slider) => {
    if (slider.noUiSlider) {
      const newFormatter = createLifeSpanBeatFormatter(currentVoice, beatUnit);
      
      // Update the formatter
      slider.noUiSlider.updateOptions({
        format: newFormatter
      });
      
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
    renderParameters();
    
    setTimeout(() => {
        connectAllSliders();
        
        setTimeout(() => {
            forceUpdateAdvancedParameterSliders();
        }, 100);
    }, 200);
    
}

function forceUpdateAdvancedParameterSliders() {
    
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
        }
    });
}

// PresetManager Class
class PresetManager {
    constructor() {
        this.currentPreset = null;
        this.presetLibrary = new Map();
        this.isModified = false;
        

        this.loadFromLocalStorage();
    }
    
    captureCurrentState(presetName, description = "") {
        
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
        
        return preset;
    }
    
    async applyPreset(preset) {
        
        try {
            if (masterClock && masterClock.isActive()) {
                toggleMasterPlayback();
            }
            
            for (let i = 0; i < 16; i++) {
                if (preset.voices[i]) {
                    voiceData[i].enabled = preset.voices[i].enabled;
                    voiceData[i].locked = preset.voices[i].locked;
                    voiceData[i].parameters = this.deepClone(preset.voices[i].parameters);
                    
                }
            }
            
            if (preset.globalSettings) {
                currentVoice = preset.globalSettings.currentVoice || 0;
                masterTempo = preset.globalSettings.masterTempo || 120;
                

            }
            
            createVoiceTabs();
            renderParameters();
            setTimeout(() => {
                connectAllSliders();
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
                
                return true;
            } else {
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
            alert('🗑️ All presets have been deleted.');
            return true;
        }
        return false;
    }
}

// Performance Monitoring Classes - INSERT AFTER PresetManager class, BEFORE global instances

// Performance Monitor Class
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.cpuUsage = 0;
    this.audioDropouts = 0;
    this.samples = [];
    this.maxSamples = 100;
    
  }
  
  update() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    
    // Calculate CPU usage (simplified)
    this.cpuUsage = Math.min(100, (delta / 16.67) * 100); // 16.67ms = 60fps baseline
    
    // Store sample for trending
    this.samples.push({
      time: now,
      cpuUsage: this.cpuUsage,
      delta: delta
    });
    
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
    
    // Log every 60 updates (roughly 1 second)
    if (this.frameCount % 60 === 0) {
      const avgCpu = this.samples.slice(-60).reduce((sum, s) => sum + s.cpuUsage, 0) / 60;
      console.log(`📊 CPU: ${avgCpu.toFixed(1)}%, Dropouts: ${this.audioDropouts}`);
    }
  }
  
  getStats() {
    const recent = this.samples.slice(-30);
    const avgCpu = recent.length > 0 ? 
      recent.reduce((sum, s) => sum + s.cpuUsage, 0) / recent.length : 0;
    
    return {
      currentCpu: this.cpuUsage,
      averageCpu: avgCpu,
      dropouts: this.audioDropouts,
      frameCount: this.frameCount
    };
  }
}

class AudioHealthMonitor {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.lastCheckTime = 0;
    this.dropoutCount = 0;
    this.isHealthy = true;
    this.isMonitoringActive = false; // Only monitor during playback
    
  }
  
  startMonitoring() {
    this.isMonitoringActive = true;
    this.lastCheckTime = this.audioContext.currentTime;
    this.dropoutCount = 0;
  }
  
  stopMonitoring() {
    this.isMonitoringActive = false;
    this.lastCheckTime = 0;
  }
  
  checkHealth() {
    if (!this.audioContext || !this.isMonitoringActive) return true;
    
    const now = this.audioContext.currentTime;
    
    // Check audio context state
    if (this.audioContext.state !== 'running') {
      console.warn('⚠️ Audio context not running:', this.audioContext.state);
      this.isHealthy = false;
      return false;
    }
    
    // Only check timing gaps during active monitoring (playback)
    if (this.lastCheckTime > 0) {
      const timeDelta = now - this.lastCheckTime;
      if (timeDelta > 0.200) { // 200ms gap during playback is suspicious
        console.warn('⚠️ Audio timing gap during playback:', timeDelta.toFixed(3), 'seconds');
        this.dropoutCount++;
        this.isHealthy = false;
        
        if (audioManager && audioManager.performanceMonitor) {
          audioManager.performanceMonitor.audioDropouts++;
        }
        
        return false;
      }
    }
    
    this.lastCheckTime = now;
    this.isHealthy = true;
    return true;
  }
  
  getStats() {
    return {
      isHealthy: this.isHealthy,
      dropouts: this.dropoutCount,
      contextState: this.audioContext ? this.audioContext.state : 'none',
      currentTime: this.audioContext ? this.audioContext.currentTime.toFixed(3) : '0',
      monitoring: this.isMonitoringActive
    };
  }
  
  reset() {
    this.dropoutCount = 0;
    this.isHealthy = true;
  }
}

// Memory Monitor Class  
class MemoryMonitor {
  constructor() {
    this.samples = [];
    this.maxSamples = 100;
    this.baselineMemory = 0;
    
  }
  
  sample() {
    if (performance.memory) {
      const usage = {
        time: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
      
      // Set baseline on first sample
      if (this.baselineMemory === 0) {
        this.baselineMemory = usage.used;
      }
      
      this.samples.push(usage);
      
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      return usage;
    }
    return null;
  }
  
  detectLeak() {
    if (this.samples.length < 10) return false;
    
    const recent = this.samples.slice(-10);
    const growth = recent[recent.length - 1].used - recent[0].used;
    const avgGrowth = growth / 10;
    
    // If consistently growing more than 2MB per sample
    if (avgGrowth > 2097152) { // 2MB
      console.warn('⚠️ Possible memory leak detected:', (avgGrowth / 1048576).toFixed(2), 'MB/sample');
      return true;
    }
    
    return false;
  }
  
  getStats() {
    const latest = this.samples[this.samples.length - 1];
    if (!latest) return null;
    
    const growthFromBaseline = latest.used - this.baselineMemory;
    const utilizationPercent = (latest.used / latest.limit) * 100;
    
    return {
      currentMB: (latest.used / 1048576).toFixed(1),
      totalMB: (latest.total / 1048576).toFixed(1),
      limitMB: (latest.limit / 1048576).toFixed(1),
      growthMB: (growthFromBaseline / 1048576).toFixed(1),
      utilization: utilizationPercent.toFixed(1),
      isLeak: this.detectLeak()
    };
  }
}

// Oscillator Pool Class - (must folllow MemoryMonitor class)
class OscillatorPool {
  constructor(audioContext, poolSize = 50) {
    this.audioContext = audioContext;
    this.availableNodes = [];
    this.activeNodes = new Set();
    this.poolSize = poolSize;
    this.createdCount = 0;
    this.reusedCount = 0;
    
    // Pre-create node sets
    for (let i = 0; i < poolSize; i++) {
      this.availableNodes.push(this.createNodeSet());
    }
    

  }
  
  createNodeSet() {
    const nodeSet = {
      oscillator: this.audioContext.createOscillator(),
      gainNode: this.audioContext.createGain(),
      filterNode: this.audioContext.createBiquadFilter(),
      panNode: this.audioContext.createStereoPanner(),
      inUse: false,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.createdCount++;
    return nodeSet;
  }
  
  acquire() {
    let nodeSet;
    
    if (this.availableNodes.length > 0) {
      nodeSet = this.availableNodes.pop();
      this.reusedCount++;
    } else {
      // Pool exhausted, create new
      console.warn('⚠️ Oscillator pool exhausted, creating new node set');
      nodeSet = this.createNodeSet();
    }
    
    nodeSet.inUse = true;
    this.activeNodes.add(nodeSet);
    
    return nodeSet;
  }
  
  release(nodeSet) {
    if (!nodeSet || !nodeSet.inUse) return;
    
    nodeSet.inUse = false;
    this.activeNodes.delete(nodeSet);
    
    // Disconnect all nodes
    try {
      if (nodeSet.oscillator) {
        nodeSet.oscillator.stop();
        nodeSet.oscillator.disconnect();
      }
      if (nodeSet.gainNode) nodeSet.gainNode.disconnect();
      if (nodeSet.filterNode) nodeSet.filterNode.disconnect();
      if (nodeSet.panNode) nodeSet.panNode.disconnect();
    } catch (e) {
      // Already disconnected or stopped
    }
    
    // Create fresh oscillator (can't reuse stopped oscillators)
    nodeSet.oscillator = this.audioContext.createOscillator();
    
    // Return to available pool
    this.availableNodes.push(nodeSet);
  }
  
  getStats() {
    const hitRate = this.createdCount > 0 ? (this.reusedCount / this.createdCount * 100) : 0;
    
    return {
      available: this.availableNodes.length,
      active: this.activeNodes.size,
      total: this.availableNodes.length + this.activeNodes.size,
      created: this.createdCount,
      reused: this.reusedCount,
      hitRate: hitRate.toFixed(1),
      efficiency: ((this.availableNodes.length / this.poolSize) * 100).toFixed(1)
    };
  }
  
  cleanup() {
    // Force cleanup of all nodes
    
    this.activeNodes.forEach(nodeSet => {
      this.release(nodeSet);
    });
    
    this.activeNodes.clear();
   }
}

// Global preset manager instance
let presetManager = null;

// File Functions
async function saveCompositionToFile() {
    
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
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        
        
        try {
            const fileContent = await readFileAsText(file);
            const preset = JSON.parse(fileContent);
            
            if (!preset.voices || !Array.isArray(preset.voices)) {
                throw new Error('Invalid preset file format');
            }
            
            await presetManager.applyPreset(preset);
            
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
    
    try {
        if (masterClock && masterClock.isActive()) {
            toggleMasterPlayback();
        }
        
        const hasEnabledVoices = voiceData.some(voice => voice.enabled);
        if (hasEnabledVoices) {
            const proceed = confirm(`📄 Create New Composition?

This will reset all voices and parameters to default settings.
Any unsaved work will be lost.

Continue?`);
            
            if (!proceed) {
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
    
    const newButton = document.querySelector('#file-controls button:nth-child(1)');
    if (newButton) {
        newButton.textContent = 'NEW';
        newButton.disabled = false;
        newButton.style.backgroundColor = '';
        newButton.style.color = '';
        
    } else {
        console.log('❌ NEW button not found');
    }
}

// Performance Dashboard Function - ADD before DOMContentLoaded event

function logPerformanceSummary() {
  if (!audioManager || !audioManager.isInitialized) return;
  
  console.log('══════════════════════════════════════════════════════');
  console.log('📊 PERFORMANCE SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  
  // Performance Monitor Stats
  if (audioManager.performanceMonitor) {
    const pm = audioManager.performanceMonitor.getStats();
    console.log(`CPU Usage: ${pm.averageCpu.toFixed(1)}% (current: ${pm.currentCpu.toFixed(1)}%)`);
    console.log(`Frame Count: ${pm.frameCount}`);
    console.log(`Audio Dropouts: ${pm.dropouts}`);
  }
  
  // Oscillator Pool Stats
  if (audioManager.oscillatorPool) {
    const stats = audioManager.oscillatorPool.getStats();
    console.log(`Active Oscillators: ${stats.active}/${stats.total}`);
    console.log(`Pool Efficiency: ${stats.efficiency}% available`);
    console.log(`Hit Rate: ${stats.hitRate}% (${stats.reused}/${stats.created})`);
  }
  
  // Memory Stats
  if (audioManager.memoryMonitor) {
    const memStats = audioManager.memoryMonitor.getStats();
    if (memStats) {
      console.log(`Memory Used: ${memStats.currentMB} MB`);
      console.log(`Memory Growth: ${memStats.growthMB} MB from baseline`);
      console.log(`Memory Utilization: ${memStats.utilization}% of ${memStats.limitMB} MB limit`);
      if (memStats.isLeak) {
        console.warn('⚠️ Possible memory leak detected!');
      }
    }
  }
  
  // Audio Health Stats  
  if (audioManager.audioHealthMonitor) {
    const healthStats = audioManager.audioHealthMonitor.getStats();
    console.log(`Audio Context: ${healthStats.contextState}`);
    console.log(`Audio Health: ${healthStats.isHealthy ? '✅ Healthy' : '❌ Issues detected'}`);
    console.log(`Monitoring Active: ${healthStats.monitoring ? '✅ Yes' : '⏸️ Idle'}`);
    
    if (healthStats.dropouts > 0) {
      console.warn(`⚠️ Audio dropouts detected: ${healthStats.dropouts}`);
    }
  }
  
  // Voice Clock Stats
  if (voiceClockManager && voiceClockManager.isInitialized) {
    const activeVoices = voiceClockManager.getActiveVoiceCount();
    const enabledVoices = voiceData.filter(v => v.enabled).length;
    console.log(`Active Voices: ${activeVoices}/${enabledVoices} enabled`);
  } else {
    console.log(`Voice System: Not active`);
  }
  
  // Master Clock Stats
  if (masterClock && masterClock.isActive()) {
    const elapsed = masterClock.getElapsedTime();
    console.log(`Master Clock: Active (${formatMsToMMSS(elapsed)} elapsed)`);
  } else {
    console.log(`Master Clock: Inactive`);
  }
  
  console.log('══════════════════════════════════════════════════════');
}

// Manual performance summary trigger
window.showPerformanceStats = logPerformanceSummary;


// ADD this pool testing function before DOMContentLoaded

// Initialize systems on page load
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();
  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  presetManager = new PresetManager();

  setTimeout(() => {
      const openButton = document.querySelector('#file-controls button:nth-child(2)');
      if (openButton) {
          openButton.onclick = openCompositionFromFile;
      }
      
      const saveButton = document.querySelector('#file-controls button:nth-child(3)');
      if (saveButton) {
          saveButton.onclick = saveCompositionToFile;
      }
  }, 300);

  setTimeout(() => {
      const newButton = document.querySelector('#file-controls button:nth-child(1)');
      if (newButton) {
          newButton.onclick = createNewComposition;
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

  
  const playButton = document.querySelector('#file-controls button:nth-child(4)');


  
  if (playButton) {
    playButton.onclick = null;
    playButton.onclick = toggleMasterPlayback;

    console.log('Try clicking PLAY now!');
  } else {
    console.log('❌ PLAY button not found in DOM');
  }
}, 2000);


