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
  { name: "DELAY", type: "multi-dual", min: 0, max: 2000 },  // NEW: Time (ms) and Feedback (%),
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

// Global state
let currentVoice = 0;
let voiceData = [];

// INSERT THE COMPLETE FUNCTION HERE:
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
          // Create piano keyboard for desktop
          const pianoContainer = document.createElement('div');
          pianoContainer.className = 'piano-container';
          pianoContainer.style.width = '100%'; // Ensure container takes full width

    // Create piano keys
    for (let i = 0; i < 88; i++) {
      const key = document.createElement('div');
      key.className = 'piano-key';
      key.dataset.note = i + 21; // MIDI note number
      pianoContainer.appendChild(key);
    }

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


function createRow(param, voiceIndex) {
  const row = document.createElement('div');
  row.className = 'row-container';
  
  // Add special class for melodic range
  if (param.name === 'MELODIC RANGE') {
    row.classList.add('melodic-range-row');
  }

  // Label section (top)
  const label = document.createElement('div');
  label.className = 'label-container';
  label.textContent = param.name;
  row.appendChild(label);

  // Controls section (bottom) - NEW STRUCTURE
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

// NOW your DOMContentLoaded event...
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  
  // Connect PLAY button
  setTimeout(() => {
    const playButton = document.querySelector('#file-controls button:nth-child(4)');
    if (playButton) {
      playButton.onclick = toggleMasterPlayback;
      console.log('✅ Master PLAY button connected to toggleMasterPlayback');
    }
  }, 200);
});



// Initialize the application
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();

  initializeVoices();
  createVoiceTabs();
  renderParameters();
  
  // Automatically connect sliders after UI is ready
  setTimeout(() => {
    connectAllSliders();
  }, 100);
  
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
  // Handle "No Rests" option (index 0)
  if (restIndex === 0) {
    console.log('No Rests selected = 0s rest');
    return 0; // No rest between notes
  }
  
  // Use same duration mapping as rhythms for rests 1-15
  const restInfo = rhythmDurations[restIndex - 1]; // Offset by 1 since rests start at index 1
  if (!restInfo) {
    console.warn(`Invalid rest index ${restIndex}, defaulting to quarter note rest`);
    return 60 / currentTempo; // Quarter note rest fallback
  }
  
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
 * Schedule a rhythm pattern for a voice - WITH ERROR HANDLING
 */
