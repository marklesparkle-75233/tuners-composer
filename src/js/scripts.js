console.log("NoteNest 16-Voice Composer loaded");

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
  "Half Note Triplets",
  "Half Notes",
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
  "Half Note Triplets",
  "Half Notes",
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
      enabled: i === 0, // Only voice 1 enabled by default
      locked: false, // Add locked state
      parameters: {}
    };
    
    // Set default values for each parameter
    parameterDefinitions.forEach(param => {
      if (param.type === 'dropdown') {
        voice.parameters[param.name] = 0; // Select first option
      } else if (param.type === 'dual-dropdown') {
        voice.parameters[param.name] = {
          min: 0, // First option
          max: 0, // Second option
          behavior: 50
        };
      } else if (param.type === 'single-dual') {
        voice.parameters[param.name] = {
          min: param.min + (param.max - param.min) * 0.25,
          max: param.min + (param.max - param.min) * 0.75,
          behavior: 50
        };
      } else if (param.type === 'multi-dual') {
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
  
  // Minimum dropdown
  const minWrapper = document.createElement('div');
  minWrapper.className = 'dropdown-container';
  
  const minLabel = document.createElement('div');
  minLabel.className = 'dropdown-label';
  minLabel.textContent = 'Minimum';
  minWrapper.appendChild(minLabel);
  
  const minSelect = document.createElement('select');
  minSelect.className = 'param-select';
  
  // Maximum dropdown  
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
  
  // Populate both dropdowns with same options
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
  
  // Set current values
  minSelect.value = voiceData[voiceIndex].parameters[paramName].min;
  maxSelect.value = voiceData[voiceIndex].parameters[paramName].max;
  
  // Event handlers
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
    const values = sliderDiv.noUiSlider.get();
    const min = Math.round(values[0]);
    const max = Math.round(values[1]);
    
    // Update voice data only, no display
    voiceData[voiceIndex].parameters[param.name].min = min;
    voiceData[voiceIndex].parameters[param.name].max = max;
  };
  
  sliderDiv.noUiSlider.on('update', updateValues);
  updateValues();
  
  sliderWrapper.appendChild(sliderDiv);
  wrapper.appendChild(sliderWrapper);
  
  return wrapper;
}

function createMultiDualSlider(param, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dual-slider';
  
  // Speed slider
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
    // Remove visual display, keep data update only
    voiceData[voiceIndex].parameters[param.name].speed.min = min;
    voiceData[voiceIndex].parameters[param.name].speed.max = max;
  };
  
  speedDiv.noUiSlider.on('update', updateSpeedValues);
  updateSpeedValues();
  
  speedWrapper.appendChild(speedDiv);
  
  // Depth slider  
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
    // Remove visual display, keep data update only
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
    const offset = percentage * (slider.offsetWidth - 16); // 16px is handle width
    tooltip.style.left = `${offset + 8}px`; // 8px is half handle width to center
    tooltip.textContent = value + '%';
  };
  
  slider.oninput = (e) => {
    const value = parseInt(e.target.value);
    voiceData[voiceIndex].parameters[param.name].behavior = value;
    updateTooltipPosition();
  };
  
  // Update position on initial load and resize
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

  // Behavior column
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
  parameterSection.innerHTML = '';
  
  // Add voice-specific controls at the top
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
  
  // Add parameters
  parameterDefinitions.forEach(param => {
    parameterSection.appendChild(createRow(param, currentVoice));
  });
}

// Voice-specific functions (placeholders for future implementation)
function previewVoice(voiceIndex) {
  console.log(`Previewing voice ${voiceIndex + 1}`);
  // TODO: Implement voice preview functionality
}

function toggleLockVoice(voiceIndex) {
  voiceData[voiceIndex].locked = !voiceData[voiceIndex].locked;
  console.log(`Voice ${voiceIndex + 1} ${voiceData[voiceIndex].locked ? 'locked' : 'unlocked'}`);
  renderParameters(); // Re-render to update button text
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  console.log('16-Voice Composer initialized');
  console.log('Voice data structure:', voiceData);
});
