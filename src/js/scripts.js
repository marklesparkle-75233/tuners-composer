// Parameter definitions
const parameterDefinitions = [
  { name: "SOUND", type: "dropdown", options: "gm-sounds" },
  { name: "TEMPO (BPM)", type: "single-dual", min: 40, max: 240 },
  { name: "VOLUME", type: "single-dual", min: 0, max: 100 },
  { name: "STEREO BALANCE", type: "single-dual", min: -100, max: 100 },
  { name: "MELODIC RANGE", type: "single-dual", min: 21, max: 108 },
  { name: "ATTACK VELOCITY", type: "single-dual", min: 0, max: 127 },
  { name: "RHYTHMS", type: "dual-dropdown", options: "rhythms" },
  { name: "RESTS", type: "dual-dropdown", options: "rests" },
  { name: "POLYPHONY", type: "single-dual", min: 1, max: 16 },
  { name: "PORTAMENTO GLIDE TIME", type: "single-dual", min: 0, max: 100 },
  { name: "REVERB", type: "single-dual", min: 0, max: 100 },
  { name: "DETUNING", type: "single-dual", min: -50, max: 50 },
  { name: "TREMOLO", type: "multi-dual", min: 0, max: 100 },
  { name: "CHORUS", type: "multi-dual", min: 0, max: 100 },
  { name: "PHASER", type: "multi-dual", min: 0, max: 100 }
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
const rhythmOptions = [
  "Select",
  "Sixteenth Note Triplets",
  "Sixteenth Notes", 
  "Eighth Note Triplets",
  "Eighth Notes",
  "Quarter Note Triplets",  // MISSING - was index 5
  "Quarter Notes",          // MISSING - was index 6  
  "Half Note Triplets",
  "Half Notes",
  "Whole Note Triplets",    // MISSING - was index 9
  "Whole Note",
  "Two Whole Notes",
  "Three Whole Notes",
  "Four Whole Notes"
];

const restOptions = [
  "Select",
  "Sixteenth Note Triplets",
  "Sixteenth Notes",
  "Eighth Note Triplets", 
  "Eighth Notes",
  "Quarter Note Triplets",  // MISSING - was index 5
  "Quarter Notes",          // MISSING - was index 6
  "Half Note Triplets",
  "Half Notes", 
  "Whole Note Triplets",    // MISSING - was index 9
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

// Global state
let currentVoice = 0;
let voiceData = [];

// Initialize voice data structure
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
        voice.parameters[param.name] = 0;
      } else if (param.type === 'dual-dropdown') {
        voice.parameters[param.name] = {
          min: 0,
          max: 0,
          behavior: 50
        };
      } else if (param.type === 'single-dual') {
        if (typeof param.min === 'undefined' || typeof param.max === 'undefined') {
          console.error(`Missing min/max for parameter: ${param.name}`);
        }
        
        voice.parameters[param.name] = {
          min: param.min + (param.max - param.min) * 0.25,
          max: param.min + (param.max - param.min) * 0.75,
          behavior: 50
        };
      } else if (param.type === 'multi-dual') {
        if (typeof param.min === 'undefined' || typeof param.max === 'undefined') {
          console.error(`Missing min/max for parameter: ${param.name}`);
        }
        
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
    });
    
    voiceData.push(voice);
  }
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