function scheduleRhythmPattern(voiceIndex, startTime) {
    const rhythmParam = voiceData[voiceIndex].parameters['RHYTHMS'];
    const restParam = voiceData[voiceIndex].parameters['RESTS'];
    
    // ERROR HANDLING: Check for valid rhythm/rest selections
    if (rhythmParam.min === 0 && rhythmParam.max === 0) {
        console.warn(`Voice ${voiceIndex + 1}: No rhythm selected, using default eighth notes`);
        rhythmParam.min = 4; // Eighth notes
        rhythmParam.max = 4;
    }
    
    if (restParam.min === 0 && restParam.max === 0) {
        console.warn(`Voice ${voiceIndex + 1}: No rest selected, using default eighth notes`);
        restParam.min = 4; // Eighth notes  
        restParam.max = 4;
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
    
    // In scheduleRhythmPattern, update the valid ranges:
// Rhythms: 0-14 (no invalid index 0 anymore)
rhythmIndex = Math.max(0, Math.min(14, rhythmIndex));
// Rests: 0-15 (index 0 is valid "No Rests")
restIndex = Math.max(0, Math.min(15, restIndex));

    
    // Get durations
    const noteDuration = getRhythmDuration(rhythmIndex, testTempo);
    const restDuration = getRestDuration(restIndex, testTempo);
    
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
    
    console.log(`Scheduled: ${noteInfo.noteName} for ${noteDuration.toFixed(3)}s, rest ${restDuration.toFixed(3)}s`);
    
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
  console.log('=== CONNECTING ALL PARAMETER CONTROLS (with mobile melodic range fix) ===');
  
  const parameterSection = document.getElementById('parameter-section');
  
  // 1. Connect dual-range sliders (noUiSlider instances)
  const dualSliders = parameterSection.querySelectorAll('.noUi-target');
  console.log(`Found ${dualSliders.length} dual-range sliders to connect`);
  
  dualSliders.forEach((slider, index) => {
    if (slider.noUiSlider) {
      const row = slider.closest('.row-container');
      const label = row ? row.querySelector('.label-container') : null;
      const paramName = label ? label.textContent.trim() : `Unknown ${index}`;
      
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
            delete voiceData[currentVoice].parameters[paramName].currentValue;
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
    const row = slider.closest('.row-container');
    const label = row ? row.querySelector('.label-container') : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Behavior';
    
    console.log(`Connecting behavior slider: ${paramName}`);
    
    // Remove any existing event listeners
    slider.oninput = null;
    slider.onchange = null;
    
    // Add new event listener
    slider.oninput = function(e) {
      const value = parseInt(e.target.value);
      
      if (voiceData[currentVoice].parameters[paramName]) {
        voiceData[currentVoice].parameters[paramName].behavior = value;
        
        // Update the tooltip
        const tooltip = slider.parentElement.querySelector('.behavior-tooltip');
        if (tooltip) {
          tooltip.textContent = value + '%';
          
          // Update tooltip position
          const percentage = (value - slider.min) / (slider.max - slider.min);
          const offset = percentage * (slider.offsetWidth - 16);
          tooltip.style.left = `${offset + 8}px`;
        }
        
        console.log(`✅ ${paramName} behavior: ${value}%`);
      }
    };
  });
  
  // 3. Connect dropdown selectors (Sound, Rhythms, Rests)
  const dropdowns = parameterSection.querySelectorAll('select.param-select, select.sound-select');
  console.log(`Found ${dropdowns.length} dropdowns to connect`);
  
  dropdowns.forEach((dropdown) => {
    const row = dropdown.closest('.row-container');
    const label = row ? row.querySelector('.label-container') : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Dropdown';
    
    // Determine if this is min/max dropdown or single dropdown
    const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
    const isMinMax = dropdownLabel === 'Minimum' || dropdownLabel === 'Maximum';
    
    console.log(`Connecting dropdown: ${paramName} (${dropdownLabel || 'single'})`);
    
    // Remove existing event listeners
    dropdown.onchange = null;
    
    // Add new event listener
    dropdown.onchange = function(e) {
      const value = parseInt(e.target.value);
      
      if (paramName === 'SOUND') {
        // Single dropdown for sound selection
        voiceData[currentVoice].parameters[paramName] = value;
        console.log(`✅ ${paramName}: ${gmSounds[value]}`);
      } else if (isMinMax && voiceData[currentVoice].parameters[paramName]) {
        // Dual dropdown (Rhythms/Rests)
        if (dropdownLabel === 'Minimum') {
          voiceData[currentVoice].parameters[paramName].min = value;
        } else if (dropdownLabel === 'Maximum') {
          voiceData[currentVoice].parameters[paramName].max = value;
        }
        console.log(`✅ ${paramName} ${dropdownLabel.toLowerCase()}: ${value}`);
      }
    };
  });
  
  // 4. Connect multi-dual sliders (like DELAY with Speed/Depth)
  const multiDualContainers = parameterSection.querySelectorAll('.dual-slider');
  console.log(`Found ${multiDualContainers.length} multi-dual slider containers`);
  
  multiDualContainers.forEach((container) => {
    const row = container.closest('.row-container');
    const label = row ? row.querySelector('.label-container') : null;
    const paramName = label ? label.textContent.trim() : 'Unknown Multi-Dual';
    
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
  
  console.log('🎉 ALL PARAMETER CONTROLS CONNECTED! System fully operational:');
  console.log(`   ✅ ${dualSliders.length} dual-range sliders`);
  console.log(`   ✅ ${behaviorSliders.length} behavior sliders`);
  console.log(`   ✅ ${dropdowns.length} dropdown controls`);
  console.log(`   ✅ Multi-dual sliders (DELAY, etc.)`);
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
   * Preview individual voice (for parameter adjustment)
   */
  previewVoice(voiceIndex) {
    const voice = this.voices[voiceIndex];
    
    if (voice.isPreviewPlaying) {
      voice.stopPreview();
    } else {
      // Stop any other voice previews first
      this.voices.forEach(v => v.stopPreview());
      voice.startPreview();
    }
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
    // Get current parameter values for this voice
    const voiceParams = voiceData[this.voiceIndex].parameters;
    
    // Select rhythm and rest durations
    const rhythmParam = voiceParams['RHYTHMS'];
    const restParam = voiceParams['RESTS'];
    
    const rhythmIndex = this.selectValueInRange(rhythmParam);
    const restIndex = this.selectValueInRange(restParam);
    
    const noteDuration = getRhythmDuration(rhythmIndex, testTempo);
    const restDuration = getRestDuration(restIndex, testTempo);
    
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
      // Use existing parameter evolution system
      startTestClock();
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