// Voice selection and management
function selectVoice(voiceIndex) {
  if (currentVoice !== voiceIndex) {
    currentVoice = voiceIndex;
    updateVoiceTabs();
    renderParameters();
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
  
  const label = document.createElement('div');
  label.className = 'slider-label';
  label.textContent = 'Range';
  wrapper.appendChild(label);
  
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'slider-wrapper';
  
  const sliderDiv = document.createElement('div');
  
  const useNoteNames = param.name === 'MELODIC RANGE';
  
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
      to: value => {
        const roundedValue = Math.round(value);
        if (useNoteNames && midiNoteNames[roundedValue]) {
          return midiNoteNames[roundedValue];
        }
        return roundedValue.toString();
      },
      from: value => {
        if (typeof value === 'string' && useNoteNames) {
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
      
      // Only update if we get valid numbers AND this is the current voice
      if (!isNaN(min) && !isNaN(max) && voiceIndex === currentVoice) {
        voiceData[voiceIndex].parameters[param.name].min = min;
        voiceData[voiceIndex].parameters[param.name].max = max;
        
        // Real-time audio updates ONLY during active playback for current voice
        if (audioManager && audioManager.testOscillator && audioManager.testGainNode && 
            audioManager.isInitialized && voiceIndex === currentVoice) {
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
  
  // Remove any existing event listeners before adding new ones
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

function createRow(param, voiceIndex) {
  const row = document.createElement('div');
  row.className = 'row-container';

  const label = document.createElement('div');
  label.className = 'label-container';
  label.textContent = param.name;
  row.appendChild(label);

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

  row.appendChild(range);

  if (param.type !== 'dropdown') {
    row.appendChild(createBehaviorSlider(param, voiceIndex));
  } else {
    const emptyBehavior = document.createElement('div');
    emptyBehavior.className = 'behavior-container';
    row.appendChild(emptyBehavior);
  }

  return row;
}

function renderParameters() {
  const parameterSection = document.getElementById('parameter-section');
  
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
  
  const voiceControls = document.createElement('div');
  voiceControls.className = 'voice-controls';
  voiceControls.innerHTML = `
    <div class="voice-label">Voice ${currentVoice + 1}</div>
    <div class="control-buttons">
      <button class="control-btn" onclick="previewVoice(${currentVoice})">PREVIEW</button>
      <button class="control-btn" onclick="toggleLockVoice(${currentVoice})">${voiceData[currentVoice].locked ? 'UNLOCK' : 'LOCK'}</button>
    </div>
  `;
  parameterSection.appendChild(voiceControls);
  
  parameterDefinitions.forEach(param => {
    parameterSection.appendChild(createRow(param, currentVoice));
  });
}

// Voice-specific functions with Preview/Stop toggle
function previewVoice(voiceIndex) {
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
  
function toggleLockVoice(voiceIndex) {
  voiceData[voiceIndex].locked = !voiceData[voiceIndex].locked;
  renderParameters();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();

  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  document.addEventListener('click', initializeAudioOnFirstClick, { once: true });
});

// Initialize audio on first user click
async function initializeAudioOnFirstClick() {
  await audioManager.initialize();
  
  if (audioManager.isInitialized) {
    audioManager.createTestOscillator();
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

// Also add this test function to manually check the interpolation
function testInterpolation() {
  console.log('=== TESTING INTERPOLATION ===');
  
  // Test the core algorithm
  const testResult = interpolateParameter(50, 20, 80, 75, 0.1);
  console.log('Interpolation test - Input: 50, Range: 20-80, Behavior: 75%, Result:', testResult);
  
  // Check if voices are enabled
  for (let i = 0; i < 16; i++) {
    if (voiceData[i] && voiceData[i].enabled) {
      console.log(`Voice ${i + 1} is enabled`);
    }
  }
  
  // Check current voice behavior settings
  const volumeParam = voiceData[currentVoice].parameters['VOLUME'];
  const balanceParam = voiceData[currentVoice].parameters['STEREO BALANCE'];
  
  console.log('Current voice volume behavior:', volumeParam.behavior);
  console.log('Current voice balance behavior:', balanceParam.behavior);
}

// Updated previewVoice with more debugging
// Replace the previewVoice function with this fixed version
// Simple test clock for Session 4 - Add to scripts.js

// Simple test timing variables
let testClockInterval = null;
let testBeatCount = 0;
let testTempo = 120; // Fixed test tempo for now

/**
 * Simple test clock - just to make parameter evolution visible
 * This will be replaced with proper multi-voice timing in Session 5
 */
function startTestClock() {
  if (testClockInterval) {
    clearInterval(testClockInterval);
  }
  
  testBeatCount = 0;
  const beatDuration = (60 / testTempo) * 1000; // Convert to milliseconds
  
  console.log(`Test clock started: ${testTempo} BPM (${beatDuration}ms per beat)`);
  
  testClockInterval = setInterval(() => {
    testBeatCount++;
    console.log(`--- TEST BEAT ${testBeatCount} ---`);
    
    // Update parameters for current voice only (for testing)
    if (voiceData[currentVoice] && voiceData[currentVoice].enabled) {
      updateParametersOnTestBeat(currentVoice);
    }
  }, beatDuration);
}

/**
 * Stop the test clock
 */
function stopTestClock() {
  if (testClockInterval) {
    clearInterval(testClockInterval);
    testClockInterval = null;
  }
  testBeatCount = 0;
  console.log('Test clock stopped');
}

/**
 * Updated parameter update function with amplified changes
 * Replace the updateParametersOnTestBeat function
 */
function updateParametersOnTestBeat(voiceIndex) {
  // Update VOLUME parameter with much more dramatic changes
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  if (volumeParam && volumeParam.behavior > 0) {
    if (!volumeParam.currentValue) {
      volumeParam.currentValue = (volumeParam.min + volumeParam.max) / 2;
    }
    
    // AMPLIFIED: Much larger delta scaling for dramatic changes
    const scaledDelta = (volumeParam.behavior / 100) * 0.8; // Increased from 0.3 to 0.8
    
    const newVolume = interpolateParameter(
      volumeParam.currentValue,
      volumeParam.min,
      volumeParam.max,
      volumeParam.behavior,
      scaledDelta
    );
    
    volumeParam.currentValue = newVolume;
    
    console.log(`Volume: ${Math.round(newVolume)}% (behavior: ${volumeParam.behavior}%, delta: ${scaledDelta.toFixed(2)})`);
  }
  
  // Update BALANCE parameter with much more dramatic changes
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  if (balanceParam && balanceParam.behavior > 0) {
    if (!balanceParam.currentValue) {
      balanceParam.currentValue = (balanceParam.min + balanceParam.max) / 2;
    }
    
    // AMPLIFIED: Much larger delta scaling for dramatic changes
    const scaledDelta = (balanceParam.behavior / 100) * 0.8; // Increased from 0.3 to 0.8
    
    const newBalance = interpolateParameter(
      balanceParam.currentValue,
      balanceParam.min,
      balanceParam.max,
      balanceParam.behavior,
      scaledDelta
    );
    
    balanceParam.currentValue = newBalance;
    
    console.log(`Balance: ${Math.round(newBalance)}% (behavior: ${balanceParam.behavior}%, delta: ${scaledDelta.toFixed(2)})`);
  }
}
/**
 * Updated preview function using simple test clock
 // Replace the existing previewVoice function with this unified version
 */

async function previewVoice(voiceIndex) {
  console.log('=== PREVIEW VOICE (unified rhythmic system) ===', voiceIndex);
  
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
    console.log('Stopping all playback...');
    
    // Stop rhythmic playback
    stopRhythmicPlayback();
    
    // Stop test clock
    stopTestClock();
    
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
    console.log('Starting unified rhythmic preview...');
    
    // Stop any existing playback first
    stopRhythmicPlayback();
    stopTestClock();
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
    
    // Start parameter interpolation for volume/balance evolution
    startTestClock();
    
    // Start rhythmic note patterns
    startRhythmicPlayback(voiceIndex);
    
    previewButton.textContent = 'STOP';
    previewButton.style.backgroundColor = '#ffcccc';
    previewButton.style.color = '#333';
    
    console.log('Unified rhythmic preview started');
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

// Rhythm duration mapping (beats relative to quarter note = 1 beat)
const rhythmDurations = {
  0: { name: "Select", beats: 1 }, // Default
  1: { name: "Sixteenth Note Triplets", beats: 1/6 },
  2: { name: "Sixteenth Notes", beats: 0.25 },
  3: { name: "Eighth Note Triplets", beats: 1/3 },
  4: { name: "Eighth Notes", beats: 0.5 },
  5: { name: "Quarter Note Triplets", beats: 2/3 },    // ADDED
  6: { name: "Quarter Notes", beats: 1 },              // ADDED  
  7: { name: "Half Note Triplets", beats: 4/3 },
  8: { name: "Half Notes", beats: 2 },
  9: { name: "Whole Note Triplets", beats: 8/3 },      // ADDED
  10: { name: "Whole Note", beats: 4 },
  11: { name: "Two Whole Notes", beats: 8 },
  12: { name: "Three Whole Notes", beats: 12 },
  13: { name: "Four Whole Notes", beats: 16 }
};

// Global rhythm system variables
let noteScheduler = null;
let nextNoteTime = 0;
let isRhythmicPlaybackActive = false;

/**
 * Convert rhythm dropdown index to actual duration in seconds
 */
function getRhythmDuration(rhythmIndex, currentTempo) {
  const rhythmInfo = rhythmDurations[rhythmIndex] || rhythmDurations[4]; // Default to eighth notes
  const beatDuration = 60 / currentTempo; // Seconds per quarter note beat
  const noteDuration = rhythmInfo.beats * beatDuration;
  
  console.log(`Rhythm: ${rhythmInfo.name} = ${rhythmInfo.beats} beats = ${noteDuration.toFixed(3)}s at ${currentTempo} BPM`);
  return noteDuration;
}

/**
 * Convert rest dropdown index to actual duration in seconds
 */
function getRestDuration(restIndex, currentTempo) {
  const restInfo = rhythmDurations[restIndex] || rhythmDurations[4]; // Default to eighth notes
  const beatDuration = 60 / currentTempo;
  const restDuration = restInfo.beats * beatDuration;
  
  console.log(`Rest: ${restInfo.name} = ${restInfo.beats} beats = ${restDuration.toFixed(3)}s at ${currentTempo} BPM`);
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

function selectMidiNote(voiceIndex) {
  const melodicParam = voiceData[voiceIndex].parameters['MELODIC RANGE'];
  
  // CRITICAL FIX: Always read current min/max from sliders, not cached values
  const currentMin = Math.round(melodicParam.min);
  const currentMax = Math.round(melodicParam.max);
  
  // Initialize currentNote if it doesn't exist or is outside the current range
  if (!melodicParam.currentNote || 
      melodicParam.currentNote < currentMin || 
      melodicParam.currentNote > currentMax) {
    melodicParam.currentNote = Math.floor((currentMin + currentMax) / 2);
    console.log(`Reset currentNote to ${melodicParam.currentNote} (range: ${currentMin}-${currentMax})`);
  }
  
  // Use behavior setting to control how much the note can change
  if (melodicParam.behavior > 0) {
    const newNote = interpolateParameter(
      melodicParam.currentNote,
      currentMin,
      currentMax,
      melodicParam.behavior,
      0.15 // Increased from 0.1 for more melodic movement
    );
    
    melodicParam.currentNote = Math.round(newNote);
  }
  
  // Ensure note stays within bounds
  melodicParam.currentNote = Math.max(currentMin, Math.min(currentMax, melodicParam.currentNote));
  
  const frequency = midiToFrequency(melodicParam.currentNote);
  const noteName = midiNoteNames[melodicParam.currentNote] || `MIDI${melodicParam.currentNote}`;
  
  console.log(`Selected note: ${noteName} (MIDI ${melodicParam.currentNote}) = ${frequency.toFixed(1)}Hz [Range: ${currentMin}-${currentMax}]`);
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
  
  // Set up envelope (simple attack/release)
  const attackTime = 0.01; // 10ms attack
  const releaseTime = 0.1;  // 100ms release
  const sustainLevel = gainValue * 0.8; // 80% of target volume
  
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, startTime + attackTime);
  gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
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
 * Schedule a rhythm pattern for a voice
 */
function scheduleRhythmPattern(voiceIndex, startTime) {
  const rhythmParam = voiceData[voiceIndex].parameters['RHYTHMS'];
  const restParam = voiceData[voiceIndex].parameters['RESTS'];
  
  // Select rhythm and rest within behavior ranges - AMPLIFIED changes
  let rhythmIndex, restIndex;
  
  if (rhythmParam.behavior > 0) {
    rhythmIndex = Math.floor(interpolateParameter(
      (rhythmParam.min + rhythmParam.max) / 2,
      rhythmParam.min,
      rhythmParam.max,
      rhythmParam.behavior,
      0.5 // Increased from 0.2 to 0.5 for more dramatic rhythm changes
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
      0.5 // Increased from 0.2 to 0.5 for more dramatic rest changes
    ));
  } else {
    restIndex = Math.floor((restParam.min + restParam.max) / 2);
  }
  
  // Ensure indices stay within valid range
  rhythmIndex = Math.max(0, Math.min(10, rhythmIndex));
  restIndex = Math.max(0, Math.min(10, restIndex));
  
  // Get durations
  const noteDuration = getRhythmDuration(rhythmIndex, testTempo);
  const restDuration = getRestDuration(restIndex, testTempo);
  
  // Select note within melodic range (already working well)
  const noteInfo = selectMidiNote(voiceIndex);
  
  // Apply current volume and balance to the scheduled note
  const volumeParam = voiceData[voiceIndex].parameters['VOLUME'];
  const balanceParam = voiceData[voiceIndex].parameters['STEREO BALANCE'];
  
  // Schedule the note with current parameter values
  const scheduledNote = scheduleNote(noteInfo.frequency, noteDuration, startTime, voiceIndex);
  
  console.log(`Scheduled: ${noteInfo.noteName} for ${noteDuration.toFixed(3)}s, rest ${restDuration.toFixed(3)}s (vol: ${Math.round(volumeParam.currentValue || 50)}%, bal: ${Math.round(balanceParam.currentValue || 0)}%)`);
  
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
    stopTestClock();
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
    
    // Start parameter interpolation (for volume/balance evolution)
    startTestClock();
    
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
  
  const shortestDuration = getRhythmDuration(1, testTempo); // 16th note triplets
  const longestDuration = getRhythmDuration(10, testTempo); // 4 whole notes
  
  console.log(`Shortest: ${rhythmDurations[1].name} = ${shortestDuration.toFixed(3)}s`);
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