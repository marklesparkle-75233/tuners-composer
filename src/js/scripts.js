// Parameter definitions
const parameterDefinitions = [
  // INSTRUMENT & SOUND ROLLUP - CORRECTED ORDER
  { name: "INSTRUMENT", type: "dropdown", options: "gm-sounds", rollup: "instrument" },
  { name: "MELODIC RANGE", type: "single-dual", min: 21, max: 108, rollup: "instrument" },
  { name: "PHRASE STYLES", type: "phrase-styles-control", rollup: "instrument" },
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

// Phrase Styles Debug Logging
const PHRASE_STYLES_DEBUG = false;  // Set to true for detailed pattern debugging

// ===== DEBUG FLAGS =====
const DEBUG = {
  LIFE_SPAN: false,        // Life Span slider creation, updates, view switching
  TIMELINE: false,         // Timeline View operations
  BEAT_CONVERSION: false,  // beatsToMs, msToBeats calculations
  SLIDER_CONNECTION: false, // Slider event handler connections
  VOICE_CLOCK: false,      // Voice clock timing and scheduling
  MASTER_CLOCK: false,     // Master clock updates
  AUDIO: false,            // Audio node creation and cleanup
  PERFORMANCE: false,      // CPU, memory, oscillator pool stats
  PHRASE_STYLES: false,    // Phrase pattern generation (uses PHRASE_STYLES_DEBUG)
  UNDO_REDO: false,        // NEW: Undo/redo operations and state capture
  EVENTS: false,           // NEW: Events system operations and timeline interaction
  ALL: false               // Master override - enables all logging
};

// Master override
if (DEBUG.ALL) {
  Object.keys(DEBUG).forEach(key => {
    if (key !== 'ALL') DEBUG[key] = true;
  });
}
// ===== END DEBUG FLAGS =====

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
    to: function(beatCount) {
      // Get current tempo
      const tempo = getCurrentTempoForVoice(voiceIndex);
      
      // Round to integer and handle infinity
      const roundedBeats = Math.round(beatCount);
      
      if (roundedBeats >= 999999) return '∞ beats (∞)';
      if (roundedBeats <= 0) return '0 beats (0:00)';
      
      // Convert beats to milliseconds for time display
      const timeMs = beatsToMs(roundedBeats, beatUnit, tempo);
      const timeStr = formatMsToMMSS(timeMs);
      
      // Format: "80 beats (1:20)" - NO DECIMALS
      return `${roundedBeats} beats (${timeStr})`;
    },


    from: function(value) {
      // Handle infinity strings
      if (value === '∞ beats (∞)' || value === '∞' || value === 'Infinity') {
        return 999999;
      }
      
      // Parse "80 beats (1:20)" format
      const beatsMatch = value.match(/^(\d+) beats/);
      
      if (beatsMatch) {
        return parseInt(beatsMatch[1]);
      }
      
      // Fallback: parse as number
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.round(parsed);
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
  
  console.log(`🎵 Beat duration for Voice ${voiceIndex + 1}: ${durationMs}ms (tempo: ${currentTempo} BPM)`);

  return durationMs;
}

// ===== BEAT-BASED TIME CONVERSION SYSTEM =====

/**
 * Convert beat count to milliseconds
 * @param {number} beatCount - Number of beats in the selected unit
 * @param {number} beatUnit - Index in rhythmOptions (0-14)
 * @param {number} tempo - Current tempo in BPM
 * @returns {number} Time in milliseconds
 */
function beatsToMs(beatCount, beatUnit, tempo) {
  if (beatCount >= 999999) return 999999999; // Infinity case
  
  // PRECISION FIX: Use integer arithmetic
  const beatDurationMs = (60000 / tempo); // Quarter note in milliseconds
  const rhythmInfo = rhythmDurations[beatUnit] || rhythmDurations[7];
  const unitDurationMs = rhythmInfo.beats * beatDurationMs;
  
  // Use consistent calculation
  const totalMs = beatCount * unitDurationMs;
  
  return Math.round(totalMs); // Round to nearest millisecond
}

/**
 * Convert milliseconds to beat count
 * @param {number} timeMs - Time in milliseconds
 * @param {number} beatUnit - Index in rhythmOptions (0-14)
 * @param {number} tempo - Current tempo in BPM
 * @returns {number} Number of beats (integer)
 */
function msToBeats(timeMs, beatUnit, tempo) {
  if (timeMs >= 999999999) return 999999; // Infinity case
  
  // PRECISION FIX: Use integer arithmetic where possible
  const beatDurationMs = (60000 / tempo); // Quarter note in milliseconds (integer)
  const rhythmInfo = rhythmDurations[beatUnit] || rhythmDurations[7];
  const unitDurationMs = rhythmInfo.beats * beatDurationMs;
  
  if (unitDurationMs === 0) return 0;
  
  // CRITICAL: Use consistent rounding to prevent drift
  const rawBeats = timeMs / unitDurationMs;
  
  // Round to 3 decimal places and ensure consistency
  return Math.round(rawBeats * 1000) / 1000;
}

/**
 * Get current tempo for a voice (handles behavior interpolation)
 * @param {number} voiceIndex - Voice index (0-15)
 * @returns {number} Current tempo in BPM
 */
function getCurrentTempoForVoice(voiceIndex) {
  const tempoParam = voiceData[voiceIndex].parameters['TEMPO (BPM)'];
  
  if (!tempoParam) return 120; // Default fallback
  
  // If tempo is evolving with behavior, use current value
  if (tempoParam.behavior > 0 && tempoParam.currentValue !== undefined) {
    return Math.round(tempoParam.currentValue);
  }
  
  // Otherwise use midpoint
  return Math.round((tempoParam.min + tempoParam.max) / 2);
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

// Melodic Scale Definitions (intervals from root)
const scaleDefinitions = {
  'None': null, // No filtering
  'Chromatic': [0,1,2,3,4,5,6,7,8,9,10,11],
  'Major': [0,2,4,5,7,9,11],
  'Natural Minor': [0,2,3,5,7,8,10],
  'Harmonic Minor': [0,2,3,5,7,8,11],
  'Melodic Minor': [0,2,3,5,7,9,11],
  'Dorian': [0,2,3,5,7,9,10],
  'Phrygian': [0,1,3,5,7,8,10],
  'Lydian': [0,2,4,6,7,9,11],
  'Mixolydian': [0,2,4,5,7,9,10],
  'Locrian': [0,1,3,5,6,8,10],
  'Blues': [0,3,5,6,7,10],
  'Pentatonic Major': [0,2,4,7,9],
  'Pentatonic Minor': [0,3,5,7,10],
  'Whole Tone': [0,2,4,6,8,10],
  'Diminished': [0,2,3,5,6,8,9,11],
  'Augmented': [0,3,4,7,8,11]
};

// Note names for root note dropdown
const noteNames = [
  'C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 
  'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'
];

// Chord quality display names (maps to existing chordQualities object)
const chordQualityNames = {
  'none': 'None (All Scale Notes)',
  'major': 'Major Triad',
  'minor': 'Minor Triad',
  'diminished': 'Diminished Triad',
  'augmented': 'Augmented Triad',
  'sus2': 'Suspended 2nd',
  'sus4': 'Suspended 4th',
  'major7': 'Major 7th',
  'minor7': 'Minor 7th',
  'dominant7': 'Dominant 7th',
  'diminished7': 'Diminished 7th',
  'halfDiminished7': 'Half-Diminished 7th',
  'augmented7': 'Augmented 7th',
  'majorMajor7': 'Major/Major 7th',
  'add9': 'Add 9',
  'major9': 'Major 9th',
  'minor9': 'Minor 9th',
  'dominant9': 'Dominant 9th',
  'major11': 'Major 11th',
  'minor11': 'Minor 11th',
  'dominant11': 'Dominant 11th',
  'major13': 'Major 13th',
  'minor13': 'Minor 13th',
  'dominant13': 'Dominant 13th',
  'sixth': '6th Chord',
  'minorSixth': 'Minor 6th',
  'sixNine': '6/9 Chord',
  'dom7sharp5': 'Dom 7 ♯5',
  'dom7flat5': 'Dom 7 ♭5',
  'dom7sharp9': 'Dom 7 ♯9',
  'dom7flat9': 'Dom 7 ♭9',
  'quartal': 'Quartal',
  'cluster': 'Cluster',
  'wholeTone': 'Whole Tone'
};

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

  seekTo(targetTimeMs) {
  if (DEBUG.MASTER_CLOCK) {
    console.log(`🎯 MasterClock seeking to ${formatMsToMMSS(targetTimeMs)}`);
  }
  
  const wasRunning = this.isRunning;
  
  // NEW: Stop all currently playing notes before seeking
  if (voiceClockManager && voiceClockManager.isInitialized) {
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        const voiceClock = voiceClockManager.getVoiceClock(i);
        if (voiceClock && voiceClock.activeNotes) {
          this.stopActiveNotesInVoice(voiceClock);
        }
      }
    }
  }
  
  // MOVED: Apply parameter state BEFORE updating voice clocks
  this.applyParameterStateAtTime(targetTimeMs);
  
  if (this.isRunning) {
    // Seeking during playback - adjust timing but keep running
    const now = Date.now();
    this.masterStartTime = now - targetTimeMs;
    this.currentTime = now;
    this.elapsedTime = targetTimeMs;
    this.lastUpdateTime = now;
    this.lastParameterUpdate = now;
    
    // Ensure audioManager knows we're still playing
    if (audioManager) {
      audioManager.isPlaying = true;
    }
    
    if (DEBUG.MASTER_CLOCK) {
      console.log(`   Updated timing: masterStartTime adjusted for seamless playback`);
      console.log(`   New elapsed time: ${formatMsToMMSS(this.elapsedTime)}`);
    }
  } else {
    // Seeking while stopped - just set position
    this.elapsedTime = targetTimeMs;
    this.masterStartTime = Date.now() - targetTimeMs;
    
    if (DEBUG.MASTER_CLOCK) {
      console.log(`   Set position while stopped: ${formatMsToMMSS(this.elapsedTime)}`);
    }
  }
  
  // Update all voice clocks AFTER parameter state is set
  if (voiceClockManager && voiceClockManager.isInitialized) {
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        const voiceClock = voiceClockManager.getVoiceClock(i);
        if (voiceClock && voiceClock.isActive) {
          voiceClock.seekTo(targetTimeMs);
        }
      }
    }
  }
  
  // Update timeline playheads immediately
  this.updateAllTimelines();
  
  if (DEBUG.MASTER_CLOCK) {
    console.log(`✅ Seek complete to ${formatMsToMMSS(targetTimeMs)}`);
  }
}


stopActiveNotesInVoice(voiceClock) {
  if (!voiceClock.activeNotes) return;
  
  const notesToStop = Array.from(voiceClock.activeNotes);
  
  notesToStop.forEach(note => {
    try {
      // Stop oscillator immediately
      if (note.oscillator && note.isActive) {
        note.oscillator.stop();
        note.isActive = false;
      }
    } catch (e) {
      // Already stopped
    }
  });
  
  // Clear active notes tracking
  voiceClock.activeNotes.clear();
  
  console.log(`🛑 Stopped ${notesToStop.length} active notes`);
}

  applyParameterStateAtTime(targetTimeMs) {
    if (DEBUG.MASTER_CLOCK) {
      console.log(`🎛️ Applying parameter state at ${formatMsToMMSS(targetTimeMs)} (NEW REGISTRY)`);
    }
    
    let updatedVoices = 0;
    
    for (let i = 0; i < 16; i++) {
      if (voiceData[i].enabled) {
        // NEW: Use EventRegistry instead of voice-specific events
        const parameterState = this.getParameterStateFromRegistry(i, targetTimeMs);
        this.applyParametersToVoice(i, parameterState);
        updatedVoices++;
      }
    }
    
    if (DEBUG.MASTER_CLOCK) {
      console.log(`✅ Applied registry-based parameter state to ${updatedVoices} voices`);
    }
  }
  
  /**
   * Get parameter state from EventRegistry at specific time
   * NEW METHOD: Replaces old event processing
   * @param {number} voiceIndex - Voice index
   * @param {number} targetTimeMs - Target time in milliseconds
   * @returns {object} Parameter state object
   */
  getParameterStateFromRegistry(voiceIndex, targetTimeMs) {
    // Start with baseline parameters
    const currentState = this.cloneBaselineParameters(voiceIndex);
    
    // Get voice's Life Span settings for beat conversion
    const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
    if (!lifeSpan) return currentState;
    
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = getCurrentTempoForVoice(voiceIndex);
    const targetBeat = msToBeats(targetTimeMs, beatUnit, tempo);
    
    // NEW: Get all events for this voice from registry
    const registry = getEventRegistry();
    const voiceEvents = registry.getEventsForVoice(voiceIndex);
    
    // Filter to events at or before target beat
    const applicableEvents = voiceEvents.filter(event => event.beatPosition <= targetBeat)
                                      .sort((a, b) => a.beatPosition - b.beatPosition); // Chronological order
    
    if (DEBUG.MASTER_CLOCK && applicableEvents.length > 0) {
      console.log(`   📅 Voice ${voiceIndex + 1}: Applying ${applicableEvents.length} registry events up to beat ${targetBeat.toFixed(1)}`);
    }
    
    // Apply each event in chronological order (later events override earlier ones)
    applicableEvents.forEach(event => {
      if (event.type === 'parameter') {
        // Single parameter event
        currentState[event.parameterName] = event.value;
        
        if (DEBUG.MASTER_CLOCK) {
          console.log(`     Applied: ${event.parameterName} = ${JSON.stringify(event.value)} (beat ${event.beatPosition})`);
        }
        
      } else if (event.type === 'compound-parameter') {
        // Multi-parameter event
        Object.keys(event.changes).forEach(paramName => {
          currentState[paramName] = event.changes[paramName].value;
          
          if (DEBUG.MASTER_CLOCK) {
            console.log(`     Applied: ${paramName} = ${JSON.stringify(event.changes[paramName].value)} (beat ${event.beatPosition})`);
          }
        });
      }
    });
    
    return currentState;
  }


getParameterStateAtTime(voiceIndex, targetTimeMs) {
  const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    // No events - return current baseline parameters
    return this.cloneBaselineParameters(voiceIndex);
  }
  
  const beatUnit = lifeSpan.beatUnit || 7;
  const tempo = getCurrentTempoForVoice(voiceIndex);
  const targetBeat = msToBeats(targetTimeMs, beatUnit, tempo);
  
  // ALWAYS start fresh from baseline parameters (this ensures backward seeking works)
const currentState = this.cloneBaselineParameters(voiceIndex);

if (DEBUG.MASTER_CLOCK) {
  console.log(`   🔄 Starting from baseline for Voice ${voiceIndex + 1} at beat ${targetBeat.toFixed(1)}`);
}

// Apply all parameter events up to targetBeat (chronological order)  
const parameterEvents = lifeSpan.events
  .filter(event => event.type === 'parameter' && event.beatPosition <= targetBeat)
  .sort((a, b) => a.beatPosition - b.beatPosition);

if (DEBUG.MASTER_CLOCK) {
  console.log(`   📅 Found ${parameterEvents.length} parameter events to apply`);
  parameterEvents.forEach(event => {
    console.log(`     • Beat ${event.beatPosition}: ${event.parameter} = ${JSON.stringify(event.value)}`);
  });
}

  
  if (DEBUG.MASTER_CLOCK && parameterEvents.length > 0) {
    console.log(`   Voice ${voiceIndex + 1}: Processing ${parameterEvents.length} parameter events up to beat ${targetBeat.toFixed(1)}`);
  }
  
  // Apply each event (most recent wins)
  parameterEvents.forEach(event => {
    if (event.parameter && event.value) {
      currentState[event.parameter] = event.value;
      
      if (DEBUG.MASTER_CLOCK) {
        console.log(`     Applied: ${event.parameter} = ${JSON.stringify(event.value)} (beat ${event.beatPosition})`);
      }
    }
  });
  
  return currentState;
}

cloneBaselineParameters(voiceIndex) {
  const voice = voiceData[voiceIndex];
  if (!voice) return {};
  
  // Create a deep copy of current parameter values
  const baseline = {};
  
  Object.keys(voice.parameters).forEach(paramName => {
    const param = voice.parameters[paramName];
    
    if (typeof param === 'object' && param !== null) {
      // Handle different parameter types
      if (typeof param.min === 'number' && typeof param.max === 'number') {
        // Range parameter
        baseline[paramName] = {
          min: param.min,
          max: param.max,
          behavior: param.behavior || 0
        };
      } else if (param.selectedValues && Array.isArray(param.selectedValues)) {
        // Multi-select parameter
        baseline[paramName] = {
          selectedValues: [...param.selectedValues],
          behavior: param.behavior || 0
        };
      } else if (param.speed || param.depth) {
        // Multi-dual parameter
        baseline[paramName] = {
          speed: param.speed ? { ...param.speed } : { min: 0, max: 0 },
          depth: param.depth ? { ...param.depth } : { min: 0, max: 0 },
          feedback: param.feedback ? { ...param.feedback } : { min: 0, max: 0 },
          behavior: param.behavior || 0
        };
      } else {
        // Complex parameter (copy as-is)
        baseline[paramName] = JSON.parse(JSON.stringify(param));
      }
    } else {
      // Simple parameter (number, string)
      baseline[paramName] = param;
    }
  });
  
  if (DEBUG.MASTER_CLOCK) {
    console.log(`📋 Cloned baseline parameters for Voice ${voiceIndex + 1}:`, Object.keys(baseline));
  }
  
  // Log baseline volume specifically
    if (baseline['VOLUME']) {
      const vol = baseline['VOLUME'];
      const avgVol = (vol.min + vol.max) / 2;
      console.log(`   📊 Baseline VOLUME: ${vol.min}-${vol.max} (avg: ${avgVol.toFixed(1)})`);
    }

  return baseline;
}

applyParametersToVoice(voiceIndex, parameterState) {
  if (!parameterState || Object.keys(parameterState).length === 0) return;

  if (DEBUG.MASTER_CLOCK) {
    console.log(`🎛️ Applying parameters to Voice ${voiceIndex + 1} voiceData`);
  }

  // UPDATE voiceData so new notes use correct parameters
  Object.keys(parameterState).forEach(paramName => {
    if (voiceData[voiceIndex].parameters[paramName]) {
      const currentParam = voiceData[voiceIndex].parameters[paramName];
      const newValue = parameterState[paramName];
      
      // Apply based on parameter type
      if (typeof newValue === 'object' && newValue !== null) {
        if (typeof newValue.min === 'number' && typeof newValue.max === 'number') {
          // Range parameter - UPDATE voiceData
          currentParam.min = newValue.min;
          currentParam.max = newValue.max;
          if (newValue.behavior !== undefined) {
            currentParam.behavior = newValue.behavior;
          }
          
          // Clear current interpolated value to force recalculation
          delete currentParam.currentValue;
          
          if (DEBUG.MASTER_CLOCK && paramName === 'VOLUME') {
            console.log(`     🔊 UPDATED voiceData ${paramName}: ${newValue.min}-${newValue.max}`);
          }
        }
        // ... other parameter types unchanged
      } else {
        // Simple parameter
        voiceData[voiceIndex].parameters[paramName] = newValue;
      }
    }
  });

  if (DEBUG.MASTER_CLOCK) {
    console.log(`✅ voiceData updated - new notes will use these parameters`);
  }
}


applyRealTimeAudioChanges(voiceIndex, parameterState) {
  if (DEBUG.MASTER_CLOCK) {
    console.log(`🔊 Applying real-time audio for Voice ${voiceIndex + 1}`);
  }
  
  // Apply volume changes to active notes in voice clock
  if (parameterState['VOLUME']) {
    const volumeParam = parameterState['VOLUME'];
    const newVolume = (volumeParam.min + volumeParam.max) / 2;
    
    console.log(`🔊 VOLUME UPDATE: Voice ${voiceIndex + 1} → ${newVolume.toFixed(1)} (updating active notes)`);
    
    // Update master volume control
    if (audioManager && audioManager.setVolumeRealTime) {
      audioManager.setVolumeRealTime(newVolume);
    }
    
    // NEW: Update active notes in voice clock
    if (voiceClockManager && voiceClockManager.isInitialized) {
      const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
      if (voiceClock && voiceClock.updateVolumeForActiveNotes) {
        voiceClock.updateVolumeForActiveNotes(newVolume);
      }
    }
  }
  
  // Apply balance changes (existing code unchanged)
  if (parameterState['STEREO BALANCE']) {
    const balanceParam = parameterState['STEREO BALANCE'];
    const newBalance = (balanceParam.min + balanceParam.max) / 2;
    
    console.log(`🔊 BALANCE UPDATE: Voice ${voiceIndex + 1} → ${newBalance.toFixed(1)}`);
    
    if (audioManager && audioManager.setBalanceRealTime) {
      audioManager.setBalanceRealTime(newBalance);
    }
  }
}


  updateAllTimelines() {
    // Update main timeline view playhead
    if (timelineViewActive) {
      updateTimelinePlayhead();
    }
    
    // Update visual timeline playhead
    if (visualTimeline && visualTimeline.isVisible) {
      visualTimeline.updatePlayhead();
    }
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
    
    // Update timeline playhead if timeline view is active
    if (timelineViewActive) {
      updateTimelinePlayhead();
    }

        // NEW: Update visual timeline playhead if visible
    if (visualTimeline && visualTimeline.isVisible) {
      visualTimeline.updatePlayhead();
    }

    this.lastUpdateTime = now;
  }
  
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
  
  applyParametersToVoice(voiceIndex, parameterState) {
  if (!parameterState || Object.keys(parameterState).length === 0) return;

  if (DEBUG.MASTER_CLOCK) {
    console.log(`🎛️ Storing parameter state for Voice ${voiceIndex + 1} (NOT modifying voiceData)`);
  }

  // Store parameter state in voice clock for new notes (don't corrupt voiceData)
  if (voiceClockManager && voiceClockManager.isInitialized) {
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (voiceClock) {
      // Store the parameter state for use by new notes
      voiceClock.currentParameterState = parameterState;
      
      if (DEBUG.MASTER_CLOCK) {
        console.log(`   ✅ Stored parameter state in voice clock (voiceData preserved)`);
        
        if (parameterState['VOLUME']) {
          const vol = parameterState['VOLUME'];
          const avg = (vol.min + vol.max) / 2;
          console.log(`     🔊 Volume for new notes: ${vol.min}-${vol.max} (avg: ${avg.toFixed(1)})`);
        }
      }
    }
  }

  // DON'T modify voiceData - it should stay as baseline
  if (DEBUG.MASTER_CLOCK) {
    console.log(`✅ Parameter state applied WITHOUT corrupting voiceData baseline`);
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
let timelineViewActive = false; // Track if timeline view is open

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

// Inside initializeVoices() function, update LIFE SPAN parameter:

} else if (param.name === 'LIFE SPAN') {
  // Initialize Life Span parameter with BEAT-BASED storage
  const defaultTempo = 120;
  const defaultBeatUnit = 7; // Quarter Notes
  const defaultTimeMs = 300000; // 5 minutes
  const defaultMaxBeats = 700;
  
  voice.parameters[param.name] = {
    // PRIMARY STORAGE (beats)
    maxTimeBeats: defaultMaxBeats,     
    beatUnit: defaultBeatUnit,         
    
    // NEW: Enhanced Events array system (mute + parameter events)
    events: [
      { 
        type: 'mute', 
        beatPosition: 0, 
        action: 'unmute', 
        id: 'default-start' 
      },
      { 
        type: 'mute', 
        beatPosition: defaultMaxBeats, 
        action: 'mute', 
        id: 'default-end' 
      }
      // Parameter events will be added here:
      // { type: 'parameter', beatPosition: 64, parameter: 'VOLUME', 
      //   changeType: 'range', value: {min: 80, max: 100}, id: 'evt-003' }
    ],
    nextEventId: 2, // Updated for 2 default events


    
    // LEGACY: Keep existing 3-entrance system (for rollback safety)
    lifeSpan1: {
      enterBeats: 0,                   
      exitBeats: 999999                // Infinity
    },
    lifeSpan2: {
      enterBeats: 0,
      exitBeats: 0                     // Disabled
    },
    lifeSpan3: {
      enterBeats: 0,
      exitBeats: 0                     // Disabled
    },
    repeat: false,
    behavior: 0,
    
    // LEGACY STORAGE (milliseconds - for backward compatibility)
    maxTimeMs: defaultTimeMs,          
    lifeSpan1Legacy: {
      enter: 0,
      exit: 999999999
    },
    lifeSpan2Legacy: {
      enter: 0,
      exit: 0
    },
    lifeSpan3Legacy: {
      enter: 0,
      exit: 0
    }
  };
      } else if (param.name === 'PHRASE STYLES') {
        // Initialize Phrase Styles parameter with defaults
        voice.parameters[param.name] = {
          patterns: {
            random: { enabled: true, length: 1 },        // DEFAULT ENABLED
            ascending: { enabled: false, length: 12 },   // 50% of 24
            descending: { enabled: false, length: 12 },
            pendulum: { enabled: false, length: 12 },
            wave: { enabled: false, length: 12 },
            spiral: { enabled: false, length: 12 }
          },
          breathe: {
            enabled: false,  // Checkbox state
            length: 12       // Slider value (50% of 24)
          },
          behavior: 50  // Pattern switching frequency (0-100%)
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
            selectedNotes: [60],
            filterSettings: {
              rootNote: -1,  // -1 = "None Selected"
              scale: 'None',
              chord: 'none'
            }
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
  wrapper.className = 'dual-slider';
  
  const lifeSpanParam = voiceData[voiceIndex].parameters['LIFE SPAN'];
  const beatUnit = lifeSpanParam.beatUnit || 7;
  
  // GET MAX BEATS (primary storage)
  const maxBeats = lifeSpanParam.maxTimeBeats || 600;
  
  // Calculate equivalent time for display
  const tempo = getCurrentTempoForVoice(voiceIndex);
  const maxTimeMs = beatsToMs(maxBeats, beatUnit, tempo);
  const maxTimeFormatted = formatMsToMMSS(maxTimeMs);
  
  console.log(`🎵 Voice ${voiceIndex + 1} Life Span: ${maxBeats} beats = ${maxTimeFormatted} @ ${tempo} BPM`);
  
  // NEW: Enhanced settings row with dual-mode input
const settingsRow = document.createElement('div');
settingsRow.className = 'life-span-settings';
settingsRow.style.cssText = `
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  width: 100%;
`;

settingsRow.innerHTML = `
  <div class="dual-mode-container" style="flex: 2; display: flex; flex-direction: column; gap: 8px;">
    <label style="font-weight: bold; color: #333;">Total Voice Length:</label>
    
    <!-- Mode Toggle Buttons -->
    <div class="mode-toggle-buttons" style="display: flex; gap: 4px; margin-bottom: 8px;">
      <button class="mode-btn beats-mode active" data-mode="beats" style="
        flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600;
        background: #4a90e2; color: white; border: none; border-radius: 4px 0 0 4px;
        cursor: pointer; transition: all 0.2s ease;
      ">🎵 BEATS</button>
      <button class="mode-btn time-mode" data-mode="time" style="
        flex: 1; padding: 6px 12px; font-size: 11px; font-weight: 600;
        background: #e9ecef; color: #495057; border: none; border-radius: 0 4px 4px 0;
        cursor: pointer; transition: all 0.2s ease;
      ">⏰ TIME</button>
    </div>
    
    <!-- Input Container (switches between beat/time input) -->
    <div class="input-container" style="position: relative;">
      
   <!-- Beat Input -->
    <div class="beat-input-group" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <div class="beat-input-with-arrows" style="display: flex; align-items: center; position: relative;">
        <input type="number" class="beat-count-input" value="${maxBeats}" 
              min="2" max="9999" step="1" placeholder="32"
              style="width: 80px; padding: 6px 24px 6px 8px; border: 2px solid #4a90e2; border-radius: 4px; 
                      font-size: 14px; font-weight: 600; text-align: center; background: #f8f9fa; box-sizing: border-box;" />
        
        <!-- Beat Up/Down Arrow Container -->
        <div class="beat-arrows" style="
          position: absolute; right: 2px; top: 2px; bottom: 2px; width: 20px;
          display: flex; flex-direction: column; background: white; border-radius: 0 2px 2px 0;
        ">
          <button class="beat-arrow beat-up" style="
            flex: 1; border: none; background: #f8f9fa; cursor: pointer; 
            font-size: 10px; line-height: 1; color: #495057; border-radius: 0 2px 0 0;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.1s ease; border-bottom: 1px solid #dee2e6;
          " title="Increase by 1 beat">▲</button>
          
          <button class="beat-arrow beat-down" style="
            flex: 1; border: none; background: #f8f9fa; cursor: pointer;
            font-size: 10px; line-height: 1; color: #495057; border-radius: 0 0 2px 0;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.1s ease;
          " title="Decrease by 1 beat">▼</button>
        </div>
      </div>
      
      <span class="beat-unit-label" style="font-size: 12px; color: #666; min-width: 100px;">
        ${rhythmOptions[beatUnit]}
      </span>
      <span class="tempo-display" style="font-size: 11px; color: #666; font-weight: 600; margin-left: 8px;">
        @ ${tempo} BPM
      </span>
      <span class="equals-time" style="font-size: 12px; color: #666; margin-left: 10px;">
        = ${maxTimeFormatted}
      </span>
      
      <!-- MOVED: Inline preset buttons after the time display -->
      <div class="inline-presets" style="display: flex; gap: 3px; margin-left: 15px;">
        <button class="preset-btn" data-beats="4" style="
          background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 3px; padding: 2px 6px;
          font-size: 10px; cursor: pointer; transition: all 0.2s ease; font-weight: 600;
          min-width: 24px; color: #495057;
        ">4</button>
        <button class="preset-btn" data-beats="8" style="
          background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 3px; padding: 2px 6px;
          font-size: 10px; cursor: pointer; transition: all 0.2s ease; font-weight: 600;
          min-width: 24px; color: #495057;
        ">8</button>
        <button class="preset-btn" data-beats="16" style="
          background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 3px; padding: 2px 6px;
          font-size: 10px; cursor: pointer; transition: all 0.2s ease; font-weight: 600;
          min-width: 24px; color: #495057;
        ">16</button>
        <button class="preset-btn" data-beats="32" style="
          background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 3px; padding: 2px 6px;
          font-size: 10px; cursor: pointer; transition: all 0.2s ease; font-weight: 600;
          min-width: 24px; color: #495057;
        ">32</button>
        <button class="preset-btn" data-beats="64" style="
          background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 3px; padding: 2px 6px;
          font-size: 10px; cursor: pointer; transition: all 0.2s ease; font-weight: 600;
          min-width: 24px; color: #495057;
        ">64</button>
      </div>
    </div>

      
      <!-- Time Input -->
      <div class="time-input-group" style="display: none; align-items: center; gap: 8px;">
        <div class="time-input-with-arrows" style="display: flex; align-items: center; position: relative;">
          <input type="text" class="time-input" value="${maxTimeFormatted}" 
                 placeholder="1:04" maxlength="5"
                 style="width: 80px; padding: 6px 24px 6px 8px; border: 2px solid #6c757d; border-radius: 4px; 
                        font-size: 14px; font-weight: 600; text-align: center; box-sizing: border-box;" />
          
          <!-- Time Up/Down Arrow Container -->
          <div class="time-arrows" style="
            position: absolute; right: 2px; top: 2px; bottom: 2px; width: 20px;
            display: flex; flex-direction: column; background: white; border-radius: 0 2px 2px 0;
          ">
            <button class="time-arrow time-up" style="
              flex: 1; border: none; background: #f8f9fa; cursor: pointer; 
              font-size: 10px; line-height: 1; color: #495057; border-radius: 0 2px 0 0;
              display: flex; align-items: center; justify-content: center;
              transition: all 0.1s ease; border-bottom: 1px solid #dee2e6;
            " title="Increase by 1 second">▲</button>
            
            <button class="time-arrow time-down" style="
              flex: 1; border: none; background: #f8f9fa; cursor: pointer;
              font-size: 10px; line-height: 1; color: #495057; border-radius: 0 0 2px 0;
              display: flex; align-items: center; justify-content: center;
              transition: all 0.1s ease;
            " title="Decrease by 1 second">▼</button>
          </div>
        </div>
        
        <span class="time-format-hint" style="font-size: 12px; color: #666; min-width: 100px;">
          MM:SS format
        </span>
        <span class="tempo-display-time" style="font-size: 11px; color: #666; font-weight: 600; margin-left: 8px;">
          @ ${tempo} BPM
        </span>
        <span class="equals-beats" style="font-size: 12px; color: #666; margin-left: 10px;">
          = ${maxBeats} beats
        </span>
      </div>
    </div>
      
  <div class="beat-unit-container" style="flex: 1;">
    <label>Beat Unit:</label>
    <select class="beat-unit-select" style="width: 100%; padding: 4px; margin-left: 5px;">
      ${rhythmOptions.map((option, index) => 
        `<option value="${index}" ${index === beatUnit ? 'selected' : ''}>${option}</option>`
      ).join('')}
    </select>
  </div>
`;

  wrapper.appendChild(settingsRow);
  
  
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

function calculateMasterTimelineLength() {
  let maxTimeMs = 0;
  
  console.log('📏 Calculating master timeline length...');
  
  for (let i = 0; i < 16; i++) {
    if (!voiceData[i].enabled) continue;
    
    const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
    if (!lifeSpan) continue;
    
    // Convert voice's max BEATS to milliseconds
    const maxBeats = lifeSpan.maxTimeBeats || 600;
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = getCurrentTempoForVoice(i);
    
    const voiceMaxMs = beatsToMs(maxBeats, beatUnit, tempo);
    
    console.log(`   Voice ${i + 1}: ${maxBeats} beats = ${formatMsToMMSS(voiceMaxMs)} @ ${tempo} BPM`);
    
    if (voiceMaxMs > maxTimeMs) {
      maxTimeMs = voiceMaxMs;
    }
  }
  
  // Fallback to 5 minutes if nothing set
  const finalTimeMs = maxTimeMs > 0 ? maxTimeMs : 300000;
  console.log(`📏 Master timeline length: ${formatMsToMMSS(finalTimeMs)} (${finalTimeMs}ms)`);
  return finalTimeMs;
}

function createTimelineEntranceSlider(voiceIndex, entranceNum, maxTimeMs, beatUnit) {
  const container = document.createElement('div');
  container.className = 'timeline-entrance-slider';
  container.style.cssText = `
    margin-bottom: 8px;
    width: 100%;
  `;
  
  console.log(`      Creating slider for Entrance ${entranceNum}...`);
  
  const label = document.createElement('div');
  label.className = 'timeline-entrance-label';
  label.textContent = `Entrance & Exit ${entranceNum}`;
  label.style.cssText = `
    font-size: 13px;
    color: #666;
    margin-bottom: 5px;
    font-weight: 600;
  `;
  container.appendChild(label);
  
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'timeline-slider-wrapper';
  sliderWrapper.dataset.voiceIndex = voiceIndex;
  sliderWrapper.dataset.entranceNum = entranceNum;
  sliderWrapper.style.cssText = `
    width: 100%;
    height: 40px;
    position: relative;
    box-sizing: border-box;
  `;
  
  const sliderDiv = document.createElement('div');
  sliderDiv.className = 'timeline-nouislider';
  sliderDiv.style.cssText = `
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  `;
  sliderWrapper.appendChild(sliderDiv);
  container.appendChild(sliderWrapper);
  
  console.log(`      Slider div created and appended`);
  
  // Get Life Span data (BEAT-BASED)
  const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpan) {
    console.error(`❌ Voice ${voiceIndex + 1}: No LIFE SPAN parameter!`);
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'padding: 10px; background: #fff3cd; color: #856404;';
    errorMsg.textContent = '⚠️ Life Span parameter missing';
    container.appendChild(errorMsg);
    return container;
  }
  
  let spanData = lifeSpan[`lifeSpan${entranceNum}`];
  
  // CREATE MISSING DATA if needed
  if (!spanData) {
    console.warn(`      ⚠️ Creating missing lifeSpan${entranceNum} data...`);
    lifeSpan[`lifeSpan${entranceNum}`] = {
      enterBeats: 0,
      exitBeats: entranceNum === 1 ? 999999 : 0
    };
    spanData = lifeSpan[`lifeSpan${entranceNum}`];
  }
  
  const enterBeats = spanData.enterBeats || 0;
  const exitBeats = spanData.exitBeats || 0;
  
  console.log(`      Entrance ${entranceNum} data: ${enterBeats}-${exitBeats} beats`);
  
  // Convert to milliseconds for timeline display
  const tempo = getCurrentTempoForVoice(voiceIndex);
  const enterMs = beatsToMs(enterBeats, beatUnit, tempo);
  const exitMs = (exitBeats >= 999999) ? maxTimeMs : beatsToMs(exitBeats, beatUnit, tempo);
  
  console.log(`      Timeline range: ${formatMsToMMSS(enterMs)} - ${formatMsToMMSS(exitMs)}`);
  
  // Calculate step size (1 beat in ms)
  const beatStepMs = beatsToMs(1, beatUnit, tempo);
  
  // Create formatter
  const formatter = {
    to: function(timeMs) {
      const beats = Math.round(msToBeats(timeMs, beatUnit, tempo));
      const timeStr = formatMsToMMSS(timeMs);
      return `${beats} beats (${timeStr})`;
    },
    from: function(value) {
      const beatsMatch = value.match(/^(\d+) beats/);
      if (beatsMatch) {
        const beats = parseInt(beatsMatch[1]);
        return beatsToMs(beats, beatUnit, tempo);
      }
      return parseFloat(value) || 0;
    }
  };
  
  console.log(`      Creating noUiSlider: range 0-${maxTimeMs}ms, step ${beatStepMs}ms`);
  
  try {
    noUiSlider.create(sliderDiv, {
      start: [enterMs, Math.min(exitMs, maxTimeMs)],
      connect: true,
      range: { min: 0, max: maxTimeMs },
      step: Math.max(1, Math.round(beatStepMs)),
      tooltips: [true, true],
      format: formatter
    });
    
    console.log(`      ✅ noUiSlider created successfully`);
    
    // Force width
    setTimeout(() => {
      sliderDiv.style.setProperty('width', '100%', 'important');
      const base = sliderDiv.querySelector('.noUi-base');
      if (base) base.style.setProperty('width', '100%', 'important');
      const connects = sliderDiv.querySelector('.noUi-connects');
      if (connects) connects.style.setProperty('width', '100%', 'important');
    }, 0);
    
    // Add voice boundary if applicable
    const voiceMaxBeats = lifeSpan.maxTimeBeats || 600;
    const voiceMaxTimeMs = beatsToMs(voiceMaxBeats, beatUnit, tempo);
    
    if (voiceMaxTimeMs < maxTimeMs) {
      const boundaryPercentage = (voiceMaxTimeMs / maxTimeMs) * 100;
      
      const boundaryLine = document.createElement('div');
      boundaryLine.className = 'voice-max-boundary';
      boundaryLine.style.cssText = `
        position: absolute;
        top: 0;
        bottom: 0;
        left: ${boundaryPercentage}%;
        width: 2px;
        background: #dc3545;
        z-index: 50;
        pointer-events: none;
      `;
      
      const boundaryLabel = document.createElement('div');
      boundaryLabel.style.cssText = `
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #dc3545;
        font-weight: 600;
        white-space: nowrap;
        background: white;
        padding: 2px 4px;
        border-radius: 2px;
      `;
      boundaryLabel.textContent = `Max: ${formatMsToMMSS(voiceMaxTimeMs)}`;
      
      boundaryLine.appendChild(boundaryLabel);
      sliderWrapper.appendChild(boundaryLine);
      
      console.log(`      🚧 Boundary at ${formatMsToMMSS(voiceMaxTimeMs)} (${boundaryPercentage.toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error(`      ❌ Error creating noUiSlider:`, error);
    console.error(`         Message:`, error.message);
    
    // Add visible error
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
      padding: 10px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      color: #856404;
      font-size: 12px;
      margin-top: 5px;
    `;
    errorMsg.innerHTML = `
      <strong>⚠️ Slider Error:</strong><br>
      ${error.message}
    `;
    container.appendChild(errorMsg);
  }
  
  return container;
}

function createTimelineVoiceRow(voiceIndex, maxTimeMs) {
  const row = document.createElement('div');
  row.className = 'voice-timeline-row';
  row.dataset.voiceIndex = voiceIndex;
  row.style.cssText = `
    border-bottom: 1px solid #dee2e6;
    padding: 15px 20px;
    background: white;
    position: relative;
  `;
  
  console.log(`🎬 Creating timeline row for Voice ${voiceIndex + 1}`);
  
  // Voice header
  const header = document.createElement('div');
  header.className = 'voice-timeline-header';
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 12px;
  `;
  
  const voiceLabel = document.createElement('div');
  voiceLabel.className = 'voice-timeline-label';
  const instrumentIndex = voiceData[voiceIndex].parameters['INSTRUMENT'];
  const instrumentName = gmSounds[instrumentIndex] || 'Unknown';
  voiceLabel.innerHTML = `
    <strong style="font-size: 16px; color: #333;">Voice ${voiceIndex + 1}</strong>
    <span style="font-size: 14px; color: #666; margin-left: 8px;">(${instrumentName})</span>
  `;
  
  header.appendChild(voiceLabel);
  row.appendChild(header);
  
  // Get Life Span data (BEAT-BASED)
  const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpan) {
    console.error(`❌ Voice ${voiceIndex + 1}: No LIFE SPAN parameter found!`);
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = 'padding: 20px; color: #dc3545; text-align: center;';
    errorMsg.textContent = '⚠️ Life Span parameter missing - cannot create timeline';
    row.appendChild(errorMsg);
    return row;
  }
  
  const beatUnit = lifeSpan.beatUnit || 7;
  const maxBeats = lifeSpan.maxTimeBeats || 600;
  
  // Calculate time for display
  const tempo = getCurrentTempoForVoice(voiceIndex);
  const voiceMaxTimeMs = beatsToMs(maxBeats, beatUnit, tempo);
  const voiceMaxTimeFormatted = formatMsToMMSS(voiceMaxTimeMs);
  
  console.log(`   Max: ${maxBeats} beats = ${voiceMaxTimeFormatted} @ ${tempo} BPM`);
  
  // Create parameter content container
  const paramContentContainer = document.createElement('div');
  paramContentContainer.className = 'row-container-content';
  paramContentContainer.style.cssText = `
    display: flex;
    width: 100%;
    gap: 20px;
  `;
  
  // Left side: Sliders container
  const slidersContainer = document.createElement('div');
  slidersContainer.className = 'range-container';
  slidersContainer.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0;
  `;
  
  // Create 3 entrance sliders
  for (let i = 1; i <= 3; i++) {
    console.log(`   Creating Entrance ${i} slider...`);
    try {
      const entranceContainer = createTimelineEntranceSlider(voiceIndex, i, maxTimeMs, beatUnit);
      slidersContainer.appendChild(entranceContainer);
      console.log(`   ✅ Entrance ${i} slider created`);
    } catch (sliderError) {
      console.error(`   ❌ Error creating Entrance ${i} slider:`, sliderError);
      
      // Add visible error
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'padding: 10px; background: #fff3cd; color: #856404; border-radius: 4px;';
      errorDiv.textContent = `⚠️ Error creating slider ${i}: ${sliderError.message}`;
      slidersContainer.appendChild(errorDiv);
    }
  }
  
  paramContentContainer.appendChild(slidersContainer);
  
  // Right side: Behavior container
  const behaviorContainer = document.createElement('div');
  behaviorContainer.className = 'behavior-container';
  behaviorContainer.style.cssText = `
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 15px;
    background: linear-gradient(to bottom, #f7f8f8, #e9ecef);
    border-radius: 8px;
  `;
  
  // Total Time Length - READ ONLY DISPLAY
  const timeContainer = document.createElement('div');
  timeContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 5px;
  `;
  const timeLabel = document.createElement('label');
  timeLabel.textContent = 'Total Time Length:';
  timeLabel.style.cssText = 'font-size: 12px; font-weight: bold; color: #333; text-align: center;';
  
  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'timeline-max-time-display';
  timeDisplay.textContent = voiceMaxTimeFormatted;
  timeDisplay.style.cssText = `
    width: 100%;
    padding: 6px 8px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #495057;
    text-align: center;
    font-family: 'Courier New', monospace;
  `;
  
  timeContainer.appendChild(timeLabel);
  timeContainer.appendChild(timeDisplay);
  behaviorContainer.appendChild(timeContainer);
  
  // Beat Unit - READ ONLY DISPLAY
  const beatContainer = document.createElement('div');
  beatContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 5px;
  `;
  const beatLabel = document.createElement('label');
  beatLabel.textContent = 'Beat Unit:';
  beatLabel.style.cssText = 'font-size: 12px; font-weight: bold; color: #333; text-align: center;';
  
  const beatDisplay = document.createElement('div');
  beatDisplay.className = 'timeline-beat-unit-display';
  beatDisplay.textContent = rhythmOptions[beatUnit] || 'Quarter Notes';
  beatDisplay.style.cssText = `
    width: 100%;
    padding: 6px 8px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 12px;
    color: #495057;
    text-align: center;
  `;
  
  beatContainer.appendChild(beatLabel);
  beatContainer.appendChild(beatDisplay);
  behaviorContainer.appendChild(beatContainer);
  
  // Repeat checkbox
  const repeatContainer = document.createElement('div');
  repeatContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid #dee2e6;
  `;
  
  const repeatLabel = document.createElement('label');
  repeatLabel.textContent = 'Repeat';
  repeatLabel.style.cssText = 'font-size: 14px; font-weight: bold; color: #333;';
  
  const repeatCheckbox = document.createElement('input');
  repeatCheckbox.type = 'checkbox';
  repeatCheckbox.className = 'timeline-repeat-checkbox';
  repeatCheckbox.dataset.voiceIndex = voiceIndex;
  repeatCheckbox.checked = lifeSpan.repeat || false;
  repeatCheckbox.style.cssText = `
    width: 20px;
    height: 20px;
    cursor: pointer;
    transform: scale(1.2);
  `;
  
  // Connect to voiceData
  repeatCheckbox.onchange = function(e) {
    voiceData[voiceIndex].parameters['LIFE SPAN'].repeat = e.target.checked;
    console.log(`✅ Voice ${voiceIndex + 1} Repeat = ${e.target.checked}`);
  };
  
  repeatContainer.appendChild(repeatLabel);
  repeatContainer.appendChild(repeatCheckbox);
  behaviorContainer.appendChild(repeatContainer);
  
  paramContentContainer.appendChild(behaviorContainer);
  row.appendChild(paramContentContainer);
  
  console.log(`✅ Created timeline row for Voice ${voiceIndex + 1}`);
  
  return row;
}

function connectTimelineSliders() {
  console.log('🔗 Connecting timeline sliders to voiceData...');
  
  const timelineSliders = document.querySelectorAll('.timeline-slider-wrapper');
  
  console.log(`   Found ${timelineSliders.length} timeline slider wrappers`);
  
  timelineSliders.forEach((wrapper, index) => {
    const voiceIndex = parseInt(wrapper.dataset.voiceIndex);
    const entranceNum = parseInt(wrapper.dataset.entranceNum);
    
    console.log(`   [${index + 1}/${timelineSliders.length}] Connecting Voice ${voiceIndex + 1}, Entrance ${entranceNum}`);
    
    const sliderDiv = wrapper.querySelector('.timeline-nouislider');
    
    if (!sliderDiv) {
      console.warn(`      ⚠️ Slider div not found`);
      return;
    }
    
    if (!sliderDiv.noUiSlider) {
      console.warn(`      ⚠️ noUiSlider instance not found`);
      return;
    }
    
    console.log(`      ✅ Slider instance found`);
    
    // Remove any existing handlers
    sliderDiv.noUiSlider.off('update');
    sliderDiv.noUiSlider.off('set');
    
    // Use 'set' event - ONLY fires on user interaction (not on slider creation)
    sliderDiv.noUiSlider.on('set', function(values) {
      console.log(`      🖱️ User edited Entrance ${entranceNum}`);
      
      const enterMs = parseFloat(values[0]);
      const exitMs = parseFloat(values[1]);
      
      console.log(`         Raw values: ${enterMs}ms - ${exitMs}ms`);
      
      // Convert milliseconds to beats
      const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
      const beatUnit = lifeSpan.beatUnit || 7;
      const tempo = getCurrentTempoForVoice(voiceIndex);
      
      const enterBeats = msToBeats(enterMs, beatUnit, tempo);
      const exitBeats = (exitMs >= 999999999) ? 999999 : msToBeats(exitMs, beatUnit, tempo);
      
      console.log(`         Converted: ${enterBeats} - ${exitBeats} beats`);
      
      // Clamp to voice's max beats
      const voiceMaxBeats = lifeSpan.maxTimeBeats || 600;
      
      const clampedEnterBeats = Math.min(enterBeats, voiceMaxBeats);
      const clampedExitBeats = (exitBeats >= 999999) ? exitBeats : Math.min(exitBeats, voiceMaxBeats);
      
      console.log(`         Clamped: ${clampedEnterBeats} - ${clampedExitBeats} beats (max: ${voiceMaxBeats})`);
      
      // Update PRIMARY storage (beats)
      lifeSpan[`lifeSpan${entranceNum}`].enterBeats = clampedEnterBeats;
      lifeSpan[`lifeSpan${entranceNum}`].exitBeats = clampedExitBeats;
      
      // Update LEGACY storage (ms)
      if (!lifeSpan[`lifeSpan${entranceNum}Legacy`]) {
        lifeSpan[`lifeSpan${entranceNum}Legacy`] = {};
      }
      
      lifeSpan[`lifeSpan${entranceNum}Legacy`].enter = beatsToMs(clampedEnterBeats, beatUnit, tempo);
      lifeSpan[`lifeSpan${entranceNum}Legacy`].exit = beatsToMs(clampedExitBeats, beatUnit, tempo);
      
      console.log(`✅ Stored Voice ${voiceIndex + 1}, Entrance ${entranceNum}: ${clampedEnterBeats}-${clampedExitBeats} beats`);
    });
    
    console.log(`      ✅ 'set' handler connected (fires on user edit only)`);
  });
  
  console.log(`✅ Connected ${timelineSliders.length} timeline sliders`);
}

// ===== END TIMELINE VIEW HELPER FUNCTIONS =====



// ===== TIMELINE VIEW FUNCTIONS =====

function showTimelineView() {
  console.log('🎬 Opening Timeline View...');
  console.log('   Current voice:', currentVoice + 1);
  console.log('   Enabled voices:', voiceData.filter(v => v.enabled).map((v, i) => i + 1));
  
  try {
    // 1. Mark timeline as active
    timelineViewActive = true;
    console.log('✅ Timeline marked as active');
    
    // 2. Hide parameter section
    const paramSection = document.getElementById('parameter-section');
    if (!paramSection) {
      console.error('❌ Parameter section not found');
      alert('Error: Could not find parameter section. Please refresh the page.');
      return;
    }
    paramSection.style.display = 'none';
    console.log('✅ Parameter section hidden');
    
    // 3. Create timeline view container
    const timelineContainer = document.createElement('div');
    timelineContainer.id = 'timeline-view-container';
    timelineContainer.className = 'timeline-view-container';
    timelineContainer.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      overflow-y: auto;
    `;
    console.log('✅ Timeline container created');
    
    // 4. Create header
    const header = document.createElement('div');
    header.className = 'timeline-view-header';
    header.style.cssText = `
      background: linear-gradient(to bottom, #f7f8f8, #c0def7);
      border-bottom: 2px solid #4a90e2;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'LIFE SPAN TIMELINE VIEW';
    title.style.cssText = 'margin: 0; font-size: 20px; color: #333;';
    
    const backButton = document.createElement('button');
    backButton.textContent = 'BACK TO VOICE CONTROLS';
    backButton.className = 'timeline-back-button';
    backButton.style.cssText = `
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    `;
    backButton.onclick = closeTimelineView;
    
    header.appendChild(title);
    header.appendChild(backButton);
    timelineContainer.appendChild(header);
    console.log('✅ Header created');
    
    // 5. Create master timeline bar
    try {
      const masterTimelineBar = document.createElement('div');
      masterTimelineBar.className = 'master-timeline-bar';
      masterTimelineBar.style.cssText = `
        background: linear-gradient(to bottom, #f7f8f8, #e9ecef);
        border-bottom: 2px solid #dee2e6;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10;
      `;
      
      console.log('✅ Master timeline bar div created');
      
      const maxTimeMs = calculateMasterTimelineLength();
      const maxTimeFormatted = formatMsToMMSS(maxTimeMs);
      
      console.log('✅ Max time calculated:', maxTimeFormatted, '(', maxTimeMs, 'ms)');
      
      const timelineInfo = document.createElement('div');
      timelineInfo.className = 'timeline-info';
      timelineInfo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
      `;
      
      const startLabel = document.createElement('span');
      startLabel.textContent = '0:00';
      startLabel.style.cssText = 'font-weight: 600; color: #495057; font-size: 14px;';
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'timeline-progress-container';
      progressContainer.style.cssText = `
        position: relative;
        flex: 1;
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: visible;
      `;
      
      const progressBar = document.createElement('div');
      progressBar.id = 'timeline-progress-bar';
      progressBar.className = 'timeline-progress-bar';
      progressBar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        background: #4a90e2;
        border-radius: 4px;
        transition: width 0.05s linear;
      `;
      
      const playhead = document.createElement('div');
      playhead.id = 'timeline-playhead';
      playhead.className = 'timeline-playhead';
      playhead.style.cssText = `
        position: absolute;
        top: -10px;
        left: 0%;
        width: 3px;
        height: calc(100% + 20px);
        background: #dc3545;
        transition: left 0.05s linear;
        pointer-events: none;
        z-index: 100;
      `;
      
      const playheadArrow = document.createElement('div');
      playheadArrow.style.cssText = `
        position: absolute;
        top: -18px;
        left: -7px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid #dc3545;
      `;
      playhead.appendChild(playheadArrow);
      
      const playheadTooltip = document.createElement('div');
      playheadTooltip.id = 'timeline-playhead-tooltip';
      playheadTooltip.className = 'timeline-playhead-tooltip';
      playheadTooltip.textContent = '0:00';
      playheadTooltip.style.cssText = `
        position: absolute;
        top: -1px;
        left: 8px;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        font-family: 'Courier New', monospace;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      `;
      playhead.appendChild(playheadTooltip);
      
      progressContainer.appendChild(progressBar);
      progressContainer.appendChild(playhead);
      
      console.log('✅ Progress container created');
      
      const endLabel = document.createElement('span');
      endLabel.id = 'timeline-max-time';
      endLabel.textContent = maxTimeFormatted;
      endLabel.style.cssText = 'font-weight: 600; color: #495057; font-size: 14px;';
      
      timelineInfo.appendChild(startLabel);
      timelineInfo.appendChild(progressContainer);
      timelineInfo.appendChild(endLabel);
      
      masterTimelineBar.appendChild(timelineInfo);
      timelineContainer.appendChild(masterTimelineBar);
      
      console.log('✅ Master timeline bar fully created and appended!');
      
    } catch (error) {
      console.error('❌ ERROR creating master timeline bar:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      throw error; // Re-throw to catch in outer try-catch
    }
    
    // 6. Create content area with voice rows
    const content = document.createElement('div');
    content.className = 'timeline-content';
    content.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    `;
    
    // Calculate master timeline length
    const maxTimeMs = calculateMasterTimelineLength();
    
    // Count enabled voices
    const enabledVoices = voiceData.filter(v => v.enabled);
    
    if (enabledVoices.length === 0) {
      const noVoices = document.createElement('div');
      noVoices.style.cssText = `
        text-align: center;
        padding: 40px;
        color: #dc3545;
        font-size: 16px;
      `;
      noVoices.innerHTML = `
        <p style="margin: 0 0 10px 0;">⚠️ No Enabled Voices</p>
        <p style="margin: 0; font-size: 14px;">Please enable at least one voice to use Timeline View.</p>
      `;
      content.appendChild(noVoices);
      console.log('⚠️ No enabled voices - showing warning message');
    } else {
      console.log(`📊 Generating timeline for ${enabledVoices.length} voices`);
      
      // Generate a row for each enabled voice
      for (let i = 0; i < 16; i++) {
        if (!voiceData[i].enabled) continue;
        
        console.log(`   Creating row for Voice ${i + 1}...`);
        try {
          const voiceRow = createTimelineVoiceRow(i, maxTimeMs);
          content.appendChild(voiceRow);
          console.log(`   ✅ Voice ${i + 1} row created`);
        } catch (rowError) {
          console.error(`   ❌ Error creating Voice ${i + 1} row:`, rowError);
        }
      }
      // DIAGNOSTIC: Check content area after all rows added
console.log(`📊 Content area has ${content.children.length} child elements`);
    }
    
    timelineContainer.appendChild(content);
    console.log('✅ Content area created and appended');
    
    // 7. Inject into main content
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('❌ Main content area not found');
      alert('Error: Could not find main content area. Please refresh the page.');
      return;
    }
    
    mainContent.appendChild(timelineContainer);
    console.log('✅ Timeline container injected into main-content');
    
    console.log('✅ Timeline View opened successfully');
    console.log('   Enabled voices:', voiceData.filter(v => v.enabled).map((v, i) => `Voice ${i + 1}`).join(', '));
    
    // 8. Connect all timeline sliders
    setTimeout(() => {
      console.log('🔗 About to connect timeline sliders...');
      console.log('   Timeline sliders in DOM:', document.querySelectorAll('.timeline-slider-wrapper').length);
      
      try {
        connectTimelineSliders();
        console.log('✅ Timeline sliders connected');
        
        // DEBUG: Verify they're actually connected
        setTimeout(() => {
          const wrappers = document.querySelectorAll('.timeline-slider-wrapper');
          console.log('🔍 Post-connection check:');
          wrappers.forEach((wrapper, idx) => {
            const slider = wrapper.querySelector('.timeline-nouislider');
            console.log(`   Slider ${idx + 1}: hasNoUiSlider=${!!(slider && slider.noUiSlider)}`);
          });
        }, 50);
        
      } catch (connectError) {
        console.error('❌ Error connecting timeline sliders:', connectError);
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in showTimelineView():', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Try to restore parameter section
    const paramSection = document.getElementById('parameter-section');
    if (paramSection) {
      paramSection.style.display = 'flex';
    }
    
    timelineViewActive = false;
    
    alert(`Error opening Timeline View: ${error.message}\n\nPlease check the console for details.`);
  }
}

function closeTimelineView() {
  console.log('🔙 Closing Timeline View...');

  // DEBUG: Check data before closing
  debugLifeSpanData(currentVoice, 'Before closing Timeline View');
  
  // DEBUG: Log current Life Span data BEFORE closing
  console.log('📊 Life Span data before closing Timeline View:');
  for (let i = 0; i < 16; i++) {
    if (!voiceData[i].enabled) continue;
    
    const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
    if (lifeSpan) {
      console.log(`   Voice ${i + 1}:`);
      for (let j = 1; j <= 3; j++) {
        const span = lifeSpan[`lifeSpan${j}`];
        if (span) {
          console.log(`      Entrance ${j}: ${span.enterBeats}-${span.exitBeats} beats`);
        }
      }
    }
  }
  
  // 1. Mark timeline as inactive
  timelineViewActive = false;
  
  // 2. Remove timeline container
  const timeline = document.getElementById('timeline-view-container');
  if (timeline) {
    timeline.remove();
    console.log('✅ Timeline container removed');
  }
  
  // 3. Restore parameter section
  const paramSection = document.getElementById('parameter-section');
  if (paramSection) {
    paramSection.style.display = 'flex';
    console.log('✅ Parameter section restored');
  }
  
  // 4. Refresh parameter view to show updated values
  setTimeout(() => {
    console.log('🔄 Refreshing parameter view for Voice', currentVoice + 1);
    
    // DEBUG: Log data right before render
    const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
    if (lifeSpan) {
      console.log('   Life Span data at render time:');
      for (let j = 1; j <= 3; j++) {
        const span = lifeSpan[`lifeSpan${j}`];
        if (span) {
          console.log(`      Entrance ${j}: ${span.enterBeats}-${span.exitBeats} beats`);
        }
      }
    }
    
    renderParameters();
    
    setTimeout(() => {
      connectAllSliders();
      console.log('✅ Parameter view refreshed and reconnected');
    }, 100);
  }, 100);
}

function calculateMasterTimelineLength() {
  let maxTimeMs = 0;
  
  console.log('📏 Calculating master timeline length...');
  
  for (let i = 0; i < 16; i++) {
    if (!voiceData[i].enabled) continue;
    
    const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
    if (!lifeSpan) continue;
    
    // Convert voice's max BEATS to milliseconds
    const maxBeats = lifeSpan.maxTimeBeats || 600;
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = getCurrentTempoForVoice(i);
    
    const voiceMaxMs = beatsToMs(maxBeats, beatUnit, tempo);
    
    console.log(`   Voice ${i + 1}: ${maxBeats} beats = ${formatMsToMMSS(voiceMaxMs)} @ ${tempo} BPM`);
    
    if (voiceMaxMs > maxTimeMs) {
      maxTimeMs = voiceMaxMs;
    }
  }
  
  // Fallback to 5 minutes if nothing set
  const finalTimeMs = maxTimeMs > 0 ? maxTimeMs : 300000;
  console.log(`📏 Master timeline length: ${formatMsToMMSS(finalTimeMs)} (${finalTimeMs}ms)`);
  return finalTimeMs;
}
// ===== ADVANCED TIMELINE VIEW FUNCTIONS =====

function createTimelineEntranceSlider(voiceIndex, entranceNum, maxTimeMs, beatUnit) {
  const container = document.createElement('div');
  container.className = 'timeline-entrance-slider';
  container.style.cssText = `
    margin-bottom: 8px;
    width: 100%;
  `;
  
  console.log(`      Creating slider for Entrance ${entranceNum}...`);
  
  const label = document.createElement('div');
  label.className = 'timeline-entrance-label';
  label.textContent = `Entrance & Exit ${entranceNum}`;
  label.style.cssText = `
    font-size: 13px;
    color: #666;
    margin-bottom: 5px;
    font-weight: 600;
  `;
  container.appendChild(label);
  
  const sliderWrapper = document.createElement('div');
  sliderWrapper.className = 'timeline-slider-wrapper';
  sliderWrapper.dataset.voiceIndex = voiceIndex;
  sliderWrapper.dataset.entranceNum = entranceNum;
  sliderWrapper.style.cssText = `
    width: 100%;
    height: 40px;
    position: relative;
    box-sizing: border-box;
  `;
  
  const sliderDiv = document.createElement('div');
  sliderDiv.className = 'timeline-nouislider';
  sliderDiv.style.cssText = `
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  `;
  sliderWrapper.appendChild(sliderDiv);
  container.appendChild(sliderWrapper);
  
  console.log(`      Slider div created and appended`);
  
  // Get Life Span data (BEAT-BASED)
  const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpan) {
    console.error(`❌ Voice ${voiceIndex + 1}: No LIFE SPAN parameter!`);
    return container;
  }
  
  const spanData = lifeSpan[`lifeSpan${entranceNum}`];
  
if (!spanData) {
  console.error(`❌ Voice ${voiceIndex + 1}: No lifeSpan${entranceNum} data!`);
  
  // CREATE MISSING DATA
  console.log(`   🔧 Creating missing lifeSpan${entranceNum} data...`);
  lifeSpan[`lifeSpan${entranceNum}`] = {
    enterBeats: 0,
    exitBeats: entranceNum === 1 ? 999999 : 0 // First entrance defaults to infinity
  };
  spanData = lifeSpan[`lifeSpan${entranceNum}`];
  console.log(`   ✅ Created with defaults: ${spanData.enterBeats}-${spanData.exitBeats} beats`);
}
  
  const enterBeats = spanData.enterBeats || 0;
  const exitBeats = spanData.exitBeats || 0;
  
  console.log(`      Entrance ${entranceNum} data: ${enterBeats}-${exitBeats} beats`);
  
  // Convert to milliseconds for timeline display
  const tempo = getCurrentTempoForVoice(voiceIndex);
  const enterMs = beatsToMs(enterBeats, beatUnit, tempo);
  const exitMs = (exitBeats >= 999999) ? maxTimeMs : beatsToMs(exitBeats, beatUnit, tempo);
  
  console.log(`      Converting to timeline: ${formatMsToMMSS(enterMs)} - ${formatMsToMMSS(exitMs)}`);
  
  // Calculate step size (1 beat in ms)
  const beatStepMs = beatsToMs(1, beatUnit, tempo);
  
  // Create formatter
  const formatter = {
    to: function(timeMs) {
      // Convert timeline position (ms) to beats for tooltip
      const beats = Math.round(msToBeats(timeMs, beatUnit, tempo));
      const timeStr = formatMsToMMSS(timeMs);
      return `${beats} beats (${timeStr})`;
    },
    from: function(value) {
      // Parse "80 beats (1:20)" format
      const beatsMatch = value.match(/^(\d+) beats/);
      if (beatsMatch) {
        const beats = parseInt(beatsMatch[1]);
        return beatsToMs(beats, beatUnit, tempo);
      }
      
      // Fallback: parse as ms
      return parseFloat(value) || 0;
    }
  };
  
  console.log(`      Creating noUiSlider with range: 0-${maxTimeMs}ms, step: ${beatStepMs}ms`);
  
  try {
    noUiSlider.create(sliderDiv, {
      start: [enterMs, Math.min(exitMs, maxTimeMs)],
      connect: true,
      range: { min: 0, max: maxTimeMs },
      // NO STEP - allow free positioning, quantize on user release
      tooltips: [true, true],
      format: formatter
    });
    
    console.log(`      ✅ noUiSlider created successfully`);
    
    // Force timeline sliders to full width
    setTimeout(() => {
      sliderDiv.style.setProperty('width', '100%', 'important');
      sliderDiv.style.setProperty('min-width', '0', 'important');
      sliderDiv.style.setProperty('max-width', '100%', 'important');
      
      const base = sliderDiv.querySelector('.noUi-base');
      if (base) {
        base.style.setProperty('width', '100%', 'important');
      }
      
      const connects = sliderDiv.querySelector('.noUi-connects');
      if (connects) {
        connects.style.setProperty('width', '100%', 'important');
      }
      
      console.log(`      ✅ Slider width forced to 100%`);
    }, 0);
    
    // Add visual boundary line at voice's max time (if less than master max)
    const voiceMaxBeats = lifeSpan.maxTimeBeats || 600;
    const voiceMaxTimeMs = beatsToMs(voiceMaxBeats, beatUnit, tempo);
    
    if (voiceMaxTimeMs < maxTimeMs) {
      const boundaryPercentage = (voiceMaxTimeMs / maxTimeMs) * 100;
      
      const boundaryLine = document.createElement('div');
      boundaryLine.className = 'voice-max-boundary';
      boundaryLine.style.cssText = `
        position: absolute;
        top: 0;
        bottom: 0;
        left: ${boundaryPercentage}%;
        width: 2px;
        background: #dc3545;
        z-index: 50;
        pointer-events: none;
      `;
      
      const boundaryLabel = document.createElement('div');
      boundaryLabel.style.cssText = `
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #dc3545;
        font-weight: 600;
        white-space: nowrap;
        background: white;
        padding: 2px 4px;
        border-radius: 2px;
      `;
      boundaryLabel.textContent = `Max: ${voiceMaxTimeFormatted}`;
      
      boundaryLine.appendChild(boundaryLabel);
      sliderWrapper.appendChild(boundaryLine);
      
      console.log(`      🚧 Boundary at ${voiceMaxTimeFormatted} (${boundaryPercentage.toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error(`      ❌ Error creating slider:`, error);
    console.error(`         Error message:`, error.message);
    console.error(`         Error stack:`, error.stack);
    
    // Add error message to container
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
      padding: 10px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      color: #856404;
      font-size: 12px;
    `;
    errorMsg.textContent = `Error creating slider: ${error.message}`;
    container.appendChild(errorMsg);
  }
  
  return container;
}

function connectTimelineSliders() {
  console.log('🔗 Connecting timeline sliders to voiceData...');
  
  const timelineSliders = document.querySelectorAll('.timeline-slider-wrapper');
  
  console.log(`   Found ${timelineSliders.length} timeline slider wrappers`);
  
  timelineSliders.forEach((wrapper, index) => {
    const voiceIndex = parseInt(wrapper.dataset.voiceIndex);
    const entranceNum = parseInt(wrapper.dataset.entranceNum);
    
    console.log(`   [${index + 1}/${timelineSliders.length}] Connecting Voice ${voiceIndex + 1}, Entrance ${entranceNum}`);
    
    const sliderDiv = wrapper.querySelector('.timeline-nouislider');
    
    if (!sliderDiv) {
      console.warn(`      ⚠️ Slider div not found`);
      return;
    }
    
    if (!sliderDiv.noUiSlider) {
      console.warn(`      ⚠️ noUiSlider instance not found`);
      return;
    }
    
    console.log(`      ✅ Slider instance found`);
    
    // Remove any existing handlers
    sliderDiv.noUiSlider.off('update');
    sliderDiv.noUiSlider.off('set');
    
    // Use 'set' event - ONLY fires when user releases slider handle
    // This prevents initial slider position from overwriting stored data
    sliderDiv.noUiSlider.on('set', function(values) {
      console.log(`      🖱️ User SET Entrance ${entranceNum} slider`);
      
      let enterMs = parseFloat(values[0]);
      let exitMs = parseFloat(values[1]);
      
      console.log(`         Raw ms values: ${enterMs} - ${exitMs}`);
      
      // Get voice parameters
      const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
      const beatUnit = lifeSpan.beatUnit || 7;
      const tempo = getCurrentTempoForVoice(voiceIndex);
      
      // Quantize to beat boundaries
      const beatStepMs = beatsToMs(1, beatUnit, tempo);
      enterMs = Math.round(enterMs / beatStepMs) * beatStepMs;
      
      if (exitMs < 999999999) {
        exitMs = Math.round(exitMs / beatStepMs) * beatStepMs;
      }
      
      console.log(`         Quantized ms: ${enterMs} - ${exitMs} (step: ${beatStepMs}ms)`);
      
      // Convert milliseconds to beats
      const enterBeats = msToBeats(enterMs, beatUnit, tempo);
      const exitBeats = (exitMs >= 999999999) ? 999999 : msToBeats(exitMs, beatUnit, tempo);
      
      console.log(`         Converted to beats: ${enterBeats} - ${exitBeats}`);
      
      // Clamp to voice's max beats
      const voiceMaxBeats = lifeSpan.maxTimeBeats || 600;
      
      const clampedEnterBeats = Math.min(enterBeats, voiceMaxBeats);
      const clampedExitBeats = (exitBeats >= 999999) ? exitBeats : Math.min(exitBeats, voiceMaxBeats);
      
      if (clampedEnterBeats !== enterBeats || clampedExitBeats !== exitBeats) {
        console.log(`         Clamped to: ${clampedEnterBeats} - ${clampedExitBeats} (max: ${voiceMaxBeats})`);
      }
      
      // Update PRIMARY storage (beats)
      lifeSpan[`lifeSpan${entranceNum}`].enterBeats = clampedEnterBeats;
      lifeSpan[`lifeSpan${entranceNum}`].exitBeats = clampedExitBeats;
      
      // Update LEGACY storage (ms)
      if (!lifeSpan[`lifeSpan${entranceNum}Legacy`]) {
        lifeSpan[`lifeSpan${entranceNum}Legacy`] = {};
      }
      
      lifeSpan[`lifeSpan${entranceNum}Legacy`].enter = beatsToMs(clampedEnterBeats, beatUnit, tempo);
      lifeSpan[`lifeSpan${entranceNum}Legacy`].exit = beatsToMs(clampedExitBeats, beatUnit, tempo);
      
      console.log(`✅ STORED Voice ${voiceIndex + 1}, Entrance ${entranceNum}: ${clampedEnterBeats}-${clampedExitBeats} beats`);
      
      // Update the slider to show quantized position (if it changed)
      const quantizedEnterMs = beatsToMs(clampedEnterBeats, beatUnit, tempo);
      const quantizedExitMs = beatsToMs(clampedExitBeats, beatUnit, tempo);
      
      if (Math.abs(quantizedEnterMs - enterMs) > 1 || Math.abs(quantizedExitMs - exitMs) > 1) {
        sliderDiv.noUiSlider.set([quantizedEnterMs, quantizedExitMs]);
        console.log(`         Slider updated to show quantized position`);
      }
    });
    
    console.log(`      ✅ 'set' handler connected (fires on user release only)`);
  });
  
  console.log(`✅ Connected ${timelineSliders.length} timeline sliders`);
}

function updateTimelinePlayhead() {
  // Check 1: Is timeline active?
  if (!timelineViewActive) {
    console.log('❌ Timeline not active');
    return;
  }
  
  // Check 2: Is master clock running?
  if (!masterClock || !masterClock.isActive()) {
    console.log('❌ Master clock not active');
    return;
  }
  
  const elapsedMs = masterClock.getElapsedTime();
  const maxTimeMs = calculateMasterTimelineLength();
  
  // Debug log (5% of calls)
  if (Math.random() < 0.05) {
    console.log('⏱️ Playhead update:', formatMsToMMSS(elapsedMs));
    console.log('   Raw elapsedMs:', elapsedMs);
    console.log('   masterStartTime:', masterClock.masterStartTime);
    console.log('   currentTime:', masterClock.currentTime);
    console.log('   isActive:', masterClock.isActive());
  }

  
  // Calculate percentage position
  let percentage = (elapsedMs / maxTimeMs) * 100;
  
  // Handle repeat/cycling (wrap around if past 100%)
  if (percentage > 100) {
    percentage = percentage % 100;
  }
  
  // Update progress bar
  const progressBar = document.getElementById('timeline-progress-bar');
  if (progressBar) {
    progressBar.style.width = Math.min(percentage, 100) + '%';
  } else {
    console.warn('⚠️ Progress bar element not found');
  }
  
  // Update playhead position
  const playhead = document.getElementById('timeline-playhead');
  if (playhead) {
    playhead.style.left = Math.min(percentage, 100) + '%';
  } else {
    console.warn('⚠️ Playhead element not found');
  }
  
  // Update playhead tooltip
  const tooltip = document.getElementById('timeline-playhead-tooltip');
  if (tooltip) {
    tooltip.textContent = formatMsToMMSS(elapsedMs);
  } else {
    console.warn('⚠️ Tooltip element not found');
  }
}
// ===== END TIMELINE VIEW FUNCTIONS =====


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
    // Capture current visual timeline state before switching
    if (viewStateManager && visualTimeline && visualTimeline.isVisible) {
      const currentState = viewStateManager.states.parameter;
      currentState.visualTimelineState = {
        zoomLevel: visualTimeline.zoomLevel,
        panOffset: visualTimeline.panOffset,
        showBeatIndicator: visualTimeline.showBeatIndicator
      };
    }
    
    currentVoice = voiceIndex;
    updateVoiceTabs();
    renderParameters();
    
    // NEW: Update visual timeline for new voice with preserved state
    updateVisualTimelineForVoiceChange(voiceIndex);
    
    setTimeout(() => {
      connectAllSliders();
      
      // Restore visual timeline state for new voice
      if (viewStateManager && visualTimeline && visualTimeline.isVisible) {
        const savedState = viewStateManager.states.parameter.visualTimelineState;
        if (savedState) {
          visualTimeline.zoomLevel = savedState.zoomLevel;
          visualTimeline.panOffset = savedState.panOffset;
          visualTimeline.showBeatIndicator = savedState.showBeatIndicator;
          
          if (visualTimeline.applyZoomAndPan) {
            visualTimeline.applyZoomAndPan();
          }
          if (visualTimeline.updateZoomControls) {
            visualTimeline.updateZoomControls();
          }
        }
      }
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

  // NEW: Capture state before checkbox change
  if (undoManager && undoManager.isCapturing && voiceIndex === currentVoice) {
    const rhythmName = (paramName === 'RHYTHMS' ? rhythmOptions : restOptions)[index];
    undoManager.captureState(`${paramName}: ${isChecked ? 'checked' : 'unchecked'} ${rhythmName}`, true);
  }

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

// ===== PHRASE STYLES CONTROL CREATION =====

function createPhraseStylesControl(param, voiceIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'phrase-styles-container';
  
  const stylesBox = document.createElement('div');
  stylesBox.className = 'phrase-styles-box';
  
  // Header row with "PHRASE STYLES" label and "Breathe" control
  const headerRow = createPhraseStylesHeader(voiceIndex);
  stylesBox.appendChild(headerRow);
  
  // Pattern rows (2 rows x 3 columns)
  const patternsGrid = createPatternsGrid(voiceIndex);
  stylesBox.appendChild(patternsGrid);
  
  wrapper.appendChild(stylesBox);
  return wrapper;
}

function createPhraseStylesHeader(voiceIndex) {
  const header = document.createElement('div');
  header.className = 'phrase-styles-header';
  
  // "PHRASE STYLES" label
  const label = document.createElement('div');
  label.className = 'phrase-styles-label';
  label.textContent = 'PHRASE STYLES';
  
  // Breathe checkbox
  const breatheCheckbox = document.createElement('input');
  breatheCheckbox.type = 'checkbox';
  breatheCheckbox.className = 'breathe-checkbox';
  breatheCheckbox.id = `breathe-checkbox-${voiceIndex}`;
  breatheCheckbox.checked = voiceData[voiceIndex].parameters['PHRASE STYLES'].breathe.enabled;
  
  // Breathe label
  const breatheLabel = document.createElement('label');
  breatheLabel.htmlFor = `breathe-checkbox-${voiceIndex}`;
  breatheLabel.textContent = 'Breathe Between Phrases';
  breatheLabel.style.cursor = 'pointer';
  
  // Breathe length slider container
  const breatheSlider = createLengthSlider(
    voiceData[voiceIndex].parameters['PHRASE STYLES'].breathe.length,
    'breathe-length-slider',
    voiceIndex,
    'breathe'
  );
  
  header.appendChild(label);
  header.appendChild(breatheCheckbox);
  header.appendChild(breatheLabel);
  header.appendChild(breatheSlider);
  
  return header;
}

function createPatternsGrid(voiceIndex) {
  const grid = document.createElement('div');
  grid.className = 'patterns-grid';
  
  const patterns = [
    { name: 'random', display: 'Random' },
    { name: 'pendulum', display: 'Pendulum' },
    { name: 'ascending', display: 'Ascending' },
    { name: 'wave', display: 'Wave' },
    { name: 'descending', display: 'Descending' },
    { name: 'spiral', display: 'Spiral' }
  ];

  
  patterns.forEach(pattern => {
    const patternRow = createPatternRow(pattern, voiceIndex);
    grid.appendChild(patternRow);
  });
  
  return grid;
}

function createPatternRow(pattern, voiceIndex) {
  const row = document.createElement('div');
  row.className = 'pattern-row';
  
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'pattern-checkbox';
  checkbox.id = `pattern-${pattern.name}-${voiceIndex}`;
  checkbox.dataset.pattern = pattern.name;
  checkbox.checked = voiceData[voiceIndex].parameters['PHRASE STYLES'].patterns[pattern.name].enabled;
  
  // Label
  const label = document.createElement('label');
  label.htmlFor = `pattern-${pattern.name}-${voiceIndex}`;
  label.textContent = pattern.display;
  label.style.cursor = 'pointer';
  
  // Length slider
  const lengthSlider = createLengthSlider(
    voiceData[voiceIndex].parameters['PHRASE STYLES'].patterns[pattern.name].length,
    'pattern-length-slider',
    voiceIndex,
    pattern.name
  );
  lengthSlider.dataset.pattern = pattern.name;
  
  row.appendChild(checkbox);
  row.appendChild(label);
  row.appendChild(lengthSlider);
  
  return row;
}

function createLengthSlider(initialValue, className, voiceIndex, patternName) {
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'length-slider-container';
  
  const lengthLabel = document.createElement('span');
  lengthLabel.textContent = 'Length';
  lengthLabel.className = 'length-label';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 1;
  slider.max = 24;
  slider.value = initialValue;
  slider.className = className;
  slider.dataset.voiceIndex = voiceIndex;
  slider.dataset.pattern = patternName;
  
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'length-value-display';
  valueDisplay.textContent = initialValue;
  
  sliderContainer.appendChild(lengthLabel);
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(valueDisplay);
  
  return sliderContainer;
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
      <button id="undo-btn" class="control-btn" onclick="performUndo()" title="Undo last change (Ctrl+Z)" disabled style="opacity: 0.5;">⮪ UNDO</button>
      <button id="redo-btn" class="control-btn" onclick="performRedo()" title="Redo last undo (Ctrl+Y)" disabled style="opacity: 0.5;">⮫ REDO</button>
      <button class="control-btn" onclick="previewVoice(${currentVoice})">PREVIEW</button>
      <button class="control-btn sync-btn" onclick="syncVoiceToOthers(${currentVoice})" title="Copy this voice's tempo to all other voices">SYNC</button>
      <button class="control-btn" onclick="toggleLockVoice(${currentVoice})">${voiceData[currentVoice].locked ? 'UNLOCK' : 'LOCK'}</button>
    </div>
  `;
  parameterSection.appendChild(voiceControls);
  
  // NEW: Update undo/redo button states immediately after creating them
  setTimeout(() => {
    updateUndoRedoButtons();
  }, 50);

  
  // NEW: Render LIFE SPAN first, then other parameters
  const lifeSpanParam = parameterDefinitions.find(param => param.name === 'LIFE SPAN');
  const otherParams = parameterDefinitions.filter(param => param.name !== 'LIFE SPAN');
  
  if (lifeSpanParam) {
    const lifeSpanRollup = createParameterRollup(lifeSpanParam, currentVoice);
    parameterSection.appendChild(lifeSpanRollup);
    console.log('📊 LIFE SPAN rollup positioned at top');
  }
  
  otherParams.forEach(param => {
    const parameterRollup = createParameterRollup(param, currentVoice);
    parameterSection.appendChild(parameterRollup);
  });
  
  // NEW: Auto-show Visual Timeline for current voice
  setTimeout(() => {
    showVisualTimeline();
  }, 50);

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
    // ===== STOP PLAYBACK =====
    
    if (voiceClockManager) {
      voiceClockManager.stopAllVoices();
    }
    
    if (masterClock) {
      masterClock.stop();
    }
    
    if (audioManager) {
      audioManager.isPlaying = false;
      if (audioManager.audioHealthMonitor) {
        audioManager.audioHealthMonitor.stopMonitoring();
      }
    }

    playButton.textContent = 'PLAY';
    playButton.style.backgroundColor = '';
    playButton.style.color = '';
    
    console.log('⏹️ Playback stopped');
    
  } else {
    // ===== START PLAYBACK =====
    
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
    
    // Set audio manager playing state
    if (audioManager) {
      audioManager.isPlaying = true;
      console.log(`🔊 AudioManager.isPlaying set to: ${audioManager.isPlaying}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    voiceClockManager.startAllVoices();
    
    // Start audio health monitoring
    if (audioManager && audioManager.audioHealthMonitor) {
      audioManager.audioHealthMonitor.startMonitoring();
    }
    
    playButton.textContent = 'STOP';
    playButton.style.backgroundColor = '#dc3545';
    playButton.style.color = 'white';
    
    console.log('▶️ Playback started');
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
  
    /**
   * Check and apply registry events at current beat
   * NEW METHOD: Integrates EventRegistry with voice playback
   */
  checkRegistryEvents() {
    if (!eventRegistry) return;
    
    const elapsedMs = this.masterClock.getElapsedTime();
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    
    if (!lifeSpan) return;
    
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = this.currentTempo || getCurrentTempoForVoice(this.voiceIndex);
    const currentBeat = Math.round(msToBeats(elapsedMs, beatUnit, tempo));
    
    // Get events at current beat for this voice
    const eventsAtBeat = eventRegistry.getEventsByBeat(currentBeat);
    const voiceEventsAtBeat = eventsAtBeat.filter(event => event.voiceIndex === this.voiceIndex);
    
    if (voiceEventsAtBeat.length > 0) {
      if (DEBUG.VOICE_CLOCK) {
        console.log(`🎯 Voice ${this.voiceIndex + 1}: Found ${voiceEventsAtBeat.length} registry events at beat ${currentBeat}`);
      }
      
      // Apply events using EventProcessor
      voiceEventsAtBeat.forEach(event => {
        EventProcessor.applyEventToVoice(event);
      });
    }
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
    
    // NEW: Add filter controls
    const filterControls = this.createFilterControls();
    this.container.appendChild(filterControls);
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
  
  handleMouseUp = (e) => {
  // This is for PIANO KEYBOARD, not timeline!
  // Clean up global listeners
  document.removeEventListener('mousemove', this.handleMouseMove);
  document.removeEventListener('mouseup', this.handleMouseUp);
  
  // Reset drag state for next interaction
  this.isDragging = false;
  this.dragStartNote = null;
  this.dragMode = null;
  
  if (DEBUG.EVENTS) {
    console.log(`🎹 Piano keyboard mouse up - drag state reset`);
  }
}


  
  toggleNote(midiNote) {
    // NEW: Capture state before piano keyboard change
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      const noteName = midiNoteNames[midiNote] || `MIDI${midiNote}`;
      const action = this.selectedNotes.has(midiNote) ? 'deselected' : 'selected';
      undoManager.captureState(`Piano: ${action} ${noteName}`, true);
    }
    
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
  
  // NEW: Reset timeline to full-width playing
  resetToFullPlaying() {
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    if (!lifeSpan) return;
    
    // NEW: Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Timeline: Reset to full playing`, true);
    }
    
    // Reset events to default (play from 0 to maxBeats)
    const maxBeats = lifeSpan.maxTimeBeats || 700;
    
    lifeSpan.events = [
      {
        type: 'mute',
        beatPosition: 0,
        action: 'unmute',
        id: 'default-start'
      },
      {
        type: 'mute',
        beatPosition: maxBeats,
        action: 'mute',
        id: 'default-end'
      }
    ];
    
    lifeSpan.nextEventId = 1; // Reset event counter
    
    if (DEBUG.EVENTS) {
      console.log(`🔄 Reset Voice ${this.voiceIndex + 1} to full playing (0-${maxBeats} beats)`);
      console.log(`   Events:`, lifeSpan.events);
    }
    
    // Refresh timeline
    this.refresh();
    
    // Show visual feedback
    const refreshBtn = this.container.querySelector('.timeline-control-btn');
    if (refreshBtn) {
      const originalText = refreshBtn.textContent;
      refreshBtn.textContent = '✅ Reset';
      refreshBtn.style.background = '#28a745';
      
      setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.style.background = '';
      }, 1500);
    }
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

    createFilterControls() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'melodic-filter-controls';
    filterContainer.style.cssText = `
      margin-top: 12px;
      padding: 12px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    `;
    
    // Filter row with three dropdowns
    const filterRow = document.createElement('div');
    filterRow.className = 'filter-row';
    filterRow.style.cssText = `
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    `;
    
    // Root Note dropdown
    const rootGroup = document.createElement('div');
    rootGroup.className = 'filter-group';
    rootGroup.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 4px;';
    
    const rootLabel = document.createElement('label');
    rootLabel.textContent = 'Root Note:';
    rootLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: #495057;';
    
    const rootSelect = document.createElement('select');
    rootSelect.className = 'root-note-select';
    rootSelect.style.cssText = `
      padding: 6px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    `;
    
    // Add "None Selected" as first option
    const noneOption = document.createElement('option');
    noneOption.value = '-1';
    noneOption.textContent = 'None Selected';
    rootSelect.appendChild(noneOption);
    
    noteNames.forEach((name, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = name;
      rootSelect.appendChild(option);
    });
    
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    rootSelect.value = melodicParam.filterSettings?.rootNote ?? -1; // Default to -1 (None)

    
    rootGroup.appendChild(rootLabel);
    rootGroup.appendChild(rootSelect);
    
    // Scale dropdown
    const scaleGroup = document.createElement('div');
    scaleGroup.className = 'filter-group';
    scaleGroup.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 4px;';
    
    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Scale:';
    scaleLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: #495057;';
    
    const scaleSelect = document.createElement('select');
    scaleSelect.className = 'scale-select';
    scaleSelect.style.cssText = `
      padding: 6px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    `;
    
    Object.keys(scaleDefinitions).forEach(scaleName => {
      const option = document.createElement('option');
      option.value = scaleName;
      option.textContent = scaleName;
      scaleSelect.appendChild(option);
    });
    
    scaleSelect.value = melodicParam.filterSettings?.scale || 'None';
    
    scaleGroup.appendChild(scaleLabel);
    scaleGroup.appendChild(scaleSelect);
    
    // Chord dropdown
    const chordGroup = document.createElement('div');
    chordGroup.className = 'filter-group';
    chordGroup.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 4px;';
    
    const chordLabel = document.createElement('label');
    chordLabel.textContent = 'Chord:';
    chordLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: #495057;';
    
    const chordSelect = document.createElement('select');
    chordSelect.className = 'chord-select';
    chordSelect.style.cssText = `
      padding: 6px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 12px;
      background: white;
    `;
    
    Object.keys(chordQualityNames).forEach(chordKey => {
      const option = document.createElement('option');
      option.value = chordKey;
      option.textContent = chordQualityNames[chordKey];
      chordSelect.appendChild(option);
    });
    
    chordSelect.value = melodicParam.filterSettings?.chord || 'none';
    
    chordGroup.appendChild(chordLabel);
    chordGroup.appendChild(chordSelect);
    
    filterRow.appendChild(rootGroup);
    filterRow.appendChild(scaleGroup);
    filterRow.appendChild(chordGroup);
    filterContainer.appendChild(filterRow);
    
    // Filter result display
    const resultDiv = document.createElement('div');
    resultDiv.className = 'filter-result';
    resultDiv.style.cssText = `
      font-size: 11px;
      color: #6c757d;
      text-align: center;
      font-style: italic;
      padding: 6px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 3px;
    `;
    resultDiv.textContent = 'Select scale/chord to filter notes';
    filterContainer.appendChild(resultDiv);
    
    // Connect event handlers (pass event for mutual exclusivity detection)
    rootSelect.onchange = (e) => this.applyFilters(e);
    scaleSelect.onchange = (e) => this.applyFilters(e);
    chordSelect.onchange = (e) => this.applyFilters(e);
    
    return filterContainer;
  }


  applyFilters(event = null) {
    const rootSelect = this.container.querySelector('.root-note-select');
    const scaleSelect = this.container.querySelector('.scale-select');
    const chordSelect = this.container.querySelector('.chord-select');
    const resultDiv = this.container.querySelector('.filter-result');
    
    if (!rootSelect || !scaleSelect || !chordSelect) return;
    
    const rootNote = parseInt(rootSelect.value);
    const scaleName = scaleSelect.value;
    const chordName = chordSelect.value;
    
    // NEW: Capture state before filter change
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
      const oldSettings = melodicParam.filterSettings || {};
      
      // Only capture if something actually changed
      if (oldSettings.rootNote !== rootNote || oldSettings.scale !== scaleName || oldSettings.chord !== chordName) {
        let actionDesc = 'Filter: ';
        if (rootNote !== -1) actionDesc += noteNames[rootNote] + ' ';
        if (scaleName !== 'None') actionDesc += scaleName;
        if (chordName !== 'none') actionDesc += chordQualityNames[chordName];
        
        undoManager.captureState(actionDesc.trim(), true);
      }
    }
    
    // Check if root is selected when scale/chord is active
    if (rootNote === -1 && (scaleName !== 'None' || chordName !== 'none')) {
      resultDiv.textContent = '⚠️ Please select a Root Note first';
      resultDiv.style.color = '#dc3545';
      
      // Reset scale and chord to None
      scaleSelect.value = 'None';
      chordSelect.value = 'none';
      
      console.log('⚠️ Root Note required for scale/chord filtering');
      return;
    }




    // NEW: Mutual exclusivity - if scale selected, clear chord (and vice versa)
    if (scaleName !== 'None' && chordName !== 'none') {
      // Determine which was just changed by checking event target
      const changedElement = event?.target;
      
      if (changedElement === scaleSelect) {
        // Scale was just changed - clear chord
        chordSelect.value = 'none';
        console.log(`🎵 Scale selected (${scaleName}) - clearing chord`);
      } else if (changedElement === chordSelect) {
        // Chord was just changed - clear scale
        scaleSelect.value = 'None';
        console.log(`🎵 Chord selected (${chordName}) - clearing scale`);
      }
    }
    
    // Re-read values after potential reset
    const finalScale = scaleSelect.value;
    const finalChord = chordSelect.value;
    
    // Save filter settings
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    melodicParam.filterSettings = {
      rootNote: rootNote,
      scale: finalScale,
      chord: finalChord
    };

    
    // Get current selection range
    if (this.selectedNotes.size === 0) {
      resultDiv.textContent = 'Select notes on keyboard first';
      return;
    }
    
    const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
    const minNote = selectedArray[0];
    const maxNote = selectedArray[selectedArray.length - 1];

    // Apply filtering with final values
    const filteredNotes = this.filterNotesToScaleAndChord(minNote, maxNote, rootNote, finalScale, finalChord);

    // Update selection
    this.selectedNotes.clear();
    filteredNotes.forEach(note => this.selectedNotes.add(note));
    
    // Update visual and data
    this.updateVisualSelection();
    this.updateVoiceData();
    
    // Update result display
    if (filteredNotes.length === 0) {
      resultDiv.textContent = '⚠️ No notes match this scale/chord in selected range';
      resultDiv.style.color = '#dc3545';
    } else {
      const noteNamesList = filteredNotes.slice(0, 8).map(n => midiNoteNames[n]).join(', ');
      const suffix = filteredNotes.length > 8 ? `, ...+${filteredNotes.length - 8} more` : '';
      resultDiv.textContent = `Filtered: ${filteredNotes.length} notes (${noteNamesList}${suffix})`;
      resultDiv.style.color = '#6c757d';
    }
  }
  
  filterNotesToScaleAndChord(minNote, maxNote, rootNote, scaleName, chordName) {
    // If no filtering selected, return ACTUAL selected notes (not filled range)
    if (scaleName === 'None' && chordName === 'none') {
      // Return the notes user actually clicked, don't fill the range
      return Array.from(this.selectedNotes).sort((a, b) => a - b);
    }

    
    const filteredNotes = [];
    
    // Get scale intervals
    const scaleIntervals = scaleDefinitions[scaleName];
    
    // Get chord intervals and normalize to single octave
    let normalizedChordIntervals = null;
    if (chordName !== 'none' && chordQualities[chordName]) {
      normalizedChordIntervals = chordQualities[chordName].map(interval => interval % 12);
    }
    
    // Iterate through range
    for (let midi = minNote; midi <= maxNote; midi++) {
      const noteInOctave = midi % 12;
      const rootInOctave = rootNote % 12;
      const intervalFromRoot = (noteInOctave - rootInOctave + 12) % 12;
      
      // Check scale filter
      if (scaleName !== 'None' && scaleIntervals) {
        if (!scaleIntervals.includes(intervalFromRoot)) {
          continue; // Note not in scale, skip it
        }
      }
      
      // Check chord filter (using normalized intervals)
      if (chordName !== 'none' && normalizedChordIntervals) {
        if (!normalizedChordIntervals.includes(intervalFromRoot)) {
          continue; // Note not in chord, skip it
        }
      }
      
      // Note passes all filters
      filteredNotes.push(midi);
    }
    
    return filteredNotes;
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

// MASTER CHORD COMPENDIUM
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
    this.activeNotes = new Set();
    this.lookaheadScheduler = null;
    this.lastProcessedBeat = -1; // Track last processed beat to avoid duplicates
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
  
  seekTo(targetTimeMs) {
  if (DEBUG.VOICE_CLOCK) {
    console.log(`🎵 Voice ${this.voiceIndex + 1} seeking to ${formatMsToMMSS(targetTimeMs)}`);
  }
  
  if (!this.isActive) {
    if (DEBUG.VOICE_CLOCK) {
      console.log(`   Voice ${this.voiceIndex + 1} not active - skipping seek`);
    }
    return;
  }
  
  // Update timing for continuous playback
  const masterTime = this.masterClock.getMasterTime();
  this.lastNoteTime = masterTime;
  this.nextNoteTime = masterTime + 50; // Schedule next note very soon (50ms)
  
  // Update tempo in case it changed
  this.updateTempo();
  
  // Reset lookahead scheduler if it exists
  if (this.lookaheadScheduler && this.lookaheadScheduler.isActive) {
    const currentTime = audioManager.audioContext.currentTime;
    this.lookaheadScheduler.nextNoteTime = currentTime + 0.050; // 50ms ahead
    this.lookaheadScheduler.lastScheduledTime = currentTime;
  }
  
  if (DEBUG.VOICE_CLOCK) {
    console.log(`✅ Voice ${this.voiceIndex + 1} seek complete - playback should continue`);
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
    const shouldPlay = this.isInLifeSpan(elapsedMs);
    
    // Enhanced debugging for mute testing
    if (DEBUG.VOICE_CLOCK) { 
      const lifeSpanParam = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
      const beatUnit = lifeSpanParam ? lifeSpanParam.beatUnit || 7 : 7;
      const tempo = this.currentTempo || 120;
      const currentBeat = msToBeats(elapsedMs, beatUnit, tempo);
      
      console.log(`🎵 Voice ${this.voiceIndex + 1} shouldPlay check:`);
      console.log(`   Elapsed: ${formatMsToMMSS(elapsedMs)} (Beat ${currentBeat.toFixed(1)})`);
      console.log(`   Result: ${shouldPlay ? 'PLAY' : 'MUTED'}`);
      
      if (lifeSpanParam) {
        for (let i = 1; i <= 3; i++) {
          const span = lifeSpanParam[`lifeSpan${i}`];
          if (span && span.exitBeats > 0) {
            const inThisSpan = currentBeat >= span.enterBeats && currentBeat < span.exitBeats;
            console.log(`     Entrance ${i}: ${span.enterBeats}-${span.exitBeats} beats (${inThisSpan ? 'IN' : 'out'})`);
          }
        }
      }
    }
    
    return shouldPlay;
  }

  isInLifeSpan(elapsedMs) {
    const lifeSpanParam = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    
    if (!lifeSpanParam) {
      return true; // No Life Span parameter
    }
    
    // NEW: Use events array instead of 3-entrance system
    if (lifeSpanParam.events && lifeSpanParam.events.length > 0) {
      return this.isInLifeSpanEvents(elapsedMs, lifeSpanParam);
    }
    
    // FALLBACK: Use old 3-entrance system (for safety during transition)
    return this.isInLifeSpanLegacy(elapsedMs, lifeSpanParam);
  }

  
  // NEW: Events-based play/mute logic
  isInLifeSpanEvents(elapsedMs, lifeSpanParam) {
    const tempo = this.currentTempo || getCurrentTempoForVoice(this.voiceIndex);
    const beatUnit = lifeSpanParam.beatUnit || 7;
    const elapsedBeats = msToBeats(elapsedMs, beatUnit, tempo);
    
    // Handle repeat mode
    let currentBeat = elapsedBeats;
    if (lifeSpanParam.repeat) {
      const maxBeats = lifeSpanParam.maxTimeBeats || 700;
      currentBeat = elapsedBeats % maxBeats;
    }
    
    // Process events chronologically to determine current play state
    const muteEvents = lifeSpanParam.events
      .filter(event => event.type === 'mute')
      .sort((a, b) => a.beatPosition - b.beatPosition);
    
    let isPlaying = false; // Default to muted
    
    muteEvents.forEach(event => {
      if (currentBeat >= event.beatPosition) {
        isPlaying = (event.action === 'unmute');
      }
    });
    
    if (DEBUG.EVENTS && Math.random() < 0.02) { // 2% of calls for debugging
      console.log(`🎵 Voice ${this.voiceIndex + 1} events check:`);
      console.log(`   Current beat: ${currentBeat.toFixed(1)} (elapsed: ${elapsedBeats.toFixed(1)})`);
      console.log(`   Result: ${isPlaying ? 'PLAYING' : 'MUTED'} (from events system)`);
    }
    
    return isPlaying;
  }
  
  // LEGACY: Original 3-entrance system (fallback)
  isInLifeSpanLegacy(elapsedMs, lifeSpanParam) {
    // Get current tempo and beat unit
    const tempo = this.currentTempo || getCurrentTempoForVoice(this.voiceIndex);
    const beatUnit = lifeSpanParam.beatUnit || 7;
    
    // Convert elapsed time to beats ONCE
    const elapsedBeats = msToBeats(elapsedMs, beatUnit, tempo);
    
    // Collect all active spans
    let activeSpans = [];
    for (let i = 1; i <= 3; i++) {
      const span = lifeSpanParam[`lifeSpan${i}`];
      
      if (span && typeof span.exitBeats === 'number' && span.exitBeats > 0) {
        activeSpans.push({
          enterBeats: span.enterBeats || 0,
          exitBeats: span.exitBeats >= 999999 ? Infinity : span.exitBeats,
          number: i
        });
      }
    }
    
    if (activeSpans.length === 0) {
      return false; // No active spans
    }
    
    // Handle REPEAT mode
    if (lifeSpanParam.repeat) {
      const maxBeats = lifeSpanParam.maxTimeBeats || 700;
      
      // Check for infinite spans
      for (const span of activeSpans) {
        if (span.exitBeats === Infinity) {
          return true;
        }
      }
      
      // Calculate position within current cycle
      const cyclePosition = elapsedBeats % maxBeats;
      
      // Check if we're in any active span at this cycle position
      for (const span of activeSpans) {
        if (cyclePosition >= span.enterBeats && cyclePosition < span.exitBeats) {
          return true;
        }
      }
      
      return false;
    }
    
    // NON-REPEAT: Check spans once
    for (const span of activeSpans) {
      if (elapsedBeats >= span.enterBeats && elapsedBeats < span.exitBeats) {
        return true;
      }
    }
    
    return false;
  }

  isTimeForNextNote() {
    // Check for EventRegistry events before scheduling notes
    this.processRegistryEventsAtCurrentTime();

    if (!this.shouldPlayNote()) return false;
    
    const masterTime = this.masterClock.getMasterTime();
    return masterTime >= this.nextNoteTime;
  }

    /**
   * Process EventRegistry events at current time
   * NEW METHOD: Applies parameter automation during playback
   */
    processRegistryEventsAtCurrentTime() {
    if (!eventRegistry) {
      console.log(`⚠️ Voice ${this.voiceIndex + 1}: No eventRegistry available`);
      return;
    }
    
    const elapsedMs = this.masterClock.getElapsedTime();
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    
    if (!lifeSpan) {
      console.log(`⚠️ Voice ${this.voiceIndex + 1}: No lifeSpan data`);
      return;
    }
    
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = this.currentTempo || getCurrentTempoForVoice(this.voiceIndex);
    const currentBeat = Math.round(msToBeats(elapsedMs, beatUnit, tempo));
    
    // ENHANCED: Always log beat progression for Voice 1 during testing
    if (this.voiceIndex === 0 && currentBeat % 2 === 0) { // Every 2nd beat for Voice 1
      console.log(`🎵 Voice 1 at beat ${currentBeat} (${formatMsToMMSS(elapsedMs)})`);
    }
    
    // Only check if we haven't processed this beat yet
    if (this.lastEventBeat === currentBeat) return;
    this.lastEventBeat = currentBeat;
    
    // Get events at current beat for this voice
    const eventsAtBeat = eventRegistry.getEventsByBeat(currentBeat);
    const voiceEventsAtBeat = eventsAtBeat.filter(event => event.voiceIndex === this.voiceIndex);
    
    if (voiceEventsAtBeat.length > 0) {
      console.log(`🎯 Voice ${this.voiceIndex + 1}: FOUND ${voiceEventsAtBeat.length} events at beat ${currentBeat}`);
      
      voiceEventsAtBeat.forEach(event => {
        try {
          console.log(`   🎚️ Applying: ${event.parameterName} = ${JSON.stringify(event.value)}`);
          EventProcessor.applyEventToVoice(event);
        } catch (error) {
          console.error(`❌ Error applying event ${event.id}:`, error);
        }
      });
    }
  }



  scheduleNextNote() {
    // Process EventRegistry events before note scheduling
    this.processRegistryEventsAtCurrentTime();

    const elapsedMs = this.masterClock.getElapsedTime();
    const shouldPlay = this.shouldPlayNote();
    
    // CRITICAL DEBUG: Log the repeat status
    const lifeSpanParam = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    const repeatEnabled = lifeSpanParam ? lifeSpanParam.repeat : false;
    
    // NEW: Check for registry events at current beat
      this.checkRegistryEvents();

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

updateVolumeForActiveNotes(newVolume) {
  if (!this.activeNotes || this.activeNotes.size === 0) {
    console.log(`🔊 Voice ${this.voiceIndex + 1}: No active notes to update volume`);
    return;
  }
  
  const volumeGain = (newVolume / 100) * 0.15; // Same scaling as existing code
  const now = audioManager.audioContext.currentTime;
  
  console.log(`🔊 Voice ${this.voiceIndex + 1}: Updating ${this.activeNotes.size} active notes to volume ${newVolume} (gain: ${volumeGain.toFixed(3)})`);
  
  let updatedCount = 0;
  let failedCount = 0;
  
  this.activeNotes.forEach((note, index) => {
    if (!note.isActive || !note.gainNode) {
      console.log(`   ⚠️ Note ${index}: isActive=${note.isActive}, hasGainNode=${!!note.gainNode} - SKIPPED`);
      failedCount++;
      return;
    }
    
    try {
  // Update the note's gain node immediately - USE .value INSTEAD OF setValueAtTime
  const oldGain = note.gainNode.gain.value;
  note.gainNode.gain.value = volumeGain;
  updatedCount++;
  
  console.log(`   ✓ Note ${index}: ${oldGain.toFixed(4)} → ${volumeGain.toFixed(4)} (direct .value)`);
} catch (e) {
  // Note might be disconnected
  console.log(`   ❌ Note ${index}: Failed to update gain:`, e.message);
  failedCount++;
}

  });
  
  console.log(`✅ Volume update complete: ${updatedCount} updated, ${failedCount} failed`);
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
    // NEW: Use stored parameter state if available (from seeking)
    if (this.currentParameterState) {
      if (DEBUG.VOICE_CLOCK) {
        console.log(`🎵 Voice ${this.voiceIndex + 1}: Using stored parameter state from seek`);
      }
      
      return this.convertParameterStateToVoiceParams(this.currentParameterState);
    }

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

  convertParameterStateToVoiceParams(parameterState) {
  const volumeParam = parameterState['VOLUME'] || voiceData[this.voiceIndex].parameters['VOLUME'];
  const balanceParam = parameterState['STEREO BALANCE'] || voiceData[this.voiceIndex].parameters['STEREO BALANCE'];
  
  const currentVolume = volumeParam.currentValue || (volumeParam.min + volumeParam.max) / 2;
  const currentBalance = balanceParam.currentValue || (balanceParam.min + balanceParam.max) / 2;
  
  if (DEBUG.VOICE_CLOCK) {
    console.log(`   🔊 Converted parameter state: Volume=${currentVolume.toFixed(1)}, Balance=${currentBalance.toFixed(1)}`);
  }
  
  return {
    volume: (currentVolume / 100) * 0.15,
    balance: Math.max(-1, Math.min(1, currentBalance / 100)),
    polyphonyScale: 1.0, // Default for now
    velocityScale: 1.0   // Default for now
    // Add other parameters as needed
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
  if (lifeSpanParam.repeat) return false;
  
  const maxBeats = lifeSpanParam.maxTimeBeats || 600;
  const beatUnit = lifeSpanParam.beatUnit || 7;
  
  // Get actual locked tempo
  const voiceClock = this.getVoiceClock(voiceIndex);
  const tempo = voiceClock && voiceClock.playbackStartTempo ? 
    voiceClock.playbackStartTempo : 
    getCurrentTempoForVoice(voiceIndex);
  
  // PRECISION: Calculate expected completion time instead of beat comparison
  const expectedCompletionMs = beatsToMs(maxBeats, beatUnit, tempo);
  
  // FIXED: Compare time instead of beats to avoid precision errors
  const completed = elapsedMs >= (expectedCompletionMs - 50); // 50ms tolerance
  
  if (completed) {
    const actualBeats = msToBeats(elapsedMs, beatUnit, tempo);
    console.log(`✅ Voice ${voiceIndex + 1} COMPLETED: ${elapsedMs}ms >= ${expectedCompletionMs}ms (${actualBeats.toFixed(3)} beats)`);
  }
  
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
// ===== MELODIC PHRASE GENERATOR CLASS (UPDATED FOR PHRASE STYLES) =====
// ===== MELODIC PHRASE GENERATOR CLASS (UPDATED FOR PHRASE STYLES) =====

class MelodicPhraseGenerator {
  constructor(voiceIndex) {
    this.voiceIndex = voiceIndex;
    this.patternHistory = [];
    
    // Pattern generation methods
    this.patterns = {
      'random': this.generateRandom.bind(this),
      'ascending': this.generateAscending.bind(this),
      'descending': this.generateDescending.bind(this),
      'pendulum': this.generatePendulum.bind(this),
      'wave': this.generateWave.bind(this),
      'spiral': this.generateSpiral.bind(this),
    };
  }
  
  selectActivePattern() {
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    
    if (!phraseStyles) {
      console.warn(`Voice ${this.voiceIndex + 1}: No PHRASE STYLES parameter, using Random`);
      return { name: 'random', length: 1 };
    }
    
    const enabledPatterns = [];
    
    // Collect enabled MELODIC patterns only (exclude breathe)
    Object.keys(phraseStyles.patterns).forEach(patternName => {
      if (phraseStyles.patterns[patternName].enabled) {
        enabledPatterns.push({
          name: patternName,
          length: phraseStyles.patterns[patternName].length
        });
      }
    });

    // NEW: Validation - ensure at least one enabled pattern
    if (enabledPatterns.length === 0) {
      if (PHRASE_STYLES_DEBUG) {
        console.warn(`Voice ${this.voiceIndex + 1}: No patterns enabled, auto-enabling Random`);
      }
      
      // Auto-enable Random pattern in the data
      phraseStyles.patterns.random.enabled = true;
      
      // Update UI checkbox if visible
      const parameterSection = document.getElementById('parameter-section');
      if (parameterSection && currentVoice === this.voiceIndex) {
        const randomCheckbox = parameterSection.querySelector('.pattern-checkbox[data-pattern="random"]');
        if (randomCheckbox) {
          randomCheckbox.checked = true;
        }
      }
      
      return { name: 'random', length: 1 };
    }
    
    // Pattern selection based on Behavior slider
    const behaviorSetting = phraseStyles.behavior || 50;
    
    if (behaviorSetting > 50) {
      // High behavior = pure random selection
      const selected = enabledPatterns[Math.floor(Math.random() * enabledPatterns.length)];
      return selected;
    } else {
      // Low behavior = avoid recent patterns
      return this.selectWithHistoryAvoidance(enabledPatterns);
    }
  }
  
  selectWithHistoryAvoidance(enabledPatterns) {
    // Filter out patterns used in last 2 phrases
    const available = enabledPatterns.filter(p => 
      !this.patternHistory.slice(-2).includes(p.name)
    );
    
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    } else {
      // All patterns recently used, pick from full list
      return enabledPatterns[Math.floor(Math.random() * enabledPatterns.length)];
    }
  }
  
  // NEW: Determine if breathe should be inserted after this phrase
  shouldInsertBreathe() {
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    
    if (!phraseStyles || !phraseStyles.breathe.enabled) {
      return false; // Breathe not enabled
    }
    
    const behaviorSetting = phraseStyles.behavior || 50;
    const breatheProbability = 0.1 + (behaviorSetting / 100) * 0.8; // 10% to 90%
    
    const shouldBreathe = Math.random() < breatheProbability;
    
    if (PHRASE_STYLES_DEBUG && shouldBreathe) {
      console.log(`💨 Voice ${this.voiceIndex + 1}: Inserting Breathe (probability: ${(breatheProbability * 100).toFixed(0)}%)`);
    }
    
    return shouldBreathe;
  }
  
  getBreatheLength() {
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    return phraseStyles ? phraseStyles.breathe.length : 12;
  }

  generate(notePool, maxNotes, behaviorSetting) {
    const selectedPattern = this.selectActivePattern();
    
    // Use the pattern's configured length BUT respect maxNotes (boundary limit)
    let actualLength = selectedPattern.length;
    
    // NEW: Respect boundary limit if provided
    if (maxNotes < 100) {
      actualLength = Math.min(actualLength, maxNotes);
      
      if (PHRASE_STYLES_DEBUG && actualLength < selectedPattern.length) {
        console.log(`✂️ Voice ${this.voiceIndex + 1}: Pattern ${selectedPattern.name} truncated: ${selectedPattern.length} → ${actualLength} notes (boundary limit)`);
      }
    }
    
    // Also can't exceed available notes in pool
    actualLength = Math.min(actualLength, notePool.length);
    
    if (PHRASE_STYLES_DEBUG) {
      console.log(`🎵 Voice ${this.voiceIndex + 1}: ${selectedPattern.name} pattern, length=${selectedPattern.length}, actual=${actualLength} notes`);
    }
    
    // Generate phrase
    const phrase = this.patterns[selectedPattern.name](notePool, actualLength);
    
    // NEW: Validate generated phrase
    if (!Array.isArray(phrase)) {
      console.error(`Voice ${this.voiceIndex + 1}: Invalid phrase generated by ${selectedPattern.name}`);
      return [notePool[0]]; // Fallback to single note
    }
    
    // Breathe returns empty array - this is valid
    if (phrase.length === 0 && selectedPattern.name === 'breathe') {
      return phrase;
    }
    
    // Other patterns should never return empty
    if (phrase.length === 0) {
      console.error(`Voice ${this.voiceIndex + 1}: Empty phrase from ${selectedPattern.name}`);
      return [notePool[0]]; // Fallback
    }
    
    // Update history
    this.patternHistory.push(selectedPattern.name);
    if (this.patternHistory.length > 3) {
      this.patternHistory.shift();
    }
    
    return phrase;
  }
  
  // ===== PATTERN GENERATORS =====
  
  generateRandom(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      const randomNote = notePool[Math.floor(Math.random() * notePool.length)];
      return [randomNote];
    }
    
    // Pure randomization - each note independent
    const phrase = [];
    for (let i = 0; i < noteCount; i++) {
      const randomNote = notePool[Math.floor(Math.random() * notePool.length)];
      phrase.push(randomNote);
    }
    return phrase;
  }
  
  generateAscending(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      return [notePool[Math.floor(Math.random() * notePool.length)]];
    }
    
    const sorted = [...notePool].sort((a, b) => a - b);
    
    // Pick random starting note from pool
    const startIndex = Math.floor(Math.random() * sorted.length);
    const phrase = [];
    
    // Get behavior setting for interval control
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    const behaviorSetting = phraseStyles ? phraseStyles.behavior : 50;
    
    let currentIndex = startIndex;
    
    for (let i = 0; i < noteCount; i++) {
      phrase.push(sorted[currentIndex]);
      
      // Determine step size based on behavior
      const stepSize = this.calculateAscendingStepSize(behaviorSetting, sorted.length);
      
      currentIndex = (currentIndex + stepSize) % sorted.length;
    }
    
    return phrase;
  }
  
  calculateAscendingStepSize(behaviorSetting, poolSize) {
    const maxStep = Math.max(1, Math.floor(poolSize / 4));
    
    if (behaviorSetting <= 25) {
      return Math.random() < 0.8 ? 1 : 2;
    } else if (behaviorSetting <= 50) {
      return Math.floor(Math.random() * 3) + 1;
    } else if (behaviorSetting <= 75) {
      return Math.floor(Math.random() * 4) + 1;
    } else {
      return Math.floor(Math.random() * Math.min(6, maxStep)) + 1;
    }
  }

  generateDescending(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      return [notePool[Math.floor(Math.random() * notePool.length)]];
    }
    
    const sorted = [...notePool].sort((a, b) => b - a); // Descending order
    
    const startIndex = Math.floor(Math.random() * sorted.length);
    const phrase = [];
    
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    const behaviorSetting = phraseStyles ? phraseStyles.behavior : 50;
    
    let currentIndex = startIndex;
    
    for (let i = 0; i < noteCount; i++) {
      phrase.push(sorted[currentIndex]);
      
      const stepSize = this.calculateAscendingStepSize(behaviorSetting, sorted.length);
      
      currentIndex = (currentIndex + stepSize) % sorted.length;
    }
    
    return phrase;
  }

  generatePendulum(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      return [notePool[Math.floor(Math.random() * notePool.length)]];
    }
    
    const sorted = [...notePool].sort((a, b) => a - b);
    
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    const behaviorSetting = phraseStyles ? phraseStyles.behavior : 50;
    
    const startIndex = Math.floor(Math.random() * sorted.length);
    const phrase = [];
    
    let direction = Math.random() > 0.5 ? 1 : -1;
    let currentIndex = startIndex;
    
    for (let i = 0; i < noteCount; i++) {
      phrase.push(sorted[currentIndex]);
      
      const stepSize = this.calculateAscendingStepSize(behaviorSetting, sorted.length);
      
      currentIndex += (stepSize * direction);
      
      // Wrap around with direction change
      if (currentIndex >= sorted.length) {
        direction = -1;
        currentIndex = sorted.length - 1 - (currentIndex - sorted.length);
        if (currentIndex < 0) currentIndex = 0;
      } else if (currentIndex < 0) {
        direction = 1;
        currentIndex = Math.abs(currentIndex);
        if (currentIndex >= sorted.length) currentIndex = sorted.length - 1;
      }
    }
    
    return phrase;
  }

  generateWave(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      return [notePool[Math.floor(Math.random() * notePool.length)]];
    }
    
    const sorted = [...notePool].sort((a, b) => a - b);
    
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    const behaviorSetting = phraseStyles ? phraseStyles.behavior : 50;
    
    const phaseOffset = Math.random() * Math.PI * 2;
    const phrase = [];
    
    const cycleCount = behaviorSetting <= 25 ? 6 : 
                       behaviorSetting <= 50 ? 4 : 
                       behaviorSetting <= 75 ? 2 : 1;
    
    for (let i = 0; i < noteCount; i++) {
      const phase = (i / noteCount) * Math.PI * cycleCount * 2 + phaseOffset;
      const sineValue = Math.sin(phase);
      const normalized = (sineValue + 1) / 2;
      
      let indexFloat = normalized * (sorted.length - 1);
      
      if (behaviorSetting > 75) {
        const jitter = (Math.random() - 0.5) * (sorted.length * 0.2);
        indexFloat += jitter;
      }
      
      const index = Math.max(0, Math.min(sorted.length - 1, Math.floor(indexFloat)));
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }

  generateSpiral(notePool, noteCount) {
    // Handle single note case
    if (noteCount <= 1) {
      return [notePool[Math.floor(Math.random() * notePool.length)]];
    }
    
    const sorted = [...notePool].sort((a, b) => a - b);
    
    const phraseStyles = voiceData[this.voiceIndex].parameters['PHRASE STYLES'];
    const behaviorSetting = phraseStyles ? phraseStyles.behavior : 50;
    
    const centerIndex = Math.floor(Math.random() * sorted.length);
    const phrase = [];
    
    const expansionRate = behaviorSetting <= 25 ? 0.5 : 
                          behaviorSetting <= 50 ? 1.0 : 
                          behaviorSetting <= 75 ? 1.5 : 2.0;
    
    for (let i = 0; i < noteCount; i++) {
      const expansion = Math.pow(i / noteCount, 1.0 / expansionRate);
      const maxRange = Math.floor(sorted.length / 2);
      const range = Math.floor(expansion * maxRange);
      
      let offset = (i % 2 === 0) ? range : -range;
      
      if (behaviorSetting > 75) {
        const jitter = Math.floor((Math.random() - 0.5) * maxRange * 0.3);
        offset += jitter;
      }
      
      const index = Math.max(0, Math.min(sorted.length - 1, centerIndex + offset));
      phrase.push(sorted[index]);
    }
    
    return phrase;
  }
  
  generateBreathe(notePool, noteCount) {
    // Return empty array - signals "no notes" to scheduler
    return [];
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

    this.lastProcessedBeat = -1; // Track processed beats

    
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
    // NEW: Process EventRegistry events during lookahead scheduling
    this.processRegistryEvents(); 
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

   /**
   * Process EventRegistry events for this voice
   * NEW METHOD: Integrates EventRegistry with LookaheadScheduler
   */
  processRegistryEvents() {
    if (!eventRegistry) return;
    
    // FIXED: Use correct property names for LookaheadScheduler
    const elapsedMs = this.masterClock.getElapsedTime();
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    
    if (!lifeSpan) return;
    
    const beatUnit = lifeSpan.beatUnit || 7;
    const tempo = getCurrentTempoForVoice(this.voiceIndex);
    const currentBeat = Math.round(msToBeats(elapsedMs, beatUnit, tempo));
    
    // Only process each beat once
    if (this.lastProcessedBeat === currentBeat) return;
    this.lastProcessedBeat = currentBeat;
    
    // Get events at current beat for this voice
    const eventsAtBeat = eventRegistry.getEventsByBeat(currentBeat);
    const voiceEventsAtBeat = eventsAtBeat.filter(event => event.voiceIndex === this.voiceIndex);
    
    // ENHANCED: Log beat timing for debugging
    const timeMs = beatsToMs(currentBeat, beatUnit, tempo);
    const timeFormatted = formatMsToMMSS(timeMs);
    
    if (currentBeat <= 16 && Math.random() < 0.3) { // 30% chance to log
      console.log(`⏱️ Voice ${this.voiceIndex + 1}: Beat ${currentBeat} = ${timeFormatted} (tempo: ${tempo})`);
    }

    if (voiceEventsAtBeat.length > 0) {
      console.log(`🎯 Voice ${this.voiceIndex + 1}: APPLYING ${voiceEventsAtBeat.length} events at beat ${currentBeat}`);
      
      voiceEventsAtBeat.forEach(event => {
        try {
          console.log(`   🎚️ Processing: ${event.parameterName} = ${JSON.stringify(event.value)}`);
          EventProcessor.applyEventToVoice(event);
        } catch (error) {
          console.error(`❌ Error applying event ${event.id}:`, error);
        }
      });
    }
  }



  scheduleAhead() {
    const currentTime = this.audioContext.currentTime;
    const scheduleUntil = currentTime + this.currentLookahead;
    
    // NEW: Safety counter to prevent infinite loops
      let loopIterations = 0;
      const MAX_LOOP_ITERATIONS = 100;
    
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
      while (this.nextNoteTime < scheduleUntil && scheduledCount < maxNotesPerCycle && loopIterations < MAX_LOOP_ITERATIONS) {
      loopIterations++;

    // Generate next note in phrase
    if (this.phraseIndex >= this.currentPhrase.length) {
      // Phrase completed - check if we should insert breathe
      if (this.phraseGenerator.shouldInsertBreathe()) {
        // Insert breathe (silence)
        const breatheLength = this.phraseGenerator.getBreatheLength();
        const rhythmDuration = this.getNextRhythmDuration();
        const breatheDuration = breatheLength * rhythmDuration;
        
        if (PHRASE_STYLES_DEBUG) {
          console.log(`💨 Voice ${this.voiceIndex + 1}: Breathe inserted (${breatheDuration.toFixed(3)}s)`);
        }
        
        // Advance time for breathe duration
        this.nextNoteTime += breatheDuration;
        
        // Don't increment scheduledCount - breathe doesn't count as a note
        // Continue to generate next melodic phrase
      }
      
            // Generate new melodic phrase
      // NOTE: Don't use lookahead to determine phrase length!
      // Use the actual pattern length from user settings
      
      this.currentPhrase = this.generatePhrase(999); // Pass large number, generator will use actual pattern length
      this.phraseIndex = 0;

      
      // Sanity check - phrase should never be empty now
      if (this.currentPhrase.length === 0) {
        console.error(`⚠️ Voice ${this.voiceIndex + 1}: Empty phrase generated! Falling back to single note.`);
        const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
        const fallbackNote = melodicParam.selectedNotes ? 
          melodicParam.selectedNotes[0] : Math.round((melodicParam.min + melodicParam.max) / 2);
        this.currentPhrase = [fallbackNote];
      }
      
      if (PHRASE_STYLES_DEBUG) {
        console.log(`🎵 Voice ${this.voiceIndex + 1}: New phrase ready (${this.currentPhrase.length} notes)`);
      }
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
    
    // NEW: Check if we hit safety limit
    if (loopIterations >= MAX_LOOP_ITERATIONS) {
      console.error(`⚠️ Voice ${this.voiceIndex + 1}: Scheduler safety limit reached (${loopIterations} iterations)`);
      console.error(`   This usually means Breathe phrase caused an infinite loop`);
      console.error(`   nextNoteTime: ${this.nextNoteTime.toFixed(3)}, scheduleUntil: ${scheduleUntil.toFixed(3)}`);
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
  
generatePhrase(maxNotes) {
  const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
  
  // Get note pool
  let notePool;
  if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 0) {
    notePool = melodicParam.selectedNotes;
  } else {
    const minNote = Math.round(melodicParam.min);
    const maxNote = Math.round(melodicParam.max);
    notePool = [];
    for (let note = minNote; note <= maxNote; note++) {
      notePool.push(note);
    }
  }
  
  // NOTE: maxNotes is ignored - pattern generator uses its own length settings
  const behaviorSetting = melodicParam.behavior || 50;
  return this.phraseGenerator.generate(notePool, maxNotes, behaviorSetting);
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
  // NEW: Check boundary BEFORE scheduling to audio buffer
  const noteWillPlayAt = (scheduleTime - this.audioContext.currentTime) * 1000 + 
                         this.masterClock.getElapsedTime();
  
  const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
  if (!voiceClock) return;
  
  const willBeInLifeSpan = voiceClock.isInLifeSpan(noteWillPlayAt);
  
  if (!willBeInLifeSpan) {
    if (DEBUG.VOICE_CLOCK) {
      const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
      const beatUnit = lifeSpan.beatUnit || 7;
      const tempo = voiceClock.currentTempo || getCurrentTempoForVoice(this.voiceIndex);
      const beatPos = msToBeats(noteWillPlayAt, beatUnit, tempo);
      
      console.log(`⏭️ Voice ${this.voiceIndex + 1}: BLOCKED note at beat ${beatPos.toFixed(1)}`);
    }
    return; // Exit early - don't schedule
  }
  
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
  
  // If polyphony > 1, add additional notes
  if (polyphonyCount > 1) {
    const melodicParam = voiceData[this.voiceIndex].parameters['MELODIC RANGE'];
    
    if (melodicParam.selectedNotes && melodicParam.selectedNotes.length > 1) {
      noteInfoArray.length = 0;
      
      const availableNotes = [...melodicParam.selectedNotes];
      const notesToPick = Math.min(polyphonyCount, availableNotes.length);
      
      for (let i = 0; i < notesToPick; i++) {
        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        const selectedMidi = availableNotes.splice(randomIndex, 1)[0];
        
        noteInfoArray.push({
          midiNote: selectedMidi,
          frequency: midiToFrequency(selectedMidi),
          noteName: midiNoteNames[selectedMidi] || `MIDI${selectedMidi}`
        });
      }
    } else {
      const behaviorSetting = melodicParam.behavior || 50;
      const baseNote = noteInfoArray[0];
      const minNote = Math.round(melodicParam.min);
      const maxNote = Math.round(melodicParam.max);
      
      const chord = generateMusicalChord(baseNote, polyphonyCount, minNote, maxNote, behaviorSetting);
      noteInfoArray.length = 0;
      noteInfoArray.push(...chord);
    }
  }
  
  // Schedule using existing audio infrastructure
  voiceClock.triggerNote(noteInfoArray, noteDuration * 1000, scheduleTime);
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
  } else if (param.type === 'phrase-styles-control') {
    range.appendChild(createPhraseStylesControl(param, voiceIndex));
  }

  
  controlsContainer.appendChild(range);
  
  // Handle behavior container - LIFE SPAN and PHRASE STYLES get special treatment
  if (param.type === 'life-span') {
    const lifeSpanBehavior = createLifeSpanBehaviorContainer(param, voiceIndex);
    controlsContainer.appendChild(lifeSpanBehavior);
  } else if (param.type === 'phrase-styles-control') {
    // Phrase Styles uses behavior slider WITHIN the piano keyboard area
    const behaviorContainer = createBehaviorSlider(param, voiceIndex);
    controlsContainer.appendChild(behaviorContainer);
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

// ===== PHRASE STYLES CONTROL CONNECTION =====

function connectPhraseStylesControls(container, voiceIndex) {
  if (!container) {
    console.warn('Phrase Styles container not found');
    return;
  }
  
  const phraseStylesParam = voiceData[voiceIndex].parameters['PHRASE STYLES'];
  if (!phraseStylesParam) {
    console.warn(`Voice ${voiceIndex + 1}: PHRASE STYLES parameter not found`);
    return;
  }
  
  // Connect pattern checkboxes
  const patternCheckboxes = container.querySelectorAll('.pattern-checkbox');
  patternCheckboxes.forEach(checkbox => {
    checkbox.onchange = (e) => {
      // NEW: Capture state before pattern change
      if (undoManager && undoManager.isCapturing && voiceIndex === currentVoice) {
        const patternName = e.target.dataset.pattern;
        const action = e.target.checked ? 'enabled' : 'disabled';
        undoManager.captureState(`Pattern ${patternName} ${action}`, true);
      }
      
      const patternName = e.target.dataset.pattern;
      const isChecked = e.target.checked;
      
      phraseStylesParam.patterns[patternName].enabled = isChecked;
      
      console.log(`Voice ${voiceIndex + 1}: ${patternName} pattern = ${isChecked ? 'ENABLED' : 'DISABLED'}`);
    };
  });

  
  // Connect pattern length sliders
  const patternSliders = container.querySelectorAll('.pattern-length-slider');
  patternSliders.forEach(slider => {
    const valueDisplay = slider.parentElement.querySelector('.length-value-display');
    
    slider.oninput = (e) => {
      const patternName = e.target.dataset.pattern;
      const length = parseInt(e.target.value);
      
      phraseStylesParam.patterns[patternName].length = length;
      
      if (valueDisplay) {
        valueDisplay.textContent = length;
      }
      
      console.log(`Voice ${voiceIndex + 1}: ${patternName} length = ${length}`);
    };
  });
  
    // Connect breathe checkbox
  const breatheCheckbox = container.querySelector('.breathe-checkbox');
  if (breatheCheckbox) {
    breatheCheckbox.onchange = (e) => {
      
      // NEW: Capture state before breathe change
      if (undoManager && undoManager.isCapturing && voiceIndex === currentVoice) {
        const action = e.target.checked ? 'enabled' : 'disabled';
        undoManager.captureState(`Breathe ${action}`, true);
      }
      
      const isChecked = e.target.checked;
      phraseStylesParam.breathe.enabled = isChecked;
      
      console.log(`Voice ${voiceIndex + 1}: Breathe = ${isChecked ? 'ENABLED' : 'DISABLED'}`);
    };
  }
  
  // Connect breathe length slider
  const breatheSlider = container.querySelector('.breathe-length-slider');
  if (breatheSlider) {
    const breatheValueDisplay = breatheSlider.parentElement.querySelector('.length-value-display');
    
    breatheSlider.oninput = (e) => {
      const length = parseInt(e.target.value);
      phraseStylesParam.breathe.length = length;
      
      if (breatheValueDisplay) {
        breatheValueDisplay.textContent = length;
      }
      
      console.log(`Voice ${voiceIndex + 1}: Breathe length = ${length}`);
    };
  }
  
  if (PHRASE_STYLES_DEBUG) {
    console.log(`✅ Connected Phrase Styles controls for Voice ${voiceIndex + 1}`);
  }
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
      slider.noUiSlider.off('set');
      slider.noUiSlider.off('start'); // NEW: Also remove old 'start' handler
      
      // NEW: Capture state when user STARTS dragging (before any changes)
      slider.noUiSlider.on('start', function(values) {
        if (undoManager && undoManager.isCapturing) {
          undoManager.captureState(`${paramName} range (before change)`, true);
          
          if (DEBUG.UNDO_REDO) {
            console.log(`📸 Pre-captured ${paramName} before slider drag`);
          }
        }
      });
      
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
        // Special handling for PHRASE STYLES
        if (paramName === 'PHRASE STYLES') {
          voiceData[currentVoice].parameters[paramName].behavior = value;
        } else {
          // Regular parameters
          voiceData[currentVoice].parameters[paramName].behavior = value;
        }
        
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
    
      // NEW: Capture state BEFORE change
      if (undoManager) {
        const dropdownLabel = dropdown.closest('.dropdown-container')?.querySelector('.dropdown-label')?.textContent;
        const actionName = `${paramName} ${dropdownLabel || 'changed'}`;
        undoManager.captureState(actionName, true);
      }
      
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
        slider.noUiSlider.off('set');
        slider.noUiSlider.off('start'); // NEW: Also remove old 'start' handler
        
        // NEW: Capture state when user STARTS dragging (before any changes)
        slider.noUiSlider.on('start', function(values) {
          if (undoManager && undoManager.isCapturing) {
            const subParam = labelText || `slider ${sliderIndex}`;
            undoManager.captureState(`${paramName} ${subParam} (before change)`, true);
            
            if (DEBUG.UNDO_REDO) {
              console.log(`📸 Pre-captured ${paramName} ${subParam} before slider drag`);
            }
          }
        });
        
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

  // 6. Connect Phrase Styles Controls
  const phraseStylesContainers = parameterSection.querySelectorAll('.phrase-styles-container');
  
  phraseStylesContainers.forEach((container) => {
    connectPhraseStylesControls(container, currentVoice);
  });

// Inside connectAllSliders(), update Life Span section:

// 7. Connect Life Span Controls
const lifeSpanContainers = parameterSection.querySelectorAll('.life-span-settings');
const actualContainers = [];
lifeSpanContainers.forEach(settings => {
  const container = settings.closest('.dual-slider');
  if (container) actualContainers.push(container);
});

actualContainers.forEach((container) => {
  const parameterRollup = container.closest('.parameter-rollup');
  const behaviorContainer = parameterRollup ? parameterRollup.querySelector('.life-span-behavior') : null;

  // Connect Max Time input
  const maxTimeInput = container.querySelector('.max-time-input');
  
  if (maxTimeInput) {
    maxTimeInput.oninput = function(e) {
      const value = e.target.value;
      
      // Check for missing leading zero
      if (value.match(/^:\d{2}$/)) {
        e.target.style.borderColor = '#ffc107';
        e.target.style.backgroundColor = '#fffbf0';
        console.warn(`❌ Missing leading zero: ${value} → should be "0${value}"`);
        
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
        
        setTimeout(() => {
          if (messageDiv && messageDiv.parentElement) {
            messageDiv.parentElement.removeChild(messageDiv);
          }
          e.target.style.borderColor = '';
          e.target.style.backgroundColor = '';
        }, 4000);
        
        return;
      }
      
      // Remove existing format hint
      const existingHint = container.querySelector('.format-hint');
      if (existingHint) {
        existingHint.parentElement.removeChild(existingHint);
      }
      
      const parsedMs = parseMMSSToMs(value);
      const MINIMUM_TIME_MS = 5000;
      const MAXIMUM_TIME_MS = 3600000;
      
      if (parsedMs !== null && parsedMs >= MINIMUM_TIME_MS && parsedMs <= MAXIMUM_TIME_MS) {
        // CONVERT TO BEATS (primary storage)
        const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
        const beatUnit = lifeSpan.beatUnit;
        const tempo = getCurrentTempoForVoice(currentVoice);
        
        const newMaxBeats = msToBeats(parsedMs, beatUnit, tempo);
        
        // Update PRIMARY storage (beats)
        voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeBeats = newMaxBeats;
        
        // Update LEGACY storage (milliseconds)
        voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeMs = parsedMs;
        
        // Calculate actual time after beat quantization
        const quantizedMs = beatsToMs(newMaxBeats, beatUnit, tempo);
        const quantizedFormatted = formatMsToMMSS(quantizedMs);
        
        // Update input to show quantized value if different
        if (quantizedMs !== parsedMs) {
          e.target.value = quantizedFormatted;
          console.log(`📏 Quantized ${formatMsToMMSS(parsedMs)} → ${quantizedFormatted} (${newMaxBeats} beats)`);
        }
        
        // Visual feedback - valid input
        e.target.style.borderColor = '#28a745';
        e.target.style.backgroundColor = '#f8fff8';
        
        console.log(`✅ Max Time updated: ${newMaxBeats} beats = ${quantizedFormatted} @ ${tempo} BPM`);
        
        // IMMEDIATELY rebuild all sliders with new range
        // NEW: Update Visual Timeline instead of rebuilding obsolete sliders
        if (visualTimeline && visualTimeline.isVisible) {
          visualTimeline.updateVoiceData(); // Update cached data first
          visualTimeline.refresh();         // Then refresh display
          
          if (DEBUG.EVENTS) {
            console.log(`🔄 Timeline refreshed for parameter change`);
          }
        }
        
        // Clear visual feedback
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
          console.warn(`❌ Invalid time format: ${value}`);
        }
        
        setTimeout(() => {
          e.target.style.borderColor = '';
          e.target.style.backgroundColor = '';
        }, 3000);
      }
    };
    
    maxTimeInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        e.target.blur();
      }
    };
    
    maxTimeInput.placeholder = "0:05";
    maxTimeInput.title = "Enter time in MM:SS format (minimum: 0:05, maximum: 60:00)";
  }

// Connect time increment/decrement arrows (UPDATED FOR 1-SECOND INCREMENTS)
// Connect time increment/decrement arrows (FIXED HOLD-TO-REPEAT)
const timeUpArrow = container.querySelector('.time-up');
const timeDownArrow = container.querySelector('.time-down');

if (timeUpArrow && timeDownArrow) {
  // Define the increment/decrement functions
  const incrementTime = () => {
    if (lifeSpanTimeInput) {
      const currentTime = parseMMSSToMs(lifeSpanTimeInput.value) || 0;
      const newTimeMs = Math.min(3600000, currentTime + 1000); // +1 second
      const newTimeFormatted = formatMsToMMSS(newTimeMs);
      
      lifeSpanTimeInput.value = newTimeFormatted;
      
      // Trigger input event to update everything
      const inputEvent = new Event('input', { bubbles: true });
      lifeSpanTimeInput.dispatchEvent(inputEvent);
    }
  };
  
  const decrementTime = () => {
    if (lifeSpanTimeInput) {
      const currentTime = parseMMSSToMs(lifeSpanTimeInput.value) || 0;
      const newTimeMs = Math.max(5000, currentTime - 1000); // -1 second
      const newTimeFormatted = formatMsToMMSS(newTimeMs);
      
      lifeSpanTimeInput.value = newTimeFormatted;
      
      // Trigger input event to update everything
      const inputEvent = new Event('input', { bubbles: true });
      lifeSpanTimeInput.dispatchEvent(inputEvent);
    }
  };
  
  // Single click handlers
  timeUpArrow.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    incrementTime();
    console.log(`⬆️ Time increased by 1 second`);
  };
  
  timeDownArrow.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    decrementTime();
    console.log(`⬇️ Time decreased by 1 second`);
  };
  
  // Hold-to-repeat functionality
  let timeArrowInterval = null;
  
  const startTimeRepeating = (direction) => {
    if (timeArrowInterval) clearInterval(timeArrowInterval);
    
    // Initial delay, then repeat faster
    setTimeout(() => {
      timeArrowInterval = setInterval(() => {
        if (direction === 'up') {
          incrementTime();
        } else {
          decrementTime();
        }
      }, 100); // Fast repeat every 100ms
    }, 300); // Initial 300ms delay before repeating starts
  };
  
  const stopTimeRepeating = () => {
    if (timeArrowInterval) {
      clearInterval(timeArrowInterval);
      timeArrowInterval = null;
    }
  };
  
  // Hold-to-repeat events
  timeUpArrow.onmousedown = (e) => {
    e.preventDefault();
    startTimeRepeating('up');
  };
  timeDownArrow.onmousedown = (e) => {
    e.preventDefault();
    startTimeRepeating('down');
  };
  
  timeUpArrow.onmouseup = stopTimeRepeating;
  timeDownArrow.onmouseup = stopTimeRepeating;
  timeUpArrow.onmouseleave = stopTimeRepeating;
  timeDownArrow.onmouseleave = stopTimeRepeating;
  
  console.log(`✅ Connected time arrows with hold-to-repeat`);


  
  // Update tooltips
  timeUpArrow.title = "Increase by 1 second";
  timeDownArrow.title = "Decrease by 1 second";
  
  console.log(`✅ Connected time arrows (1-second increments)`);
}

// Connect beat increment/decrement arrows (FIXED HOLD-TO-REPEAT)
const beatUpArrow = container.querySelector('.beat-up');
const beatDownArrow = container.querySelector('.beat-down');

if (beatUpArrow && beatDownArrow) {
  // Define the increment/decrement functions
  const incrementBeat = () => {
    if (lifeSpanBeatCountInput) {
      const currentBeats = parseInt(lifeSpanBeatCountInput.value) || 0;
      const newBeats = Math.min(9999, currentBeats + 1);
      
      lifeSpanBeatCountInput.value = newBeats;
      
      // Trigger input event to update everything
      const inputEvent = new Event('input', { bubbles: true });
      lifeSpanBeatCountInput.dispatchEvent(inputEvent);
    }
  };
  
  const decrementBeat = () => {
    if (lifeSpanBeatCountInput) {
      const currentBeats = parseInt(lifeSpanBeatCountInput.value) || 0;
      const newBeats = Math.max(2, currentBeats - 1);
      
      lifeSpanBeatCountInput.value = newBeats;
      
      // Trigger input event to update everything
      const inputEvent = new Event('input', { bubbles: true });
      lifeSpanBeatCountInput.dispatchEvent(inputEvent);
    }
  };
  
  // Single click handlers
  beatUpArrow.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    incrementBeat();
    console.log(`⬆️ Beat increased by 1`);
  };
  
  beatDownArrow.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    decrementBeat();
    console.log(`⬇️ Beat decreased by 1`);
  };
  
  // Hold-to-repeat functionality
  let beatArrowInterval = null;
  
  const startBeatRepeating = (direction) => {
    if (beatArrowInterval) clearInterval(beatArrowInterval);
    
    // Initial delay, then repeat faster
    setTimeout(() => {
      beatArrowInterval = setInterval(() => {
        if (direction === 'up') {
          incrementBeat();
        } else {
          decrementBeat();
        }
      }, 100); // Fast repeat every 100ms
    }, 300); // Initial 300ms delay before repeating starts
  };
  
  const stopBeatRepeating = () => {
    if (beatArrowInterval) {
      clearInterval(beatArrowInterval);
      beatArrowInterval = null;
    }
  };
  
  // Hold-to-repeat events
  beatUpArrow.onmousedown = (e) => {
    e.preventDefault();
    startBeatRepeating('up');
  };
  beatDownArrow.onmousedown = (e) => {
    e.preventDefault();
    startBeatRepeating('down');
  };
  
  beatUpArrow.onmouseup = stopBeatRepeating;
  beatDownArrow.onmouseup = stopBeatRepeating;
  beatUpArrow.onmouseleave = stopBeatRepeating;
  beatDownArrow.onmouseleave = stopBeatRepeating;
  
  console.log(`✅ Connected beat arrows with hold-to-repeat`);
}


 
  //Connect dual-mode toggle buttons 
const modeButtons = container.querySelectorAll('.mode-btn');
const beatInputGroup = container.querySelector('.beat-input-group');
const timeInputGroup = container.querySelector('.time-input-group');
const beatCountInput = container.querySelector('.beat-count-input');
const timeInput = container.querySelector('.time-input');
const equalsTime = container.querySelector('.equals-time');
const equalsBeats = container.querySelector('.equals-beats');

// Connect Beat Unit dropdown
const beatUnitSelect = container.querySelector('.beat-unit-select');
if (beatUnitSelect) {
  beatUnitSelect.onchange = function(e) {
    const oldBeatUnit = voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit;
    const newBeatUnit = parseInt(e.target.value);
    
    console.log(`🎵 Changing beat unit: ${rhythmOptions[oldBeatUnit]} → ${rhythmOptions[newBeatUnit]}`);
    
    // Update beat unit
    voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit = newBeatUnit;
    
    // Rebuild sliders to update tooltips with new time calculations
    // NEW: Update Visual Timeline instead of rebuilding obsolete sliders
if (visualTimeline && visualTimeline.isVisible) {
  visualTimeline.updateVoiceData(); // Update cached data first
  visualTimeline.refresh();         // Then refresh display
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Timeline refreshed for parameter change`);
  }
}
  };
}

// NEW: Connect dual-mode toggle buttons (using unique variable names)
const lifeSpanModeButtons = container.querySelectorAll('.mode-btn');
const lifeSpanBeatInputGroup = container.querySelector('.beat-input-group');
const lifeSpanTimeInputGroup = container.querySelector('.time-input-group');
const lifeSpanBeatCountInput = container.querySelector('.beat-count-input');
const lifeSpanTimeInput = container.querySelector('.time-input');
const lifeSpanEqualsTime = container.querySelector('.equals-time');
const lifeSpanEqualsBeats = container.querySelector('.equals-beats');

console.log(`🔗 Found ${lifeSpanModeButtons.length} mode buttons for Voice ${currentVoice + 1}`);

lifeSpanModeButtons.forEach((button, index) => {
  console.log(`   Button ${index + 1}: ${button.dataset.mode} (active: ${button.classList.contains('active')})`);
  
  button.onclick = function(e) {
    console.log(`🖱️ Mode button clicked: ${this.dataset.mode}`);
    
    const mode = this.dataset.mode;
    
    // Update button states
    lifeSpanModeButtons.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
        btn.style.background = '#4a90e2';
        btn.style.color = 'white';
        console.log(`   ✅ Activated ${mode} mode`);
      } else {
        btn.classList.remove('active');
        btn.style.background = '#e9ecef';
        btn.style.color = '#495057';
      }
    });
    
    // Show/hide appropriate input
    if (mode === 'beats') {
      if (lifeSpanBeatInputGroup) lifeSpanBeatInputGroup.style.display = 'flex';
      if (lifeSpanTimeInputGroup) lifeSpanTimeInputGroup.style.display = 'none';
      console.log(`🎵 Voice ${currentVoice + 1}: Switched to BEAT mode`);
    } else if (mode === 'time') {
      if (lifeSpanBeatInputGroup) lifeSpanBeatInputGroup.style.display = 'none';
      if (lifeSpanTimeInputGroup) lifeSpanTimeInputGroup.style.display = 'flex';
      console.log(`⏰ Voice ${currentVoice + 1}: Switched to TIME mode`);
    }
  };
});
// Connect Beat Count Input
if (lifeSpanBeatCountInput) {
  lifeSpanBeatCountInput.oninput = function(e) {
    const newBeats = parseInt(e.target.value);
    
    // Calculate minimum beats based on 5-second minimum
    const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
    const beatUnit = lifeSpan.beatUnit;
    const tempo = getCurrentTempoForVoice(currentVoice);
    const minimumBeats = Math.max(2, msToBeats(5000, beatUnit, tempo)); // 5 seconds minimum
    
    // Remove any existing error message
    const existingError = container.querySelector('.beat-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    if (isNaN(newBeats) || newBeats < minimumBeats || newBeats > 9999) {
      e.target.style.borderColor = '#dc3545';
      e.target.style.backgroundColor = '#fff8f8';
      
      // Show user-friendly error message
      let errorMessage = '';
      if (newBeats < minimumBeats) {
        const actualSeconds = beatsToMs(newBeats, beatUnit, tempo) / 1000;
        errorMessage = `⚠️ Too short: ${newBeats} beats = ${actualSeconds.toFixed(1)}s (minimum: 5 seconds = ${minimumBeats} beats)`;
      } else if (newBeats > 9999) {
        errorMessage = `⚠️ Too long: Maximum is 9999 beats`;
      } else {
        errorMessage = `⚠️ Invalid number`;
      }
      
      // Create and show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'beat-error-message';
      errorDiv.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 11px;
        color: #721c24;
        z-index: 1000;
        margin-top: 4px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      `;
      errorDiv.textContent = errorMessage;
      
      // Insert after the input container
      const inputContainer = container.querySelector('.input-container');
      if (inputContainer) {
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(errorDiv);
      }
      
      console.warn(`❌ ${errorMessage}`);
      return;
    }
    
    // Valid input - proceed with update
    voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeBeats = newBeats;
    
    const equivalentMs = beatsToMs(newBeats, beatUnit, tempo);
    voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeMs = equivalentMs;
    
    // NEW: Update events array when timeline length changes
    const lifeSpanParam = voiceData[currentVoice].parameters['LIFE SPAN'];
    if (lifeSpanParam.events && lifeSpanParam.events.length > 0) {
      // Find and update the default-end event
      const endEvent = lifeSpanParam.events.find(event => event.id === 'default-end');
      if (endEvent) {
        const oldBeat = endEvent.beatPosition;
        endEvent.beatPosition = newBeats;
        
        if (DEBUG.EVENTS) {
          console.log(`🔄 Updated default-end event: ${oldBeat} → ${newBeats} beats`);
        }
      }
      
      // If no default-end event exists, create one
      if (!endEvent) {
        lifeSpanParam.events.push({
          type: 'mute',
          beatPosition: newBeats,
          action: 'mute',
          id: 'default-end'
        });
        
        if (DEBUG.EVENTS) {
          console.log(`➕ Created default-end event at beat ${newBeats}`);
        }
      }
    }
    
    // Update displays
    const timeFormatted = formatMsToMMSS(equivalentMs);
    if (lifeSpanEqualsTime) lifeSpanEqualsTime.textContent = `= ${timeFormatted}`;
    if (lifeSpanTimeInput) lifeSpanTimeInput.value = timeFormatted;
    
    // Visual feedback - valid input
    e.target.style.borderColor = '#28a745';
    e.target.style.backgroundColor = '#f8fff8';
    
    console.log(`🎵 Beat mode: ${newBeats} beats = ${timeFormatted} @ ${tempo} BPM`);
    
    // NEW: Update Visual Timeline instead of rebuilding obsolete sliders
if (visualTimeline && visualTimeline.isVisible) {
  visualTimeline.updateVoiceData(); // Update cached data first
  visualTimeline.refresh();         // Then refresh display
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Timeline refreshed for parameter change`);
  }
}
    
    // Clear visual feedback
    setTimeout(() => {
      e.target.style.borderColor = '#4a90e2';
      e.target.style.backgroundColor = '#f8f9fa';
    }, 2000);
  };
  
  lifeSpanBeatCountInput.onkeypress = function(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
}



// Connect Time Input  
if (lifeSpanTimeInput) {
  lifeSpanTimeInput.oninput = function(e) {
    const value = e.target.value; // This is "0:05"
    const parsedMs = parseMMSSToMs(value); // This is 5000ms
    
    if (parsedMs !== null && parsedMs >= 5000 && parsedMs <= 3600000) {
      const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
      const beatUnit = lifeSpan.beatUnit;
      const tempo = getCurrentTempoForVoice(currentVoice);
      
      const equivalentBeats = msToBeats(parsedMs, beatUnit, tempo); // This is 12 beats
      
      // Update storage
      voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeBeats = equivalentBeats;
      voiceData[currentVoice].parameters['LIFE SPAN'].maxTimeMs = parsedMs;
      
      // NEW: Update events array when timeline length changes
      const lifeSpanParam = voiceData[currentVoice].parameters['LIFE SPAN'];
      if (lifeSpanParam.events && lifeSpanParam.events.length > 0) {
        // Find and update the default-end event
        const endEvent = lifeSpanParam.events.find(event => event.id === 'default-end');
        if (endEvent) {
          const oldBeat = endEvent.beatPosition;
          endEvent.beatPosition = equivalentBeats;
          
          if (DEBUG.EVENTS) {
            console.log(`🔄 Updated default-end event: ${oldBeat} → ${equivalentBeats} beats`);
          }
        }
        
        // If no default-end event exists, create one
        if (!endEvent) {
          lifeSpanParam.events.push({
            type: 'mute',
            beatPosition: equivalentBeats,
            action: 'mute',
            id: 'default-end'
          });
          
          if (DEBUG.EVENTS) {
            console.log(`➕ Created default-end event at beat ${equivalentBeats}`);
          }
        }
      }
      
      // FIXED: Show the original time value, not a recalculated one
      if (lifeSpanEqualsTime) lifeSpanEqualsTime.textContent = `= ${value}`; // Shows "= 0:05"
      
      // Update beat input
      if (lifeSpanBeatCountInput) lifeSpanBeatCountInput.value = equivalentBeats;
      
      // Update "= beats" display for when user switches back to beat mode
      if (lifeSpanEqualsBeats) lifeSpanEqualsBeats.textContent = `= ${equivalentBeats} beats`;
      
      console.log(`⏰ Time mode: ${value} = ${equivalentBeats} beats @ ${tempo} BPM`);
      
      // NEW: Update Visual Timeline instead of rebuilding obsolete sliders
if (visualTimeline && visualTimeline.isVisible) {
  visualTimeline.updateVoiceData(); // Update cached data first
  visualTimeline.refresh();         // Then refresh display
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Timeline refreshed for parameter change`);
  }
}
      
      // Visual feedback
      e.target.style.borderColor = '#28a745';
      e.target.style.backgroundColor = '#f8fff8';
      setTimeout(() => {
        e.target.style.borderColor = '#6c757d';
        e.target.style.backgroundColor = '';
      }, 2000);
      
    } else {
      // Invalid input feedback
      e.target.style.borderColor = '#dc3545';
      e.target.style.backgroundColor = '#fff8f8';
      setTimeout(() => {
        e.target.style.borderColor = '#6c757d';
        e.target.style.backgroundColor = '';
      }, 3000);
    }
  };
  
  lifeSpanTimeInput.onkeypress = function(e) {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
}

// Connect quick preset buttons
const lifeSpanPresetButtons = container.querySelectorAll('.preset-btn');
lifeSpanPresetButtons.forEach(button => {
  button.onclick = function() {
    const presetBeats = parseInt(this.dataset.beats);
    
    // Check if preset is valid before applying
    const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
    const beatUnit = lifeSpan.beatUnit;
    const tempo = getCurrentTempoForVoice(currentVoice);
    const minimumBeats = Math.max(2, msToBeats(5000, beatUnit, tempo));
    
    if (presetBeats < minimumBeats) {
      // Visual feedback for invalid preset
      this.style.background = '#dc3545';
      this.style.color = 'white';
      this.style.borderColor = '#dc3545';
      
      // Show tooltip-style error
      const errorTooltip = document.createElement('div');
      errorTooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        white-space: nowrap;
        z-index: 1000;
        margin-bottom: 4px;
      `;
      errorTooltip.textContent = `Too short! Min: ${minimumBeats} beats`;
      
      this.style.position = 'relative';
      this.appendChild(errorTooltip);
      
      // Remove error feedback after 3 seconds
      setTimeout(() => {
        this.style.background = '';
        this.style.color = '';
        this.style.borderColor = '';
        if (errorTooltip.parentNode) {
          errorTooltip.remove();
        }
      }, 3000);
      
      const actualSeconds = beatsToMs(presetBeats, beatUnit, tempo) / 1000;
      console.warn(`❌ Preset ${presetBeats} beats too short: ${actualSeconds.toFixed(1)}s (minimum: 5s = ${minimumBeats} beats)`);
      return;
    }
    
    // Valid preset - apply it
    if (lifeSpanBeatCountInput) {
      lifeSpanBeatCountInput.value = presetBeats;
      
      // Trigger the input event to update everything
      const inputEvent = new Event('input', { bubbles: true });
      lifeSpanBeatCountInput.dispatchEvent(inputEvent);
    }
    
    // Visual feedback - success
    this.style.background = '#28a745';
    this.style.color = 'white';
    setTimeout(() => {
      this.style.background = '';
      this.style.color = '';
    }, 500);
    
    console.log(`🎯 Quick preset: ${presetBeats} beats`);
  };
});


// Connect Repeat checkbox
  const repeatCheckbox = behaviorContainer ? behaviorContainer.querySelector('.repeat-checkbox') : null;
  if (repeatCheckbox) {
    repeatCheckbox.onchange = function(e) {
      // NEW: Capture state before repeat change
      if (undoManager && undoManager.isCapturing) {
        const action = e.target.checked ? 'enabled' : 'disabled';
        undoManager.captureState(`Repeat ${action}`, true);
      }
      
      voiceData[currentVoice].parameters['LIFE SPAN'].repeat = e.target.checked;
      console.log(`✅ Voice ${currentVoice + 1} Repeat = ${e.target.checked}`);
    };
  }

  
  // Connect Life Span sliders
  const spanSliders = container.querySelectorAll('.life-span-dual-slider');
  
  spanSliders.forEach((sliderContainer) => {
    const spanNumber = parseInt(sliderContainer.dataset.spanNumber);
    const slider = sliderContainer.querySelector('.noUi-target');
    
    if (slider && slider.noUiSlider) {
      console.log(`🔗 Connecting Life Span ${spanNumber} slider for Voice ${currentVoice + 1}`);
      
      slider.noUiSlider.off('update');
      slider.noUiSlider.on('update', function(values) {
        const enterValue = values[0];
        const exitValue = values[1];
        
        // Parse beat counts from formatter
        const formatter = createLifeSpanBeatFormatter(currentVoice, voiceData[currentVoice].parameters['LIFE SPAN'].beatUnit);
        const enterBeats = Math.round(formatter.from(enterValue));
        const exitBeats = Math.round(formatter.from(exitValue));
        
        // Store BEATS directly (primary storage)
        const lifeSpan = voiceData[currentVoice].parameters['LIFE SPAN'];
        lifeSpan[`lifeSpan${spanNumber}`].enterBeats = enterBeats;
        lifeSpan[`lifeSpan${spanNumber}`].exitBeats = exitBeats;
        
        // Update LEGACY milliseconds storage (for backward compatibility)
        const tempo = getCurrentTempoForVoice(currentVoice);
        const beatUnit = lifeSpan.beatUnit;
        
        lifeSpan[`lifeSpan${spanNumber}Legacy`] = {
          enter: beatsToMs(enterBeats, beatUnit, tempo),
          exit: beatsToMs(exitBeats, beatUnit, tempo)
        };
        
        console.log(`✅ Life Span ${spanNumber}: ${enterBeats}-${exitBeats} beats`);
      });
    } else {
      console.warn(`❌ Life Span ${spanNumber} slider not found`);
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
      
      // NEW: Disable undo capturing during preset load
        if (undoManager) {
          undoManager.isCapturing = false;
        }

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
            
          // NEW: Re-enable undo and clear history after preset load
            if (undoManager) {
              undoManager.isCapturing = true;
              undoManager.clear();
              updateUndoRedoButtons();
              
              if (DEBUG.UNDO_REDO) {
                console.log('🔓 Undo re-enabled after preset load');
                console.log('   History cleared for fresh start');
              }
            }    

            return true;
            
        } catch (error) {
            console.error('❌ Error loading preset:', error);
            return false;
        }
    
        // Apply voice data
    for (let i = 0; i < 16; i++) {
      if (preset.voices[i]) {
        voiceData[i].enabled = preset.voices[i].enabled;
        voiceData[i].locked = preset.voices[i].locked;
        voiceData[i].parameters = this.deepClone(preset.voices[i].parameters);
      }
    }
    
    // NEW: Migrate legacy data if needed
    migrateLegacyLifeSpanData();
    
    // ... rest of existing code ...
    
    return true;
    
  } catch (error) {
    console.error('❌ Error loading preset:', error);
    return false;
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
  
  // Check timing gaps during active monitoring (playback) - RESTORED with seeking tolerance
  if (this.lastCheckTime > 0) {
    const timeDelta = now - this.lastCheckTime;
    
    // IMPROVED: More tolerant gap detection (1 second instead of 200ms)
    // This accounts for seeking operations that legitimately cause timing jumps
    if (timeDelta > 1.0) { // 1 second gap during playback is suspicious
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

// ===== UNDO/REDO MANAGER CLASS =====
class UndoManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.maxStates = 50;
    this.isCapturing = true;
    this.lastCaptureTime = 0;
    this.captureThrottleMs = 500; // Don't capture more than once per 500ms
    
    if (DEBUG.UNDO_REDO) {
      console.log('🔄 UndoManager initialized');
      console.log(`   Max states: ${this.maxStates}`);
      console.log(`   Throttle: ${this.captureThrottleMs}ms`);
    }
  }
  
  /**
   * Capture current application state
   * @param {string} actionName - Description of the action being performed
   * @param {boolean} force - Bypass throttle if true
   */
  captureState(actionName, force = false) {
    if (!this.isCapturing) {
      if (DEBUG.UNDO_REDO) {
        console.log(`⏸️ Capture disabled, skipping: ${actionName}`);
      }
      return;
    }
    
    // Throttle captures to prevent duplicate states during drag operations
    const now = Date.now();
    if (!force && (now - this.lastCaptureTime) < this.captureThrottleMs) {
      if (DEBUG.UNDO_REDO) {
        console.log(`⏭️ Throttled capture: ${actionName} (${now - this.lastCaptureTime}ms since last)`);
      }
      return;
    }
    
    try {
      const state = {
        timestamp: now,
        action: actionName,
        voiceData: JSON.parse(JSON.stringify(voiceData)), // Deep clone
        currentVoice: currentVoice,
        timelineViewActive: timelineViewActive
      };
      
      this.undoStack.push(state);
      
      // Limit stack size
      if (this.undoStack.length > this.maxStates) {
        this.undoStack.shift();
        if (DEBUG.UNDO_REDO) {
          console.log(`   Stack trimmed to ${this.maxStates} states`);
        }
      }
      
      // Clear redo stack when new action performed
      this.redoStack = [];
      
      this.lastCaptureTime = now;
      
      if (DEBUG.UNDO_REDO) {
        console.log(`📸 Captured state: "${actionName}"`);
        console.log(`   Stack size: ${this.undoStack.length} undo, ${this.redoStack.length} redo`);
        console.log(`   Current voice: ${currentVoice + 1}`);
      }
      
      // NEW: Update button states
      updateUndoRedoButtons();

    } catch (error) {
      console.error('❌ Error capturing state:', error);
    }
  }
  
  /**
   * Undo the last action
   * @returns {boolean} True if undo was performed
   */
  undo() {
    if (this.undoStack.length === 0) {
      if (DEBUG.UNDO_REDO) {
        console.log('⚠️ Nothing to undo');
      }
      return false;
    }
    
    if (DEBUG.UNDO_REDO) {
      console.log(`⮪ UNDO requested (stack: ${this.undoStack.length})`);
    }
    
    // Save current state to redo stack BEFORE undoing
    const currentState = {
      timestamp: Date.now(),
      action: 'Current State (before undo)',
      voiceData: JSON.parse(JSON.stringify(voiceData)),
      currentVoice: currentVoice,
      timelineViewActive: timelineViewActive
    };
    this.redoStack.push(currentState);
    
    // Restore previous state
    const previousState = this.undoStack.pop();
    this.restoreState(previousState, 'UNDO');
    
    if (DEBUG.UNDO_REDO) {
      console.log(`✅ Undid: "${previousState.action}"`);
      console.log(`   New stack: ${this.undoStack.length} undo, ${this.redoStack.length} redo`);
    }
    
    return true;
  }
  
  /**
   * Redo the last undone action
   * @returns {boolean} True if redo was performed
   */
  redo() {
    if (this.redoStack.length === 0) {
      if (DEBUG.UNDO_REDO) {
        console.log('⚠️ Nothing to redo');
      }
      return false;
    }
    
    if (DEBUG.UNDO_REDO) {
      console.log(`⮫ REDO requested (stack: ${this.redoStack.length})`);
    }
    
    // Save current state to undo stack BEFORE redoing
    const currentState = {
      timestamp: Date.now(),
      action: 'Current State (before redo)',
      voiceData: JSON.parse(JSON.stringify(voiceData)),
      currentVoice: currentVoice,
      timelineViewActive: timelineViewActive
    };
    this.undoStack.push(currentState);
    
    // Restore next state
    const nextState = this.redoStack.pop();
    this.restoreState(nextState, 'REDO');
    
    if (DEBUG.UNDO_REDO) {
      console.log(`✅ Redid: "${nextState.action}"`);
      console.log(`   New stack: ${this.undoStack.length} undo, ${this.redoStack.length} redo`);
    }
    
    return true;
  }
  
    /**
   * Restore a saved state
   * @param {object} state - State object to restore
   * @param {string} operation - 'UNDO' or 'REDO' for logging
   */
  restoreState(state, operation) {
    if (DEBUG.UNDO_REDO) {
      console.log(`🔄 Restoring state from ${operation}: "${state.action}"`);
    }
    
    // Disable capturing during restoration
    this.isCapturing = false;
    
    try {
      // Restore voice data
      voiceData = JSON.parse(JSON.stringify(state.voiceData));
      currentVoice = state.currentVoice;
      
      if (DEBUG.UNDO_REDO) {
        console.log(`   ✓ voiceData restored`);
        console.log(`   ✓ currentVoice = ${currentVoice + 1}`);
      }
      
      // Close timeline view if it was open
      if (timelineViewActive && !state.timelineViewActive) {
        closeTimelineView();
      }
      
      // Refresh UI
      createVoiceTabs();
      
      if (DEBUG.UNDO_REDO) {
        console.log(`   ✓ Voice tabs refreshed`);
      }
      
      renderParameters();
      
      if (DEBUG.UNDO_REDO) {
        console.log(`   ✓ Parameters rendered`);
        console.log(`   ⏱️ Waiting 200ms for sliders to initialize...`);
      }
      
      // Wait for sliders to be created and ready
      const self = this; // Capture 'this' for use in setTimeout
      
      setTimeout(() => {
        if (DEBUG.UNDO_REDO) {
          console.log(`   🔌 Connecting sliders...`);
        }
        
        connectAllSliders();
        
        if (DEBUG.UNDO_REDO) {
          console.log(`   ✓ connectAllSliders() completed`);
          console.log(`   ⏱️ Waiting 200ms more for slider connections...`);
        }
        
        // Additional delay for sliders to fully connect
        setTimeout(() => {
          if (DEBUG.UNDO_REDO) {
            console.log(`   🔧 About to force-update sliders...`);
            console.log(`   'this' context:`, self);
            console.log(`   forceUpdateAllSliders exists:`, typeof self.forceUpdateAllSliders);
          }
          
          self.forceUpdateAllSliders();
          
          // Re-enable capturing
          self.isCapturing = true;
          
          if (DEBUG.UNDO_REDO) {
            console.log(`✅ State restoration complete`);
            console.log(`   Active voice: ${currentVoice + 1}`);
            console.log(`   Capturing re-enabled`);
          }
          
        }, 200); // Increased delay
        
      }, 200); // Increased delay
      
    } catch (error) {
      console.error(`❌ Error restoring state:`, error);
      console.error(`   Error details:`, error.message);
      console.error(`   Stack trace:`, error.stack);
      this.isCapturing = true; // Re-enable even on error
    }
  }

  
    /**
   * Force all sliders to update to current voiceData values
   * Called after state restoration to ensure visual sync
   */
  forceUpdateAllSliders() {
    const parameterSection = document.getElementById('parameter-section');
    if (!parameterSection) {
      if (DEBUG.UNDO_REDO) {
        console.error(`   ❌ parameterSection not found!`);
      }
      return;
    }
    
    const allSliders = parameterSection.querySelectorAll('.noUi-target');
    
    if (DEBUG.UNDO_REDO) {
      console.log(`🔧 Force-updating ${allSliders.length} sliders...`);
    }
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    allSliders.forEach((slider, index) => {
      if (DEBUG.UNDO_REDO) {
        console.log(`   [${index + 1}/${allSliders.length}] Checking slider...`);
      }
      
      if (!slider.noUiSlider) {
        if (DEBUG.UNDO_REDO) {
          console.log(`      ⚠️ No noUiSlider instance`);
        }
        skippedCount++;
        return;
      }
      
      try {
        const row = slider.closest('.row-container-content');
        const rollup = row ? row.closest('.parameter-rollup') : null;
        const rollupTitle = rollup ? rollup.querySelector('.parameter-rollup-title') : null;
        const paramName = rollupTitle ? rollupTitle.textContent.trim() : null;
        
        if (DEBUG.UNDO_REDO) {
          console.log(`      Parameter: ${paramName || 'UNKNOWN'}`);
        }
        
        if (!paramName) {
          if (DEBUG.UNDO_REDO) {
            console.log(`      ⚠️ Could not determine parameter name`);
          }
          skippedCount++;
          return;
        }
        
        if (!voiceData[currentVoice].parameters[paramName]) {
          if (DEBUG.UNDO_REDO) {
            console.log(`      ⚠️ Parameter not found in voiceData`);
          }
          skippedCount++;
          return;
        }
        
        const paramData = voiceData[currentVoice].parameters[paramName];
        
        if (DEBUG.UNDO_REDO) {
          console.log(`      Data:`, paramData);
        }
        
        // Handle different parameter types
        if (paramName === 'MELODIC RANGE') {
          if (DEBUG.UNDO_REDO) {
            console.log(`      ⏭️ Skipping (piano keyboard handles this)`);
          }
          skippedCount++;
          return;
        } else if (typeof paramData.min === 'number' && typeof paramData.max === 'number') {
          // Single-dual parameter
          const oldValues = slider.noUiSlider.get();
          slider.noUiSlider.set([paramData.min, paramData.max]);
          const newValues = slider.noUiSlider.get();
          updatedCount++;
          
          if (DEBUG.UNDO_REDO) {
            console.log(`      ✓ ${paramName}: [${oldValues[0]}, ${oldValues[1]}] → [${paramData.min}, ${paramData.max}]`);
            console.log(`         Slider now shows: [${newValues[0]}, ${newValues[1]}]`);
          }
        } else if (paramData.speed || paramData.depth || paramData.feedback) {
          // Multi-dual parameter
          const sliderWrapper = slider.closest('.slider-wrapper');
          const label = sliderWrapper ? sliderWrapper.querySelector('.slider-label')?.textContent.trim().toLowerCase() : '';
          
          if (DEBUG.UNDO_REDO) {
            console.log(`      Multi-dual slider label: "${label}"`);
          }
          
          if (label.includes('speed') || label.includes('time')) {
            if (paramData.speed) {
              slider.noUiSlider.set([paramData.speed.min, paramData.speed.max]);
              updatedCount++;
              if (DEBUG.UNDO_REDO) {
                console.log(`      ✓ Speed: [${paramData.speed.min}, ${paramData.speed.max}]`);
              }
            }
          } else if (label.includes('depth') || label.includes('mix')) {
            if (paramData.depth) {
              slider.noUiSlider.set([paramData.depth.min, paramData.depth.max]);
              updatedCount++;
              if (DEBUG.UNDO_REDO) {
                console.log(`      ✓ Depth: [${paramData.depth.min}, ${paramData.depth.max}]`);
              }
            }
          } else if (label.includes('feedback')) {
            if (paramData.feedback) {
              slider.noUiSlider.set([paramData.feedback.min, paramData.feedback.max]);
              updatedCount++;
              if (DEBUG.UNDO_REDO) {
                console.log(`      ✓ Feedback: [${paramData.feedback.min}, ${paramData.feedback.max}]`);
              }
            }
          }
        } else {
          if (DEBUG.UNDO_REDO) {
            console.log(`      ⚠️ Unknown parameter structure`);
          }
          skippedCount++;
        }
        
      } catch (error) {
        // Slider might not be ready, skip it
        if (DEBUG.UNDO_REDO) {
          console.error(`      ❌ Error updating slider:`, error.message);
        }
        skippedCount++;
      }
    });
    
    if (DEBUG.UNDO_REDO) {
      console.log(`✅ Slider update complete: ${updatedCount} updated, ${skippedCount} skipped`);
    }
    
    // Update behavior sliders
    this.forceUpdateBehaviorSliders();
  }

  
  /**
   * Force behavior sliders to update to current values
   */
  forceUpdateBehaviorSliders() {
    const parameterSection = document.getElementById('parameter-section');
    if (!parameterSection) return;
    
    const behaviorSliders = parameterSection.querySelectorAll('.behavior-slider-wrapper input[type="range"]');
    
    behaviorSliders.forEach((slider) => {
      const row = slider.closest('.row-container') || 
                slider.closest('.parameter-rollup-content')?.closest('.parameter-rollup');
      const label = row ? (row.querySelector('.parameter-rollup-title') || row.querySelector('.label-container')) : null;
      const paramName = label ? label.textContent.trim() : null;
      
      if (!paramName || !voiceData[currentVoice].parameters[paramName]) return;
      
      try {
        const paramData = voiceData[currentVoice].parameters[paramName];
        let behaviorValue;
        
        if (paramName === 'PHRASE STYLES') {
          behaviorValue = paramData.behavior || 50;
        } else {
          behaviorValue = paramData.behavior || 50;
        }
        
        slider.value = behaviorValue;
        
        // Update tooltip
        const tooltip = slider.parentElement.querySelector('.behavior-tooltip');
        if (tooltip) {
          tooltip.textContent = behaviorValue + '%';
          
          const percentage = (behaviorValue - parseInt(slider.min)) / (parseInt(slider.max) - parseInt(slider.min));
          const sliderWidth = slider.offsetWidth;
          const thumbWidth = 16;
          const offset = percentage * (sliderWidth - thumbWidth) + (thumbWidth / 2);
          tooltip.style.left = `${offset}px`;
        }
        
        if (DEBUG.UNDO_REDO) {
          console.log(`   ✓ ${paramName} behavior: ${behaviorValue}%`);
        }
        
      } catch (error) {
        // Skip on error
      }
    });
  }

  
  /**
   * Clear all undo/redo history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
    
    if (DEBUG.UNDO_REDO) {
      console.log('🗑️ Undo/redo history cleared');
    }
  }
  
  /**
   * Get current stack sizes
   * @returns {object} Stack statistics
   */
  getStats() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      isCapturing: this.isCapturing
    };
  }
}

// ===== SMALL CONTEXT MENU COMPONENT =====
class SmallContextMenu {
  static show(options, clientX, clientY) {
    // Remove existing menu
    const existing = document.querySelector('.small-context-menu');
    if (existing) existing.remove();
    
    const menu = document.createElement('div');
    menu.className = 'small-context-menu';
    menu.style.cssText = `
      position: fixed;
      left: ${clientX + 10}px;
      top: ${clientY - 10}px;
      background: white;
      border: 2px solid #4a90e2;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 140px;
      overflow: hidden;
      user-select: none;
    `;
    
    // Add header if provided
    if (options.header) {
      const header = document.createElement('div');
      header.style.cssText = `
        background: #4a90e2;
        color: white;
        padding: 8px 12px;
        font-weight: 600;
        font-size: 12px;
        border-bottom: 1px solid #357abd;
      `;
      header.textContent = options.header;
      menu.appendChild(header);
    }
    
    // Add menu items
    options.items.forEach((option, index) => {
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.style.cssText = `
        padding: 10px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s ease;
        font-size: 13px;
        border-bottom: ${index < options.items.length - 1 ? '1px solid #f0f0f0' : 'none'};
      `;
      
      item.innerHTML = `
        <span style="font-size: 14px; min-width: 16px;">${option.icon}</span>
        <span style="flex: 1;">${option.text}</span>
      `;
      
      // Hover effects
      item.onmouseenter = function() {
        this.style.background = '#f8f9fa';
      };
      item.onmouseleave = function() {
        this.style.background = '';
      };
      
      // Click handler
      item.onclick = () => {
        try {
          option.action();
        } catch (error) {
          console.error(`❌ Context menu action failed:`, error);
        }
        menu.remove();
      };
      
      menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Auto-close on outside click
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 100);
  }
}

// ===== VIEW STATE MANAGER CLASS =====
class ViewStateManager {
  constructor() {
    this.currentMode = 'timeline';
    this.states = {
      parameter: {
        currentVoice: 0,
        rollupStates: new Map(),
        scrollPosition: 0,
        playheadPosition: 0,
        visualTimelineState: {
          zoomLevel: 1.0,
          panOffset: 0,
          showBeatIndicator: true
        },
        preservedSliders: new Map()
      },
      timeline: {
        selectedVoices: new Set(),
        masterScrollPosition: 0,
        voiceTrackStates: new Map(),
        playheadPosition: 0
      }
    };
    
    this.isTransitioning = false;
  }
  
  captureCurrentState() {
    const currentState = this.states[this.currentMode];
    
    if (this.currentMode === 'parameter') {
      // Capture parameter view state
      currentState.currentVoice = currentVoice;
      currentState.playheadPosition = masterClock ? masterClock.getElapsedTime() : 0;
      
      // Capture rollup states (only changed ones for performance)
      Object.keys(parameterRollupState).forEach(paramName => {
        if (parameterRollupState[paramName] !== false) { // Only store non-default
          currentState.rollupStates.set(paramName, parameterRollupState[paramName]);
        }
      });
      
      // Capture scroll position
      const parameterSection = document.getElementById('parameter-section');
      if (parameterSection) {
        currentState.scrollPosition = parameterSection.scrollTop;
      }
      
      // Capture visual timeline state
      if (visualTimeline && visualTimeline.isVisible) {
        currentState.visualTimelineState = {
          zoomLevel: visualTimeline.zoomLevel,
          panOffset: visualTimeline.panOffset,
          showBeatIndicator: visualTimeline.showBeatIndicator
        };
      }
      
      // NEW: Preserve slider instances for performance
      currentState.preservedSliders = this.preserveSliderInstances();


      if (DEBUG.TIMELINE) {
        console.log(`💾 Captured Parameter View state: voice ${currentState.currentVoice + 1}`);
        console.log(`   Rollups: ${currentState.rollupStates.size} expanded`);
        console.log(`   Scroll: ${currentState.scrollPosition}px`);
        console.log(`   Zoom: ${currentState.visualTimelineState.zoomLevel}x`);
      }
    } else {
      // Capture timeline view state
      currentState.playheadPosition = masterClock ? masterClock.getElapsedTime() : 0;
      
      // Capture enabled voices
      currentState.selectedVoices.clear();
      voiceData.forEach((voice, index) => {
        if (voice.enabled) {
          currentState.selectedVoices.add(index);
        }
      });
      
      // Capture master scroll position
      const tracksArea = document.querySelector('.master-tracks-area');
      if (tracksArea) {
        currentState.masterScrollPosition = tracksArea.scrollTop;
      }
      
      if (DEBUG.TIMELINE) {
        console.log(`💾 Captured Timeline View state`);
        console.log(`   Selected voices: ${Array.from(currentState.selectedVoices).map(i => i + 1).join(', ')}`);
        console.log(`   Scroll: ${currentState.masterScrollPosition}px`);
      }
    }
  }
  
  restoreState(targetMode) {
    const targetState = this.states[targetMode];
    
    if (targetMode === 'parameter') {
      // Restore parameter view state
      if (targetState.currentVoice !== currentVoice) {
        selectVoice(targetState.currentVoice);
      }
      
      // Restore rollup states
      targetState.rollupStates.forEach((isExpanded, paramName) => {
        if (parameterRollupState[paramName] !== isExpanded) {
          toggleParameterRollup(paramName);
        }
      });
      
      // Restore scroll position (with delay for DOM to settle)
      setTimeout(() => {
        const parameterSection = document.getElementById('parameter-section');
        if (parameterSection) {
          parameterSection.scrollTop = targetState.scrollPosition;
        }
      }, 100);
      
      // Restore visual timeline state
      if (visualTimeline && targetState.visualTimelineState) {
        visualTimeline.zoomLevel = targetState.visualTimelineState.zoomLevel;
        visualTimeline.panOffset = targetState.visualTimelineState.panOffset;
        visualTimeline.showBeatIndicator = targetState.visualTimelineState.showBeatIndicator;
        
        if (visualTimeline.isVisible) {
          visualTimeline.applyZoomAndPan();
          visualTimeline.updateZoomControls();
        }
      }
      
      // NEW: Restore slider instances for performance
setTimeout(() => {
  this.restoreSliderInstances(targetState.preservedSliders);
}, 150); // After connectAllSliders() completes


      if (DEBUG.TIMELINE) {
        console.log(`♻️ Restored Parameter View state`);
      }
    } else {
      // Restore timeline view state  
      // Restore scroll position
      setTimeout(() => {
        const tracksArea = document.querySelector('.master-tracks-area');
        if (tracksArea) {
          tracksArea.scrollTop = targetState.masterScrollPosition;
        }
      }, 100);
      
      if (DEBUG.TIMELINE) {
        console.log(`♻️ Restored Timeline View state`);
      }
    }
  }
  
preserveSliderInstances() {
  const sliderMap = new Map();
  const parameterSection = document.getElementById('parameter-section');
  
  if (!parameterSection) return sliderMap;
  
  const sliders = parameterSection.querySelectorAll('.noUi-target');
  
  sliders.forEach(slider => {
    if (slider.noUiSlider) {
  // Generate unique key for this slider
  const row = slider.closest('.parameter-rollup');
  const paramName = row ? row.dataset.parameter : 'unknown';
  const sliderWrapper = slider.closest('.slider-wrapper');
  const label = sliderWrapper ? sliderWrapper.querySelector('.slider-label')?.textContent?.trim() : 'Range';

  // Fallback label detection for single-dual sliders
  let finalLabel = label;
  if (!finalLabel || finalLabel === '') {
    // Check if it's a single-dual slider (no explicit label)
    const dualSliderContainer = slider.closest('.dual-slider');
    if (dualSliderContainer && !sliderWrapper.querySelector('.slider-label')) {
      finalLabel = 'Range';
    }
  }

      
      const key = `${paramName}-${finalLabel}-${this.states.parameter.currentVoice}`;

      
      // Store the slider configuration, not the instance
      const config = {
        element: slider,
        values: slider.noUiSlider.get(),
        options: slider.noUiSlider.options
      };
      
      sliderMap.set(key, config);
      
      if (DEBUG.TIMELINE) {
        console.log(`💾 Preserved slider: ${key}`);
      }
    }
  });
  
  if (DEBUG.TIMELINE) {
    console.log(`✅ Preserved ${sliderMap.size} slider instances`);
  }
  
  return sliderMap;
}

restoreSliderInstances(sliderMap) {
  if (!sliderMap || sliderMap.size === 0) return;
  
  let restoredCount = 0;
  
  sliderMap.forEach((config, key) => {
    try {
      if (config.element && config.element.noUiSlider) {
        // Slider still exists and has instance - just update values
        config.element.noUiSlider.set(config.values);
        restoredCount++;
        
        if (DEBUG.TIMELINE) {
          console.log(`♻️ Restored slider values: ${key}`);
        }
      }
    } catch (error) {
      if (DEBUG.TIMELINE) {
        console.warn(`⚠️ Could not restore slider ${key}:`, error.message);
      }
    }
  });
  
  if (DEBUG.TIMELINE) {
    console.log(`✅ Restored ${restoredCount} slider instances`);
  }
}

switchMode(newMode) {
  if (newMode === this.currentMode || this.isTransitioning) {
    return false;
  }
  
  const startTime = performance.now();
  this.isTransitioning = true;
  
  if (DEBUG.TIMELINE) {
    console.log(`🔄 View switch: ${this.currentMode} → ${newMode}`);
  }
  
  // Step 1: Capture current state (with slider preservation)
  this.captureCurrentState();
  
  // Step 2: Switch views (preserve audio)
  const oldMode = this.currentMode;
  this.currentMode = newMode;
  
  this.renderViewMode(newMode);
  
  // Step 3: Restore new view state
  this.restoreState(newMode);
  
  // Step 4: Update button
  this.updateToggleButton(newMode);
  
  // Step 5: Performance measurement and cleanup
  // Immediate performance measurement
const performanceReport = this.measureSwitchPerformance(startTime, oldMode, newMode);

setTimeout(() => {
  this.isTransitioning = false;
  
  if (DEBUG.TIMELINE) {
    console.log(`✅ View switch complete: ${oldMode} → ${newMode} (${performanceReport.duration}ms)`);
  }
}, 50); // Reduced from 200ms

  
  return true;
}

  measureSwitchPerformance(startTime, fromMode, toMode) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  const performanceReport = {
    duration: Math.round(duration),
    fromMode,
    toMode,
    sliderCount: document.querySelectorAll('.noUi-target').length,
    rollupCount: document.querySelectorAll('.parameter-rollup').length,
    audioActive: masterClock ? masterClock.isActive() : false
  };
  
  if (duration > 100) {
    console.warn(`⚠️ SLOW view switch: ${duration.toFixed(1)}ms`, performanceReport);
  } else {
    console.log(`✅ Fast view switch: ${duration.toFixed(1)}ms`, performanceReport);
  }
  
  return performanceReport;
}

  renderViewMode(mode) {
    const parameterSection = document.getElementById('parameter-section');
    let masterTimelineContainer = document.getElementById('master-timeline-container');
    const mainContent = document.getElementById('main-content');
    
    if (mode === 'parameter') {
      // Show Parameter View
      if (parameterSection) {
        parameterSection.style.display = 'flex';
      }
      
      // Hide Master Timeline
      if (masterTimelineContainer) {
        masterTimelineContainer.style.display = 'none';
      }
      
      // Ensure individual visual timeline is shown (faster)
      if (!visualTimeline || !visualTimeline.isVisible) {
        showVisualTimeline();
      }

      
    } else {
      // Show Timeline View
      if (parameterSection) {
        parameterSection.style.display = 'none';
      }
      
      // Create or show Master Timeline
      if (!masterTimelineContainer) {
        masterTimelineContainer = this.createMasterTimelineContainer();
        mainContent.appendChild(masterTimelineContainer);
      }
      
      masterTimelineContainer.style.display = 'flex';
      
      // Render all voice timelines (immediate)
      this.renderAllVoiceTimelines();

    }
  }
  
  createMasterTimelineContainer() {
    const container = document.createElement('div');
    container.id = 'master-timeline-container';
    container.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #666;
        text-align: center;
        gap: 20px;
      ">
        <div style="font-size: 48px;">📊</div>
        <h2 style="margin: 0; color: #333;">Master Timeline View</h2>
        <p style="margin: 0; font-size: 16px;">Multi-voice timeline orchestration</p>
        <div style="font-size: 14px; color: #999;">
          Sessions 27-30 will implement this view
        </div>
      </div>
    `;
    
    return container;
  }
  
  renderAllVoiceTimelines() {
    // Placeholder for Session 27
    console.log('📊 renderAllVoiceTimelines() - placeholder for Session 27');
  }
  
  updateToggleButton(mode) {
    const toggleBtn = document.getElementById('view-toggle-btn');
    if (!toggleBtn) return;
    
    const icon = toggleBtn.querySelector('.view-icon');
    const text = toggleBtn.querySelector('.view-text');
    
    // NEW LOGIC: Timeline is primary, Parameter View is alternative
    if (mode === 'timeline') {
      // Currently in Timeline View (primary) → button shows "Parameter View" (alternative)
      if (icon) icon.textContent = '🎛️';
      if (text) text.textContent = 'Reference View';
      toggleBtn.classList.remove('active'); // Timeline is default, not highlighted
    } else {
      // Currently in Parameter View (alternative) → button shows "Timeline View" (primary)
      if (icon) icon.textContent = '📊';
      if (text) text.textContent = 'Timeline View';
      toggleBtn.classList.add('active'); // Parameter mode gets highlight (since it's alternative)
    }

    
    if (DEBUG.TIMELINE) {
      console.log(`🔘 Toggle button updated for ${mode} mode`);
    }
  }
}

// ===== CENTRALIZED EVENT REGISTRY SYSTEM =====

/**
 * Centralized Event Registry - manages all timeline events across all voices
 * Replaces the fragmented per-voice event system with unified architecture
 */
class EventRegistry {
  constructor() {
    // Core storage
    this.events = new Map();        // eventId -> full event data
    
    // Indexing maps for fast lookups
    this.voiceMap = new Map();      // voiceIndex -> Set<eventId>
    this.beatMap = new Map();       // beatPosition -> Set<eventId>
    this.paramMap = new Map();      // paramName -> Set<eventId>
    this.typeMap = new Map();       // eventType -> Set<eventId>
    this.regionMap = new Map();     // voiceIndex-regionIndex -> Set<eventId>
    
    // ID generation
    this.nextEventId = 1000;        // Start at 1000 for clear distinction
    
    // Statistics
    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      eventsByVoice: new Map(),
      lastOperation: null,
      operationCount: 0
    };
    
    console.log('🏗️ EventRegistry initialized with centralized architecture');
  }
  
  /**
   * Generate unique event ID
   * @returns {string} Formatted event ID (e.g., "REG-1000")
   */
  generateEventId() {
    const id = `REG-${this.nextEventId}`;
    this.nextEventId++;
    return id;
  }
  
  /**
   * Add event to registry with full indexing
   * @param {object} eventData - Complete event object
   * @returns {string} Generated event ID
   */
  addEvent(eventData) {
    const eventId = this.generateEventId();
    
    // Store complete event data
    const completeEvent = {
      id: eventId,
      timestamp: Date.now(),
      ...eventData
    };
    
    this.events.set(eventId, completeEvent);
    
    // Update all indexes
    this.updateIndexes(eventId, completeEvent);
    
    // Update statistics
    this.updateStats('add', completeEvent);
    
    console.log(`➕ EventRegistry: Added ${completeEvent.type} event ${eventId} for Voice ${completeEvent.voiceIndex + 1}`);
    
    return eventId;
  }
  
  /**
   * Update all indexing maps for an event
   * @private
   */
  updateIndexes(eventId, eventData) {
    // Voice index
    if (typeof eventData.voiceIndex === 'number') {
      if (!this.voiceMap.has(eventData.voiceIndex)) {
        this.voiceMap.set(eventData.voiceIndex, new Set());
      }
      this.voiceMap.get(eventData.voiceIndex).add(eventId);
    }
    
    // Beat position
    if (typeof eventData.beatPosition === 'number') {
      if (!this.beatMap.has(eventData.beatPosition)) {
        this.beatMap.set(eventData.beatPosition, new Set());
      }
      this.beatMap.get(eventData.beatPosition).add(eventId);
    }
    
    // Parameter name
    if (eventData.parameterName) {
      if (!this.paramMap.has(eventData.parameterName)) {
        this.paramMap.set(eventData.parameterName, new Set());
      }
      this.paramMap.get(eventData.parameterName).add(eventId);
    }
    
    // Event type
    if (eventData.type) {
      if (!this.typeMap.has(eventData.type)) {
        this.typeMap.set(eventData.type, new Set());
      }
      this.typeMap.get(eventData.type).add(eventId);
    }
    
    // Region relationship
    if (typeof eventData.voiceIndex === 'number' && typeof eventData.regionIndex === 'number') {
      const regionKey = `${eventData.voiceIndex}-${eventData.regionIndex}`;
      if (!this.regionMap.has(regionKey)) {
        this.regionMap.set(regionKey, new Set());
      }
      this.regionMap.get(regionKey).add(eventId);
    }
  }
  
  /**
   * Update statistics tracking
   * @private
   */
  updateStats(operation, eventData) {
    this.stats.lastOperation = operation;
    this.stats.operationCount++;
    
    if (operation === 'add') {
      this.stats.totalEvents++;
      
      // Count by type
      if (!this.stats.eventsByType.has(eventData.type)) {
        this.stats.eventsByType.set(eventData.type, 0);
      }
      this.stats.eventsByType.set(eventData.type, this.stats.eventsByType.get(eventData.type) + 1);
      
      // Count by voice
      if (!this.stats.eventsByVoice.has(eventData.voiceIndex)) {
        this.stats.eventsByVoice.set(eventData.voiceIndex, 0);
      }
      this.stats.eventsByVoice.set(eventData.voiceIndex, this.stats.eventsByVoice.get(eventData.voiceIndex) + 1);
    }
  }
  
    /**
   * Remove event from registry and all indexes
   * @param {string} eventId - Event ID to remove
   * @returns {boolean} True if event was removed
   */
  removeEvent(eventId) {
    const eventData = this.events.get(eventId);
    if (!eventData) {
      console.warn(`⚠️ EventRegistry: Event ${eventId} not found for removal`);
      return false;
    }
    
    // Remove from all indexes
    this.removeFromIndexes(eventId, eventData);
    
    // Remove main event
    this.events.delete(eventId);
    
    // Update statistics
    this.updateStats('remove', eventData);
    
    console.log(`➖ EventRegistry: Removed ${eventData.type} event ${eventId} from Voice ${eventData.voiceIndex + 1}`);
    return true;
  }
  
  /**
   * Update existing event
   * @param {string} eventId - Event ID to update
   * @param {object} newData - New event data (partial or complete)
   * @returns {boolean} True if event was updated
   */
  updateEvent(eventId, newData) {
    const existingEvent = this.events.get(eventId);
    if (!existingEvent) {
      console.warn(`⚠️ EventRegistry: Event ${eventId} not found for update`);
      return false;
    }
    
    // Remove old indexes
    this.removeFromIndexes(eventId, existingEvent);
    
    // Merge new data
    const updatedEvent = {
      ...existingEvent,
      ...newData,
      id: eventId, // Preserve original ID
      timestamp: Date.now() // Update timestamp
    };
    
    // Store updated event
    this.events.set(eventId, updatedEvent);
    
    // Update indexes with new data
    this.updateIndexes(eventId, updatedEvent);
    
    console.log(`🔄 EventRegistry: Updated event ${eventId} for Voice ${updatedEvent.voiceIndex + 1}`);
    return true;
  }
  
  /**
   * Get specific event by ID
   * @param {string} eventId - Event ID
   * @returns {object|null} Event data or null if not found
   */
  getEvent(eventId) {
    return this.events.get(eventId) || null;
  }
  
  /**
   * Get events by beat position
   * @param {number} beatPosition - Beat position to search
   * @param {number} tolerance - Optional tolerance for fuzzy matching
   * @returns {Array} Array of events at this beat
   */
  getEventsByBeat(beatPosition, tolerance = 0) {
    if (tolerance === 0) {
      // Exact match
      const eventIds = this.beatMap.get(beatPosition) || new Set();
      return Array.from(eventIds).map(id => this.events.get(id)).filter(Boolean);
    } else {
      // Fuzzy match within tolerance
      const matchingEvents = [];
      for (let beat = beatPosition - tolerance; beat <= beatPosition + tolerance; beat++) {
        const eventIds = this.beatMap.get(beat) || new Set();
        const events = Array.from(eventIds).map(id => this.events.get(id)).filter(Boolean);
        matchingEvents.push(...events);
      }
      return matchingEvents;
    }
  }
  
  /**
   * Get events by parameter name
   * @param {string} paramName - Parameter name
   * @returns {Array} Array of events for this parameter
   */
  getEventsByParameter(paramName) {
    const eventIds = this.paramMap.get(paramName) || new Set();
    return Array.from(eventIds).map(id => this.events.get(id)).filter(Boolean);
  }
  
  /**
   * Remove event from all indexes
   * @private
   */
  removeFromIndexes(eventId, eventData) {
    // Voice index
    if (this.voiceMap.has(eventData.voiceIndex)) {
      this.voiceMap.get(eventData.voiceIndex).delete(eventId);
      if (this.voiceMap.get(eventData.voiceIndex).size === 0) {
        this.voiceMap.delete(eventData.voiceIndex);
      }
    }
    
    // Beat position
    if (this.beatMap.has(eventData.beatPosition)) {
      this.beatMap.get(eventData.beatPosition).delete(eventId);
      if (this.beatMap.get(eventData.beatPosition).size === 0) {
        this.beatMap.delete(eventData.beatPosition);
      }
    }
    
    // Parameter name
    if (eventData.parameterName && this.paramMap.has(eventData.parameterName)) {
      this.paramMap.get(eventData.parameterName).delete(eventId);
      if (this.paramMap.get(eventData.parameterName).size === 0) {
        this.paramMap.delete(eventData.parameterName);
      }
    }
    
    // Event type
    if (this.typeMap.has(eventData.type)) {
      this.typeMap.get(eventData.type).delete(eventId);
      if (this.typeMap.get(eventData.type).size === 0) {
        this.typeMap.delete(eventData.type);
      }
    }
    
    // Region relationship
    if (typeof eventData.voiceIndex === 'number' && typeof eventData.regionIndex === 'number') {
      const regionKey = `${eventData.voiceIndex}-${eventData.regionIndex}`;
      if (this.regionMap.has(regionKey)) {
        this.regionMap.get(regionKey).delete(eventId);
        if (this.regionMap.get(regionKey).size === 0) {
          this.regionMap.delete(regionKey);
        }
      }
    }
  }
  
  /**
   * Find events within a beat range for a voice
   * @param {number} voiceIndex - Voice index (0-15)
   * @param {number} startBeat - Start beat (inclusive)
   * @param {number} endBeat - End beat (inclusive)
   * @returns {Array} Events within the beat range
   */
  getEventsInRange(voiceIndex, startBeat, endBeat) {
    const voiceEvents = this.getEventsForVoice(voiceIndex);
    return voiceEvents.filter(event => 
      event.beatPosition >= startBeat && event.beatPosition <= endBeat
    );
  }
  
  /**
   * Get all events as a simple array (for debugging)
   * @returns {Array} All events in the registry
   */
  getAllEvents() {
    return Array.from(this.events.values());
  }

// ===== END PARAMETER MANAGER =====

  /**
   * Get all events for a specific voice
   * @param {number} voiceIndex - Voice index (0-15)
   * @returns {Array} Array of event objects
   */
  getEventsForVoice(voiceIndex) {
    const eventIds = this.voiceMap.get(voiceIndex) || new Set();
    return Array.from(eventIds).map(id => this.events.get(id)).filter(Boolean);
  }
  
  /**
   * Get current registry statistics
   * @returns {object} Statistics summary
   */
  getStats() {
    return {
      totalEvents: this.stats.totalEvents,
      voiceCount: this.voiceMap.size,
      typeBreakdown: Object.fromEntries(this.stats.eventsByType),
      voiceBreakdown: Object.fromEntries(this.stats.eventsByVoice),
      lastOperation: this.stats.lastOperation,
      operationCount: this.stats.operationCount
    };
  }
  
  /**
   * Clear all events (for testing/reset)
   */
  clear() {
    this.events.clear();
    this.voiceMap.clear();
    this.beatMap.clear();
    this.paramMap.clear();
    this.typeMap.clear();
    this.regionMap.clear();
    
    this.stats.totalEvents = 0;
    this.stats.eventsByType.clear();
    this.stats.eventsByVoice.clear();
    
    console.log('🗑️ EventRegistry cleared');
  }
}

// ===== END EVENT REGISTRY SYSTEM =====

// ===== UNIVERSAL PARAMETER MANAGER =====

/**
 * Universal Parameter Manager - handles all parameter types across the application
 * Provides consistent parameter definitions, validation, and value collection
 */
class ParameterManager {
  static supportedParams = {
    // INSTRUMENT & SOUND PARAMETERS
    'INSTRUMENT': { 
      type: 'simple', 
      bounds: [0, 31],
      options: gmSounds,
      icon: '🎼'
    },
    'POLYPHONY': { 
      type: 'range', 
      bounds: [1, 16],
      icon: '🎛️'
    },
    'ATTACK VELOCITY': { 
      type: 'range', 
      bounds: [0, 127],
      icon: '⚡'
    },
    'DETUNING': { 
      type: 'range', 
      bounds: [-50, 50],
      icon: '🎚️'
    },
    'PORTAMENTO GLIDE TIME': { 
      type: 'range', 
      bounds: [0, 100],
      icon: '🌊'
    },
    
    // CHARACTER PARAMETERS
    'TEMPO (BPM)': { 
      type: 'range', 
      bounds: [40, 240],
      icon: '🎵'
    },
    'MELODIC RANGE': { 
      type: 'range', 
      bounds: [21, 108],
      icon: '🎹',
      special: 'piano-keyboard'
    },
    'PHRASE STYLES': {
      type: 'complex',
      icon: '🎭',
      special: 'phrase-patterns'
    },
    'RHYTHMS': { 
      type: 'multiselect', 
      options: rhythmOptions,
      icon: '🎶'
    },
    'RESTS': { 
      type: 'multiselect', 
      options: restOptions,
      icon: '⏸️'
    },
    
    // MIXING & LEVELS PARAMETERS
    'VOLUME': { 
      type: 'range', 
      bounds: [0, 100],
      icon: '🔊'
    },
    'STEREO BALANCE': { 
      type: 'range', 
      bounds: [-100, 100],
      icon: '⚖️'
    },
    
    // EFFECTS PARAMETERS
    'TREMOLO': { 
      type: 'effect', 
      bounds: [0, 100],
      icon: '〰️',
      subParams: ['speed', 'depth']
    },
    'CHORUS': { 
      type: 'effect', 
      bounds: [0, 100],
      icon: '🎭',
      subParams: ['speed', 'depth']
    },
    'PHASER': { 
      type: 'effect', 
      bounds: [0, 100],
      icon: '🌀',
      subParams: ['speed', 'depth']
    },
    'REVERB': { 
      type: 'effect', 
      bounds: [0, 100],
      icon: '🏛️',
      subParams: ['speed', 'depth']
    },
    'DELAY': { 
      type: 'effect', 
      bounds: [0, 100],
      icon: '⏰',
      subParams: ['speed', 'depth', 'feedback']
    }
  };
  
  /**
   * Get parameter definition
   * @param {string} paramName - Parameter name
   * @returns {object|null} Parameter definition or null if not found
   */
  static getParameterDefinition(paramName) {
    return this.supportedParams[paramName] || null;
  }
  
  /**
   * Check if parameter is supported for events
   * @param {string} paramName - Parameter name
   * @returns {boolean} True if supported
   */
  static isParameterSupported(paramName) {
    return paramName in this.supportedParams;
  }
  
  /**
   * Get all parameters by category for UI grouping
   * @returns {object} Parameters grouped by category
   */
  static getParametersByCategory() {
    return {
      instrument: [
        'INSTRUMENT',
        'POLYPHONY', 
        'ATTACK VELOCITY',
        'DETUNING',
        'PORTAMENTO GLIDE TIME'
      ],
      character: [
        'TEMPO (BPM)',
        'MELODIC RANGE'
      ],
      phraseBuilder: [
        'RHYTHMS',
        'RESTS',
        'PHRASE STYLES'
      ],
      mixing: [
        'VOLUME',
        'STEREO BALANCE'
      ],
      effects: [
        'TREMOLO',
        'CHORUS', 
        'PHASER',
        'REVERB',
        'DELAY'
      ]
    };
  }
  
  /**
   * Get parameter icon
   * @param {string} paramName - Parameter name
   * @returns {string} Icon emoji
   */
  static getIcon(paramName) {
    const def = this.getParameterDefinition(paramName);
    return def ? def.icon : '⚙️';
  }
  
  /**
   * Validate parameter value against bounds
   * @param {string} paramName - Parameter name
   * @param {any} value - Value to validate
   * @returns {boolean} True if valid
   */
  static validateValue(paramName, value) {
    const def = this.getParameterDefinition(paramName);
    if (!def) return false;
    
    switch (def.type) {
      case 'range':
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return value.min >= def.bounds[0] && value.max <= def.bounds[1] && value.min <= value.max;
        }
        return false;
        
      case 'simple':
        return typeof value === 'number' && value >= def.bounds[0] && value <= def.bounds[1];
        
      case 'multiselect':
        return Array.isArray(value) && value.every(v => 
          typeof v === 'number' && v >= 0 && v < def.options.length
        );
        
      case 'effect':
        // TODO: Implement effect validation
        return true;
        
      case 'complex':
        // TODO: Implement complex parameter validation
        return true;
        
      default:
        return false;
    }
  }
  
  /**
   * Get current value from voiceData for parameter
   * @param {number} voiceIndex - Voice index (0-15)
   * @param {string} paramName - Parameter name
   * @returns {any} Current parameter value
   */
  static getCurrentValue(voiceIndex, paramName) {
    if (!voiceData[voiceIndex] || !voiceData[voiceIndex].parameters[paramName]) {
      return null;
    }
    
    const param = voiceData[voiceIndex].parameters[paramName];
    const def = this.getParameterDefinition(paramName);
    
    if (!def) return null;
    
    switch (def.type) {
      case 'range':
        return {
          min: param.min,
          max: param.max,
          behavior: param.behavior || 50
        };
        
      case 'simple':
        // FIXED: Handle simple dropdown values correctly
        return typeof param === 'number' ? param : 0;
        
      case 'multiselect':
        return param.selectedValues || [];
        
      case 'effect':
        return {
          speed: param.speed ? (param.speed.min + param.speed.max) / 2 : 0,
          depth: param.depth ? (param.depth.min + param.depth.max) / 2 : 0,
          feedback: param.feedback ? (param.feedback.min + param.feedback.max) / 2 : 0
        };
        
      case 'complex':
        return param; // Return as-is for complex parameters
        
      default:
        return null;
    }
  }


}

// ===== END PARAMETER MANAGER =====


// ===== UNIVERSAL EVENT CREATOR =====

/**
 * Universal Event Creator - creates events for any parameter type
 * Integrates with EventRegistry and ParameterManager
 */
class EventCreator {
  /**
   * Create a parameter automation event
   * @param {number} voiceIndex - Target voice (0-15)
   * @param {string} parameterName - Parameter to automate
   * @param {number} beatPosition - When to trigger (absolute beat)
   * @param {any} newValue - New parameter value
   * @param {number} regionIndex - Which region this event belongs to
   * @param {number} relativePosition - Position within region (0.0-1.0)
   * @returns {string|null} Event ID if successful, null if failed
   */
  static createParameterEvent(voiceIndex, parameterName, beatPosition, newValue, regionIndex = 0, relativePosition = 0.5) {
    // Validate inputs
    if (!ParameterManager.isParameterSupported(parameterName)) {
      console.error(`❌ Parameter ${parameterName} not supported for events`);
      return null;
    }
    
    if (!ParameterManager.validateValue(parameterName, newValue)) {
      console.error(`❌ Invalid value for ${parameterName}:`, newValue);
      return null;
    }
    
    if (voiceIndex < 0 || voiceIndex >= 16) {
      console.error(`❌ Invalid voice index: ${voiceIndex}`);
      return null;
    }
    
    // Create event data
    const eventData = {
      type: 'parameter',
      voiceIndex: voiceIndex,
      parameterName: parameterName,
      beatPosition: Math.round(beatPosition), // Ensure integer beats
      regionIndex: regionIndex,
      relativePosition: Math.max(0, Math.min(1, relativePosition)),
      value: newValue,
      changeType: this.determineChangeType(parameterName, newValue)
    };
    
    // Add to registry
    const registry = getEventRegistry();
    const eventId = registry.addEvent(eventData);
    
    console.log(`💎 Created ${parameterName} event: ${JSON.stringify(newValue)} at beat ${beatPosition} (Voice ${voiceIndex + 1})`);
    
    return eventId;
  }
  
  /**
   * Determine change type based on parameter and value
   * @private
   */
  static determineChangeType(parameterName, value) {
    const def = ParameterManager.getParameterDefinition(parameterName);
    if (!def) return 'unknown';
    
    switch (def.type) {
      case 'range':
        return 'range';
      case 'simple':
        return 'dropdown';
      case 'multiselect':
        return 'multiselect';
      case 'effect':
        return 'effect';
      case 'complex':
        return 'complex';
      default:
        return 'unknown';
    }
  }
  
  /**
   * Quick helper to create VOLUME event
   * @param {number} voiceIndex - Voice index
   * @param {number} beatPosition - Beat position
   * @param {number} minVol - Minimum volume
   * @param {number} maxVol - Maximum volume
   * @returns {string|null} Event ID
   */
  static quickVolumeEvent(voiceIndex, beatPosition, minVol, maxVol) {
    return this.createParameterEvent(voiceIndex, 'VOLUME', beatPosition, {
      min: minVol,
      max: maxVol,
      behavior: 50
    });
  }
  
  /**
   * Quick helper to create INSTRUMENT event
   * @param {number} voiceIndex - Voice index
   * @param {number} beatPosition - Beat position
   * @param {number} instrumentIndex - GM instrument index (0-31)
   * @returns {string|null} Event ID
   */
  static quickInstrumentEvent(voiceIndex, beatPosition, instrumentIndex) {
    return this.createParameterEvent(voiceIndex, 'INSTRUMENT', beatPosition, instrumentIndex);
  }

    /**
   * Create compound event with multiple parameters
   * @param {number} voiceIndex - Target voice (0-15)
   * @param {number} beatPosition - When to trigger
   * @param {object} parameterChanges - Object with paramName -> newValue pairs
   * @param {number} regionIndex - Region index
   * @param {number} relativePosition - Position within region
   * @returns {string|null} Event ID if successful
   */
  static createCompoundEvent(voiceIndex, beatPosition, parameterChanges, regionIndex = 0, relativePosition = 0.5) {
    // Validate all parameters first
    const validatedChanges = {};
    let validationErrors = [];
    
    Object.keys(parameterChanges).forEach(paramName => {
      if (!ParameterManager.isParameterSupported(paramName)) {
        validationErrors.push(`${paramName} not supported`);
        return;
      }
      
      if (!ParameterManager.validateValue(paramName, parameterChanges[paramName])) {
        validationErrors.push(`${paramName} invalid value`);
        return;
      }
      
      validatedChanges[paramName] = {
        value: parameterChanges[paramName],
        changeType: this.determineChangeType(paramName, parameterChanges[paramName])
      };
    });
    
    if (validationErrors.length > 0) {
      console.error(`❌ Compound event validation failed:`, validationErrors);
      return null;
    }
    
    if (Object.keys(validatedChanges).length === 0) {
      console.error(`❌ No valid parameters in compound event`);
      return null;
    }
    
    // Create compound event
    const eventData = {
      type: 'compound-parameter',
      voiceIndex: voiceIndex,
      beatPosition: Math.round(beatPosition),
      regionIndex: regionIndex,
      relativePosition: Math.max(0, Math.min(1, relativePosition)),
      changes: validatedChanges,
      parameterNames: Object.keys(validatedChanges) // For quick lookup
    };
    
    // Add to registry
    const registry = getEventRegistry();
    const eventId = registry.addEvent(eventData);
    
    console.log(`💎 Created compound event: ${Object.keys(validatedChanges).join(', ')} at beat ${beatPosition} (Voice ${voiceIndex + 1})`);
    
    return eventId;
  }

}
// ===== END EVENT CREATOR =====

// ===== CENTRALIZED EVENT PROCESSOR =====

/**
 * Event Processor - handles event detection and application during playback
 * Replaces 16x voice loops with single efficient lookup system
 */
class EventProcessor {
  /**
   * Process all events at current beat position
   * Called by master clock during playback
   * @param {number} currentBeat - Current playhead beat position
   */
  static processAllEvents(currentBeat) {
    const registry = getEventRegistry();
    
    // Single efficient lookup - no 16x voice loops!
    const eventsToTrigger = registry.getEventsByBeat(currentBeat);
    
    if (eventsToTrigger.length === 0) return;
    
    console.log(`🎯 Processing ${eventsToTrigger.length} events at beat ${currentBeat}`);
    
    eventsToTrigger.forEach(event => {
      try {
        this.applyEventToVoice(event);
      } catch (error) {
        console.error(`❌ Error applying event ${event.id}:`, error);
      }
    });
  }
  
  /**
   * Apply a specific event to its target voice
   * @param {object} event - Event data from registry
   */
  static applyEventToVoice(event) {
    const voiceIndex = event.voiceIndex;
    
    if (!voiceData[voiceIndex]) {
      console.error(`❌ Voice ${voiceIndex} not found`);
      return;
    }
    
    if (event.type === 'parameter') {
      // Single parameter event
      this.applySingleParameterChange(voiceIndex, event.parameterName, event.value);
      
    } else if (event.type === 'compound-parameter') {
      // Multiple parameter event
      Object.keys(event.changes).forEach(paramName => {
        const paramData = event.changes[paramName];
        this.applySingleParameterChange(voiceIndex, paramName, paramData.value);
      });
      
    } else {
      console.warn(`⚠️ Unknown event type: ${event.type}`);
    }
  }
  
  /**
   * Apply a single parameter change to a voice
   * @param {number} voiceIndex - Target voice
   * @param {string} parameterName - Parameter to change
   * @param {any} newValue - New parameter value
   */
  static applySingleParameterChange(voiceIndex, parameterName, newValue) {
    const voice = voiceData[voiceIndex];
    let currentParam = voice.parameters[parameterName];
    
    // FIXED: Get definition first, before any checks
    const def = ParameterManager.getParameterDefinition(parameterName);
    
    if (!def) {
      console.error(`❌ No definition found for parameter ${parameterName}`);
      return;
    }
    
    // FIXED: Handle simple parameters that are just numbers (not objects)
    if (currentParam === undefined || currentParam === null) {
      console.error(`❌ Parameter ${parameterName} not found in Voice ${voiceIndex + 1}`);
      return;
    }
    
    // For simple parameters, currentParam might be a number (0), not an object
    if (def.type === 'simple' && typeof currentParam === 'number') {
      // This is valid - continue processing
    } else if (typeof currentParam !== 'object' && def.type !== 'simple') {
      console.error(`❌ Parameter ${parameterName} has unexpected type in Voice ${voiceIndex + 1}:`, typeof currentParam);
      return;
    }
    
    switch (def.type) {
      case 'range':
        // Update range parameters
        if (typeof newValue === 'object' && newValue.min !== undefined) {
          currentParam.min = newValue.min;
          currentParam.max = newValue.max;
          if (newValue.behavior !== undefined) {
            currentParam.behavior = newValue.behavior;
          }
          
          // Clear interpolated values to force recalculation
          delete currentParam.currentValue;
          
          console.log(`🎚️ Updated ${parameterName}: ${newValue.min}-${newValue.max} (Voice ${voiceIndex + 1})`);
        }
        break;
        
      case 'simple':
        // Update dropdown parameters
        voice.parameters[parameterName] = newValue;
        console.log(`🎛️ Updated ${parameterName}: ${newValue} (Voice ${voiceIndex + 1})`);
        break;
        
      case 'multiselect':
        // Update checkbox parameters
        if (Array.isArray(newValue)) {
          currentParam.selectedValues = [...newValue];
          console.log(`☑️ Updated ${parameterName}: ${newValue.length} selections (Voice ${voiceIndex + 1})`);
        }
        break;
        
      case 'effect':
        // TODO: Implement effect parameter updates
        console.log(`🌊 Effect update ${parameterName} (TODO - Session 26 Phase 3)`);
        break;
        
      case 'complex':
        // TODO: Implement complex parameter updates
        console.log(`🔧 Complex update ${parameterName} (TODO - Session 26 Phase 3)`);
        break;
        
      default:
        console.warn(`⚠️ Unknown parameter type for ${parameterName}`);
    }
    
    // Trigger real-time audio updates if this voice is currently playing
    this.triggerRealTimeUpdates(voiceIndex, parameterName, newValue);
  }

  
  /**
   * Trigger real-time audio updates for parameter changes
   * @param {number} voiceIndex - Voice that changed
   * @param {string} parameterName - Parameter that changed
   * @param {any} newValue - New value
   */
  static triggerRealTimeUpdates(voiceIndex, parameterName, newValue) {
    // Only update if master clock is running
    if (!masterClock || !masterClock.isActive()) return;
    
    // Only update if this voice is currently playing
    if (!voiceClockManager || !voiceClockManager.isInitialized) return;
    
    const voiceClock = voiceClockManager.getVoiceClock(voiceIndex);
    if (!voiceClock || !voiceClock.isActive) return;
    
    // Apply real-time updates based on parameter type
    if (parameterName === 'VOLUME') {
      const avgVolume = (newValue.min + newValue.max) / 2;
      if (voiceClock.updateVolumeForActiveNotes) {
        voiceClock.updateVolumeForActiveNotes(avgVolume);
      }
      console.log(`🔊 Real-time VOLUME update: ${avgVolume} (Voice ${voiceIndex + 1})`);
      
    } else if (parameterName === 'TEMPO (BPM)') {
      // Update voice clock tempo
      voiceClock.updateTempo();
      console.log(`🎵 Real-time TEMPO update (Voice ${voiceIndex + 1})`);
      
    } else {
      // For other parameters, trigger general updates
      if (voiceClock.updateActiveNotesRealTime) {
        voiceClock.updateActiveNotesRealTime();
      }
    }
  }
  
  /**
   * Get events that should be active at current beat for a voice
   * @param {number} voiceIndex - Voice index
   * @param {number} currentBeat - Current beat position
   * @returns {Array} Active events for this voice
   */
  static getActiveEventsForVoice(voiceIndex, currentBeat) {
    const registry = getEventRegistry();
    const voiceEvents = registry.getEventsForVoice(voiceIndex);
    
    // Return events at or before current beat (latest wins)
    return voiceEvents.filter(event => event.beatPosition <= currentBeat)
                     .sort((a, b) => b.beatPosition - a.beatPosition); // Most recent first
  }
}

// ===== END EVENT PROCESSOR =====

// ===== REGISTRY TEST FUNCTIONS =====

/**
 * Create test events for development and testing
 * Call this function to populate the registry with sample events
 */
function createTestEvents() {
  console.log('🧪 Creating test events for registry...');
  
  // Clear any existing events
  if (eventRegistry) {
    eventRegistry.clear();
  }
  
  // Ensure registry is initialized
  if (!eventRegistry) {
    initializeEventRegistry();
  }
  
// Create test events for Voice 1 - FIXED to use correct beat range
  const volEventId = EventCreator.quickVolumeEvent(0, 4, 80, 100);   // Beat 4 (was 16)
  const instEventId = EventCreator.quickInstrumentEvent(0, 8, 5);    // Beat 8 (was 32) 
  const vol2EventId = EventCreator.quickVolumeEvent(0, 12, 20, 40);  // Beat 12 (was 64)
  
  // Create compound event
  const compoundId = EventCreator.createCompoundEvent(0, 6, {        // Beat 6 (was 48)
    'TEMPO (BPM)': { min: 140, max: 160, behavior: 75 },
    'VOLUME': { min: 60, max: 80, behavior: 25 }
  });
  
  console.log(`✅ Test events created (CORRECTED for 16-beat timeline):`);
  console.log(`  VOLUME at beat 4: ${volEventId}`);
  console.log(`  INSTRUMENT at beat 8: ${instEventId}`);
  console.log(`  COMPOUND at beat 6: ${compoundId}`);
  console.log(`  VOLUME at beat 12: ${vol2EventId}`);
  
  // Show registry state
  console.log('Registry stats:', eventRegistry.getStats());
  
  return { volEventId, instEventId, compoundId, vol2EventId };
}

/**
 * Test the complete event processing chain
 */
function testEventProcessing() {
  console.log('\n🔬 Testing complete event processing chain...');
  
  // Ensure we have test events
  const events = createTestEvents();
  
  // Test beat lookups
  console.log('\n=== BEAT LOOKUPS ===');
  [16, 32, 48, 64].forEach(beat => {
    const eventsAtBeat = eventRegistry.getEventsByBeat(beat);
    console.log(`Beat ${beat}: ${eventsAtBeat.length} events`, eventsAtBeat.map(e => e.parameterName || 'compound'));
  });
  
  // Store original values
  const originalVolume = JSON.parse(JSON.stringify(voiceData[0].parameters['VOLUME']));
  const originalInstrument = voiceData[0].parameters['INSTRUMENT'];
  
  console.log('Original VOLUME:', originalVolume);
  console.log('Original INSTRUMENT:', originalInstrument);
  
  // Process events
  console.log('\n=== PROCESSING EVENTS ===');
  EventProcessor.processAllEvents(16);
  console.log('After beat 16 - VOLUME:', voiceData[0].parameters['VOLUME']);
  
  EventProcessor.processAllEvents(32);  
  console.log('After beat 32 - INSTRUMENT:', voiceData[0].parameters['INSTRUMENT']);
  
  EventProcessor.processAllEvents(48);
  console.log('After beat 48 - VOLUME:', voiceData[0].parameters['VOLUME']);
  console.log('After beat 48 - TEMPO:', voiceData[0].parameters['TEMPO (BPM)']);
  
  // Test compound event
  const compoundEvents = eventRegistry.getEventsByBeat(48);
  console.log('Compound event at beat 48:', compoundEvents);
  
  return events;
}

// Make functions globally accessible for testing
window.createTestEvents = createTestEvents;
window.testEventProcessing = testEventProcessing;

// ===== END TEST FUNCTIONS =====



// ===== GLOBAL EVENT REGISTRY INSTANCE =====

// ===== REGISTRY DASHBOARD =====

/**
 * Show comprehensive EventRegistry dashboard
 * Useful for debugging and monitoring
 */
function showRegistryDashboard() {
  console.log('\n🏗️ ===== EVENT REGISTRY DASHBOARD =====');
  
  if (!eventRegistry) {
    console.log('❌ EventRegistry not initialized');
    return;
  }
  
  const stats = eventRegistry.getStats();
  console.log('📊 STATISTICS:');
  console.log(`   Total Events: ${stats.totalEvents}`);
  console.log(`   Active Voices: ${stats.voiceCount}`);
  console.log(`   Operations Performed: ${stats.operationCount}`);
  console.log(`   Last Operation: ${stats.lastOperation}`);
  
  console.log('\n📋 EVENT BREAKDOWN:');
  console.log('   By Type:', stats.typeBreakdown);
  console.log('   By Voice:', stats.voiceBreakdown);
  
  console.log('\n💎 ALL EVENTS:');
  const allEvents = eventRegistry.getAllEvents();
  
  if (allEvents.length === 0) {
    console.log('   No events in registry');
  } else {
    allEvents.forEach((event, index) => {
      if (event.type === 'compound-parameter') {
        const paramNames = Object.keys(event.changes || {});
        console.log(`   ${index + 1}. ${event.id}: Compound (${paramNames.join(', ')}) at beat ${event.beatPosition} - Voice ${event.voiceIndex + 1}`);
      } else {
        console.log(`   ${index + 1}. ${event.id}: ${event.parameterName} at beat ${event.beatPosition} - Voice ${event.voiceIndex + 1}`);
      }
    });
  }
  
  console.log('\n🎯 QUICK TESTS:');
  console.log('   Registry.getEventsForVoice(0):', eventRegistry.getEventsForVoice(0).length, 'events');
  console.log('   Registry.getEventsByBeat(0):', eventRegistry.getEventsByBeat(0).length, 'events');
  console.log('   ParameterManager.isParameterSupported("VOLUME"):', ParameterManager.isParameterSupported('VOLUME'));
  
  console.log('🏗️ ===== END DASHBOARD =====\n');
}

// Make globally accessible
window.showRegistryDashboard = showRegistryDashboard;

// ===== END REGISTRY DASHBOARD =====

/**
 * Global centralized event registry
 * Replaces per-voice event arrays with unified architecture
 */
let eventRegistry = null;

/**
 * Initialize the global event registry
 * Called during app startup
 */
function initializeEventRegistry() {
  if (!eventRegistry) {
    eventRegistry = new EventRegistry();
    console.log('🏗️ Global EventRegistry initialized');
  }
  return eventRegistry;
}

/**
 * Get the global event registry (with lazy initialization)
 * @returns {EventRegistry} Global registry instance
 */
function getEventRegistry() {
  if (!eventRegistry) {
    initializeEventRegistry();
  }
  return eventRegistry;
}

// ===== END GLOBAL REGISTRY =====



// ===== AUDIO CONTINUITY PROTECTION =====
function protectAudioDuringViewSwitch() {
  // Store critical audio state references
  const audioState = {
    masterClockRunning: masterClock ? masterClock.isActive() : false,
    masterClockElapsed: masterClock ? masterClock.getElapsedTime() : 0,
    audioManagerPlaying: audioManager ? audioManager.isPlaying : false,
    activeVoiceCount: voiceClockManager ? voiceClockManager.getActiveVoiceCount() : 0
  };
  
  if (DEBUG.TIMELINE) {
    console.log('🔒 Audio state protected during view switch:', audioState);
  }
  
  return audioState;
}

function validateAudioAfterViewSwitch(originalState) {
  const currentState = {
    masterClockRunning: masterClock ? masterClock.isActive() : false,
    masterClockElapsed: masterClock ? masterClock.getElapsedTime() : 0,
    audioManagerPlaying: audioManager ? audioManager.isPlaying : false,
    activeVoiceCount: voiceClockManager ? voiceClockManager.getActiveVoiceCount() : 0
  };
  
  let issuesFound = 0;
  
  // Validate audio continuity
  if (originalState.masterClockRunning !== currentState.masterClockRunning) {
    console.error(`❌ Master clock state changed: ${originalState.masterClockRunning} → ${currentState.masterClockRunning}`);
    issuesFound++;
  }
  
  if (originalState.audioManagerPlaying !== currentState.audioManagerPlaying) {
    console.error(`❌ Audio manager playing state changed: ${originalState.audioManagerPlaying} → ${currentState.audioManagerPlaying}`);
    issuesFound++;
  }
  
  if (issuesFound === 0) {
    if (DEBUG.TIMELINE) {
      console.log('✅ Audio continuity validated - no issues found');
    }
  } else {
    console.error(`❌ Found ${issuesFound} audio continuity issues`);
  }
  
  return issuesFound === 0;
}

// Global view state manager instance
let viewStateManager = null;

// Global undo manager instance
let undoManager = null;
// ===== END UNDO/REDO MANAGER CLASS =====

// ===== VISUAL TIMELINE CLASS (Phase 1 + 2) =====

// NEW: Emergency timeline recovery function

function recoverVisualTimeline() {
  console.log(`🚑 Timeline recovery initiated...`);
  
  try {
    // Check if timeline container exists
    const timelineContainer = document.getElementById('visual-timeline-container');
    
    if (!timelineContainer) {
      console.log(`   Creating missing timeline container`);
      showVisualTimeline();
      return;
    }
    
    // Check if visualTimeline instance exists
    if (!visualTimeline) {
      console.log(`   Recreating visualTimeline instance`);
      visualTimeline = new VisualTimeline(currentVoice);
      visualTimeline.render(timelineContainer);
      return;
    }
    
    // Check if timeline is visible
    if (!visualTimeline.isVisible) {
      console.log(`   Timeline not visible, re-rendering`);
      visualTimeline.render(timelineContainer);
      return;
    }
    
    console.log(`✅ Timeline recovery complete`);
    
  } catch (error) {
    console.error(`❌ Timeline recovery failed:`, error);
    
    // Last resort: full timeline recreation
    visualTimeline = null;
    showVisualTimeline();
  }
}

// Make recovery function available globally
window.recoverTimeline = recoverVisualTimeline;

class VisualTimeline {
constructor(voiceIndex) {
  this.voiceIndex = voiceIndex;
  this.container = null;
  this.playhead = null;
  this.isVisible = false;
  this.updateInterval = null;
  
  this.maxBeats = 700; // Default
  this.beatUnit = 7;   // Quarter notes
  this.tempo = 120;    // Default tempo
  
  // NEW: Interactive capabilities (Phase 2) - MOUSE-DRIVEN DESIGN
  this.isInteractive = true;
  this.snapToBeat = true;
  
  // NEW: Zoom capabilities
  this.zoomLevel = 1.0;
  this.minZoom = 0.1;   // 10% zoom out (show 10x more timeline)
  this.maxZoom = 5.0;   // 500% zoom in (show precise beat details)
  this.zoomStep = 0.1;  // 10% increment per wheel step
  this.panOffset = 0;   // Horizontal pan position (0-100%)
  
  // NEW: Beat indicator
  this.showBeatIndicator = true;
  this.currentBeat = null;
  this.beatIndicator = null;
  
  // Mouse interaction state
  this.isDragging = false;
  this.dragStartBeat = null;
  this.currentMode = null; // 'mute' or 'unmute'
  this.hoverBeat = null;
  this.isHandleDragging = false; // NEW: Track handle drag state
  
  // NEW: Beat change tracking for tooltip throttling
  this.lastDisplayedBeat = null;

  // NEW: Beat change tracking for tooltip throttling
  this.lastDisplayedBeat = null;

  if (DEBUG.TIMELINE) {
    console.log(`🎬 VisualTimeline created for Voice ${voiceIndex + 1} with zoom support`);
  }
}

render(container) {
  if (!container) {
    console.error('❌ VisualTimeline: No container provided');
    return;
  }
  
  this.container = container;
  this.updateVoiceData();
  
  container.innerHTML = '';
  container.className = 'visual-timeline-container';
  
  // Calculate and set zoom constraints based on current voice data
  this.calculateZoomConstraints();
  
  // Header with voice info
  const header = this.createHeader();
  container.appendChild(header);
  
  // Zoom controls (positioned after header, before timeline)
  const zoomControls = this.createZoomControls();
  container.appendChild(zoomControls);
  
  // Main timeline track
  const track = this.createTrack();
  container.appendChild(track);
  
  // Time labels (sync with zoom)
  const timeLabels = this.createTimeLabels();
  container.appendChild(timeLabels);
  
  // Beat labels (sync with zoom)
  const beatLabels = this.createBeatLabels();
  container.appendChild(beatLabels);
  
  // Timeline controls (reset, snap, etc.)
  const controls = this.createControls();
  container.appendChild(controls);
  
  // Initialize zoom system AFTER all elements are rendered
  setTimeout(() => {
    // Add zoom and interaction support
    this.addZoomSupport();
    
    // Initialize zoom state
    this.applyZoomAndPan();
    this.updateZoomControls();
    this.updateLabelsForCurrentView();
    
    // Make track interactive for region editing
    this.makeTrackInteractive();
    
    if (DEBUG.TIMELINE) {
      console.log(`✅ VisualTimeline fully rendered and initialized for Voice ${this.voiceIndex + 1}`);
      console.log(`   Timeline: ${this.maxBeats} beats @ ${this.tempo} BPM`);
      console.log(`   Zoom: ${this.minZoom}x - ${this.maxZoom}x range`);
    }
  }, 50);
  
  this.isVisible = true;
  
  if (DEBUG.TIMELINE) {
    console.log(`🎬 VisualTimeline rendered for Voice ${this.voiceIndex + 1}`);
    console.log(`   Max: ${this.maxBeats} beats @ ${this.tempo} BPM`);
  }
}

makeTrackInteractive() {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;

  // Enable interaction
  track.style.cursor = 'default'; // Changed from 'pointer'
  track.style.userSelect = 'none';

  // NEW: Fixed double-click timer system
  let doubleClickTimer = null;

  track.addEventListener('click', (e) => {
    // Clear any existing double-click timer
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      doubleClickTimer = null;
      return; // This was the second click of a double-click
    }

    // Set timer for single-click detection
    doubleClickTimer = setTimeout(() => {
      doubleClickTimer = null;

      // This is a true single click - handle modifier keys only
      if (e.shiftKey && e.target.classList.contains('timeline-region')) {
        console.log(`🖱️ SHIFT+CLICK: Quick parameter event`);
        this.handleQuickParameterEvent(e);
      } else if (e.altKey && e.target.classList.contains('timeline-region')) {
        console.log(`🖱️ ALT+CLICK: Quick delete region`);
        this.handleQuickRegionDelete(e);
      }
      // No logging for regular single clicks
    }, 300); // 300ms delay to detect double-click
  });

  // NEW: Fixed double-click handler
  track.addEventListener('dblclick', (e) => {
    // Prevent single click events from firing
    e.preventDefault();
    e.stopPropagation();

    // Clear single-click timer
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      doubleClickTimer = null;
    }

    const beat = this.screenXToBeat(e.clientX);
    const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(beat) : beat;
    const isInPlayingRegion = this.checkIfBeatIsInPlayingRegion(snappedBeat);

    if (DEBUG.EVENTS) {
      console.log(`🖱️ DOUBLE-CLICK detected on: "${e.target.className}" at beat ${snappedBeat.toFixed(0)}`);
    }

    if (e.target.classList.contains('timeline-region') && e.target.classList.contains('playing')) {
      // Double-click GREEN REGION → Context menu
      console.log(`🟢 DOUBLE-CLICK PLAYING REGION: Show context menu at beat ${snappedBeat.toFixed(0)}`);
      this.handleGreenRegionDoubleClick(e, snappedBeat);
      
  } else if (e.target.classList.contains('parameter-event-diamond')) {
    // Double-click GOLD DIAMOND → Context menu (FORCE STOP PROPAGATION)
    console.log(`💎 DOUBLE-CLICK DIAMOND: Show context menu`);
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // ADDED: Prevent other handlers
    this.handleDiamondDoubleClick(e);
    return; // ADDED: Exit immediately

    } else if (isInPlayingRegion) {
      // Double-click inside playing region (empty space) → Parameter Event
      console.log(`💎 DOUBLE-CLICK IN PLAYING AREA: Create parameter event at beat ${snappedBeat.toFixed(0)}`);
      this.createParameterEventAtBeat(snappedBeat, e.clientX, e.clientY);
      
    } else {
      // Double-click in MUTED area → Start region creation
      console.log(`🖱️ DOUBLE-CLICK MUTED AREA: Start direct region creation at beat ${snappedBeat.toFixed(0)}`);
      this.startDirectRegionCreation(e);
    }
  });

  // Prevent context menu and selection
  track.addEventListener('contextmenu', (e) => e.preventDefault());
  track.addEventListener('selectstart', (e) => e.preventDefault());

  if (DEBUG.EVENTS) {
    console.log(`🖱️ Timeline track interactive with enhanced controls:`);
    console.log(`   • Drag handles = Resize region edges`);
    console.log(`   • Click region = Move entire region`);
    console.log(`   • Double-click empty = Create new region`);
    console.log(`   • Double-click region = Context menu`);
    console.log(`   • Shift+Click region = Quick parameter event`);
    console.log(`   • Alt+Click region = Quick delete`);
  }
}


// NEW: Handle timeline click events (DISABLED - use drag handles instead)
handleTimelineClick(e) {
  if (DEBUG.EVENTS) {
    console.log(`🖱️ Timeline click disabled - use drag handles for region editing`);
  }
  
  // All timeline editing now done through:
  // - Drag handles (resize region edges)
  // - Click region body (move entire region)
  // - Reset button (restore full-width playing)
  
  return; // No click-to-mute functionality
}

// NEW: Convert screen X coordinate to beat position
screenXToBeat(screenX) {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return 0;
  
  const rect = track.getBoundingClientRect();
  const relativeX = screenX - rect.left;
  const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
  
  return percentage * this.maxBeats;
}

// NEW: Snap beat to grid
snapBeatToGrid(beat) {
  return Math.round(beat);
}

  // NEW: Check if beat is in a playing region (using events system)
checkIfBeatIsInPlayingRegion(beat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return false;
  
  // Process events up to this beat to determine play state
  const muteEvents = lifeSpan.events
    .filter(event => event.type === 'mute')
    .sort((a, b) => a.beatPosition - b.beatPosition);
  
  let isPlaying = false;
  
  muteEvents.forEach(event => {
    if (beat >= event.beatPosition) {
      isPlaying = (event.action === 'unmute');
    }
  });
  
  return isPlaying;
}

// NEW: Insert mute event at beat position
insertMuteEvent(beat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  // Generate unique ID
  const eventId = `evt-${String(lifeSpan.nextEventId).padStart(3, '0')}`;
  lifeSpan.nextEventId++;
  
  // Create new mute event
  const newEvent = {
    type: 'mute',
    beatPosition: beat,
    action: 'mute',
    id: eventId
  };
  
  // Insert in chronological order
  const insertIndex = lifeSpan.events.findIndex(event => 
    event.type === 'mute' && event.beatPosition > beat
  );
  
  if (insertIndex === -1) {
    lifeSpan.events.push(newEvent);
  } else {
    lifeSpan.events.splice(insertIndex, 0, newEvent);
  }
  
  if (DEBUG.EVENTS) {
    console.log(`➕ Inserted MUTE event at beat ${beat} (${eventId})`);
    console.log(`   Updated events:`, lifeSpan.events);
  }
}

// NEW: Insert unmute event at beat position
insertUnmuteEvent(beat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  // Generate unique ID
  const eventId = `evt-${String(lifeSpan.nextEventId).padStart(3, '0')}`;
  lifeSpan.nextEventId++;
  
  // Create new unmute event
  const newEvent = {
    type: 'mute',
    beatPosition: beat,
    action: 'unmute',
    id: eventId
  };
  
  // Insert in chronological order
  const insertIndex = lifeSpan.events.findIndex(event => 
    event.type === 'mute' && event.beatPosition > beat
  );
  
  if (insertIndex === -1) {
    lifeSpan.events.push(newEvent);
  } else {
    lifeSpan.events.splice(insertIndex, 0, newEvent);
  }
  
  if (DEBUG.EVENTS) {
    console.log(`➕ Inserted UNMUTE event at beat ${beat} (${eventId})`);
    console.log(`   Updated events:`, lifeSpan.events);
  }
}

// NEW: Add drag functionality to region handles
addHandleDragFunctionality(handle, regionIndex, handleType) {
  let isDragging = false;
  let dragStartX = 0;
  let dragStartBeat = 0;
  let originalEvents = null;
  
  // Mouse down - start drag
  handle.onmousedown = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent timeline click event
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartBeat = this.screenXToBeat(e.clientX);
    
    // Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Timeline: Drag ${handleType} handle`, true);
    }
    
    // Store original events for validation
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    originalEvents = JSON.parse(JSON.stringify(lifeSpan.events));

    // NEW: Store region's original boundaries before any visual changes
    const region = handle.closest('.timeline-region');
    if (region) {
      const playingRegions = this.convertEventsToRegions(lifeSpan.events);
      const targetRegion = playingRegions[regionIndex];
      
      if (targetRegion) {
        // Store actual beat boundaries (not CSS percentages)
        region.dataset.originalStartBeat = targetRegion.start;
        region.dataset.originalEndBeat = targetRegion.end;
        
        if (DEBUG.EVENTS) {
          console.log(`💾 Stored original boundaries: ${targetRegion.start}-${targetRegion.end} beats`);
        }
      }
    }
    
    // Visual feedback - highlight handle during drag
    handle.style.background = 'rgba(40,167,69,1.0)';
    handle.style.borderColor = '#1e7e34';
    handle.style.width = '12px';
    handle.style.boxShadow = '0 0 8px rgba(40,167,69,0.6)';
    
    // Add global mouse move and up listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    if (DEBUG.EVENTS) {
      console.log(`🖱️ Started dragging ${handleType} handle at beat ${dragStartBeat.toFixed(1)}`);
    }
  };
  
const handleMouseMove = (e) => {
if (!isDragging) return;

const currentBeat = this.screenXToBeat(e.clientX);
const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
const clampedBeat = Math.max(0, Math.min(this.maxBeats, snappedBeat));

// Update handle position visually (preview)
this.updateHandlePosition(handle, handleType, clampedBeat);

// NEW: Calculate what the new region boundaries would be
const region = handle.closest('.timeline-region');
const originalStartBeat = parseFloat(region.dataset.originalStartBeat) || 0;
const originalEndBeat = parseFloat(region.dataset.originalEndBeat) || this.maxBeats;

let previewStartBeat = originalStartBeat;
let previewEndBeat = originalEndBeat;

if (handleType === 'left') {
  previewStartBeat = Math.round((clampedBeat / this.maxBeats) * this.maxBeats);
} else {
  previewEndBeat = Math.round((clampedBeat / this.maxBeats) * this.maxBeats);
}

// NEW: Update diamonds during handle drag too
this.updateDiamondsForRegionDragRealTime(regionIndex, previewStartBeat, previewEndBeat);

// Show tooltip
const timeMs = beatsToMs(clampedBeat, this.beatUnit, this.tempo);
const timeFormatted = formatMsToMMSS(timeMs);

handle.title = `${handleType === 'left' ? 'Start' : 'End'}: Beat ${clampedBeat.toFixed(0)} (${timeFormatted})`;
this.showDragTooltip(e.clientX, e.clientY, clampedBeat, timeFormatted, handleType);
};


const handleMouseUp = (e) => {
  if (!isDragging) return;
  
  isDragging = false;
  
  const finalBeat = this.screenXToBeat(e.clientX);
  const snappedFinalBeat = this.snapToBeat ? this.snapBeatToGrid(finalBeat) : finalBeat;
  const clampedFinalBeat = Math.max(0, Math.min(this.maxBeats, snappedFinalBeat));
  
  // Apply the drag operation to events array
  this.applyHandleDrag(regionIndex, handleType, clampedFinalBeat);
  
        // Remove global listeners first
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  
  // Reset handle visual state
  handle.style.background = 'rgba(40,167,69,0.7)';
  handle.style.borderColor = '#fff';
  handle.style.width = '8px';
  handle.style.boxShadow = 'none';
  handle.title = `Drag to adjust ${handleType === 'left' ? 'start' : 'end'} time`;
  
        // NEW: Remove floating tooltip
  const dragTooltip = document.querySelector('.drag-tooltip');
  if (dragTooltip) {
    dragTooltip.remove();
  }

  // NEW: Update all labels before refresh
  this.updateAllRegionLabels();

  // Refresh timeline to show final result
  setTimeout(() => {
    this.refresh();
  }, 50);
  
  if (DEBUG.EVENTS) {
    console.log(`✅ Finished dragging ${handleType} handle to beat ${clampedFinalBeat.toFixed(0)}`);
  }
};
}

// NEW: Update handle position during drag (visual preview)
updateHandlePosition(handle, handleType, beat) {
  const percentage = (beat / this.maxBeats) * 100;
  const region = handle.closest('.timeline-region');
  if (!region) return;
  
  // Get stored original boundaries
  const originalStartBeat = parseFloat(region.dataset.originalStartBeat) || 0;
  const originalEndBeat = parseFloat(region.dataset.originalEndBeat) || this.maxBeats;
  
  const originalLeftPercent = (originalStartBeat / this.maxBeats) * 100;
  const originalRightPercent = (originalEndBeat / this.maxBeats) * 100;
  
  let newStartBeat = originalStartBeat;
  let newEndBeat = originalEndBeat;
  
  if (handleType === 'left') {
    // LEFT HANDLE: Move left edge, keep right edge fixed
    const fixedRightPercent = originalRightPercent;
    const newLeftPercent = Math.max(0, Math.min(percentage, fixedRightPercent - 1));
    const newWidth = fixedRightPercent - newLeftPercent;
    
    region.style.left = `${newLeftPercent.toFixed(1)}%`;
    region.style.width = `${Math.max(1, newWidth).toFixed(1)}%`;
    
    // Calculate new beat boundaries for label update
    newStartBeat = Math.round((newLeftPercent / 100) * this.maxBeats);
    newEndBeat = originalEndBeat;
    
  } else {
    // RIGHT HANDLE: Keep left edge fixed, move right edge
    const fixedLeftPercent = originalLeftPercent;
    const newRightPercent = Math.max(fixedLeftPercent + 1, Math.min(percentage, 100));
    const newWidth = newRightPercent - fixedLeftPercent;
    
    region.style.left = `${fixedLeftPercent.toFixed(1)}%`;
    region.style.width = `${Math.max(1, newWidth).toFixed(1)}%`;
    
    // Calculate new beat boundaries for label update
    newStartBeat = originalStartBeat;
    newEndBeat = Math.round((newRightPercent / 100) * this.maxBeats);
  }

  // NEW: Update the region label immediately during drag
  this.updateRegionLabel(region, newStartBeat, newEndBeat);
  
  // NEW: Update diamonds during handle drag too
  this.updateDiamondsForRegionDrag(region, newStartBeat, newEndBeat);
  
  if (DEBUG.EVENTS && Math.random() < 0.1) {
    console.log(`🖱️ ${handleType.toUpperCase()} drag: Region now ${newStartBeat}-${newEndBeat} beats`);
  }
}

// NEW: Method to update region label content
updateRegionLabel(region, startBeat, endBeat) {
  const regionLabel = region.querySelector('.region-label');
  if (!regionLabel) return;
  
  // Calculate effective width for label sizing (accounts for zoom)
  const regionWidthPercent = parseFloat(region.style.width) || 0;
  const effectiveWidth = regionWidthPercent * this.zoomLevel;
  
  // Smart label content based on available space
  if (effectiveWidth > 25) {
    regionLabel.textContent = `Beat ${startBeat}-${endBeat}`;
  } else if (effectiveWidth > 15) {
    regionLabel.textContent = `${startBeat}-${endBeat}`;
  } else if (effectiveWidth > 8) {
    const beatCount = endBeat - startBeat;
    regionLabel.textContent = `${beatCount}b`;
  } else {
    regionLabel.textContent = '▶'; // Just play icon for very narrow regions
  }
  
  if (DEBUG.EVENTS && Math.random() < 0.05) {
    console.log(`🏷️ Updated region label: "${regionLabel.textContent}" (width: ${effectiveWidth.toFixed(1)}%)`);
  }
}

// NEW: Apply handle drag to events array
applyHandleDrag(regionIndex, handleType, newBeat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  // Get current playing regions
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  if (regionIndex >= playingRegions.length) {
    console.warn(`Invalid region index ${regionIndex}`);
    return;
  }
  
  const region = playingRegions[regionIndex];
  let newStartBeat = region.start;
  let newEndBeat = region.end;
  
  // Update the appropriate boundary
  if (handleType === 'left') {
    newStartBeat = Math.max(0, Math.min(newBeat, region.end - 1)); // Can't go past end
  } else {
    newEndBeat = Math.max(region.start + 1, Math.min(newBeat, this.maxBeats)); // Can't go before start
  }
  
  // Validate the new region
  if (newStartBeat >= newEndBeat) {
    console.warn(`Invalid drag: start ${newStartBeat} >= end ${newEndBeat}`);
    return;
  }
  
  // Update events array by replacing this region's events
  this.replaceRegionInEvents(regionIndex, newStartBeat, newEndBeat);
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Updated region ${regionIndex}: ${region.start}-${region.end} → ${newStartBeat}-${newEndBeat}`);
  }

  // NEW: Recalculate zoom constraints after region resize
  const oldMaxZoom = this.maxZoom;
  this.calculateZoomConstraints();
  
  // If region got smaller and current zoom is now too high, clamp it
  if (this.zoomLevel > this.maxZoom) {
    console.log(`🔍 Region resize requires zoom reduction: ${this.zoomLevel.toFixed(1)}x → ${this.maxZoom.toFixed(1)}x`);
    this.zoomLevel = this.maxZoom;
    
    // Adjust pan to stay within new bounds
    const maxPan = Math.max(0, 1 - (1 / this.zoomLevel));
    this.panOffset = Math.min(this.panOffset, maxPan);
    
    // Apply the new zoom immediately
    this.applyZoomAndPan();
    this.updateZoomControls();
  }

}

// CLEAN: Replace a region's events and update parameter events
replaceRegionInEvents(regionIndex, newStart, newEnd) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  // Get current playing regions
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[regionIndex];
  
  if (!targetRegion) return;
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Moving region ${regionIndex}: ${targetRegion.start}-${targetRegion.end} → ${newStart}-${newEnd}`);
  }
  
  // Step 1: Remove old mute events for this region
  lifeSpan.events = lifeSpan.events.filter(event => {
    if (event.type !== 'mute') return true;
    
    if (event.action === 'unmute' && event.beatPosition === targetRegion.start) {
      return false; // Remove start event
    }
    if (event.action === 'mute' && event.beatPosition === targetRegion.end) {
      return false; // Remove end event
    }
    
    return true;
  });
  
  // Step 2: Add new mute events
  const newStartEvent = {
    type: 'mute',
    beatPosition: newStart,
    action: 'unmute',
    id: `evt-${String(lifeSpan.nextEventId++).padStart(3, '0')}`
  };
  
  const newEndEvent = {
    type: 'mute',
    beatPosition: newEnd,
    action: 'mute',
    id: `evt-${String(lifeSpan.nextEventId++).padStart(3, '0')}`
  };
  
  lifeSpan.events.push(newStartEvent);
  lifeSpan.events.push(newEndEvent);
  
  // Step 3: Update parameter events for this region to maintain relative positions
  lifeSpan.events.forEach(event => {
    if (event.type === 'parameter' && event.regionIndex === regionIndex) {
      // Parameter events keep their relative position, just recalculate absolute
      const newAbsoluteBeat = newStart + (event.relativePosition * (newEnd - newStart));
      
      if (DEBUG.EVENTS) {
        console.log(`   📍 Parameter event ${event.parameter}: ${(event.relativePosition * 100).toFixed(1)}% = beat ${newAbsoluteBeat.toFixed(1)}`);
      }
    }
  });
  
  // Step 4: Sort events chronologically
  lifeSpan.events.sort((a, b) => {
    const aBeat = a.beatPosition || 0;
    const bBeat = b.beatPosition || 0;
    return aBeat - bBeat;
  });
  
  if (DEBUG.EVENTS) {
    console.log(`   ✅ Region moved, parameter events follow at same relative positions`);
  }
}

// NEW: Show floating tooltip during drag
showDragTooltip(clientX, clientY, beat, timeFormatted, handleType) {
  // Remove existing drag tooltip
  const existingTooltip = document.querySelector('.drag-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create new floating tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'drag-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${clientX + 15}px;
    top: ${clientY - 30}px;
    background: #333;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    z-index: 10000;
    pointer-events: none;
    white-space: nowrap;
  `;
  
  const handleLabel = handleType === 'left' ? 'Start' : 'End';
  tooltip.textContent = `${handleLabel}: Beat ${beat.toFixed(0)} (${timeFormatted})`;
  
  document.body.appendChild(tooltip);
}

  // NEW: Start whole-region drag operation
startWholeRegionDrag(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const region = e.target;
  const regionIndex = parseInt(region.dataset.regionIndex);
  
  // Get original region boundaries from events
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[regionIndex];
  
  if (!targetRegion) return;
  
  const regionWidth = targetRegion.end - targetRegion.start; // Width in beats
  const dragStartX = e.clientX;
  const dragStartBeat = this.screenXToBeat(dragStartX);
  const clickOffsetBeat = dragStartBeat - targetRegion.start; // Where in region user clicked
  
  let isDragging = false;
  
  // Capture state for undo
  if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
    undoManager.captureState(`Timeline: Move region ${targetRegion.start}-${targetRegion.end}`, true);
  }
  
  // Visual feedback - highlight entire region during drag
  region.style.boxShadow = '0 0 12px rgba(40,167,69,0.8)';
  region.style.transform = 'translateY(-2px)';
  region.style.cursor = 'grabbing';
  region.style.opacity = '0.8';
  region.style.border = '2px solid #28a745';
  
  if (DEBUG.EVENTS) {
    console.log(`🎯 Starting whole-region drag:`);
    console.log(`   Original region: ${targetRegion.start}-${targetRegion.end} (width: ${regionWidth} beats)`);
    console.log(`   Click offset: ${clickOffsetBeat.toFixed(1)} beats from start`);
  }

const handleWholeRegionMouseMove = (e) => {
  if (!isDragging) {
    const dragDistance = Math.abs(e.clientX - dragStartX);
    if (dragDistance > 5) {
      isDragging = true;
      if (DEBUG.EVENTS) {
        console.log(`🖱️ Started whole-region drag (width: ${regionWidth} beats)`);
      }
    } else {
      return;
    }
  }
  
  const currentBeat = this.screenXToBeat(e.clientX);
  const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
  
  // Calculate new region position
  let newRegionStart = snappedBeat - clickOffsetBeat;
  let newRegionEnd = newRegionStart + regionWidth;
  
  // Clamp to timeline bounds
  if (newRegionStart < 0) {
    newRegionStart = 0;
    newRegionEnd = regionWidth;
  } else if (newRegionEnd > this.maxBeats) {
    newRegionEnd = this.maxBeats;
    newRegionStart = this.maxBeats - regionWidth;
  }
  
  newRegionStart = Math.max(0, newRegionStart);
  newRegionEnd = Math.min(this.maxBeats, newRegionEnd);
  
  // Update visual position with live label update
  this.updateWholeRegionPosition(region, newRegionStart, newRegionEnd);
  
  // NEW: Update diamonds in real-time during region drag
  this.updateDiamondsForRegionDragRealTime(regionIndex, newRegionStart, newRegionEnd);
  
  // Show position in tooltip
  const timeMs = beatsToMs(newRegionStart, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  this.showDragTooltip(e.clientX, e.clientY, newRegionStart, timeFormatted, 'whole-region-move');
};

  
const handleMouseUp = (e) => {
  // Remove global listeners first
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
    
    if (isDragging) {
      // Apply the drag operation
      const currentBeat = this.screenXToBeat(e.clientX);
      const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
      
      let newRegionStart = snappedBeat - clickOffsetBeat;
      let newRegionEnd = newRegionStart + regionWidth;
      
      // Clamp to timeline bounds
      if (newRegionStart < 0) {
        newRegionStart = 0;
        newRegionEnd = regionWidth;
      } else if (newRegionEnd > this.maxBeats) {
        newRegionEnd = this.maxBeats;
        newRegionStart = this.maxBeats - regionWidth;
      }
      
      // NEW: Snap final positions to whole beat numbers
      newRegionStart = Math.round(Math.max(0, newRegionStart));
      newRegionEnd = Math.round(Math.min(this.maxBeats, newRegionEnd));
      
      // NEW: Ensure minimum region width of 1 beat
      if (newRegionEnd <= newRegionStart) {
        newRegionEnd = newRegionStart + 1;
      }
      
      // Update events array
      this.replaceRegionInEvents(regionIndex, newRegionStart, newRegionEnd);
      
      if (DEBUG.EVENTS) {
        console.log(`✅ Moved whole region to: ${newRegionStart}-${newRegionEnd} beats (snapped)`);
      }
    }
    
    // Reset visual state
    region.style.boxShadow = '';
    region.style.transform = '';
    region.style.cursor = '';
    region.style.opacity = '';
    region.style.border = '';
    
    // Remove floating tooltip with fade effect
    setTimeout(() => {
      const dragTooltip = document.querySelector('.drag-tooltip');
      if (dragTooltip) {
        dragTooltip.style.transition = 'opacity 0.3s ease';
        dragTooltip.style.opacity = '0';
        setTimeout(() => dragTooltip.remove(), 300);
      }
    }, 800);
    
    // NEW: Update all labels before refresh
    this.updateAllRegionLabels();
    
    // Refresh timeline to show final result
    setTimeout(() => {
      this.refresh();
    }, 50);
  };

  // Add global mouse listeners
  document.addEventListener('mousemove', handleWholeRegionMouseMove);
  document.addEventListener('mouseup', handleWholeRegionMouseUp);
}

updateWholeRegionPosition(region, newStartBeat, newEndBeat) {
  const leftPercent = (newStartBeat / this.maxBeats) * 100;
  const rightPercent = (newEndBeat / this.maxBeats) * 100;
  const width = rightPercent - leftPercent;
  
  region.style.left = `${leftPercent.toFixed(1)}%`;
  region.style.width = `${Math.max(1, width).toFixed(1)}%`;
  
  // Update region label
  this.updateRegionLabel(region, Math.round(newStartBeat), Math.round(newEndBeat));
  
  // NEW: Update diamonds in real-time during region drag
  this.updateDiamondsForRegionDrag(region, newStartBeat, newEndBeat);
}

// NEW: Update diamond positions during region drag
updateDiamondsForRegionDrag(region, newStartBeat, newEndBeat) {
  const regionIndex = parseInt(region.dataset.regionIndex);
  const diamonds = region.querySelectorAll('.parameter-event-diamond');
  
  diamonds.forEach(diamond => {
    const diamondRegionIndex = parseInt(diamond.dataset.regionIndex);
    
    // Only update diamonds that belong to this region
    if (diamondRegionIndex === regionIndex) {
      const relativePosition = parseFloat(diamond.dataset.relativePosition);
      
      // Calculate new absolute position
      const newAbsoluteBeat = newStartBeat + (relativePosition * (newEndBeat - newStartBeat));
      const newLeftPercent = (newAbsoluteBeat / this.maxBeats) * 100;
      
      // Update diamond position immediately
      diamond.style.left = `${newLeftPercent.toFixed(2)}%`;
      
      // Update diamond title with new position
      diamond.title = `💎 ${diamond.dataset.parameter} - Beat ${newAbsoluteBeat.toFixed(0)} (${(relativePosition * 100).toFixed(1)}% in region)`;
      
      if (DEBUG.EVENTS && Math.random() < 0.05) {
        console.log(`   💎 Updated diamond ${diamond.dataset.parameter}: ${(relativePosition * 100).toFixed(1)}% = beat ${newAbsoluteBeat.toFixed(1)}`);
      }
    }
  });
}

// NEW: Update diamonds in real-time during region drag (not just on mouseup)
updateDiamondsForRegionDragRealTime(regionIndex, newStartBeat, newEndBeat) {
  // Find all diamonds that belong to this region (now in track container)
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  const allDiamonds = track.querySelectorAll('.parameter-event-diamond');
  
  allDiamonds.forEach(diamond => {
    const diamondRegionIndex = parseInt(diamond.dataset.regionIndex);
    
    // Only update diamonds that belong to this region
    if (diamondRegionIndex === regionIndex) {
      const relativePosition = parseFloat(diamond.dataset.relativePosition);
      
      if (!isNaN(relativePosition)) {
        // Calculate new absolute position
        const newAbsoluteBeat = newStartBeat + (relativePosition * (newEndBeat - newStartBeat));
        const newLeftPercent = (newAbsoluteBeat / this.maxBeats) * 100;
        
        // Update diamond position immediately with smooth transition
        diamond.style.transition = 'left 0.05s ease'; // Smooth movement
        diamond.style.left = `${newLeftPercent.toFixed(2)}%`;
        
        // Update title
        diamond.title = `💎 ${diamond.dataset.parameter} - Beat ${newAbsoluteBeat.toFixed(0)} (${(relativePosition * 100).toFixed(1)}% in region)`;
        
        if (DEBUG.EVENTS && Math.random() < 0.02) {
          console.log(`   💎 Real-time: ${diamond.dataset.parameter} at beat ${newAbsoluteBeat.toFixed(1)}`);
        }
      }
    }
  });
}

  // NEW: Update legacy millisecond storage
updateLegacyStorage() {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const tempo = getCurrentTempoForVoice(this.voiceIndex);
  const beatUnit = lifeSpan.beatUnit || 7;
  
  for (let i = 1; i <= 3; i++) {
    const span = lifeSpan[`lifeSpan${i}`];
    if (span) {
      if (!lifeSpan[`lifeSpan${i}Legacy`]) {
        lifeSpan[`lifeSpan${i}Legacy`] = {};
      }
      
      lifeSpan[`lifeSpan${i}Legacy`].enter = beatsToMs(span.enterBeats || 0, beatUnit, tempo);
      lifeSpan[`lifeSpan${i}Legacy`].exit = beatsToMs(span.exitBeats || 0, beatUnit, tempo);
    }
  }
  
  console.log(`💾 Updated legacy storage for Voice ${this.voiceIndex + 1}`);
}

// NEW: Handle track leave
handleTrackLeave(e) {
  const track = this.container.querySelector('.visual-timeline-track');
  track.style.cursor = 'pointer';
  track.title = '';
}

// NEW: Convert screen X coordinate to beat position
screenXToBeat(screenX) {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return 0;
  
  const rect = track.getBoundingClientRect();
  const relativeX = screenX - rect.left;
  const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
  
  const beat = percentage * this.maxBeats;
  
  if (DEBUG.TIMELINE && Math.random() < 0.1) {
    console.log(`📐 Screen ${screenX} → Beat ${beat.toFixed(2)} (${(percentage * 100).toFixed(1)}%)`);
  }
  
  return beat;
}

// NEW: Snap beat to grid
snapBeatToGrid(beat) {
  return Math.round(beat);
}
  
  // NEW: Show visual feedback for clicks
showClickFeedback(beat) {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  // Create temporary click indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: absolute;
    left: ${(beat / this.maxBeats) * 100}%;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #ffc107;
    transform: translateX(-50%);
    z-index: 200;
    pointer-events: none;
    animation: pulse 0.5s ease;
  `;
  
  track.appendChild(indicator);
  
  // Remove after animation
  setTimeout(() => {
    if (indicator.parentElement) {
      indicator.remove();
    }
  }, 500);
  
  console.log(`💫 Click feedback shown at beat ${beat.toFixed(0)}`);
}

createHeader() {
  const header = document.createElement('div');
  header.className = 'visual-timeline-header';
  
  const title = document.createElement('div');
  title.className = 'timeline-title';
  title.innerHTML = `
    <span>🎵</span>
    <span>Interactive Timeline - Voice ${this.voiceIndex + 1}</span>
    <span style="font-size: 12px; color: #28a745; margin-left: 8px;">● CLICK TO EDIT</span>
  `;
  
  const info = document.createElement('div');
  info.className = 'timeline-info';
  
  const maxTimeMs = beatsToMs(this.maxBeats, this.beatUnit, this.tempo);
  const maxTimeFormatted = formatMsToMMSS(maxTimeMs);
  
  info.innerHTML = `
    <span>Length: ${maxTimeFormatted}</span>
    <span>Tempo: ${this.tempo} BPM</span>
    <span>Beat: ${rhythmOptions[this.beatUnit]}</span>
  `;
  
  header.appendChild(title);
  header.appendChild(info);
  
  return header;
}

createTrack() {
const track = document.createElement('div');
track.className = 'visual-timeline-track';
track.style.cssText = `
  position: relative;
  height: 80px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 8px;
  margin: 10px 0;
  overflow: hidden;
`;

// TOP SEEK ZONE (15px)
const topSeekZone = document.createElement('div');
topSeekZone.className = 'seek-zone top-seek';
topSeekZone.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15px;
  cursor: pointer;
  background: linear-gradient(to bottom, rgba(74,144,226,0.1), transparent);
  border-bottom: 1px solid #dee2e6;
  z-index: 300;
  transition: background 0.2s ease;
`;
topSeekZone.title = 'Click to position playhead';

// MIDDLE INTERACTION ZONE (50px) - for regions and diamonds
const interactionZone = document.createElement('div');
interactionZone.className = 'interaction-zone';
interactionZone.style.cssText = `
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 200;
`;

// BOTTOM SEEK ZONE (15px)
const bottomSeekZone = document.createElement('div');
bottomSeekZone.className = 'seek-zone bottom-seek';
bottomSeekZone.style.cssText = `
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15px;
  cursor: pointer;
  background: linear-gradient(to top, rgba(74,144,226,0.1), transparent);
  border-top: 1px solid #dee2e6;
  z-index: 300;
  transition: background 0.2s ease;
`;
bottomSeekZone.title = 'Click to position playhead';

// Add hover effects for seek zones
[topSeekZone, bottomSeekZone].forEach(zone => {
  zone.onmouseenter = function() {
    this.style.background = 'rgba(74,144,226,0.2)';
    this.style.borderColor = '#4a90e2';
  };
  zone.onmouseleave = function() {
    this.style.background = '';
    this.style.borderColor = '#dee2e6';
  };
  
  // Connect click handlers (we'll implement these next)
  zone.onclick = (e) => this.handleSeekZoneClick(e);
  zone.onmousemove = (e) => this.showSeekPreview(e);
});

// Grid background (moved to interaction zone)
const grid = document.createElement('div');
grid.className = 'timeline-grid';
grid.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 19px,
    rgba(0,0,0,0.1) 20px
  );
  pointer-events: none;
`;
interactionZone.appendChild(grid);

// Regions container (moved to interaction zone)
const regionsContainer = document.createElement('div');
regionsContainer.className = 'timeline-regions';
regionsContainer.style.cssText = `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

// Render life span regions in interaction zone
this.renderLifeSpanRegions(regionsContainer);
interactionZone.appendChild(regionsContainer);

// Playhead (spans full track height)
const playhead = document.createElement('div');
playhead.className = 'timeline-playhead-container';
playhead.style.cssText = `
  position: absolute;
  top: 0;
  left: 0%;
  width: 3px;
  height: 100%;
  background: #dc3545;
  transition: left 0.05s linear;
  pointer-events: none;
  z-index: 100;
`;

const playheadArrow = document.createElement('div');
playheadArrow.style.cssText = `
  position: absolute;
  top: -8px;
  left: -7px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #dc3545;
  z-index: 101;
`;

playhead.appendChild(playheadArrow);

const playheadTooltip = document.createElement('div');
playheadTooltip.textContent = '0:00';
playheadTooltip.style.cssText = `
  position: absolute;
  top: 16px;
  left: 8px;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
`;
playhead.appendChild(playheadTooltip);

// Assemble track structure
track.appendChild(topSeekZone);
track.appendChild(interactionZone);
track.appendChild(bottomSeekZone);
track.appendChild(playhead);

// Store references
this.playhead = playhead;
this.playheadTooltip = playheadTooltip;

return track;
}

handleSeekZoneClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const clickedBeat = this.screenXToBeat(e.clientX);
  const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(clickedBeat) : clickedBeat;
  const clampedBeat = Math.max(0, Math.min(this.maxBeats, snappedBeat));
  
  if (DEBUG.EVENTS) {
    console.log(`🎯 Seek zone clicked: beat ${clampedBeat.toFixed(0)}`);
  }
  
  // SEEK TO POSITION
  this.seekToPosition(clampedBeat);
  
  // Visual feedback
  this.showSeekFeedback(clampedBeat);
}

showSeekPreview(e) {
  const beat = this.screenXToBeat(e.clientX);
  const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(beat) : beat;
  const clampedBeat = Math.max(0, Math.min(this.maxBeats, snappedBeat));
  
  const timeMs = beatsToMs(clampedBeat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  // Update tooltip for current beat position
  e.target.title = `🎯 Click to seek to Beat ${clampedBeat.toFixed(0)} (${timeFormatted})`;
  
  // Optional: Show temporary vertical line preview
  this.showSeekLinePreview(clampedBeat);
}

showSeekLinePreview(beat) {
  // Remove existing preview
  const existingPreview = this.container.querySelector('.seek-line-preview');
  if (existingPreview) {
    existingPreview.remove();
  }
  
  // Show temporary vertical line
  const preview = document.createElement('div');
  preview.className = 'seek-line-preview';
  preview.style.cssText = `
    position: absolute;
    left: ${(beat / this.maxBeats) * 100}%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(74,144,226,0.6);
    transform: translateX(-50%);
    z-index: 250;
    pointer-events: none;
    transition: left 0.1s ease;
  `;
  
  const track = this.container.querySelector('.visual-timeline-track');
  track.appendChild(preview);
  
  // Auto-remove after short delay
  clearTimeout(this.seekPreviewTimeout);
  this.seekPreviewTimeout = setTimeout(() => {
    if (preview.parentElement) {
      preview.remove();
    }
  }, 1000);
}

showSeekFeedback(beat) {
  // Flash feedback at seek position
  const seekIndicator = document.createElement('div');
  seekIndicator.style.cssText = `
    position: absolute;
    left: ${(beat / this.maxBeats) * 100}%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #ffc107;
    transform: translateX(-50%);
    z-index: 400;
    pointer-events: none;
    animation: seekFlash 0.8s ease;
  `;
  
  const track = this.container.querySelector('.visual-timeline-track');
  track.appendChild(seekIndicator);
  
  setTimeout(() => {
    if (seekIndicator.parentElement) {
      seekIndicator.remove();
    }
  }, 800);
  
  console.log(`💫 Seek feedback shown at beat ${beat.toFixed(0)}`);
}

seekToPosition(targetBeat) {
  if (DEBUG.EVENTS) {
    console.log(`🎯 VisualTimeline seeking to beat ${targetBeat.toFixed(0)}`);
  }
  
  // Convert beat to milliseconds
  const targetTimeMs = beatsToMs(targetBeat, this.beatUnit, this.tempo);
  
  // Update master clock (which will handle voice clocks and parameter state)
  if (masterClock) {
    masterClock.seekTo(targetTimeMs);
  } else {
    // No master clock - just move playhead visually
    this.updatePlayheadPosition(targetBeat);
    console.warn(`⚠️ No master clock available - visual-only seek`);
  }
  
  // If we're viewing the current voice and UI is out of sync, refresh parameter rollups
  if (this.voiceIndex === currentVoice) {
    // Small delay to let parameter state settle, then refresh UI
    setTimeout(() => {
      this.refreshParameterRollupsIfNeeded();
    }, 50);
  }
  
  if (DEBUG.EVENTS) {
    console.log(`✅ VisualTimeline seek complete: beat ${targetBeat.toFixed(0)} = ${formatMsToMMSS(targetTimeMs)}`);
  }
}

refreshParameterRollupsIfNeeded() {
  // Check if parameter rollups are visible and might need updating
  const parameterSection = document.getElementById('parameter-section');
  if (parameterSection && parameterSection.style.display !== 'none') {
    // For now, just log that we might need to refresh
    // In Session 26, this will update rollups to show current parameter state
    if (DEBUG.EVENTS) {
      console.log(`🔄 Parameter rollups might need refresh for Voice ${this.voiceIndex + 1}`);
    }
  }
}

updatePlayheadPosition(beat) {
  if (!this.playhead) return;
  
  const percentage = Math.min(100, (beat / this.maxBeats) * 100);
  this.playhead.style.left = `${percentage}%`;
  
  // Update tooltip
  if (this.playheadTooltip) {
    const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
    const timeFormatted = formatMsToMMSS(timeMs);
    this.playheadTooltip.textContent = timeFormatted;
    this.playheadTooltip.title = `Beat ${beat.toFixed(0)}`;
  }
  
  if (DEBUG.TIMELINE) {
    console.log(`🎯 Playhead positioned at beat ${beat.toFixed(0)} (${percentage.toFixed(1)}%)`);
  }
}

renderLifeSpanRegions(container) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan) return;
  
  if (DEBUG.EVENTS) {
    console.log(`🎬 Rendering regions from EVENTS for Voice ${this.voiceIndex + 1}`);
    console.log(`   Timeline maxBeats: ${this.maxBeats}`);
    console.log(`   Events array:`, lifeSpan.events);
  }
  
  // Convert events array to playing regions
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  if (DEBUG.EVENTS) {
    console.log(`   Converted to ${playingRegions.length} playing regions:`, playingRegions);
  }
  
  // Render each playing region
  playingRegions.forEach((region, index) => {
    const leftPercent = (region.start / this.maxBeats) * 100;
    const rightPercent = (region.end / this.maxBeats) * 100;
    const regionWidth = rightPercent - leftPercent;
    
    if (DEBUG.EVENTS) {
      console.log(`   Region ${index + 1}: ${region.start}-${region.end} beats = ${leftPercent.toFixed(1)}%-${rightPercent.toFixed(1)}%`);
    }
    
    const regionElement = document.createElement('div');
    regionElement.className = 'timeline-region playing interactive';
    regionElement.dataset.regionIndex = index;
    
    // UPDATED: Position regions within interaction zone (not full track)
    const finalWidth = Math.max(0.5, regionWidth);
    
    regionElement.style.cssText = `
  position: absolute;
  left: ${leftPercent.toFixed(2)}%;
  width: ${finalWidth.toFixed(2)}%;
  top: 0;
  bottom: 0;
  border-radius: 6px;
  cursor: context-menu;
  transition: all 0.2s ease;
  user-select: none;
  pointer-events: auto;     /* ← Make sure this is auto */
  z-index: 50;
  background: linear-gradient(45deg, #28a745, #34ce57);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  overflow: hidden;
  box-sizing: border-box;
`;

    
    regionElement.title = `Playing region: Beat ${region.start} - ${region.end} (double-click for options)`;
    
    // Add region label and handles (existing code unchanged)
    const regionLabel = this.createRegionLabel(region, finalWidth);
    const leftHandle = this.createRegionHandle(index, 'left');
    const rightHandle = this.createRegionHandle(index, 'right');
    
    regionElement.appendChild(leftHandle);
    regionElement.appendChild(rightHandle);
    regionElement.appendChild(regionLabel);
    
    container.appendChild(regionElement);

    // NEW: Connect region body drag functionality
    this.addRegionBodyDragFunctionality(regionElement, index);
    
    // Render parameter event diamonds for this region
    this.renderParameterEventsForRegion(container, region, index, region.start, region.end);
  });
  
  // Add muted regions between playing regions
  if (playingRegions.length > 0) {
    this.renderMutedRegions(container, playingRegions);
  } else {
    // No playing regions - entire timeline is muted
    const mutedRegion = this.createFullMutedRegion();
    container.appendChild(mutedRegion);
  }
  
  if (DEBUG.EVENTS) {
    console.log(`✅ Rendered ${playingRegions.length} playing regions for Voice ${this.voiceIndex + 1}`);
  }
}

createRegionLabel(region, regionWidthPercent) {
  const regionLabel = document.createElement('div');
  regionLabel.className = 'region-label';
  regionLabel.style.cssText = `
    position: absolute;
    left: 20px;
    right: 20px;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: white;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    pointer-events: none;
    z-index: 60;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  
  // Adaptive label content based on available space
  const effectiveWidth = regionWidthPercent * this.zoomLevel;
  
  if (effectiveWidth > 25) {
    regionLabel.textContent = `Beat ${region.start}-${region.end}`;
  } else if (effectiveWidth > 15) {
    regionLabel.textContent = `${region.start}-${region.end}`;
  } else if (effectiveWidth > 8) {
    const beatCount = region.end - region.start;
    regionLabel.textContent = `${beatCount}b`;
  } else {
    regionLabel.textContent = '▶';
  }
  
  return regionLabel;
}

createRegionHandle(regionIndex, handleType) {
  const handle = document.createElement('div');
  handle.className = `region-drag-handle ${handleType}-handle`;
  handle.dataset.regionIndex = regionIndex;
  handle.dataset.handleType = handleType;
  handle.style.cssText = `
    position: absolute;
    ${handleType}: 0;
    top: 2px;
    bottom: 2px;
    width: 8px;
    background: rgba(40,167,69,0.8);
    border: 2px solid #fff;
    cursor: ew-resize;
    z-index: 200;
    border-radius: ${handleType === 'left' ? '6px 2px 2px 6px' : '2px 6px 6px 2px'};
    transition: all 0.2s ease;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
    pointer-events: auto;
  `;
  handle.title = `Drag to adjust ${handleType === 'left' ? 'start' : 'end'} time`;
  
  // Hover effects
  handle.onmouseenter = function() {
    this.style.background = 'rgba(40,167,69,1.0)';
    this.style.width = '12px';
    this.style.borderColor = '#28a745';
  };
  handle.onmouseleave = function() {
    this.style.background = 'rgba(40,167,69,0.8)';
    this.style.width = '8px';
    this.style.borderColor = '#fff';
  };
  
  // Connect drag functionality
  this.addHandleDragFunctionality(handle, regionIndex, handleType);
  
  return handle;
}

// FIXED: Create full muted region with proper tooltip support
createFullMutedRegion() {
  const mutedRegion = document.createElement('div');
  mutedRegion.className = 'timeline-region muted interactive';
  mutedRegion.style.cssText = `
    position: absolute;
    left: 0;
    right: 0;
    top: 15px;
    bottom: 15px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    pointer-events: auto;
    z-index: 40;
    background: repeating-linear-gradient(
      45deg,
      #6c757d,
      #6c757d 8px,
      #495057 8px,
      #495057 16px
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  `;
  
  mutedRegion.innerHTML = `
    <div style="text-align: center; pointer-events: none;">
      <div style="font-size: 14px; margin-bottom: 2px;">🔇</div>
      <div style="font-size: 11px;">TIMELINE MUTED</div>
      <div style="font-size: 9px; opacity: 0.8;">Double-click to create region</div>
    </div>
  `;
  
  // Add unified tooltip support
  mutedRegion.addEventListener('mouseenter', (e) => {
    const mutedBeat = this.screenXToBeat(e.clientX);
    this.showUnifiedTooltip(e.clientX, e.clientY, {
      type: 'context-help',
      beat: mutedBeat,
      operation: 'Muted Timeline',
      additionalInfo: `Double-click to create playing region • Timeline is currently silent`
    });
  });
  
  mutedRegion.addEventListener('mouseleave', () => {
    this.hideUnifiedTooltip();
  });
  
  mutedRegion.addEventListener('mousemove', (e) => {
    const mutedBeat = this.screenXToBeat(e.clientX);
    this.updateUnifiedTooltip(e.clientX, e.clientY, {
      type: 'beat-indicator',
      beat: mutedBeat,
      additionalInfo: 'Timeline muted - double-click to unmute'
    });
  });
  
  return mutedRegion;
}

// CLEAN: Render parameter event diamonds for a specific region
renderParameterEventsForRegion(container, region, regionIndex, regionStartBeat, regionEndBeat) {
  // NEW: Get parameter events from EventRegistry instead of old system
  const registry = getEventRegistry();
  const voiceEvents = registry.getEventsForVoice(this.voiceIndex);
  
  // Filter to events that fall within this region
  const regionEvents = voiceEvents.filter(event => 
    event.beatPosition >= regionStartBeat && event.beatPosition < regionEndBeat
  );
  
  if (regionEvents.length === 0) {
    if (DEBUG.EVENTS) {
      console.log(`   💎 No EventRegistry events found for region ${regionIndex} (${regionStartBeat}-${regionEndBeat})`);
    }
    return;
  }
  
  if (DEBUG.EVENTS) {
    console.log(`   💎 Rendering ${regionEvents.length} EventRegistry events for region ${regionIndex}`);
    regionEvents.forEach(event => {
      console.log(`     • ${event.parameterName || 'compound'} at beat ${event.beatPosition} (${event.id})`);
    });
  }
  
  regionEvents.forEach((event, eventIndex) => {
    const eventBeat = event.beatPosition;
    const eventLeftPercent = (eventBeat / this.maxBeats) * 100;
    
    // Create diamond marker
    const diamond = document.createElement('div');
    
    // Handle both single and compound events
    let parameterName = 'Unknown';
    let categoryClass = '';
    let isCompound = false;
    
    if (event.type === 'compound-parameter' && event.changes) {
      // Compound event
      const paramNames = Object.keys(event.changes);
      parameterName = paramNames.join(', ');
      categoryClass = this.getParameterCategory(paramNames[0]); // Use first param for styling
      isCompound = true;
      
      if (DEBUG.EVENTS) {
        console.log(`💎 Rendering compound diamond: ${parameterName}`);
      }
    } else if (event.parameterName) {
      // Single parameter event
      parameterName = event.parameterName;
      categoryClass = this.getParameterCategory(event.parameterName);
    } else {
      console.warn(`⚠️ Event has no parameter data:`, event);
    }
    
    diamond.className = `parameter-event-diamond ${categoryClass}`;
    diamond.dataset.eventId = event.id;
    diamond.dataset.regionIndex = regionIndex;
    diamond.dataset.eventType = event.type;
    diamond.dataset.parameter = parameterName;
    diamond.dataset.isCompound = isCompound.toString();
    
    // Calculate relative position for display
    const relativePosition = (eventBeat - regionStartBeat) / (regionEndBeat - regionStartBeat);
    diamond.dataset.relativePosition = relativePosition;
    
    diamond.style.cssText = `
      position: absolute;
      left: ${eventLeftPercent.toFixed(2)}%;
      top: 50%;
      width: 12px;
      height: 12px;
      background: ${this.getParameterEventColor(event.parameterName)};
      border: 2px solid #f39c12;
      border-radius: 2px;
      transform: translate(-50%, -50%) rotate(45deg);
      cursor: grab;
      z-index: 500;
      transition: all 0.2s ease;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      opacity: 1.0;
      pointer-events: auto;
    `;
    
    // Enhanced tooltip for EventRegistry events
    if (isCompound) {
      diamond.title = `💎 Multi-Parameter Event - Beat ${eventBeat}\nParameters: ${parameterName}\nDouble-click to edit`;
    } else {
      diamond.title = `💎 ${parameterName} Event - Beat ${eventBeat}\nDouble-click to edit`;
    }
    
    // Add hover effects
    diamond.onmouseenter = function() {
      this.style.background = '#f1c40f';
      this.style.borderColor = '#e67e22';
      this.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1.3)';
      this.style.boxShadow = '0 6px 16px rgba(243,156,18,0.6)';
    };
    
    diamond.onmouseleave = function() {
      this.style.background = this.dataset.originalColor || '#ffd700';
      this.style.borderColor = '#f39c12';
      this.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1)';
      this.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
    };
    
        // FIXED: Add direct event handlers to diamond to prevent track interference
    diamond.ondblclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log(`💎 DIRECT DIAMOND DOUBLE-CLICK: ${parameterName} (${event.id})`);
      
      // Show context menu directly
      SmallContextMenu.show({
        header: `${parameterName} Event`,
        items: [
          {
            icon: '✏️',
            text: 'Edit Event',
            action: () => {
              console.log(`📝 Edit menu clicked for ${event.id}`);
              this.editParameterEvent(event.id, parameterName);
            }
          },
          {
            icon: '🗑️',
            text: 'Delete Event', 
            action: () => {
              console.log(`🗑️ Delete menu clicked for ${event.id}`);
              this.deleteParameterEvent(event.id, parameterName);
            }
          }
        ]
      }, e.clientX, e.clientY);
    };
    
    // Prevent single clicks from bubbling to track
    diamond.onclick = (e) => {
      e.stopPropagation();
    };

    diamond.dataset.originalColor = this.getParameterEventColor(event.parameterName);
    
    // Add to track (not region container to avoid transform conflicts)
    const track = this.container.querySelector('.visual-timeline-track');
    if (track) {
      track.appendChild(diamond);
    } else {
      container.appendChild(diamond);
    }
    
    if (DEBUG.EVENTS) {
      console.log(`     💎 EventRegistry diamond: ${parameterName} at beat ${eventBeat} (${eventLeftPercent.toFixed(1)}%)`);
    }
  });
}

// NEW: Get parameter category for styling
getParameterCategory(parameterName) {
  if (['VOLUME', 'STEREO BALANCE'].includes(parameterName)) {
    return 'volume';
  } else if (['TEMPO (BPM)', 'RHYTHMS', 'RESTS'].includes(parameterName)) {
    return 'tempo';
  } else if (['MELODIC RANGE', 'INSTRUMENT', 'ATTACK VELOCITY'].includes(parameterName)) {
    return 'melodic';
  } else if (['REVERB', 'DELAY', 'TREMOLO', 'CHORUS', 'PHASER'].includes(parameterName)) {
    return 'effects';
  } else {
    return 'general';
  }
}

// // NEW: Get color for parameter event diamonds
// getParameterEventColor(parameterName) {
//   const colorMap = {
//     'VOLUME': 'linear-gradient(45deg, #ffd700, #f39c12)',
//     'STEREO BALANCE': 'linear-gradient(45deg, #ffd700, #f39c12)',
//     'TEMPO (BPM)': 'linear-gradient(45deg, #e74c3c, #c0392b)',
//     'RHYTHMS': 'linear-gradient(45deg, #e74c3c, #c0392b)',
//     'RESTS': 'linear-gradient(45deg, #e74c3c, #c0392b)',
//     'MELODIC RANGE': 'linear-gradient(45deg, #9b59b6, #8e44ad)',
//     'INSTRUMENT': 'linear-gradient(45deg, #9b59b6, #8e44ad)',
//     'ATTACK VELOCITY': 'linear-gradient(45deg, #9b59b6, #8e44ad)',
//     'REVERB': 'linear-gradient(45deg, #3498db, #2980b9)',
//     'DELAY': 'linear-gradient(45deg, #3498db, #2980b9)',
//     'TREMOLO': 'linear-gradient(45deg, #3498db, #2980b9)',
//     'CHORUS': 'linear-gradient(45deg, #3498db, #2980b9)',
//     'PHASER': 'linear-gradient(45deg, #3498db, #2980b9)'
//   };
  
//   return colorMap[parameterName] || 'linear-gradient(45deg, #ffd700, #f39c12)';
// }

// NEW: Get color for parameter event diamonds (all gold for consistency)
getParameterEventColor(parameterName) {
  // All parameter events use gold diamond for consistency
  return 'linear-gradient(45deg, #ffd700, #f39c12)';
}

// FIXED: Render muted regions with unified tooltip support  
renderMutedRegions(container, playingRegions) {
  const sortedRegions = [...playingRegions].sort((a, b) => a.start - b.start);
  
  // Muted region at start (if needed)
  if (sortedRegions[0].start > 0) {
    const mutedRegion = this.createMutedRegion(0, sortedRegions[0].start, 'start');
    container.appendChild(mutedRegion);
  }
  
  // Muted regions between playing regions
  for (let i = 0; i < sortedRegions.length - 1; i++) {
    const currentEnd = sortedRegions[i].end;
    const nextStart = sortedRegions[i + 1].start;
    
    if (nextStart > currentEnd) {
      const mutedRegion = this.createMutedRegion(currentEnd, nextStart, 'between');
      container.appendChild(mutedRegion);
    }
  }
  
  // Muted region at end (if needed)
  const lastRegion = sortedRegions[sortedRegions.length - 1];
  if (lastRegion.end < this.maxBeats) {
    const mutedRegion = this.createMutedRegion(lastRegion.end, this.maxBeats, 'end');
    container.appendChild(mutedRegion);
  }
}

// NEW: Create individual muted region with unified tooltip
createMutedRegion(startBeat, endBeat, position) {
  const leftPercent = (startBeat / this.maxBeats) * 100;
  const rightPercent = (endBeat / this.maxBeats) * 100;
  const width = rightPercent - leftPercent;
  
  const mutedRegion = document.createElement('div');
  mutedRegion.className = 'timeline-region muted interactive';
  mutedRegion.style.cssText = `
    position: absolute;
    left: ${leftPercent.toFixed(2)}%;
    width: ${Math.max(0.5, width).toFixed(2)}%;
    top: 15px;
    bottom: 15px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    pointer-events: auto;
    z-index: 40;
    background: repeating-linear-gradient(
      45deg,
      #6c757d,
      #6c757d 6px,
      #495057 6px,
      #495057 12px
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    overflow: hidden;
    box-sizing: border-box;
  `;
  
  // Adaptive content based on width
  const mutedWidth = width;
  if (mutedWidth > 10) {
    mutedRegion.innerHTML = `
      <div style="text-align: center; pointer-events: none;">
        <div style="font-size: 12px;">🔇 MUTED</div>
        <div style="font-size: 9px; opacity: 0.8;">Double-click to unmute</div>
      </div>
    `;
  } else if (mutedWidth > 5) {
    mutedRegion.innerHTML = `
      <div style="text-align: center; pointer-events: none; font-size: 10px;">
        🔇
      </div>
    `;
  } else {
    mutedRegion.innerHTML = `<span style="font-size: 8px;">•</span>`;
  }
  
  mutedRegion.title = `Muted region: Beat ${startBeat.toFixed(0)} - ${endBeat.toFixed(0)}`;
  
  // Add unified tooltip support
  mutedRegion.addEventListener('mouseenter', (e) => {
    const mutedBeat = this.screenXToBeat(e.clientX);
    this.showUnifiedTooltip(e.clientX, e.clientY, {
      type: 'context-help',
      beat: mutedBeat,
      operation: 'Muted Region',
      additionalInfo: `Beats ${startBeat.toFixed(0)}-${endBeat.toFixed(0)} • Double-click to create playing region`
    });
  });
  
  mutedRegion.addEventListener('mouseleave', () => {
    this.hideUnifiedTooltip();
  });
  
  mutedRegion.addEventListener('mousemove', (e) => {
    const mutedBeat = this.screenXToBeat(e.clientX);
    this.updateUnifiedTooltip(e.clientX, e.clientY, {
      type: 'beat-indicator',
      beat: mutedBeat,
      additionalInfo: `Muted region - double-click to unmute`
    });
  });
  
  return mutedRegion;
}


    // NEW: Convert events array to playing regions
  convertEventsToRegions(events) {
    if (!events || events.length === 0) {
      if (DEBUG.EVENTS) {
        console.log(`   No events found - timeline fully muted`);
      }
      return [];
    }
    
    // Sort events by beat position
    const sortedEvents = [...events]
      .filter(event => event.type === 'mute') // Only process mute events for now
      .sort((a, b) => a.beatPosition - b.beatPosition);
    
    if (DEBUG.EVENTS) {
      console.log(`   Processing ${sortedEvents.length} mute events:`, sortedEvents);
    }
    
    // Process events to determine playing regions
    const playingRegions = [];
    let isCurrentlyPlaying = false;
    let currentRegionStart = null;
    
    sortedEvents.forEach(event => {
      if (event.action === 'unmute' && !isCurrentlyPlaying) {
        // Start a new playing region
        isCurrentlyPlaying = true;
        currentRegionStart = event.beatPosition;
        
        if (DEBUG.EVENTS) {
          console.log(`     ▶️ Start playing at beat ${event.beatPosition}`);
        }
      } 
      else if (event.action === 'mute' && isCurrentlyPlaying) {
        // End current playing region
        if (currentRegionStart !== null) {
          playingRegions.push({
            start: currentRegionStart,
            end: event.beatPosition
          });
          
          if (DEBUG.EVENTS) {
            console.log(`     ⏹️ End playing at beat ${event.beatPosition} (region: ${currentRegionStart}-${event.beatPosition})`);
          }
        }
        
        isCurrentlyPlaying = false;
        currentRegionStart = null;
      }
    });
    
    // Handle case where playing region extends to end of timeline
    if (isCurrentlyPlaying && currentRegionStart !== null) {
      playingRegions.push({
        start: currentRegionStart,
        end: this.maxBeats // Play until end of timeline
      });
      
      if (DEBUG.EVENTS) {
        console.log(`     ♾️ Playing region extends to end: ${currentRegionStart}-${this.maxBeats}`);
      }
    }
    
    if (DEBUG.EVENTS) {
      console.log(`   Final playing regions:`, playingRegions);
    }
    
    return playingRegions;
  }

 
  renderMutedRegions(container, playingSpans) {
    const sortedSpans = playingSpans.sort((a, b) => a.enterBeats - b.enterBeats);
    const marginPercent = 0; // No gaps - snug regions
    
    // Add muted region at start if needed
    if (sortedSpans[0].enterBeats > 0) {
      const mutedWidth = (sortedSpans[0].enterBeats / this.maxBeats) * 100;
      const finalMutedWidth = Math.max(0.1, mutedWidth);

      
      const mutedRegion = document.createElement('div');
      mutedRegion.className = 'timeline-region muted interactive';
      mutedRegion.style.cssText = `
        position: absolute;
        left: 0%;
        width: ${finalMutedWidth.toFixed(1)}%;
        top: 15px;
        bottom: 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      `;
      mutedRegion.textContent = 'MUTED';
      mutedRegion.title = 'Muted region';
      
      container.appendChild(mutedRegion);
    }
    
    // Add muted regions between playing spans
    for (let i = 0; i < sortedSpans.length - 1; i++) {
      const currentEnd = sortedSpans[i].exitBeats;
      const nextStart = sortedSpans[i + 1].enterBeats;
      
      if (nextStart > currentEnd) {
        const leftPercent = (currentEnd / this.maxBeats) * 100;
        const mutedWidth = ((nextStart - currentEnd) / this.maxBeats) * 100;
        const finalMutedWidth = Math.max(1, mutedWidth - marginPercent);
        
        const mutedRegion = document.createElement('div');
        mutedRegion.className = 'timeline-region muted interactive';
        mutedRegion.style.cssText = `
          position: absolute;
          left: ${leftPercent.toFixed(1)}%;
          width: ${finalMutedWidth.toFixed(1)}%;
          top: 15px;
          bottom: 15px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        `;
        mutedRegion.textContent = 'MUTED';
        mutedRegion.title = 'Click to unmute this section';
        
        container.appendChild(mutedRegion);
      }
    }
    
    // Add muted region at end if needed
    const lastSpan = sortedSpans[sortedSpans.length - 1];
    if (lastSpan.exitBeats < this.maxBeats) {
      const leftPercent = (lastSpan.exitBeats / this.maxBeats) * 100;
      const mutedWidth = ((this.maxBeats - lastSpan.exitBeats) / this.maxBeats) * 100;
      const finalMutedWidth = Math.max(1, mutedWidth - marginPercent);
      
      const mutedRegion = document.createElement('div');
      mutedRegion.className = 'timeline-region muted interactive';
      mutedRegion.style.cssText = `
        position: absolute;
        left: ${leftPercent.toFixed(1)}%;
        width: ${finalMutedWidth.toFixed(1)}%;
        top: 15px;
        bottom: 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      `;
      mutedRegion.textContent = 'MUTED';
      mutedRegion.title = 'Click to unmute this section';
      
      container.appendChild(mutedRegion);
    }
  }
  
  // NEW: Create beat labels display (Feature #5)
  createBeatLabels() {
    const labels = document.createElement('div');
    labels.className = 'timeline-beat-labels';
    labels.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 0 15px;
      margin-bottom: 8px;
      font-size: 10px;
      color: #999;
      font-family: 'Courier New', monospace;
      border-top: 1px solid #eee;
      padding-top: 4px;
    `;
    
    const intervals = 5; // Show 6 beat labels
    
    for (let i = 0; i <= intervals; i++) {
      const percent = (i / intervals) * 100;
      const beats = Math.round((percent / 100) * this.maxBeats);
      
      const label = document.createElement('span');
      label.textContent = `Beat ${beats}`;
      label.title = `Beat ${beats}`;
      
      labels.appendChild(label);
    }
    
    return labels;
  }
  
  createTimeLabels() {
    const labels = document.createElement('div');
    labels.className = 'timeline-time-labels';
    
    const maxTimeMs = beatsToMs(this.maxBeats, this.beatUnit, this.tempo);
    const intervals = 5; // Show 6 time labels (0%, 20%, 40%, 60%, 80%, 100%)
    
    for (let i = 0; i <= intervals; i++) {
      const percent = (i / intervals) * 100;
      const timeMs = (percent / 100) * maxTimeMs;
      const timeFormatted = formatMsToMMSS(timeMs);
      const beats = Math.round((percent / 100) * this.maxBeats);
      
      const label = document.createElement('span');
      label.textContent = `${timeFormatted}`;
      label.title = `Beat ${beats} - ${timeFormatted}`;
      
      labels.appendChild(label);
    }
    
    return labels;
  }
  
  createControls() {
      const controls = document.createElement('div');
      controls.className = 'timeline-controls';
      
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'timeline-control-btn';
      refreshBtn.textContent = '🔄 Reset to Full';
      refreshBtn.title = 'Reset timeline to full-width playing (clear all events)';
      refreshBtn.onclick = () => this.resetToFullPlaying();
      
      // NEW: Add snap to beat toggle
      const snapToggle = document.createElement('label');
      snapToggle.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #666;
        cursor: pointer;
      `;
      
      const snapCheckbox = document.createElement('input');
      snapCheckbox.type = 'checkbox';
      snapCheckbox.checked = this.snapToBeat;
      snapCheckbox.style.cssText = 'width: 16px; height: 16px;';
      snapCheckbox.onchange = (e) => {
        this.snapToBeat = e.target.checked;
        console.log(`📐 Snap to beat: ${this.snapToBeat ? 'ON' : 'OFF'}`);
      };
      
      const snapLabel = document.createElement('span');
      snapLabel.textContent = '📐 Snap to Beat';
      
      snapToggle.appendChild(snapCheckbox);
      snapToggle.appendChild(snapLabel);
      
      controls.appendChild(refreshBtn);
      controls.appendChild(snapToggle);
      
      return controls;
    }
  
  // NEW: Show preview of region being created
 showNewRegionPreview(startBeat, endBeat) {
  // Remove existing preview
  this.clearNewRegionPreview();
  
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  const leftPercent = (startBeat / this.maxBeats) * 100;
  const rightPercent = (endBeat / this.maxBeats) * 100;
  const width = rightPercent - leftPercent;
  
  const preview = document.createElement('div');
  preview.className = 'new-region-preview';
  preview.style.cssText = `
    position: absolute;
    left: ${leftPercent.toFixed(1)}%;
    width: ${Math.max(1, width).toFixed(1)}%;
    top: 15px;
    bottom: 15px;
    background: linear-gradient(45deg, rgba(40,167,69,0.5), rgba(52,206,87,0.5));
    border: 2px dashed #28a745;
    border-radius: 6px;
    z-index: 250;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // NEW: Add live updating label to preview
  const previewLabel = document.createElement('div');
  previewLabel.className = 'preview-region-label';
  previewLabel.style.cssText = `
    color: #28a745;
    font-weight: bold;
    font-size: 11px;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.9);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #28a745;
  `;
  
  // Calculate appropriate label content
  const beatWidth = endBeat - startBeat;
  const effectiveWidth = width * this.zoomLevel;
  
  if (effectiveWidth > 20) {
    previewLabel.textContent = `${startBeat.toFixed(0)}-${endBeat.toFixed(0)}`;
  } else if (effectiveWidth > 10) {
    previewLabel.textContent = `${beatWidth.toFixed(0)}b`;
  } else {
    previewLabel.textContent = '▶';
  }
  
  preview.appendChild(previewLabel);
  track.appendChild(preview);
}

  // NEW: Clear new region preview
  clearNewRegionPreview() {
    const preview = this.container.querySelector('.new-region-preview');
    if (preview) {
      preview.remove();
    }
  }

  // NEW: Create new region in events array
createNewRegionInEvents(startBeat, endBeat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  // CLEAN: Remove any orphaned parameter events in the area we're about to create
  const beforeCount = lifeSpan.events.length;
  lifeSpan.events = lifeSpan.events.filter(event => {
    if (event.type === 'compound-parameter' || event.type === 'parameter') {
      const eventBeat = event.beatPosition || 0;
      // Keep events outside the new region area
      return eventBeat < startBeat || eventBeat > endBeat;
    }
    return true; // Keep mute events
  });
  
  if (lifeSpan.events.length < beforeCount) {
    console.log(`🧹 Cleaned ${beforeCount - lifeSpan.events.length} orphaned parameter events`);
  }
  
  // Generate unique IDs
  const startEventId = `evt-${String(lifeSpan.nextEventId++).padStart(3, '0')}`;
  const endEventId = `evt-${String(lifeSpan.nextEventId++).padStart(3, '0')}`;

    
    // Create events for new region
    const newStartEvent = {
      type: 'mute',
      beatPosition: startBeat,
      action: 'unmute',
      id: startEventId
    };
    
    const newEndEvent = {
      type: 'mute',
      beatPosition: endBeat,
      action: 'mute',
      id: endEventId
    };
    
    // Add events and sort chronologically
    lifeSpan.events.push(newStartEvent);
    lifeSpan.events.push(newEndEvent);
    lifeSpan.events.sort((a, b) => a.beatPosition - b.beatPosition);
    
    if (DEBUG.EVENTS) {
      console.log(`➕ Created new region events: unmute@${startBeat}, mute@${endBeat}`);
      console.log(`   Total events:`, lifeSpan.events.length);
    }
  }  

  // NEW: Show context menu for region (double-click region)
  showRegionContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const region = e.target;
    const regionIndex = parseInt(region.dataset.regionIndex);
    const beat = this.screenXToBeat(e.clientX);
    const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(beat) : beat;
    
    // Get region info for menu
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    const playingRegions = this.convertEventsToRegions(lifeSpan.events);
    const targetRegion = playingRegions[regionIndex];
    
    if (!targetRegion) return;
    
    // Remove any existing context menu
    const existingMenu = document.querySelector('.timeline-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'timeline-context-menu';
    menu.style.cssText = `
      position: fixed;
      left: ${e.clientX + 10}px;
      top: ${e.clientY - 20}px;
      background: white;
      border: 2px solid #4a90e2;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 180px;
      overflow: hidden;
    `;
    
    menu.innerHTML = `
      <div style="background: #4a90e2; color: white; padding: 8px 12px; font-weight: 600; font-size: 12px;">
        Region ${targetRegion.start}-${targetRegion.end}
      </div>
      <div class="menu-item" data-action="parameter-event" style="
        padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #eee;
        display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;
      ">
        <span style="font-size: 14px;">💎</span>
        <span>Set Parameter Event</span>
      </div>
      <div class="menu-item" data-action="delete-region" style="
        padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;
        transition: background 0.2s ease; color: #dc3545;
      ">
        <span style="font-size: 14px;">🗑️</span>
        <span>Delete Region</span>
      </div>
    `;
    
    // Add hover effects
    const menuItems = menu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.onmouseenter = function() {
        this.style.background = '#f8f9fa';
      };
      item.onmouseleave = function() {
        this.style.background = '';
      };
      
      item.onclick = (itemEvent) => {
        itemEvent.preventDefault();
        const action = item.dataset.action;
        
        if (action === 'parameter-event') {
          this.handleParameterEventCreation(regionIndex, snappedBeat);
        } else if (action === 'delete-region') {
          this.handleRegionDeletion(regionIndex);
        }
        
        // Remove menu
        menu.remove();
      };
    });
    
    // Add to document
    document.body.appendChild(menu);
    
    // Auto-remove menu when clicking elsewhere
    const closeMenu = (closeEvent) => {
      if (!menu.contains(closeEvent.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 100);
    
    if (DEBUG.EVENTS) {
      console.log(`📋 Context menu shown for region ${regionIndex} at beat ${snappedBeat}`);
    }
  }

editCompoundEvent(event, beat) {
  // Store the event being edited for later updates
  window.currentEditingEvent = event;
  
  // Show Event Editor
  this.showStreamlinedParameterPicker(beat, event.regionIndex);
  
  // After Event Editor opens, pre-select and populate parameters
  setTimeout(() => {
    if (event.changes) {
      Object.keys(event.changes).forEach(paramName => {
        // Click parameter button to select it
        const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
        if (paramBtn && !paramBtn.classList.contains('selected')) {
          paramBtn.click();
          
          // Mark as having existing values
          paramBtn.classList.add('has-existing-values');
          paramBtn.style.background = '#17a2b8'; // Blue for editing existing
        }
      });
      
      // Update Apply button text for editing
      const applyBtn = document.querySelector('.apply-event-btn');
      if (applyBtn) {
        applyBtn.textContent = 'Update Event';
        applyBtn.style.background = '#17a2b8'; // Blue for update
      }
    }
  }, 300);
  
  if (DEBUG.EVENTS) {
    console.log(`✏️ Opened Event Editor for editing: ${Object.keys(event.changes).join(', ')}`);
  }
}


  // NEW: Handle quick region deletion (Alt+Click)
  handleQuickRegionDelete(e) {
    const region = e.target;
    const regionIndex = parseInt(region.dataset.regionIndex);
    
    // Get region info
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    const playingRegions = this.convertEventsToRegions(lifeSpan.events);
    const targetRegion = playingRegions[regionIndex];
    
    if (!targetRegion) return;
    
    // Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Timeline: Delete region ${targetRegion.start}-${targetRegion.end}`, true);
    }
    
    // Delete immediately (no confirmation - Ctrl+Z available)
    this.handleRegionDeletion(regionIndex);
    
    console.log(`🗑️ Quick deleted region: ${targetRegion.start}-${targetRegion.end} beats (Alt+Click)`);
    
    // Optional: Brief visual feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    feedback.textContent = `🗑️ Region Deleted`;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => feedback.remove(), 300);
    }, 1500);
  }

  // NEW: Handle parameter event creation (from menu or Shift+Click)
  handleParameterEventCreation(regionIndex, beatPosition) {
    console.log(`💎 Creating parameter event at beat ${beatPosition} in region ${regionIndex}`);
    
    // For Phase A.1, show placeholder dialog
    this.showParameterEventPlaceholder(beatPosition);
    
    // TODO: In Phase A.2, this will open parameter selection dialog
  }

  // NEW: Handle region deletion (from menu or Alt+Click)
  handleRegionDeletion(regionIndex) {
    // NEW: Clear any lingering tooltips
    this.clearCreationTooltip();
    this.hideBeatIndicator();

    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    if (!lifeSpan || !lifeSpan.events) return;
    
    // Get region to delete
    const playingRegions = this.convertEventsToRegions(lifeSpan.events);
    const targetRegion = playingRegions[regionIndex];
    
    if (!targetRegion) return;
    
    // Remove events that define this region
    lifeSpan.events = lifeSpan.events.filter(event => {
      if (event.type !== 'mute') return true;
      
      // Remove unmute event at region start
      if (event.action === 'unmute' && event.beatPosition === targetRegion.start) {
        if (DEBUG.EVENTS) {
          console.log(`   🗑️ Removed region start: unmute@${event.beatPosition}`);
        }
        return false;
      }
      
      // Remove mute event at region end
      if (event.action === 'mute' && event.beatPosition === targetRegion.end) {
        if (DEBUG.EVENTS) {
          console.log(`   🗑️ Removed region end: mute@${event.beatPosition}`);
        }
        return false;
      }
      
      return true;
    });
    
    // Sort remaining events
    lifeSpan.events.sort((a, b) => a.beatPosition - b.beatPosition);
    
    if (DEBUG.EVENTS) {
      console.log(`🗑️ Deleted region ${regionIndex}: ${targetRegion.start}-${targetRegion.end} beats`);
      console.log(`   Remaining events:`, lifeSpan.events.length);
    }
    
    // Refresh timeline
    setTimeout(() => {
      this.refresh();
    }, 50);
  }

  

  updateVoiceData() {
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    if (!lifeSpan) {
      console.warn(`Voice ${this.voiceIndex + 1}: No LIFE SPAN parameter`);
      return;
    }
    
    this.maxBeats = lifeSpan.maxTimeBeats || 700;
    this.beatUnit = lifeSpan.beatUnit || 7;
    this.tempo = getCurrentTempoForVoice(this.voiceIndex);
    
    if (DEBUG.TIMELINE) {
      console.log(`📊 Updated timeline data: ${this.maxBeats} beats @ ${this.tempo} BPM`);
    }
  }
  
  updatePlayhead() {
  if (!this.isVisible || !this.playhead || !masterClock || !masterClock.isActive()) {
    return;
  }
  
  const elapsedMs = masterClock.getElapsedTime();
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const maxBeats = lifeSpan ? lifeSpan.maxTimeBeats || 700 : 700;
  const beatUnit = lifeSpan ? lifeSpan.beatUnit || 7 : 7;
  
  // CRITICAL: Use the same locked tempo that the voice clock is using
  let actualTempo = this.tempo; // Fallback
  
  if (voiceClockManager && voiceClockManager.isInitialized) {
    const voiceClock = voiceClockManager.getVoiceClock(this.voiceIndex);
    if (voiceClock && voiceClock.playbackStartTempo) {
      actualTempo = voiceClock.playbackStartTempo; // Use exact same locked tempo
    } else if (voiceClock && voiceClock.currentTempo) {
      actualTempo = voiceClock.currentTempo; // Fallback to current tempo
    }
  }
  
  // Calculate current beat using the SAME tempo as voice clock
  const currentBeat = msToBeats(elapsedMs, beatUnit, actualTempo);
  
  // FIXED: Calculate percentage based on beat position relative to max beats
  let percentage = (currentBeat / maxBeats) * 100;
  
  // Handle repeat cycling
  if (lifeSpan && lifeSpan.repeat && percentage > 100) {
    percentage = percentage % 100;
  }
  
  // CRITICAL: Clamp percentage to prevent off-screen display
  const finalPercentage = Math.max(0, Math.min(100, percentage));
  
  // Update playhead position
  this.playhead.style.left = `${finalPercentage.toFixed(2)}%`;
  
  // Update tooltip with accurate information
  const displayBeat = Math.min(currentBeat, maxBeats);
  const currentTimeFormatted = formatMsToMMSS(elapsedMs);
  
  if (this.playheadTooltip) {
    this.playheadTooltip.textContent = currentTimeFormatted;
    this.playheadTooltip.title = `Beat ${displayBeat.toFixed(1)}/${maxBeats} @ ${actualTempo} BPM`;
  }
  
  // Debug playhead positioning (only when near boundaries)
  if (Math.random() < 0.05 && (finalPercentage > 95 || currentBeat > maxBeats - 2)) {
    console.log(`🎯 Playhead sync: beat ${currentBeat.toFixed(2)}/${maxBeats} = ${finalPercentage.toFixed(1)}% @ ${actualTempo} BPM`);
  }
}
  
// ===== CORRECTED ZOOM AND PAN SYSTEM =====

addZoomSupport() {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  // Add wheel event listener for zooming
  track.addEventListener('wheel', (e) => this.handleZoom(e));
  
  // Add mouse move for beat indicator
  track.addEventListener('mousemove', (e) => this.updateBeatIndicator(e));
  track.addEventListener('mouseleave', () => this.hideBeatIndicator());
  
  // Add pan support (middle mouse or Shift+drag)
  track.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.shiftKey) { // Middle mouse or Shift+left click
      e.preventDefault();
      this.startPanning(e);
    }
  });
  
  // Initialize zoom constraints
  this.calculateZoomConstraints();
  
  if (DEBUG.EVENTS) {
    console.log(`🔍 Zoom support added: ${this.minZoom}x - ${this.maxZoom}x range`);
  }
}

calculateZoomConstraints() {
  // Minimum zoom: Always allow 100% (full timeline view)
  this.minZoom = 1.0;
  
  // Maximum zoom: Calculate based on smallest region and handle visibility
  this.maxZoom = this.calculateMaxZoomForRegions();
  
  // Fallback constraints
  this.maxZoom = Math.max(2.0, Math.min(this.maxZoom, 20.0));
  
  if (DEBUG.EVENTS) {
    console.log(`📏 Zoom constraints: ${this.minZoom}x (100% min) - ${this.maxZoom.toFixed(1)}x max`);
    console.log(`   Based on region handle visibility requirements`);
  }
}

calculateMaxZoomForRegions() {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    return 5.0; // Default if no regions
  }
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  if (playingRegions.length === 0) {
    return 5.0; // Default if no playing regions
  }
  
  // Find the smallest region
  let smallestRegionBeats = this.maxBeats;
  
  playingRegions.forEach(region => {
    const regionWidth = region.end - region.start;
    if (regionWidth < smallestRegionBeats) {
      smallestRegionBeats = regionWidth;
    }
  });
  
  // Calculate max zoom based on handle visibility requirements
  // We need at least 40px total width for both handles (8px each) + some content
  // At maximum zoom, the smallest region should be at least 40px wide
  
  const minRequiredPixels = 50; // 40px for handles + 10px buffer
  const containerWidth = 400; // Approximate timeline track width
  
  // Calculate what zoom level would make smallest region = minRequiredPixels
  const smallestRegionPercent = (smallestRegionBeats / this.maxBeats) * 100;
  const smallestRegionPixelsAt100 = (smallestRegionPercent / 100) * containerWidth;
  
  const maxZoomForSmallest = minRequiredPixels / smallestRegionPixelsAt100;
  
  if (DEBUG.EVENTS) {
    console.log(`📐 Smallest region: ${smallestRegionBeats} beats (${smallestRegionPercent.toFixed(1)}%)`);
    console.log(`   At 100% zoom: ${smallestRegionPixelsAt100.toFixed(1)}px`);
    console.log(`   Max zoom for visibility: ${maxZoomForSmallest.toFixed(1)}x`);
  }
  
  return Math.max(2.0, maxZoomForSmallest);
}

handleZoom(e) {
  e.preventDefault();
  
  const track = this.container.querySelector('.visual-timeline-track');
  const rect = track.getBoundingClientRect();
  
  // Get mouse position relative to track (0-1)
  const mouseX = e.clientX - rect.left;
  const mousePercent = mouseX / rect.width;
  
  // Calculate zoom change
  const zoomDirection = e.deltaY > 0 ? -1 : 1; // Inverted: scroll up = zoom in
  const oldZoom = this.zoomLevel;
  const proposedZoom = this.zoomLevel + (zoomDirection * this.zoomStep);
  
  // NEW: Calculate zoom limit based on handle visibility
  const maxAllowedZoom = this.calculateMaxZoomForHandleVisibility();
  
  // Apply zoom with handle-aware constraints
  this.zoomLevel = Math.max(this.minZoom, Math.min(maxAllowedZoom, proposedZoom));
  
  if (this.zoomLevel !== oldZoom) {
    // NEW: Apply intelligent panning to keep handles visible
    this.applyIntelligentZoomAndPan(mousePercent, oldZoom);
    
    if (DEBUG.EVENTS) {
      const currentBeat = this.screenXToBeat(e.clientX);
      console.log(`🔍 Smart zoom: ${oldZoom.toFixed(1)}x → ${this.zoomLevel.toFixed(1)}x at beat ${currentBeat.toFixed(1)}`);
      console.log(`   Max allowed: ${maxAllowedZoom.toFixed(1)}x (handle visibility limit)`);
    }
  } else if (proposedZoom > maxAllowedZoom) {
    // Show feedback when hitting handle visibility limit
    this.showZoomLimitFeedback('handle-visibility');
  }

  // NEW: Verify handles are still visible after zoom
setTimeout(() => {
  if (!this.areHandlesVisible()) {
    console.log(`⚠️ Handles not visible after zoom - adjusting...`);
    
    // Reduce zoom slightly to bring handles back into view
    this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - (this.zoomStep / 2));
    this.applyIntelligentZoomAndPan(mousePercent, oldZoom);
  }
}, 10);


}

calculateMaxZoomForHandleVisibility() {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return 10.0;
  
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return 10.0;
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  if (playingRegions.length === 0) return 10.0;
  
  // Get actual track width in pixels
  const trackRect = track.getBoundingClientRect();
  const trackWidthPx = trackRect.width;
  
  if (trackWidthPx === 0) return 10.0; // Track not rendered yet
  
  // Calculate current view window
  const currentViewWidth = 1 / this.zoomLevel;
  const currentViewStart = this.panOffset;
  const currentViewEnd = currentViewStart + currentViewWidth;
  
  // Find regions that are currently visible or partially visible
  const visibleRegions = playingRegions.filter(region => {
    const regionStart = region.start / this.maxBeats;
    const regionEnd = region.end / this.maxBeats;
    
    // Region is visible if it overlaps with current view
    return !(regionEnd <= currentViewStart || regionStart >= currentViewEnd);
  });
  
  if (visibleRegions.length === 0) return 10.0; // No visible regions
  
  // For each visible region, calculate maximum zoom before handles disappear
  let minAllowedZoom = 20.0;
  
  visibleRegions.forEach((region, index) => {
    const regionStartPercent = region.start / this.maxBeats;
    const regionEndPercent = region.end / this.maxBeats;
    const regionWidthPercent = regionEndPercent - regionStartPercent;
    
    // Calculate required container width to show both handles + content
    const handleWidthPx = 16; // 8px handle + padding
    const minContentWidthPx = 20; // Minimum content between handles
    const totalRequiredPx = (2 * handleWidthPx) + minContentWidthPx; // 52px minimum
    
    // What zoom level would make this region exactly totalRequiredPx wide?
    const regionWidthAtZoom1 = regionWidthPercent * trackWidthPx; // Pixels at 1x zoom
    const maxZoomForThisRegion = totalRequiredPx / regionWidthAtZoom1;
    
    if (maxZoomForThisRegion < minAllowedZoom) {
      minAllowedZoom = maxZoomForThisRegion;
    }
    
    if (DEBUG.EVENTS && Math.random() < 0.1) {
      console.log(`   Region ${index} (${region.start}-${region.end}): max zoom ${maxZoomForThisRegion.toFixed(1)}x`);
      console.log(`     Width: ${regionWidthPercent.toFixed(3)}% = ${regionWidthAtZoom1.toFixed(1)}px at 1x`);
      console.log(`     Required: ${totalRequiredPx}px for handles`);
    }
  });
  
  return Math.max(2.0, minAllowedZoom);
}


applyIntelligentZoomAndPan(mousePercent, oldZoom) {
  // NEW: Smart panning algorithm to keep handles visible
  const newPanOffset = this.calculateSmartPanOffset();
  this.panOffset = newPanOffset;
  
  // Apply the transform
  const track = this.container.querySelector('.visual-timeline-track');
  const regions = this.container.querySelector('.timeline-regions');
  const playhead = this.container.querySelector('.timeline-playhead-container');
  
  if (!regions) return;
  
  const viewStartPercent = this.panOffset * 100;
  const transform = `scaleX(${this.zoomLevel}) translateX(${-viewStartPercent}%)`;
  
  regions.style.transform = transform;
  regions.style.transformOrigin = 'left center';
  
  if (playhead) {
    playhead.style.transform = transform;
    playhead.style.transformOrigin = 'left center';
  }
  
  // Update track classes
  if (this.zoomLevel > 1.5) {
    track.classList.add('zoomed');
  } else {
    track.classList.remove('zoomed');
  }
  
  // Update controls and labels
  this.updateZoomControls();
  this.updateLabelsForCurrentView();
  
  if (DEBUG.EVENTS) {
    console.log(`🎯 Applied smart pan: ${viewStartPercent.toFixed(1)}% (keeps handles visible)`);
  }
}

calculateSmartPanOffset() {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return 0;
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  if (playingRegions.length === 0) return 0;
  
  const newViewWidth = 1 / this.zoomLevel;
  const maxPanOffset = Math.max(0, 1 - newViewWidth);
  
  // Strategy: Find the leftmost and rightmost regions that need to be visible
  let leftmostRegionStart = 1;
  let rightmostRegionEnd = 0;
  
  playingRegions.forEach(region => {
    const regionStartPercent = region.start / this.maxBeats;
    const regionEndPercent = region.end / this.maxBeats;
    
    if (regionStartPercent < leftmostRegionStart) {
      leftmostRegionStart = regionStartPercent;
    }
    if (regionEndPercent > rightmostRegionEnd) {
      rightmostRegionEnd = regionEndPercent;
    }
  });
  
  // Calculate required view to show all regions with handle padding
  const handlePadding = 0.02; // 2% padding for handles
  const requiredStart = Math.max(0, leftmostRegionStart - handlePadding);
  const requiredEnd = Math.min(1, rightmostRegionEnd + handlePadding);
  const requiredWidth = requiredEnd - requiredStart;
  
  if (requiredWidth <= newViewWidth) {
    // All regions can fit in view - center them
    const idealViewStart = requiredStart - ((newViewWidth - requiredWidth) / 2);
    return Math.max(0, Math.min(maxPanOffset, idealViewStart));
  }
  
  // Not all regions can fit - prioritize keeping the current view regions visible
  const currentViewStart = this.panOffset;
  const currentViewEnd = currentViewStart + (1 / this.zoomLevel);
  
  // Find regions currently in view
  const currentlyVisibleRegions = playingRegions.filter(region => {
    const regionStart = region.start / this.maxBeats;
    const regionEnd = region.end / this.maxBeats;
    return !(regionEnd <= currentViewStart || regionStart >= currentViewEnd);
  });
  
  if (currentlyVisibleRegions.length > 0) {
    // Keep currently visible regions in view
    const visibleStart = Math.min(...currentlyVisibleRegions.map(r => r.start / this.maxBeats));
    const visibleEnd = Math.max(...currentlyVisibleRegions.map(r => r.end / this.maxBeats));
    
    // Try to center the visible regions in the new view
    const visibleCenter = (visibleStart + visibleEnd) / 2;
    const idealViewStart = visibleCenter - (newViewWidth / 2);
    
    return Math.max(0, Math.min(maxPanOffset, idealViewStart));
  }
  
  // Fallback: maintain current pan ratio
  return Math.max(0, Math.min(maxPanOffset, this.panOffset));
}

// NEW: Check if handles are actually visible in current view
areHandlesVisible() {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return true;
  
  const trackRect = track.getBoundingClientRect();
  const handles = track.querySelectorAll('.region-drag-handle');
  
  let allHandlesVisible = true;
  
  handles.forEach(handle => {
    const handleRect = handle.getBoundingClientRect();
    
    // Check if handle is within track bounds
    const isLeftVisible = handleRect.left >= trackRect.left;
    const isRightVisible = handleRect.right <= trackRect.right;
    
    if (!isLeftVisible || !isRightVisible) {
      allHandlesVisible = false;
      
      if (DEBUG.EVENTS && Math.random() < 0.1) {
        const handleType = handle.dataset.handleType;
        console.log(`👁️ Handle ${handleType} not visible: left=${isLeftVisible}, right=${isRightVisible}`);
      }
    }
  });
  
  return allHandlesVisible;
}

calculateIntelligentPanOffset(mousePercent, oldZoom) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    return 0; // No regions to consider
  }
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  if (playingRegions.length === 0) {
    return 0; // No regions to consider
  }
  
  // Find the region that needs the most attention (smallest or closest to mouse)
  const currentViewWidth = 1 / oldZoom;
  const currentViewStart = this.panOffset;
  const mouseBeatInTimeline = currentViewStart + (mousePercent * currentViewWidth);
  
  // Find which region the mouse is over or closest to
  let targetRegion = null;
  let minDistance = this.maxBeats;
  
  playingRegions.forEach(region => {
    const regionCenter = (region.start + region.end) / 2;
    const distance = Math.abs(mouseBeatInTimeline - regionCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      targetRegion = region;
    }
  });
  
  if (!targetRegion) return this.panOffset; // Fallback
  
  // NEW: Calculate pan to keep target region's handles visible
  const newViewWidth = 1 / this.zoomLevel;
  const regionStartPercent = targetRegion.start / this.maxBeats;
  const regionEndPercent = targetRegion.end / this.maxBeats;
  const regionWidthPercent = regionEndPercent - regionStartPercent;
  
  // We need some padding around the region for handles
  const handlePadding = 0.02; // 2% padding on each side
  const requiredViewWidth = regionWidthPercent + (2 * handlePadding);
  
  if (newViewWidth < requiredViewWidth) {
    // Region won't fit in view even with optimal panning
    // Center the region as best we can
    const idealViewStart = regionStartPercent - handlePadding;
    const maxPanOffset = Math.max(0, 1 - newViewWidth);
    
    return Math.max(0, Math.min(maxPanOffset, idealViewStart));
  }
  
  // Region will fit - calculate optimal pan to keep it centered in view
  const regionCenterPercent = (regionStartPercent + regionEndPercent) / 2;
  const idealViewStart = regionCenterPercent - (newViewWidth / 2);
  const maxPanOffset = Math.max(0, 1 - newViewWidth);
  
  return Math.max(0, Math.min(maxPanOffset, idealViewStart));
}


applyZoomAndPan() {
  const track = this.container.querySelector('.visual-timeline-track');
  const regions = this.container.querySelector('.timeline-regions');
  const playhead = this.container.querySelector('.timeline-playhead-container');
  
  if (!track || !regions) return;
  
  // FIXED: Apply transform to regions container only (not track itself)
  // This keeps the container boundaries intact
  const viewWidth = 1 / this.zoomLevel;
  const viewStartPercent = this.panOffset * 100;
  
  // Apply zoom and pan transform to regions and playhead only
  const transform = `scaleX(${this.zoomLevel}) translateX(${-viewStartPercent}%)`;
  
  regions.style.transform = transform;
  regions.style.transformOrigin = 'left center';
  
  if (playhead) {
    playhead.style.transform = transform;
    playhead.style.transformOrigin = 'left center';
  }
  
  // FIXED: Ensure track container clips content properly
  track.style.overflow = 'hidden';
  track.style.position = 'relative';
  
  // FIXED: Add zoom level class for responsive styling
  if (this.zoomLevel > 1.5) {
    track.classList.add('zoomed');
  } else {
    track.classList.remove('zoomed');
  }
  
  if (DEBUG.TIMELINE) {
    console.log(`🔍 Applied zoom: ${this.zoomLevel.toFixed(1)}x, pan: ${viewStartPercent.toFixed(1)}%`);
  }
}

updateLabelsForCurrentView() {
  const viewWidth = 1 / this.zoomLevel;
  const viewStart = this.panOffset;
  const viewEnd = Math.min(1, viewStart + viewWidth);
  
  // Update time labels
  const timeLabels = this.container.querySelector('.timeline-time-labels');
  if (timeLabels) {
    const intervals = 5;
    const labels = timeLabels.querySelectorAll('span');
    
    for (let i = 0; i <= intervals; i++) {
      if (labels[i]) {
        const percent = (i / intervals);
        const timelinePercent = viewStart + (percent * (viewEnd - viewStart));
        const timeMs = timelinePercent * beatsToMs(this.maxBeats, this.beatUnit, this.tempo);
        const timeFormatted = formatMsToMMSS(timeMs);
        const beats = Math.round(timelinePercent * this.maxBeats);
        
        labels[i].textContent = timeFormatted;
        labels[i].title = `Beat ${beats} - ${timeFormatted}`;
      }
    }
  }
  
  // Update beat labels
  const beatLabels = this.container.querySelector('.timeline-beat-labels');
  if (beatLabels) {
    const intervals = 5;
    const labels = beatLabels.querySelectorAll('span');
    
    for (let i = 0; i <= intervals; i++) {
      if (labels[i]) {
        const percent = (i / intervals);
        const timelinePercent = viewStart + (percent * (viewEnd - viewStart));
        const beats = Math.round(timelinePercent * this.maxBeats);
        
        labels[i].textContent = `Beat ${beats}`;
        labels[i].title = `Beat ${beats}`;
      }
    }
  }
}

startPanning(e) {
  e.preventDefault();
  
  const startX = e.clientX;
  const startPan = this.panOffset;
  let isPanning = false;
  
  const handlePanMove = (e) => {
    if (!isPanning) {
      isPanning = true;
      document.body.style.cursor = 'grabbing';
    }
    
    const deltaX = e.clientX - startX;
    const track = this.container.querySelector('.visual-timeline-track');
    const panSensitivity = 1 / (track.offsetWidth * this.zoomLevel);
    
    const newPan = startPan - (deltaX * panSensitivity);
    const maxPan = Math.max(0, 1 - (1 / this.zoomLevel));
    
    this.panOffset = Math.max(0, Math.min(maxPan, newPan));
    this.applyZoomAndPan();
    this.updateLabelsForCurrentView(); // Update labels during pan
  };
  
  const handlePanEnd = () => {
    document.removeEventListener('mousemove', handlePanMove);
    document.removeEventListener('mouseup', handlePanEnd);
    document.body.style.cursor = '';
  };
  
  document.addEventListener('mousemove', handlePanMove);
  document.addEventListener('mouseup', handlePanEnd);
}

// ===== UNIFIED BEAT INDICATOR SYSTEM (NO TIMEOUTS) =====

updateBeatIndicator(e) {
  if (!this.showBeatIndicator) {
    this.hideBeatIndicator();
    return;
  }
  
  // NEW: Skip beat indicator for diamonds - they have their own tooltips
  if (e.target && e.target.classList.contains('parameter-event-diamond')) {
    this.hideBeatIndicator();
    return;
  }

  
  const beat = this.screenXToBeat(e.clientX);
  const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(beat) : beat;
  const clampedBeat = Math.max(0, Math.min(this.maxBeats, snappedBeat));
  const roundedBeat = Math.round(clampedBeat);
  
  // Only update tooltip when beat number actually changes
  if (this.lastDisplayedBeat !== roundedBeat) {
    this.lastDisplayedBeat = roundedBeat;
    this.currentBeat = clampedBeat;
    
    // Only update tooltip when beat changes
    this.showUnifiedBeatTooltip(e.clientX, e.clientY, clampedBeat);
    
    // Update cursor (also only when beat changes)
    this.updateCursorWithBeat(clampedBeat);
    
    if (DEBUG.EVENTS && Math.random() < 0.1) {
      console.log(`📍 Beat changed to: ${roundedBeat} (tooltip updated)`);
    }
  } else {
    // Beat hasn't changed - just update tooltip position without recreating content
    this.updateTooltipPosition(e.clientX, e.clientY);
  }
}

// NEW: Update tooltip position without changing content
updateTooltipPosition(clientX, clientY) {
  const existingTooltip = document.querySelector('.unified-beat-tooltip');
  if (existingTooltip) {
    existingTooltip.style.left = `${clientX + 15}px`;
    existingTooltip.style.top = `${clientY - 45}px`;
  }
}


showUnifiedBeatTooltip(clientX, clientY, beat) {
  // Remove existing tooltip
  const existingTooltip = document.querySelector('.unified-beat-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create persistent tooltip (no timeout)
  const tooltip = document.createElement('div');
  tooltip.className = 'unified-beat-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${clientX + 15}px;
    top: ${clientY - 45}px;
    background: linear-gradient(135deg, #333 0%, #2c3e50 100%);
    color: #ffd700;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    z-index: 10000;
    pointer-events: none;
    white-space: nowrap;
    border: 2px solid #ffd700;
    min-width: 120px;
  `;
  
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  const isInPlaying = this.checkIfBeatIsInPlayingRegion(beat);
  const zoomInfo = this.zoomLevel !== 1.0 ? ` | ${Math.round(this.zoomLevel * 100)}%` : '';
  
  tooltip.innerHTML = `
  <div style="display: flex; align-items: center; gap: 8px;">
    <div style="flex: 1;">
      <div style="color: #ffd700; font-weight: bold; font-size: 14px;">Beat ${beat.toFixed(0)}</div>
      <div style="color: #bdc3c7; font-size: 11px;">${timeFormatted}${zoomInfo}</div>
    </div>
    <div style="color: ${isInPlaying ? '#2ecc71' : '#e74c3c'}; font-size: 16px;">
      ${isInPlaying ? '▶' : '⏸'}
    </div>
  </div>
  <div style="color: #17a2b8; font-size: 10px; text-align: center; margin-top: 4px; font-weight: 600; border-top: 1px solid #555; padding-top: 4px;">
    ${this.getRegionDescription(beat)}
  </div>
`;

  
  document.body.appendChild(tooltip);
}

// NEW: Show tooltip specifically for region creation
showCreationTooltip(clientX, clientY, startBeat, endBeat) {
  // Remove existing tooltip
  const existingTooltip = document.querySelector('.creation-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  const tooltip = document.createElement('div');
  tooltip.className = 'creation-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${clientX + 15}px;
    top: ${clientY - 50}px;
    background: linear-gradient(135deg, #28a745 0%, #34ce57 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    z-index: 10000;
    pointer-events: none;
    border: 2px solid #28a745;
  `;
  
  const width = endBeat - startBeat;
  const startTimeMs = beatsToMs(startBeat, this.beatUnit, this.tempo);
  const endTimeMs = beatsToMs(endBeat, this.beatUnit, this.tempo);
  const startTime = formatMsToMMSS(startTimeMs);
  const endTime = formatMsToMMSS(endTimeMs);
  
  tooltip.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">🆕 Creating Region</div>
    <div style="font-size: 11px;">Start: Beat ${startBeat.toFixed(0)} (${startTime})</div>
    <div style="font-size: 11px;">End: Beat ${endBeat.toFixed(0)} (${endTime})</div>
    <div style="font-size: 10px; opacity: 0.9; margin-top: 4px; text-align: center;">
      Width: ${width.toFixed(1)} beats
    </div>
  `;
  
  document.body.appendChild(tooltip);
}

// NEW: Show tooltip specifically for diamond dragging
showDiamondDragTooltip(clientX, clientY, beat, parameterName) {
  // Remove existing diamond tooltip
  this.clearDiamondDragTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.className = 'diamond-drag-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    left: ${clientX + 15}px;
    top: ${clientY - 55}px;
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    box-shadow: 0 6px 18px rgba(243,156,18,0.6);
    z-index: 10001;
    pointer-events: none;
    border: 2px solid #ffd700;
  `;
  
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  tooltip.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
      <span style="font-size: 14px;">💎</span>
      <div style="font-weight: bold;">${parameterName}</div>
    </div>
    <div style="font-size: 11px; text-align: center;">
      Moving to Beat ${beat.toFixed(0)}
    </div>
    <div style="font-size: 10px; opacity: 0.9; text-align: center;">
      ${timeFormatted}
    </div>
  `;
  
  document.body.appendChild(tooltip);
}

// NEW: Clear diamond drag tooltip
clearDiamondDragTooltip() {
  const tooltip = document.querySelector('.diamond-drag-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}


// ENHANCED: Clear all creation-related tooltips
clearCreationTooltip() {
  const tooltipSelectors = [
    '.creation-tooltip',
    '.unified-beat-tooltip',
    '.diamond-drag-tooltip'
  ];
  
  tooltipSelectors.forEach(selector => {
    const tooltip = document.querySelector(selector);
    if (tooltip) {
      tooltip.remove();
    }
  });
  
  if (DEBUG.EVENTS) {
    console.log(`🧹 Cleared all creation tooltips`);
  }
}


// NEW: Show brief success message for region creation
showRegionCreatedSuccess(startBeat, endBeat) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  
  const width = endBeat - startBeat;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">🎵</span>
      <div>
        <div>Region Created</div>
        <div style="font-size: 11px; opacity: 0.9;">Beats ${startBeat.toFixed(0)}-${endBeat.toFixed(0)} (${width.toFixed(0)} beats)</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

getRegionDescription(beat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    return `Full timeline: Beat 0-${this.maxBeats}`;
  }
  
  // Find which region this beat belongs to using your existing convertEventsToRegions
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  // Check if beat is in any playing region
  for (let i = 0; i < playingRegions.length; i++) {
    const region = playingRegions[i];
    if (beat >= region.start && beat < region.end) {
      return `Playing region: Beat ${region.start}-${region.end}`;
    }
  }
  
  // If not in playing region, determine muted region
  if (playingRegions.length === 0) {
    return `Muted timeline: Beat 0-${this.maxBeats}`;
  }
  
  // Find which muted gap this beat is in
  const sorted = [...playingRegions].sort((a, b) => a.start - b.start);
  
  // Check if in start gap
  if (beat < sorted[0].start) {
    return `Muted start: Beat 0-${sorted[0].start}`;
  }
  
  // Check gaps between playing regions
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].end;
    const nextStart = sorted[i + 1].start;
    
    if (beat >= currentEnd && beat < nextStart) {
      return `Muted gap: Beat ${currentEnd}-${nextStart}`;
    }
  }
  
  // Check end gap
  const lastRegion = sorted[sorted.length - 1];
  if (beat >= lastRegion.end) {
    return `Muted end: Beat ${lastRegion.end}-${this.maxBeats}`;
  }
  
  return `Timeline: Beat ${beat.toFixed(0)} of ${this.maxBeats}`;
}

// NEW: Find which region index contains a specific beat
findRegionIndexForBeat(beat) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return -1;
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  for (let i = 0; i < playingRegions.length; i++) {
    const region = playingRegions[i];
    if (beat >= region.start && beat < region.end) {
      return i;
    }
  }
  
  return -1; // Beat not in any playing region
}

hideBeatIndicator() {
  // Clear all tooltip types
  const tooltipSelectors = [
    '.unified-beat-tooltip',
    '.creation-tooltip', 
    '.diamond-drag-tooltip'
  ];
  
  tooltipSelectors.forEach(selector => {
    const tooltip = document.querySelector(selector);
    if (tooltip) {
      tooltip.style.transition = 'opacity 0.2s ease';
      tooltip.style.opacity = '0';
      setTimeout(() => tooltip.remove(), 200);
    }
  });
  
  this.currentBeat = null;
  this.lastDisplayedBeat = null;
}
updateCursorWithBeat(beat) {
  const track = this.container.querySelector('.visual-timeline-track');
  const isInPlaying = this.checkIfBeatIsInPlayingRegion(beat);
  
  // DON'T override cursor - let CSS handle it
  // Just update the title tooltip
  if (isInPlaying) {
    track.title = `Beat ${beat.toFixed(0)} - Playing region | Double-click for parameter event`;
  } else {
    track.title = `Beat ${beat.toFixed(0)} - Muted region | Double-click to create region`;
  }
  // NO CURSOR CHANGES - let CSS rules handle cursors properly
}

// ===== CORRECTED ZOOM CONTROLS =====

createZoomControls() {
  const controls = document.createElement('div');
  controls.className = 'timeline-zoom-controls';
  controls.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #dee2e6;
    border-top: 1px solid #dee2e6;
  `;
  
  // Zoom out button
  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.textContent = '🔍−';
  zoomOutBtn.className = 'zoom-btn zoom-out-btn';
  zoomOutBtn.title = 'Zoom out (scroll wheel down)';
  zoomOutBtn.onclick = () => this.zoomOut();
  
  // Zoom level display with better formatting
  const zoomDisplay = document.createElement('span');
  zoomDisplay.className = 'zoom-display';
  zoomDisplay.style.cssText = `
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: 600;
    color: #495057;
    min-width: 60px;
    text-align: center;
    background: white;
    border: 1px solid #4a90e2;
    border-radius: 3px;
    padding: 4px 8px;
  `;
  zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
  
  // Zoom in button
  const zoomInBtn = document.createElement('button');
  zoomInBtn.textContent = '🔍+';
  zoomInBtn.className = 'zoom-btn zoom-in-btn';
  zoomInBtn.title = 'Zoom in (scroll wheel up)';
  zoomInBtn.onclick = () => this.zoomIn();
  
  // Reset zoom button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '🔍 100%';
  resetBtn.className = 'zoom-btn zoom-reset-btn';
  resetBtn.title = 'Reset zoom to 100%';
  resetBtn.onclick = () => this.resetZoom();
  
  // Fit to timeline button
  const fitBtn = document.createElement('button');
  fitBtn.textContent = '🔍 Fit';
  fitBtn.className = 'zoom-btn zoom-fit-btn';
  fitBtn.title = 'Fit entire timeline in view';
  fitBtn.onclick = () => this.fitToView();
  
  // View info display
  const viewInfo = document.createElement('span');
  viewInfo.className = 'zoom-view-info';
  viewInfo.style.cssText = `
    font-size: 11px;
    color: #666;
    font-family: 'Courier New', monospace;
    margin-left: 15px;
  `;
  this.updateViewInfo(viewInfo);
  
  // Beat indicator toggle
  const indicatorToggle = document.createElement('label');
  indicatorToggle.style.cssText = `
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #666;
    cursor: pointer;
    margin-left: auto;
  `;
  
  const indicatorCheckbox = document.createElement('input');
  indicatorCheckbox.type = 'checkbox';
  indicatorCheckbox.checked = this.showBeatIndicator;
  indicatorCheckbox.style.cssText = 'width: 16px; height: 16px;';
  indicatorCheckbox.onchange = (e) => {
    this.showBeatIndicator = e.target.checked;
    if (!this.showBeatIndicator) {
      this.hideBeatIndicator();
    }
    console.log(`💎 Beat indicator: ${this.showBeatIndicator ? 'ON' : 'OFF'}`);
  };
  
  const indicatorLabel = document.createElement('span');
  indicatorLabel.textContent = '💎 Beat Tooltip';
  
  indicatorToggle.appendChild(indicatorCheckbox);
  indicatorToggle.appendChild(indicatorLabel);
  
  controls.appendChild(zoomOutBtn);
  controls.appendChild(zoomDisplay);
  controls.appendChild(zoomInBtn);
  controls.appendChild(resetBtn);
  controls.appendChild(fitBtn);
  controls.appendChild(viewInfo);
  controls.appendChild(indicatorToggle);
  
  return controls;
}

zoomIn() {
  const oldZoom = this.zoomLevel;
  this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
  
  if (this.zoomLevel !== oldZoom) {
    // FIXED: Prevent pan drift during button zoom
    const maxPan = Math.max(0, 1 - (1 / this.zoomLevel));
    this.panOffset = Math.min(this.panOffset, maxPan);
    
    this.applyZoomAndPan();
    this.updateZoomControls();
    this.updateLabelsForCurrentView();
  }
}

zoomOut() {
  const oldZoom = this.zoomLevel;
  this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
  
  if (this.zoomLevel !== oldZoom) {
    // FIXED: Prevent pan drift during button zoom
    const maxPan = Math.max(0, 1 - (1 / this.zoomLevel));
    this.panOffset = Math.min(this.panOffset, maxPan);
    
    this.applyZoomAndPan();
    this.updateZoomControls();
    this.updateLabelsForCurrentView();
  }
}

resetZoom() {
  this.zoomLevel = 1.0;
  this.panOffset = 0;
  this.applyZoomAndPan();
  this.updateZoomControls();
  this.updateLabelsForCurrentView();
  
  if (DEBUG.EVENTS) {
    console.log(`🔍 Zoom reset to 100%`);
  }
}

fitToView() {
  this.zoomLevel = 1.0;
  this.panOffset = 0;
  this.applyZoomAndPan();
  this.updateZoomControls();
  this.updateLabelsForCurrentView();
  
  if (DEBUG.EVENTS) {
    console.log(`🔍 Fit to view: 100%`);
  }
}

updateZoomControls() {
  const zoomDisplay = this.container.querySelector('.zoom-display');
  if (zoomDisplay) {
    zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
  }
  
  // Update view info
  const viewInfo = this.container.querySelector('.zoom-view-info');
  if (viewInfo) {
    this.updateViewInfo(viewInfo);
  }
  
  // Update button states
  const zoomInBtn = this.container.querySelector('.zoom-in-btn');
  const zoomOutBtn = this.container.querySelector('.zoom-out-btn');
  
  if (zoomInBtn) {
    zoomInBtn.disabled = (this.zoomLevel >= this.maxZoom);
    zoomInBtn.style.opacity = zoomInBtn.disabled ? '0.5' : '1.0';
    zoomInBtn.style.cursor = zoomInBtn.disabled ? 'not-allowed' : 'pointer';
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.disabled = (this.zoomLevel <= this.minZoom);
    zoomOutBtn.style.opacity = zoomOutBtn.disabled ? '0.5' : '1.0';
    zoomOutBtn.style.cursor = zoomOutBtn.disabled ? 'not-allowed' : 'pointer';
  }
}

showZoomLimitFeedback(limitType) {
  // Remove existing feedback
  const existingFeedback = document.querySelector('.zoom-limit-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'zoom-limit-feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 6px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #856404;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-align: center;
  `;
  
  if (limitType === 'max') {
    const smallestRegion = this.findSmallestRegion();
    feedback.innerHTML = `
      <div style="margin-bottom: 8px;">🔍 Maximum Zoom Reached</div>
      <div style="font-size: 12px; color: #666;">
        Limited by smallest region (${smallestRegion} beats)<br>
        Region handles need to remain visible
      </div>
    `;
  } else {
    feedback.innerHTML = `
      <div style="margin-bottom: 8px;">🔍 Minimum Zoom Reached</div>
      <div style="font-size: 12px; color: #666;">
        Cannot zoom out beyond full timeline view (100%)
      </div>
    `;
  }

  document.body.appendChild(feedback);
  
  // NEW: Clear any timeout and store reference
clearTimeout(this.tooltipTimeout);
this.tooltipTimeout = setTimeout(() => {
  if (tooltip.parentElement) {
    tooltip.remove();
  }
}, 2000);

  // Auto-remove after 2 seconds
  setTimeout(() => {
    feedback.style.transition = 'opacity 0.3s ease';
    feedback.style.opacity = '0';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

findSmallestRegion() {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return this.maxBeats;
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  
  if (playingRegions.length === 0) return this.maxBeats;
  
  let smallest = this.maxBeats;
  playingRegions.forEach(region => {
    const width = region.end - region.start;
    if (width < smallest) {
      smallest = width;
    }
  });
  
  return smallest;
}


updateViewInfo(viewInfo) {
  const viewWidth = 1 / this.zoomLevel;
  const viewStartBeat = Math.round(this.panOffset * this.maxBeats);
  const viewEndBeat = Math.round((this.panOffset + viewWidth) * this.maxBeats);
  
  if (this.zoomLevel === 1.0) {
    viewInfo.textContent = `Showing full timeline (0-${this.maxBeats} beats)`;
  } else {
    viewInfo.textContent = `Showing beats ${viewStartBeat}-${viewEndBeat} of ${this.maxBeats}`;
  }
}

// ===== ENHANCED SCREEN COORDINATE CONVERSION (ZOOM-AWARE) =====
screenXToBeat(screenX) {
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return 0;
  
  const rect = track.getBoundingClientRect();
  const relativeX = screenX - rect.left;
  const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
  
  // FIXED: Apply zoom and pan transformation correctly
  const viewWidth = 1 / this.zoomLevel;
  const viewStart = this.panOffset;
  const actualTimelinePercent = viewStart + (percentage * viewWidth);
  
  // Clamp to valid timeline range
  const clampedPercent = Math.max(0, Math.min(1, actualTimelinePercent));
  const beat = clampedPercent * this.maxBeats;
  
  return beat;
}


refresh() {
  if (!this.container) {
    console.error(`❌ Cannot refresh: container is null`);
    return;
  }
  
  if (DEBUG.TIMELINE) {
    console.log(`🔄 Refreshing Visual Timeline for Voice ${this.voiceIndex + 1}`);
    console.log(`   Container exists: ${!!this.container}`);
    console.log(`   Is visible: ${this.isVisible}`);
  }
  
  try {
    // Store current zoom state
    const currentZoom = this.zoomLevel;
    const currentPan = this.panOffset;
    const currentBeatIndicator = this.showBeatIndicator;
    
    if (DEBUG.TIMELINE) {
      console.log(`   Storing state: zoom=${currentZoom}x, pan=${(currentPan*100).toFixed(1)}%`);
    }
    
    // Recalculate zoom constraints when regions change
    const oldMaxZoom = this.maxZoom;
    this.calculateZoomConstraints();
    
    // If current zoom exceeds new maximum, clamp it
    if (this.zoomLevel > this.maxZoom) {
      if (DEBUG.EVENTS) {
        console.log(`🔍 Clamping zoom: ${this.zoomLevel.toFixed(1)}x → ${this.maxZoom.toFixed(1)}x (region handles require visibility)`);
      }
      this.zoomLevel = this.maxZoom;
      
      // Adjust pan to stay within bounds
      const maxPan = Math.max(0, 1 - (1 / this.zoomLevel));
      this.panOffset = Math.min(this.panOffset, maxPan);
    }
    
    // Re-render with preserved state
    this.render(this.container);
    
    // Restore zoom state after render
    this.zoomLevel = currentZoom;
    this.panOffset = currentPan;
    this.showBeatIndicator = currentBeatIndicator;
    
    if (DEBUG.TIMELINE) {
      console.log(`✅ Timeline refreshed successfully`);
    }
    
  } catch (error) {
    console.error(`❌ Error during timeline refresh:`, error);
    console.error(`   Error message:`, error.message);
    console.error(`   Container state:`, !!this.container);
    
    // Try to recover by re-showing timeline
    setTimeout(() => {
      console.log(`🔧 Attempting timeline recovery...`);
      showVisualTimeline();
    }, 500);
  }
}


  // NEW: Force update all region labels to current state
  updateAllRegionLabels() {
    const regions = this.container.querySelectorAll('.timeline-region.playing');
    
    regions.forEach((region, index) => {
      const regionIndex = parseInt(region.dataset.regionIndex);
      if (isNaN(regionIndex)) return;
      
      // Get current region data from events
      const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
      const playingRegions = this.convertEventsToRegions(lifeSpan.events);
      
      if (playingRegions[regionIndex]) {
        const currentRegion = playingRegions[regionIndex];
        this.updateRegionLabel(region, currentRegion.start, currentRegion.end);
        
        if (DEBUG.EVENTS) {
          console.log(`🏷️ Force-updated region ${regionIndex} label: ${currentRegion.start}-${currentRegion.end}`);
        }
      }
    });
  }

  startUpdating() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.updatePlayhead();
    }, 50); // 20 FPS
    
    if (DEBUG.TIMELINE) {
      console.log(`▶️ Started timeline updates for Voice ${this.voiceIndex + 1}`);
    }
  }
  
  stopUpdating() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (DEBUG.TIMELINE) {
      console.log(`⏹️ Stopped timeline updates for Voice ${this.voiceIndex + 1}`);
    }
  }
  
  destroy() {
    this.stopUpdating();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    
    this.playhead = null;
    this.isVisible = false;
    
    if (DEBUG.TIMELINE) {
      console.log(`🗑️ VisualTimeline destroyed for Voice ${this.voiceIndex + 1}`);
    }
  }
  
  updateForVoice(newVoiceIndex) {
    this.voiceIndex = newVoiceIndex;
    
    if (this.isVisible && this.container) {
      this.refresh();
    }
    
    if (DEBUG.TIMELINE) {
      console.log(`🔄 VisualTimeline updated for Voice ${newVoiceIndex + 1}`);
    }
  }

  // NEW: Reset timeline to full-width playing
  resetToFullPlaying() {
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    if (!lifeSpan) return;
    
    // NEW: Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Timeline: Reset to full playing`, true);
    }
    
    // Reset events to default (play from 0 to maxBeats)
    const maxBeats = lifeSpan.maxTimeBeats || 700;
    
    lifeSpan.events = [
      {
        type: 'mute',
        beatPosition: 0,
        action: 'unmute',
        id: 'default-start'
      },
      {
        type: 'mute',
        beatPosition: maxBeats,
        action: 'mute',
        id: 'default-end'
      }
    ];
    
    lifeSpan.nextEventId = 1; // Reset event counter
    
    if (DEBUG.EVENTS) {
      console.log(`🔄 Reset Voice ${this.voiceIndex + 1} to full playing (0-${maxBeats} beats)`);
      console.log(`   Events:`, lifeSpan.events);
    }
    
    // Refresh timeline
    this.refresh();
    
    // Show visual feedback
    const refreshBtn = this.container.querySelector('.timeline-control-btn');
    if (refreshBtn) {
      const originalText = refreshBtn.textContent;
      refreshBtn.textContent = '✅ Reset';
      refreshBtn.style.background = '#28a745';
      
      setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.style.background = '';
      }, 1500);
    }
  }
 
 // ===== PARAMETER EVENT CREATION SYSTEM =====

createParameterEventAtBeat(beat, clientX, clientY) {
  // Use streamlined parameter selection for Session 25
  this.showStreamlinedParameterPicker(beat, 0); // regionIndex 0 for now
}


// ===== CONTEXT MENU ACTION METHODS =====

startParameterEventCreation(beat, regionIndex) {
  if (DEBUG.EVENTS) {
    console.log(`💎 Parameter event creation at beat ${beat.toFixed(0)} in region ${regionIndex}`);
  }
  
  // Use your existing system
  this.createParameterEventAtBeat(beat, window.innerWidth / 2, window.innerHeight / 2);
}

copyRegion(regionIndex, targetRegion) {
  const regionData = {
    start: targetRegion.start,
    end: targetRegion.end,
    width: targetRegion.end - targetRegion.start,
    voiceIndex: this.voiceIndex,
    timestamp: Date.now()
  };
  
  window.copiedRegion = regionData;
  
  if (DEBUG.EVENTS) {
    console.log(`📋 Copied region: ${targetRegion.start}-${targetRegion.end} beats`);
  }
  
  // Show success feedback
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #17a2b8;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
  `;
  feedback.textContent = `📋 Region Copied (${regionData.width} beats)`;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => feedback.remove(), 2000);
}

confirmDeleteRegion(regionIndex, targetRegion) {
  if (confirm(`Delete region ${targetRegion.start}-${targetRegion.end}?`)) {
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Delete region ${targetRegion.start}-${targetRegion.end}`, true);
    }
    
    this.handleRegionDeletion(regionIndex);
  }
}

handleDiamondDoubleClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const diamond = e.target;
  const eventId = diamond.dataset.eventId;
  const parameterName = diamond.dataset.parameter;
  const regionIndex = parseInt(diamond.dataset.regionIndex);
  
  console.log(`💎 Diamond double-click: ${parameterName} event (${eventId})`);
  
  if (!eventId || !parameterName) {
    console.warn(`⚠️ Diamond missing data: eventId=${eventId}, param=${parameterName}`);
    return;
  }
  
  // Get event data for menu
  const event = eventRegistry.getEvent(eventId);
  if (!event) {
    console.error(`❌ Event ${eventId} not found in registry`);
    return;
  }
  
  let headerText = `${parameterName} Event`;
  
  // Check if it's a compound event
  if (event.type === 'compound-parameter' && event.changes) {
    const affectedParams = Object.keys(event.changes);
    headerText = `Multi-Parameter Event (${affectedParams.length})`;
  }
  
  // Show context menu with Edit and Delete options
  SmallContextMenu.show({
    header: headerText,
    items: [
      {
        icon: '✏️',
        text: 'Edit Event',
        action: () => this.editParameterEvent(eventId, parameterName)
      },
      {
        icon: '🗑️',
        text: 'Delete Event',
        action: () => this.deleteParameterEvent(eventId, parameterName)
      }
    ]
  }, e.clientX, e.clientY);
}



showStreamlinedParameterPicker(beat, regionIndex) {
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  // Create the compound parameter event editor
  const editor = document.createElement('div');
  editor.className = 'compound-parameter-editor';
  editor.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 3px solid #4a90e2;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 10001;
    width: 700px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  
  editor.innerHTML = `
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 15px 20px; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 18px;">💎</span>
        <span style="margin-left: 8px;">Voice ${this.voiceIndex + 1} - Beat ${beat.toFixed(0)}</span>
      </div>
      <div style="font-size: 12px; opacity: 0.9;">${timeFormatted}</div>
    </div>
    
        <!-- Parameter Selection Grid -->
        <div style="background: #f8f9fa; border-bottom: 2px solid #dee2e6; padding: 15px;">
          <div style="text-align: center; margin-bottom: 12px; font-weight: 600; color: #333;">PRIMARY EDITING INTERFACE</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 2px; background: #dee2e6; border: 2px solid #dee2e6; padding: 2px;">
            
            <!-- Column 1: Mixing & Levels -->
            <div class="param-column" style="background: white; padding: 12px; border-right: 1px solid #dee2e6;">
              <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; font-weight: 600; text-align: center;">MIXING</div>
              <div class="param-btn" data-param="VOLUME">🔊 Volume</div>
              <div class="param-btn" data-param="STEREO BALANCE">⚖️ Stereo Balance</div>
            </div>
            
            <!-- Column 2: Instrument & Sound -->
            <div class="param-column" style="background: white; padding: 12px; border-right: 1px solid #dee2e6;">
              <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; font-weight: 600; text-align: center;">INSTRUMENT</div>
              <div class="param-btn" data-param="INSTRUMENT">🎼 Instrument</div>
              <div class="param-btn" data-param="POLYPHONY">🎛️ Polyphony</div>
              <div class="param-btn" data-param="ATTACK VELOCITY">⚡ Attack Velocity</div>
              <div class="param-btn" data-param="DETUNING">🎚️ Detuning</div>
              <div class="param-btn" data-param="PORTAMENTO GLIDE TIME">🌊 Portamento</div>
            </div>
            
            <!-- Column 3: Character -->
            <div class="param-column" style="background: white; padding: 12px; border-right: 1px solid #dee2e6;">
              <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; font-weight: 600; text-align: center;">CHARACTER</div>
              <div class="param-btn" data-param="TEMPO (BPM)">🎵 Tempo</div>
              <div class="param-btn" data-param="MELODIC RANGE">🎹 Melodic Range</div>
              
              <!-- Phrase Builder Subsection -->
              <div style="margin: 8px 0; padding: 8px; background: white; border: 0px solid #e9ecef; border-radius: 4px;">
                <div style="font-size: 13px; color: #666; font-weight: 600; text-align: center; margin-bottom: 6px;">PHRASE BUILDER</div>
                <div class="param-btn phrase-builder-btn" data-param="RHYTHMS" style="font-size: 12px; padding: 6px 8px;">🎶 Rhythms</div>
                <div class="param-btn phrase-builder-btn" data-param="RESTS" style="font-size: 12px; padding: 6px 8px;">⏸️ Rests</div>
                <div class="param-btn phrase-builder-btn" data-param="PHRASE STYLES" style="font-size: 12px; padding: 6px 8px;">🎭 Phrase Styles</div>
              </div>
            </div>
            
            <!-- Column 4: Effects -->
            <div class="param-column" style="background: white; padding: 12px;">
              <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; font-size: 13px; color: #666; font-weight: 600; text-align: center;">EFFECTS</div>
              <div class="param-btn" data-param="TREMOLO">〰️ Tremolo</div>
              <div class="param-btn" data-param="CHORUS">🎭 Chorus</div>
              <div class="param-btn" data-param="PHASER">🌀 Phaser</div>
              <div class="param-btn" data-param="REVERB">🏛️ Reverb</div>
              <div class="param-btn" data-param="DELAY">⏰ Delay</div>
            </div>
          </div>
        </div>

    
    <!-- Parameter Controls Display Area -->
    <div class="parameter-controls-area" style="flex: 1; padding: 20px; min-height: 200px; max-height: 400px; overflow-y: auto; background: #fefefe;">
      <div class="no-selection-message" style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-style: italic;">
        Click parameter names above to configure their event values
      </div>
    </div>
    
    <!-- Footer with buttons -->
    <div style="background: #f8f9fa; border-top: 1px solid #dee2e6; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <div style="font-size: 12px; color: #666;">
        <span class="selected-params-count">0</span> parameters selected for automation
      </div>
      <button class="view-baseline-btn" onclick="if(viewStateManager) viewStateManager.switchMode('parameter')" style="
        background: transparent; border: 1px solid #6c757d; color: #6c757d; padding: 4px 8px; 
        border-radius: 3px; font-size: 11px; cursor: pointer; transition: all 0.2s ease;
      ">📋 View Baseline Values</button>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="apply-event-btn" disabled style="background: #28a745; color: white; border: none; padding: 8px 20px; border-radius: 4px; font-weight: 600; cursor: pointer;">Apply Automation</button>
      <button onclick="this.closest('.compound-parameter-editor').remove()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>
  </div>
  `;
  
  // Style parameter buttons
  const style = document.createElement('style');
  style.textContent = `
    .param-btn {
      padding: 8px 10px;
      margin: 2px 0;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 13px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .param-btn:hover {
      background: #e9ecef;
      border-color: #4a90e2;
      transform: translateY(-1px);
    }
    .param-btn.selected {
      background: #4a90e2;
      color: white;
      border-color: #357abd;
      font-weight: 600;
    }
    .param-btn.has-changes {
      background: #28a745;
      color: white;
      border-color: #1e7e34;
      font-weight: 600;
    }
    .param-btn.has-changes:hover {
      background: #218838;
    }

    /* Event slider styling */
    .event-behavior-slider {
      -webkit-appearance: none;
      appearance: none;
      background: #e9ecef;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
      accent-color: #4a90e2;
    }

    .event-behavior-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 2px;
      border: 1px solid #ccc;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    .event-behavior-slider::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 2px;
      border: 1px solid #ccc;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    /* Parameter control panels */
    .parameter-control-panel {
      animation: slideInDown 0.3s ease;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize the compound event editor
  this.initializeCompoundEventEditor(editor, beat, regionIndex);
  
  document.body.appendChild(editor);
}


// ===== PARAMETER CONTROL PANEL CREATION =====

createParameterControlPanel(paramName, beat) {
  const panel = document.createElement('div');
  panel.className = 'parameter-control-panel';
  panel.dataset.parameter = paramName;
  panel.style.cssText = `
    background: #f8f9fa;
    border: 2px solid #4a90e2;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
  `;
  
  // Panel header
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #4a90e2, #357abd);
    color: white;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 13px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  
  header.innerHTML = `
    <span>${this.getParameterIcon(paramName)} ${paramName}</span>
    <button class="remove-param-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 3px; padding: 2px 6px; font-size: 11px; cursor: pointer;">✕</button>
  `;
  
  // Panel content with parameter controls
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 15px;
    background: white;
  `;
  
  // Generate appropriate controls based on parameter type
  content.appendChild(this.createParameterControls(paramName, beat));
  
  panel.appendChild(header);
  panel.appendChild(content);
  
  // Connect remove button
  const removeBtn = header.querySelector('.remove-param-btn');
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    
    // Remove this parameter from selection
    const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
    if (paramBtn) {
      paramBtn.click(); // Trigger deselection
    }
  };
  
  return panel;
}

createParameterControls(paramName, beat) {
  const currentParam = voiceData[this.voiceIndex].parameters[paramName];
  const controlsContainer = document.createElement('div');
  
  if (paramName === 'MELODIC RANGE') {
  // Special case: Melodic Range needs piano keyboard
  controlsContainer.appendChild(this.createMelodicRangeControls(paramName, currentParam));
  
} else if (typeof currentParam.min === 'number' && typeof currentParam.max === 'number') {
  // Range parameter (Volume, Tempo, etc.)
  controlsContainer.appendChild(this.createRangeControls(paramName, currentParam));

    
  } else if (currentParam.selectedValues && Array.isArray(currentParam.selectedValues)) {
    // Multi-select parameter (Rhythms, Rests)
    controlsContainer.appendChild(this.createMultiSelectControls(paramName, currentParam));
    
  } else if (typeof currentParam === 'number') {
    // Dropdown parameter (Instrument)
    controlsContainer.appendChild(this.createDropdownControls(paramName, currentParam));
    
  } else if (currentParam.speed || currentParam.depth) {
    // Multi-dual parameter (Effects)
    controlsContainer.appendChild(this.createEffectControls(paramName, currentParam));
    
  } else {
    // Fallback for complex parameters
    controlsContainer.innerHTML = `
      <div style="text-align: center; color: #666; padding: 20px;">
        <div>🚧</div>
        <div style="margin-top: 8px;">Parameter controls for <strong>${paramName}</strong><br>will be implemented in Session 26</div>
      </div>
    `;
  }
  
  return controlsContainer;
}

createDropdownControls(paramName, currentValue) {
  const container = document.createElement('div');
  container.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
  `;
  
  // Parameter name header
  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  header.innerHTML = `${this.getParameterIcon(paramName)} ${paramName}`;
  
  if (paramName === 'INSTRUMENT') {
    const selectContainer = document.createElement('div');
    selectContainer.innerHTML = `
  <div style="margin-bottom: 12px;">
    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Select Instrument:</label>
    <select class="event-instrument-select" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 13px; background: white;">
      ${gmSounds.map((sound, index) => 
        `<option value="${index}" ${index === currentValue ? 'selected' : ''}>${sound}</option>`
      ).join('')}
    </select>
  </div>
`;

    
    // Connect change detection
    const select = selectContainer.querySelector('.event-instrument-select');
    select.onchange = function() {
      const paramBtn = document.querySelector(`[data-param="INSTRUMENT"]`);
      if (paramBtn && parseInt(this.value) !== currentValue) {
        paramBtn.classList.add('has-changes');
      } else if (paramBtn) {
        paramBtn.classList.remove('has-changes');
      }
    };
    
    container.appendChild(header);
    container.appendChild(selectContainer);
  }
  
  return container;
}


getParameterIcon(paramName) {
  const iconMap = {
    'VOLUME': '🔊',
    'STEREO BALANCE': '⚖️',
    'TEMPO (BPM)': '🎵',
    'RHYTHMS': '🎶',
    'RESTS': '⏸️',
    'INSTRUMENT': '🎼',
    'MELODIC RANGE': '🎹',
    'POLYPHONY': '🎛️',
    'ATTACK VELOCITY': '⚡',
    'DETUNING': '🎚️',
    'PORTAMENTO GLIDE TIME': '🌊',
    'TREMOLO': '〰️',
    'CHORUS': '🎭',
    'PHASER': '🌀',
    'REVERB': '🏛️',
    'DELAY': '⏰'
  };
  
  return iconMap[paramName] || '⚙️';
}

selectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea, beat) {
  btn.classList.add('selected');
  
  // Hide "no selection" message
  const noSelectionMessage = controlsArea.querySelector('.no-selection-message');
  if (noSelectionMessage) {
    noSelectionMessage.style.display = 'none';
  }
  
  // Create parameter control panel
  const controlPanel = this.createParameterControlPanel(paramName, beat);
  controlsArea.appendChild(controlPanel);
  
  // Store references
  selectedParameters.set(paramName, {
    element: btn,
    values: this.getDefaultParameterValues(paramName),
    controlPanel: controlPanel
  });
  
  activeControlPanels.set(paramName, controlPanel);
  
  if (DEBUG.EVENTS) {
    console.log(`✅ Selected parameter: ${paramName}`);
  }
}

deselectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea) {
  btn.classList.remove('selected', 'has-changes');
  
  // Remove control panel
  const controlPanel = activeControlPanels.get(paramName);
  if (controlPanel && controlPanel.parentElement) {
    controlPanel.remove();
  }
  
  // Remove from tracking
  selectedParameters.delete(paramName);
  activeControlPanels.delete(paramName);
  
  // Show "no selection" message if no parameters selected
  if (selectedParameters.size === 0) {
    const noSelectionMessage = controlsArea.querySelector('.no-selection-message');
    if (noSelectionMessage) {
      noSelectionMessage.style.display = 'flex';
    }
  }
  
  if (DEBUG.EVENTS) {
    console.log(`❌ Deselected parameter: ${paramName}`);
  }
}

updateCompoundEventUI(selectedParameters, countSpan, applyBtn, noSelectionMessage, controlsArea) {
  const count = selectedParameters.size;
  
  countSpan.textContent = count;
  applyBtn.disabled = count === 0;
  applyBtn.style.opacity = count === 0 ? '0.5' : '1';
  applyBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
  
  if (count === 0 && noSelectionMessage) {
    noSelectionMessage.style.display = 'flex';
  } else if (noSelectionMessage) {
    noSelectionMessage.style.display = 'none';
  }
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Updated UI: ${count} parameters selected`);
  }
}

createRangeControls(paramName, currentParam) {
  const container = document.createElement('div');
  container.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
  `;
  
  // Parameter name header
  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  header.innerHTML = `${this.getParameterIcon(paramName)} ${paramName}`;
  
  // Range slider container
  const rangeContainer = document.createElement('div');
  rangeContainer.style.cssText = `
    margin-bottom: 15px;
  `;
  
  // Create range label and slider div
  rangeContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <label style="font-size: 12px; color: #666; font-weight: 600;">Range</label>
      <span class="range-values" style="font-size: 11px; color: #666; font-family: monospace;">${currentParam.min} - ${currentParam.max}</span>
    </div>
    <div class="event-range-slider" style="width: 100%; margin-bottom: 5px;"></div>
  `;
  
  // Behavior slider container  
  const behaviorContainer = document.createElement('div');
  behaviorContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <label style="font-size: 12px; color: #666; font-weight: 600;">Behavior</label>
      <span class="behavior-value" style="font-size: 11px; color: #666; font-family: monospace;">${currentParam.behavior || 50}%</span>
    </div>
    <input type="range" class="event-behavior-slider" min="0" max="100" value="${currentParam.behavior || 50}" 
           style="width: 100%; height: 6px; border-radius: 3px; background: #e9ecef; outline: none; cursor: pointer; -webkit-appearance: none; appearance: none;">
  `;
  
  container.appendChild(header);
  container.appendChild(rangeContainer);
  container.appendChild(behaviorContainer);
  
  // Initialize range slider (noUiSlider)
  setTimeout(() => {
    const sliderDiv = rangeContainer.querySelector('.event-range-slider');
    
    if (sliderDiv && !sliderDiv.noUiSlider) {
      // Determine min/max bounds for this parameter
      const paramDef = parameterDefinitions.find(p => p.name === paramName);
      const minBound = paramDef ? paramDef.min : 0;
      const maxBound = paramDef ? paramDef.max : 100;
      
      noUiSlider.create(sliderDiv, {
        start: [currentParam.min, currentParam.max],
        connect: true,
        range: { min: minBound, max: maxBound },
        step: 1,
        tooltips: [true, true],
        format: {
          to: value => Math.round(value).toString(),
          from: value => Number(value)
        }
      });
      
      // Connect range slider updates
      sliderDiv.noUiSlider.on('update', function(values) {
        const min = Math.round(Number(values[0]));
        const max = Math.round(Number(values[1]));
        
        rangeContainer.querySelector('.range-values').textContent = `${min} - ${max}`;
        
        // Mark parameter button as having changes
        const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
        if (paramBtn && (min !== currentParam.min || max !== currentParam.max)) {
          paramBtn.classList.add('has-changes');
        } else if (paramBtn) {
          paramBtn.classList.remove('has-changes');
        }
        
        if (DEBUG.EVENTS && Math.random() < 0.1) {
          console.log(`🎚️ ${paramName} range: ${min}-${max}`);
        }
      });
    }
  }, 50);
  
  // Connect behavior slider
  const behaviorSlider = behaviorContainer.querySelector('.event-behavior-slider');
  behaviorSlider.oninput = function() {
    const value = parseInt(this.value);
    behaviorContainer.querySelector('.behavior-value').textContent = value + '%';
    
    // Mark as changed if different from current
    const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
    if (paramBtn && value !== (currentParam.behavior || 50)) {
      paramBtn.classList.add('has-changes');
    }
  };
  
  return container;
}

createMelodicRangeControls(paramName, currentParam) {
  const container = document.createElement('div');
  container.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
  `;
  
  // Parameter name header
  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  header.innerHTML = `🎹 ${paramName}`;
  
  // Current range display
  const currentRange = document.createElement('div');
  currentRange.style.cssText = `
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 4px;
    padding: 8px 10px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #0d47a1;
    text-align: center;
  `;
  
  const minNoteName = midiNoteNames[currentParam.min] || `MIDI${currentParam.min}`;
  const maxNoteName = midiNoteNames[currentParam.max] || `MIDI${currentParam.max}`;
  currentRange.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">💡 Current range:</div>
    <div>${minNoteName} (${currentParam.min}) to ${maxNoteName} (${currentParam.max})</div>
  `;
  
  // Piano keyboard container
  const pianoContainer = document.createElement('div');
  pianoContainer.className = 'event-piano-container';
  pianoContainer.style.cssText = `
    margin-bottom: 12px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
  `;
  
  // Behavior slider
  const behaviorContainer = document.createElement('div');
  behaviorContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <label style="font-size: 12px; color: #666; font-weight: 600;">Behavior</label>
      <span class="behavior-value" style="font-size: 11px; color: #666; font-family: monospace;">${currentParam.behavior || 50}%</span>
    </div>
    <input type="range" class="event-behavior-slider" min="0" max="100" value="${currentParam.behavior || 50}" 
           style="width: 100%; height: 6px; border-radius: 3px; background: #e9ecef; outline: none; cursor: pointer; -webkit-appearance: none; appearance: none;">
  `;
  
  container.appendChild(header);
  container.appendChild(currentRange);
  container.appendChild(pianoContainer);
  container.appendChild(behaviorContainer);
  
    // Initialize piano keyboard after DOM insertion
  setTimeout(() => {
    try {
      console.log(`🎹 Initializing piano keyboard for MELODIC RANGE event editor`);
      const eventPiano = new InteractivePiano(pianoContainer, this.voiceIndex);
      
      // FIXED: Store reference in pianoContainer, not container
      pianoContainer.eventPiano = eventPiano;
      
      console.log(`✅ Piano keyboard initialized and stored as pianoContainer.eventPiano`);

      
      // Mark parameter as changed when piano selection changes
      const originalUpdateVoiceData = eventPiano.updateVoiceData;
      eventPiano.updateVoiceData = function() {
        // Call original method
        originalUpdateVoiceData.call(this);
        
        // Mark parameter button as having changes
        const paramBtn = document.querySelector(`[data-param="MELODIC RANGE"]`);
        if (paramBtn) {
          paramBtn.classList.add('has-changes');
        }
        
        // Update current range display
        if (this.selectedNotes.size > 0) {
          const selectedArray = Array.from(this.selectedNotes).sort((a, b) => a - b);
          const minNote = selectedArray[0];
          const maxNote = selectedArray[selectedArray.length - 1];
          const minNoteName = midiNoteNames[minNote] || `MIDI${minNote}`;
          const maxNoteName = midiNoteNames[maxNote] || `MIDI${maxNote}`;
          
          currentRange.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">💡 New range:</div>
            <div>${minNoteName} (${minNote}) to ${maxNoteName} (${maxNote}) - ${this.selectedNotes.size} notes</div>
          `;
        }
      };
      
      if (DEBUG.EVENTS) {
        console.log(`🎹 Piano keyboard initialized for Melodic Range event`);
      }
      
    } catch (error) {
     console.error(`❌ Error creating event piano:`, error);
      console.error(`   Error details:`, error.message);
      console.error(`   Piano container state:`, pianoContainer);
      console.error(`   Voice index:`, this.voiceIndex);
      
      // Fallback: Show error message with more details
      pianoContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #dc3545;">
          <div>❌ Piano keyboard failed to load</div>
          <div style="font-size: 12px; margin-top: 4px;">Error: ${error.message}</div>
          <div style="font-size: 12px; margin-top: 4px;">Check console for details</div>
        </div>
      `;
    }
  }, 150);
  
  // Connect behavior slider
  const behaviorSlider = behaviorContainer.querySelector('.event-behavior-slider');
  behaviorSlider.oninput = function() {
    const value = parseInt(this.value);
    behaviorContainer.querySelector('.behavior-value').textContent = value + '%';
    
    // Mark as changed if different from current
    const paramBtn = document.querySelector(`[data-param="MELODIC RANGE"]`);
    if (paramBtn && value !== (currentParam.behavior || 50)) {
      paramBtn.classList.add('has-changes');
    }
  };
  
  return container;
}

createDropdownControls(paramName, currentValue) {
  const container = document.createElement('div');
  container.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
  `;
  
  // Parameter name header
  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  header.innerHTML = `${this.getParameterIcon(paramName)} ${paramName}`;
  
  if (paramName === 'INSTRUMENT') {
    const selectContainer = document.createElement('div'); // MISSING: Create selectContainer
    selectContainer.innerHTML = `
      <div style="margin-bottom: 12px;">
        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Select Instrument:</label>
        <select class="event-instrument-select" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 13px; background: white;">
          ${gmSounds.map((sound, index) => 
            `<option value="${index}" ${index === currentValue ? 'selected' : ''}>${sound}</option>`
          ).join('')}
        </select>
      </div>
    `;
    
    // Connect change detection
    const select = selectContainer.querySelector('.event-instrument-select');
    select.onchange = function() {
      const paramBtn = document.querySelector(`[data-param="INSTRUMENT"]`);
      if (paramBtn && parseInt(this.value) !== currentValue) {
        paramBtn.classList.add('has-changes');
      } else if (paramBtn) {
        paramBtn.classList.remove('has-changes');
      }
    };
    
    // MISSING: Append everything to container
    container.appendChild(header);
    container.appendChild(selectContainer);
  }
  
  return container;
}


createMultiSelectControls(paramName, currentParam) {
  const container = document.createElement('div');
  
  const options = paramName === 'RHYTHMS' ? rhythmOptions : restOptions;
  const selectedValues = currentParam.selectedValues || [];
  
  container.innerHTML = `
  <div style="margin-bottom: 10px;">
    <label style="display: block; font-size: 12px; color: #666; margin-bottom: 6px; font-weight: 600;">Select ${paramName}:</label>
    <div style="max-height: 140px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px; padding: 8px; background: #fefefe;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 8px; align-items: start;">
        ${options.map((option, index) => `
          <label style="display: flex; align-items: center; gap: 4px; padding: 2px 0; font-size: 12px; cursor: pointer; white-space: nowrap;">
            <input type="checkbox" class="event-rhythm-checkbox" value="${index}" 
                   ${selectedValues.includes(index) ? 'checked' : ''} 
                   style="margin: 0; flex-shrink: 0;">
            <span style="overflow: hidden; text-overflow: ellipsis;">${option}</span>
          </label>
        `).join('')}
      </div>
    </div>
  </div>
  
  <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 4px; padding: 8px; font-size: 11px; color: #0d47a1;">
    <div style="font-weight: 600; margin-bottom: 4px;">💡 Currently selected (${selectedValues.length}):</div>
    <div style="max-height: 40px; overflow-y: auto; font-size: 10px; line-height: 1.3;">
      ${selectedValues.map(i => options[i]).join(', ') || 'None'}
    </div>
  </div>
`;

  
  return container;
}

createEffectControls(paramName, currentParam) {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;
  
  const speedValue = currentParam.speed ? (currentParam.speed.min + currentParam.speed.max) / 2 : 0;
  const depthValue = currentParam.depth ? (currentParam.depth.min + currentParam.depth.max) / 2 : 0;
  const feedbackValue = currentParam.feedback ? (currentParam.feedback.min + currentParam.feedback.max) / 2 : 0;
  
  let speedLabel = 'Speed';
  let depthLabel = 'Depth';
  
  if (paramName === 'REVERB' || paramName === 'DELAY') {
    speedLabel = 'Time';
    depthLabel = 'Mix';
  }
  
  container.innerHTML = `
    <div style="display: flex; gap: 12px;">
      <div style="flex: 1;">
        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px; font-weight: 600;">${speedLabel}:</label>
        <input type="range" class="event-speed-range" min="0" max="100" value="${speedValue}"
               style="width: 100%; margin-bottom: 4px;">
        <div class="speed-value-display" style="text-align: center; font-size: 11px; color: #666;">${speedValue.toFixed(0)}%</div>
      </div>
      <div style="flex: 1;">
        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px; font-weight: 600;">${depthLabel}:</label>
        <input type="range" class="event-depth-range" min="0" max="100" value="${depthValue}"
               style="width: 100%; margin-bottom: 4px;">
        <div class="depth-value-display" style="text-align: center; font-size: 11px; color: #666;">${depthValue.toFixed(0)}%</div>
      </div>
    </div>
    
    ${paramName === 'DELAY' ? `
      <div>
        <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px; font-weight: 600;">Feedback:</label>
        <input type="range" class="event-feedback-range" min="0" max="100" value="${feedbackValue}"
               style="width: 100%; margin-bottom: 4px;">
        <div class="feedback-value-display" style="text-align: center; font-size: 11px; color: #666;">${feedbackValue.toFixed(0)}%</div>
      </div>
    ` : ''}
    
    <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 4px; padding: 10px; font-size: 12px; color: #0d47a1;">
      <div style="font-weight: 600; margin-bottom: 4px;">💡 Current ${paramName.toLowerCase()}:</div>
      <div>${speedLabel}: ${speedValue.toFixed(0)}% | ${depthLabel}: ${depthValue.toFixed(0)}%${paramName === 'DELAY' ? ` | Feedback: ${feedbackValue.toFixed(0)}%` : ''}</div>
    </div>
  `;
  
  // Connect range sliders to update displays
  const speedRange = container.querySelector('.event-speed-range');
  const depthRange = container.querySelector('.event-depth-range');
  const feedbackRange = container.querySelector('.event-feedback-range');
  
  if (speedRange) {
    speedRange.oninput = function() {
      container.querySelector('.speed-value-display').textContent = this.value + '%';
    };
  }
  
  if (depthRange) {
    depthRange.oninput = function() {
      container.querySelector('.depth-value-display').textContent = this.value + '%';
    };
  }
  
  if (feedbackRange) {
    feedbackRange.oninput = function() {
      container.querySelector('.feedback-value-display').textContent = this.value + '%';
    };
  }
  
  return container;
}

getDefaultParameterValues(paramName) {
  const currentParam = voiceData[this.voiceIndex].parameters[paramName];
  
  if (typeof currentParam.min === 'number' && typeof currentParam.max === 'number') {
    return {
      type: 'range',
      min: currentParam.min,
      max: currentParam.max
    };
  } else if (currentParam.selectedValues) {
    return {
      type: 'multi-select',
      selectedValues: [...currentParam.selectedValues]
    };
  } else if (typeof currentParam === 'number') {
    return {
      type: 'dropdown',
      value: currentParam
    };
  } else if (currentParam.speed || currentParam.depth) {
    return {
      type: 'effect',
      speed: currentParam.speed ? (currentParam.speed.min + currentParam.speed.max) / 2 : 0,
      depth: currentParam.depth ? (currentParam.depth.min + currentParam.depth.max) / 2 : 0,
      feedback: currentParam.feedback ? (currentParam.feedback.min + currentParam.feedback.max) / 2 : 0
    };
  }
  
  return { type: 'unknown' };
}

// ===== COMPOUND EVENT WORKFLOW =====

applyCompoundParameterEvent(beat, regionIndex, selectedParameters) {
  const parameterChanges = {};
  
  if (DEBUG.EVENTS) {
    console.log(`🔍 Collecting values from ${selectedParameters.size} selected parameters:`);
    selectedParameters.forEach((paramData, paramName) => {
      console.log(`   • ${paramName}:`, paramData);
      console.log(`     Control panel exists:`, !!paramData.controlPanel);
      console.log(`     Control panel HTML:`, paramData.controlPanel?.outerHTML?.substring(0, 100) + '...');
    });
  }
  
  // Collect all parameter changes with error handling
  selectedParameters.forEach((paramData, paramName) => {
    try {
      if (!paramData.controlPanel) {
        console.error(`❌ No control panel for ${paramName}`);
        return;
      }
      
      const collectedValue = this.collectParameterValues(paramName, paramData.controlPanel);
      
      if (collectedValue && collectedValue.value) {
        parameterChanges[paramName] = collectedValue;
        
        if (DEBUG.EVENTS) {
          console.log(`   ✅ ${paramName}:`, collectedValue);
        }
      } else {
        console.warn(`   ⚠️ ${paramName}: No valid value collected`);
      }
    } catch (error) {
      console.error(`   ❌ ${paramName}: Error collecting values:`, error);
    }
  });
  
  if (Object.keys(parameterChanges).length === 0) {
    console.error(`❌ No valid parameter changes collected`);
    return null;
  }
  
  // Create compound event
  const eventId = this.createCompoundParameterEvent(beat, regionIndex, parameterChanges);
  
  if (DEBUG.EVENTS) {
    const paramNames = Object.keys(parameterChanges);
    console.log(`✅ Applied compound event: ${paramNames.join(', ')} at beat ${beat.toFixed(0)}`);
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Changes:`, parameterChanges);
  }
  
  // Show success notification
  if (eventId) {
    this.showCompoundEventSuccessNotification(beat, parameterChanges);
    
    // Refresh timeline to show new diamond
    setTimeout(() => this.refresh(), 100);
  }
  
  return eventId;
}


showCompoundEventSuccessNotification(beat, parameterChanges) {
  const paramNames = Object.keys(parameterChanges);
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <span style="font-size: 16px;">💎</span>
      <div>
        <div>Multi-Parameter Event Created</div>
        <div style="font-size: 11px; opacity: 0.9;">Beat ${beat.toFixed(0)} (${timeFormatted})</div>
      </div>
    </div>
    <div style="font-size: 12px; opacity: 0.9; line-height: 1.3;">
      Parameters: ${paramNames.join(', ')}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

createCompoundParameterEvent(beat, regionIndex, parameterChanges) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    console.error(`❌ No life span or events array for Voice ${this.voiceIndex + 1}`);
    return null;
  }
  
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[regionIndex];
  
  if (!targetRegion) {
    console.error(`❌ Target region ${regionIndex} not found`);
    return null;
  }
  
  const relativePosition = (beat - targetRegion.start) / (targetRegion.end - targetRegion.start);
  const eventId = `compound-${String(lifeSpan.nextEventId++).padStart(3, '0')}`;
  
  // Validate parameter changes
  const validChanges = {};
  Object.keys(parameterChanges).forEach(paramName => {
    if (parameterChanges[paramName] && parameterChanges[paramName].value) {
      validChanges[paramName] = parameterChanges[paramName];
    }
  });
  
  if (Object.keys(validChanges).length === 0) {
    console.warn(`⚠️ No valid parameter changes to apply`);
    return null;
  }
  
  const compoundEvent = {
    type: 'compound-parameter',
    regionIndex: regionIndex,
    relativePosition: relativePosition,
    beatPosition: beat, // For easy reference
    changes: validChanges,
    id: eventId,
    timestamp: Date.now()
  };
  
  lifeSpan.events.push(compoundEvent);
  
  if (DEBUG.EVENTS) {
    const paramNames = Object.keys(validChanges);
    console.log(`💎 Created compound event: ${paramNames.join(', ')} at beat ${beat.toFixed(0)}`);
    console.log(`   Event ID: ${eventId}`);
    console.log(`   Relative position: ${(relativePosition * 100).toFixed(1)}% in region`);
    console.log(`   Changes:`, validChanges);
  }
  
    // DEBUG: Verify event was added
    console.log(`📊 Total events after creation: ${lifeSpan.events.length}`);
    console.log(`📊 Events array:`, lifeSpan.events.map(e => ({type: e.type, id: e.id, region: e.regionIndex})));

  return eventId;
}

initializeCompoundEventEditor(editor, beat, regionIndex) {
  const controlsArea = editor.querySelector('.parameter-controls-area');
  const noSelectionMessage = editor.querySelector('.no-selection-message');
  const selectedCountSpan = editor.querySelector('.selected-params-count');
  const applyBtn = editor.querySelector('.apply-event-btn');
  
  let selectedParameters = new Map(); // paramName -> {element, values}
  let activeControlPanels = new Map(); // paramName -> controlElement
  
  // Connect parameter button clicks
  const paramButtons = editor.querySelectorAll('.param-btn');
  paramButtons.forEach(btn => {
    btn.onclick = () => {
      const paramName = btn.dataset.param;
      
      if (btn.classList.contains('selected')) {
        // Deselect parameter
        this.deselectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea);
      } else {
        // Select parameter
        this.selectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea, beat);
      }
      
      // Update UI state
      this.updateCompoundEventUI(selectedParameters, selectedCountSpan, applyBtn, noSelectionMessage, controlsArea);
    };
  });
  
   // Connect Apply button with create/update functionality
  applyBtn.onclick = () => {
    if (selectedParameters.size === 0) {
      console.warn('⚠️ No parameters selected for event operation');
      return;
    }
    
    const isUpdating = !!window.currentEditingEvent;
    console.log(`🎯 ${isUpdating ? 'Updating' : 'Creating'} EventRegistry event at beat ${beat.toFixed(0)} for Voice ${this.voiceIndex + 1}`);
    
    // Collect parameter changes from UI
    const parameterChanges = {};
    let hasChanges = false;
    
    selectedParameters.forEach((paramData, paramName) => {
      const controlPanel = paramData.controlPanel;
      if (!controlPanel) return;
      
      try {
        const collectedValue = this.collectParameterValuesFromPanel(paramName, controlPanel);
        
        if (collectedValue && collectedValue.value) {
          parameterChanges[paramName] = collectedValue.value;
          hasChanges = true;
          
          console.log(`   ✅ Collected ${paramName}:`, collectedValue.value);
        }
      } catch (error) {
        console.error(`   ❌ Error collecting ${paramName}:`, error);
      }
    });
    
    if (!hasChanges) {
      console.warn('⚠️ No valid parameter changes collected');
      return;
    }
    
    let eventId;
    const paramNames = Object.keys(parameterChanges);
    
    if (isUpdating) {
      // UPDATE existing event
      const existingEvent = window.currentEditingEvent;
      
      if (paramNames.length === 1) {
        // Update as single parameter event
        const paramName = paramNames[0];
        const success = eventRegistry.updateEvent(existingEvent.id, {
          parameterName: paramName,
          value: parameterChanges[paramName],
          changeType: 'range' // TODO: Make this dynamic
        });
        eventId = success ? existingEvent.id : null;
      } else {
        // Update as compound event
        const changes = {};
        paramNames.forEach(paramName => {
          changes[paramName] = {
            value: parameterChanges[paramName],
            changeType: 'range' // TODO: Make this dynamic
          };
        });
        
        const success = eventRegistry.updateEvent(existingEvent.id, {
          type: 'compound-parameter',
          changes: changes,
          parameterNames: paramNames
        });
        eventId = success ? existingEvent.id : null;
      }
      
      if (eventId) {
        console.log(`💎 EventRegistry event updated: ${eventId}`);
      }
      
    } else {
      // CREATE new event (existing logic)
      if (paramNames.length === 1) {
        const paramName = paramNames[0];
        eventId = EventCreator.createParameterEvent(
          this.voiceIndex,
          paramName,
          beat,
          parameterChanges[paramName],
          regionIndex,
          0.5
        );
      } else {
        eventId = EventCreator.createCompoundEvent(
          this.voiceIndex,
          beat,
          parameterChanges,
          regionIndex,
          0.5
        );
      }
      
      if (eventId) {
        console.log(`💎 EventRegistry event created: ${eventId}`);
      }
    }
    
    if (eventId) {
      // Show appropriate notification
      if (isUpdating) {
        this.showEventUpdatedNotification(beat, paramNames);
      } else {
        this.showEventCreatedNotification(beat, paramNames);
      }
      
      // Clear editing state
      window.currentEditingEvent = null;
      
      // Close the editor
      editor.remove();
      
      // Refresh timeline to show updated diamond
      if (visualTimeline && visualTimeline.isVisible) {
        setTimeout(() => {
          visualTimeline.refresh();
        }, 100);
      }
      
    } else {
      console.error(`❌ Failed to ${isUpdating ? 'update' : 'create'} EventRegistry event`);
      alert(`Error ${isUpdating ? 'updating' : 'creating'} parameter event. Please check the console.`);
    }
  };

}

/**
 * Collect parameter values from control panel
 * NEW METHOD: Works with EventRegistry and handles all parameter types
 */
collectParameterValuesFromPanel(paramName, controlPanel) {
  const def = ParameterManager.getParameterDefinition(paramName);
  if (!def) {
    console.error(`❌ No definition for ${paramName}`);
    return null;
  }
  
  console.log(`🔍 Collecting values for ${paramName} (type: ${def.type})`);
  console.log(`   Control panel:`, !!controlPanel);
  
  switch (def.type) {
    case 'range':
      if (paramName === 'MELODIC RANGE') {
        // SPECIAL CASE: Melodic Range uses piano keyboard
        return this.collectMelodicRangeValues(controlPanel);
      } else {
        // Standard range slider
        return this.collectRangeSliderValues(controlPanel);
      }
      
    case 'simple':
      const dropdown = controlPanel.querySelector('.event-instrument-select');
      if (dropdown) {
        const value = parseInt(dropdown.value);
        console.log(`   📝 Collected dropdown value: ${value}`);
        return {
          value: value,
          changeType: 'dropdown'
        };
      }
      break;
      
    case 'multiselect':
      const checkboxes = controlPanel.querySelectorAll('.event-rhythm-checkbox:checked');
      const selectedValues = Array.from(checkboxes).map(cb => parseInt(cb.value));
      console.log(`   📝 Collected multiselect values: [${selectedValues.join(', ')}]`);
      
      return {
        value: selectedValues,
        changeType: 'multiselect'
      };
      
    case 'effect':
      return this.collectEffectValues(controlPanel);
      
    case 'complex':
      if (paramName === 'PHRASE STYLES') {
        return this.collectPhraseStylesValues(controlPanel);
      }
      break;
      
    default:
      console.warn(`⚠️ Parameter collection not implemented for ${paramName} (${def.type})`);
      return null;
  }
  
  console.error(`❌ Failed to collect values for ${paramName}`);
  return null;
}

/**
 * Collect values from melodic range piano keyboard
 */
collectMelodicRangeValues(controlPanel) {
  console.log(`🎹 Collecting Melodic Range from piano keyboard`);
  
  // Look for the piano instance
  const pianoContainer = controlPanel.querySelector('.event-piano-container');
  if (!pianoContainer || !pianoContainer.eventPiano) {
    console.error(`❌ Piano keyboard not found or not initialized`);
    console.log(`   Piano container:`, !!pianoContainer);
    console.log(`   Piano instance:`, pianoContainer ? !!pianoContainer.eventPiano : 'N/A');
    return null;
  }
  
  const piano = pianoContainer.eventPiano;
  const selectedNotes = Array.from(piano.selectedNotes).sort((a, b) => a - b);
  
  if (selectedNotes.length === 0) {
    console.warn(`⚠️ No notes selected on piano keyboard`);
    return null;
  }
  
  const minNote = selectedNotes[0];
  const maxNote = selectedNotes[selectedNotes.length - 1];
  
  // Get behavior from behavior slider
  const behaviorSlider = controlPanel.querySelector('.event-behavior-slider');
  const behavior = behaviorSlider ? parseInt(behaviorSlider.value) : 50;
  
  console.log(`   🎹 Collected piano selection: ${minNote}-${maxNote} (${selectedNotes.length} notes), behavior: ${behavior}%`);
  
  const value = {
    min: minNote,
    max: maxNote,
    behavior: behavior,
    selectedNotes: selectedNotes
  };
  
  return {
    value: value,
    changeType: 'range'
  };
}

/**
 * Collect values from standard range slider
 */
collectRangeSliderValues(controlPanel) {
  const rangeSlider = controlPanel.querySelector('.event-range-slider');
  if (rangeSlider && rangeSlider.noUiSlider) {
    const values = rangeSlider.noUiSlider.get();
    const min = Math.round(Number(values[0]));
    const max = Math.round(Number(values[1]));
    
    const behaviorSlider = controlPanel.querySelector('.event-behavior-slider');
    const behavior = behaviorSlider ? parseInt(behaviorSlider.value) : 50;
    
    console.log(`   🎚️ Collected range slider: ${min}-${max}, behavior: ${behavior}%`);
    
    return {
      value: { min, max, behavior },
      changeType: 'range'
    };
  }
  
  return null;
}

  
  /**
   * Show success notification for event creation
   */
  showEventCreatedNotification(beat, paramNames) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideInRight 0.3s ease;
    `;
    
    const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
    const timeFormatted = formatMsToMMSS(timeMs);
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 16px;">💎</span>
        <div>
          <div>EventRegistry Event Created</div>
          <div style="font-size: 11px; opacity: 0.9;">Beat ${beat.toFixed(0)} (${timeFormatted})</div>
        </div>
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        Parameters: ${paramNames.join(', ')}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

/**
 * Show success notification for event update
 */
showEventUpdatedNotification(beat, paramNames) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #17a2b8;
    color: white;
    padding: 15px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <span style="font-size: 16px;">💎</span>
      <div>
        <div>Event Updated</div>
        <div style="font-size: 11px; opacity: 0.9;">Beat ${beat.toFixed(0)} (${timeFormatted})</div>
      </div>
    </div>
    <div style="font-size: 12px; opacity: 0.9;">
      Parameters: ${paramNames.join(', ')}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

selectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea, beat) {
  btn.classList.add('selected');
  
  // Create parameter control panel
  const controlPanel = this.createParameterControlPanel(paramName, beat);
  controlsArea.appendChild(controlPanel);
  
  // Store references
  selectedParameters.set(paramName, {
    element: btn,
    values: this.getDefaultParameterValues(paramName),
    controlPanel: controlPanel
  });
  
  activeControlPanels.set(paramName, controlPanel);
  
  if (DEBUG.EVENTS) {
    console.log(`✅ Selected parameter: ${paramName}`);
  }
}

deselectParameter(paramName, btn, selectedParameters, activeControlPanels, controlsArea) {
  btn.classList.remove('selected', 'has-changes');
  
  // Remove control panel
  const controlPanel = activeControlPanels.get(paramName);
  if (controlPanel && controlPanel.parentElement) {
    controlPanel.remove();
  }
  
  // Remove from tracking
  selectedParameters.delete(paramName);
  activeControlPanels.delete(paramName);
  
  if (DEBUG.EVENTS) {
    console.log(`❌ Deselected parameter: ${paramName}`);
  }
}

updateCompoundEventUI(selectedParameters, countSpan, applyBtn, noSelectionMessage, controlsArea) {
  const count = selectedParameters.size;
  
  countSpan.textContent = count;
  applyBtn.disabled = count === 0;
  applyBtn.style.opacity = count === 0 ? '0.5' : '1';
  
  if (count === 0) {
    noSelectionMessage.style.display = 'flex';
  } else {
    noSelectionMessage.style.display = 'none';
  }
  
  if (DEBUG.EVENTS) {
    console.log(`🔄 Updated UI: ${count} parameters selected`);
  }
}

// ===== DIAMOND CONTEXT MENU ACTIONS =====
editParameterEvent(eventId, parameterName) {
  console.log(`✏️ REGISTRY EDIT: Starting edit for event ${eventId}`);
  
  // Get event from EventRegistry with detailed debugging
  if (!eventRegistry) {
    console.error(`❌ EventRegistry not initialized`);
    return;
  }
  
  const event = eventRegistry.getEvent(eventId);
  
  if (!event) {
    console.error(`❌ Event ${eventId} not found in EventRegistry`);
    console.log(`   Available events:`, eventRegistry.getAllEvents().map(e => e.id));
    return;
  }
  
  console.log(`📝 Found event for editing:`, event);
  console.log(`   Type: ${event.type}`);
  console.log(`   Parameter: ${event.parameterName}`);
  console.log(`   Beat: ${event.beatPosition}`);
  console.log(`   Value:`, event.value);
  
  // Store event being edited
  window.currentEditingEvent = event;
  
  // Open Primary Editing Interface
  this.showStreamlinedParameterPicker(event.beatPosition, event.regionIndex || 0);
  
  // Pre-load existing parameters after editor opens
  setTimeout(() => {
    if (event.type === 'compound-parameter' && event.changes) {
      // COMPOUND EVENT: Pre-select multiple parameters
      console.log(`📝 Loading compound event with parameters: ${Object.keys(event.changes).join(', ')}`);
      
      Object.keys(event.changes).forEach(paramName => {
        console.log(`   🔍 Processing compound parameter: ${paramName}`, event.changes[paramName]);
        
        const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
        if (paramBtn) {
          // Select the parameter button if not already selected
          if (!paramBtn.classList.contains('selected')) {
            console.log(`   👆 Clicking button for ${paramName}`);
            paramBtn.click();
          }
          
          // Mark as editing existing
          paramBtn.style.borderLeft = '4px solid #17a2b8';
          paramBtn.style.background = '#e1f5fe';
          paramBtn.title = `${paramName} (editing existing compound event)`;
          
          console.log(`✅ Pre-selected ${paramName} for compound editing`);
          
          // Load existing values for this parameter
          setTimeout(() => {
            console.log(`   📝 Loading values for ${paramName} from compound event`);
            this.loadEventValuesIntoControls(paramName, event.changes[paramName]);
          }, 200 + (Object.keys(event.changes).indexOf(paramName) * 100)); // Stagger loading
        } else {
          console.warn(`   ⚠️ Button not found for ${paramName}`);
        }
      });
      
      // Update Apply button for compound editing
      setTimeout(() => {
        const applyBtn = document.querySelector('.apply-event-btn');
        if (applyBtn) {
          const paramCount = Object.keys(event.changes).length;
          applyBtn.textContent = `Update Event (${paramCount} params)`;
          applyBtn.style.background = '#17a2b8';
          
          console.log(`✅ Apply button updated for compound event (${paramCount} parameters)`);
        }
      }, 500);
      
    } else if (event.type === 'parameter') {
      // SINGLE PARAMETER EVENT
      console.log(`📝 Loading single parameter event: ${event.parameterName}`);
      
      const paramBtn = document.querySelector(`[data-param="${event.parameterName}"]`);
      if (paramBtn) {
        if (!paramBtn.classList.contains('selected')) {
          console.log(`   👆 Clicking button for ${event.parameterName}`);
          paramBtn.click();
        }
        
        // Mark as editing existing
        paramBtn.style.borderLeft = '4px solid #17a2b8';
        paramBtn.style.background = '#e1f5fe';
        paramBtn.title = `${event.parameterName} (editing existing event)`;
        
        console.log(`✅ Pre-selected ${event.parameterName} for single editing`);
        
        // Load existing values
        setTimeout(() => {
          this.loadEventValuesIntoControls(event.parameterName, { value: event.value });
        }, 200);
      }
      
      // Update Apply button for single editing
      setTimeout(() => {
        const applyBtn = document.querySelector('.apply-event-btn');
        if (applyBtn) {
          applyBtn.textContent = 'Update Event';
          applyBtn.style.background = '#17a2b8';
        }
      }, 300);
    } else {
      console.warn(`⚠️ Unknown event type for editing: ${event.type}`);
    }
  }, 400); // Increased timeout for compound events

  
  console.log(`✅ Edit process initiated for ${event.parameterName}`);
}

/**
 * Load existing event values into control panels
 * NEW METHOD: Populates UI with current event values
 */
loadEventValuesIntoControls(paramName, paramData) {
  console.log(`🔍 Searching for control panel for ${paramName}`);
  
  // FIXED: Look for the actual parameter control panel created by createParameterControlPanel
  let controlPanel = null;
  
  // The control panels are created by createParameterControlPanel and have data-parameter attribute
  const allPanels = document.querySelectorAll('.parameter-control-panel');
  console.log(`   Found ${allPanels.length} parameter control panels`);
  
  allPanels.forEach((panel, index) => {
    console.log(`   Panel ${index + 1}:`, {
      'data-parameter': panel.dataset.parameter,
      'class': panel.className
    });
    
    if (panel.dataset.parameter === paramName) {
      controlPanel = panel;
      console.log(`   ✅ Found matching panel for ${paramName}`);
    }
  });
  
  if (!controlPanel) {
    console.warn(`⚠️ No control panel found for ${paramName}`);
    return;
  }
  
  const def = ParameterManager.getParameterDefinition(paramName);
  if (!def) return;
  
  console.log(`📝 Loading values for ${paramName}:`, paramData);


  
  switch (def.type) {
    case 'range':
      if (paramData.value && typeof paramData.value === 'object') {
        // Load range slider values
        const rangeSlider = controlPanel.querySelector('.event-range-slider');
        if (rangeSlider && rangeSlider.noUiSlider) {
          rangeSlider.noUiSlider.set([paramData.value.min, paramData.value.max]);
          
          // Update display
          const rangeValues = controlPanel.querySelector('.range-values');
          if (rangeValues) {
            rangeValues.textContent = `${paramData.value.min} - ${paramData.value.max}`;
          }
          
          console.log(`📝 Set range slider to: ${paramData.value.min}-${paramData.value.max}`);
        }
        
        // Load behavior slider
        const behaviorSlider = controlPanel.querySelector('.event-behavior-slider');
        if (behaviorSlider && paramData.value.behavior !== undefined) {
          behaviorSlider.value = paramData.value.behavior;
          
          const behaviorDisplay = controlPanel.querySelector('.behavior-value');
          if (behaviorDisplay) {
            behaviorDisplay.textContent = paramData.value.behavior + '%';
          }
          
          console.log(`📝 Set behavior slider to: ${paramData.value.behavior}%`);
        }
      }
      break;
      
    case 'simple':
      if (paramName === 'INSTRUMENT') {
        const dropdown = controlPanel.querySelector('.event-instrument-select');
        if (dropdown && typeof paramData.value === 'number') {
          dropdown.value = paramData.value;
          console.log(`📝 Set instrument dropdown to: ${paramData.value}`);
        }
      }
      break;
      
    default:
      console.log(`📝 Loading for ${paramName} (${def.type}) - not yet implemented`);
  }
}

/**
 * Delete parameter event from EventRegistry
 * NEW METHOD: Removes event and refreshes timeline
 */
deleteParameterEvent(eventId, parameterName) {
  console.log(`🗑️ Deleting EventRegistry event: ${eventId} (${parameterName})`);
  
  if (!eventRegistry) {
    console.error(`❌ EventRegistry not available`);
    return;
  }
  
  // Capture state for undo
  if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
    undoManager.captureState(`Delete ${parameterName} event ${eventId}`, true);
  }
  
  // Remove from registry
  const success = eventRegistry.removeEvent(eventId);
  
  if (success) {
    console.log(`✅ Event ${eventId} deleted from registry`);
    
    // Show success feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      z-index: 9999;
      animation: slideInRight 0.3s ease;
    `;
    feedback.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🗑️</span>
        <div>
          <div>Event Deleted</div>
          <div style="font-size: 11px; opacity: 0.9;">${parameterName} event removed</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(feedback);
    setTimeout(() => {
      feedback.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
    
    // Refresh timeline to remove diamond
    setTimeout(() => {
      this.refresh();
    }, 100);
    
  } else {
    console.error(`❌ Failed to delete event ${eventId}`);
  }
}



editCompoundEvent(event, beat) {
  // Show Event Editor with pre-loaded values
  this.showStreamlinedParameterPicker(beat, event.regionIndex);
  
  // After Event Editor opens, pre-select and populate parameters
  setTimeout(() => {
    if (event.changes) {
      Object.keys(event.changes).forEach(paramName => {
        // Click parameter button to select it
        const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
        if (paramBtn && !paramBtn.classList.contains('selected')) {
          paramBtn.click();
        }
        
        // Load existing values into controls
        setTimeout(() => {
          this.loadExistingValuesIntoControls(paramName, event.changes[paramName]);
        }, 100);
      });
    }
  }, 200);
  
  if (DEBUG.EVENTS) {
    console.log(`✏️ Opened compound event editor for ${Object.keys(event.changes).join(', ')}`);
  }
}

loadExistingValuesIntoControls(paramName, paramData) {
  const controlPanel = document.querySelector(`[data-parameter="${paramName}"]`);
  if (!controlPanel) return;
  
  if (paramData.changeType === 'range') {
    // Load range values
    const rangeSlider = controlPanel.querySelector('.event-range-slider');
    if (rangeSlider && rangeSlider.noUiSlider && paramData.value) {
      rangeSlider.noUiSlider.set([paramData.value.min, paramData.value.max]);
    }
    
    // Load behavior value
    const behaviorSlider = controlPanel.querySelector('.event-behavior-slider');
    if (behaviorSlider && paramData.value.behavior !== undefined) {
      behaviorSlider.value = paramData.value.behavior;
      const behaviorDisplay = controlPanel.querySelector('.behavior-value');
      if (behaviorDisplay) {
        behaviorDisplay.textContent = paramData.value.behavior + '%';
      }
    }
    
    if (DEBUG.EVENTS) {
      console.log(`📝 Loaded ${paramName} values: ${paramData.value.min}-${paramData.value.max}, behavior: ${paramData.value.behavior}%`);
    }
  }
  // Add other parameter types as needed
}


startEventPositionEdit(eventId, parameterName) {
  if (DEBUG.EVENTS) {
    console.log(`📍 Event position editing: Drag the diamond to move within region`);
  }
  
  // Show instruction for diamond dragging
  const instruction = document.createElement('div');
  instruction.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffc107;
    color: #856404;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    text-align: center;
    border: 2px solid #856404;
  `;
  
  instruction.innerHTML = `
    <div style="margin-bottom: 6px;">📍 Event Position Edit Active</div>
    <div style="font-size: 12px; opacity: 0.9;">
      Drag the gold diamond to move the ${parameterName} event within its region
    </div>
  `;
  
  document.body.appendChild(instruction);
  
  setTimeout(() => {
    instruction.style.transition = 'opacity 0.3s ease';
    instruction.style.opacity = '0';
    setTimeout(() => instruction.remove(), 300);
  }, 4000);
}

copyParameterEvent(eventId, parameterName) {
  if (DEBUG.EVENTS) {
    console.log(`📋 Copying parameter event: ${parameterName} (${eventId})`);
  }
  
  // Find and copy the event
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const event = lifeSpan.events.find(e => e.id === eventId);
  
  if (event) {
    window.copiedParameterEvent = {
      parameter: event.parameter,
      value: JSON.parse(JSON.stringify(event.value)), // Deep copy
      changeType: event.changeType,
      sourceVoice: this.voiceIndex,
      timestamp: Date.now()
    };
    
    // Show success feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: #6f42c1;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      z-index: 9999;
    `;
    feedback.textContent = `📋 ${parameterName} Event Copied`;
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }
}

addParametersToEvent(eventId, event) {
  if (DEBUG.EVENTS) {
    console.log(`➕ Adding parameters to existing event: ${eventId}`);
  }
  
  if (!event) {
    console.error(`❌ No event provided for adding parameters`);
    return;
  }
  
  // Calculate beat position and open Event Editor
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const region = playingRegions[event.regionIndex];
  
  if (!region) {
    console.error(`❌ Could not find region ${event.regionIndex} for event ${eventId}`);
    return;
  }
  
  const absoluteBeat = region.start + (event.relativePosition * (region.end - region.start));
  
  // Open Event Editor in "add to existing" mode
  this.showStreamlinedParameterPicker(absoluteBeat, event.regionIndex);
  
  // Pre-load existing parameters after Event Editor opens
  setTimeout(() => {
    // Mark as editing existing event
    window.currentEditingEvent = event;
    
    if (event.changes) {
      // Auto-select existing parameters (but don't prevent adding more)
      Object.keys(event.changes).forEach(paramName => {
        const paramBtn = document.querySelector(`[data-param="${paramName}"]`);
        if (paramBtn) {
          paramBtn.click(); // Auto-select existing parameters
          
          // Visual indicator for existing vs new parameters
          paramBtn.style.borderLeft = '4px solid #17a2b8';
          paramBtn.style.background = '#e1f5fe'; // Light blue for existing
          
          // Add tooltip
          paramBtn.title = `${paramName} (existing in event)`;
        }
      });
    }
    
    // Update Apply button for "add mode"
    const applyBtn = document.querySelector('.apply-event-btn');
    if (applyBtn) {
      applyBtn.textContent = 'Update Event (Add Parameters)';
      applyBtn.style.background = '#17a2b8'; // Blue for update mode
    }
    
    // Update header
    const header = document.querySelector('.compound-parameter-editor div');
    if (header) {
      header.innerHTML = header.innerHTML.replace('Parameter Event', 'Add Parameters to Event');
    }
    
    if (DEBUG.EVENTS) {
      console.log(`✅ Event Editor opened in "add parameters" mode`);
      console.log(`   Existing parameters: ${Object.keys(event.changes || {}).join(', ')}`);
    }
  }, 300);
}


pasteParameterEvent(targetEventId, targetEvent) {
  if (!window.copiedParameterEvent) {
    console.warn(`⚠️ No copied event available for pasting`);
    return;
  }
  
  const copiedData = window.copiedParameterEvent;
  
  if (DEBUG.EVENTS) {
    console.log(`📋 Pasting ${copiedData.parameter} into event ${targetEventId}`);
  }
  
  // Find target event in events array
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const eventIndex = lifeSpan.events.findIndex(e => e.id === targetEventId);
  
  if (eventIndex === -1) {
    console.error(`❌ Target event ${targetEventId} not found`);
    return;
  }
  
  // Capture state for undo
  if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
    undoManager.captureState(`Paste ${copiedData.parameter} into event ${targetEventId}`, true);
  }
  
  // Add copied parameter to target event's changes
  if (targetEvent.type === 'compound-parameter') {
    targetEvent.changes[copiedData.parameter] = {
      changeType: copiedData.changeType || 'range',
      value: JSON.parse(JSON.stringify(copiedData.value)) // Deep copy
    };
  } else {
    // Convert single event to compound event
    const originalParam = targetEvent.parameter;
    const originalValue = targetEvent.value;
    
    targetEvent.type = 'compound-parameter';
    targetEvent.changes = {
      [originalParam]: {
        changeType: targetEvent.changeType || 'range',
        value: originalValue
      },
      [copiedData.parameter]: {
        changeType: copiedData.changeType || 'range',
        value: JSON.parse(JSON.stringify(copiedData.value))
      }
    };
    
    // Remove old single-event properties
    delete targetEvent.parameter;
    delete targetEvent.value;
    delete targetEvent.changeType;
  }
  
  // Show success feedback
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #17a2b8;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  feedback.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>📋</span>
      <div>
        <div>Parameter Pasted</div>
        <div style="font-size: 11px; opacity: 0.9;">${copiedData.parameter} added to event</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
  
  // Refresh timeline to update diamond tooltip
  setTimeout(() => this.refresh(), 100);
}

confirmDeleteEvent(eventId, parameterName) {
  const confirmMessage = `🗑️ Delete Parameter Event?

Parameter: ${parameterName}
Event ID: ${eventId}

This will remove the parameter automation.
Continue?`;

  if (confirm(confirmMessage)) {
    // Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Delete ${parameterName} event`, true);
    }
    
    this.deleteParameterEvent(eventId);
    
    if (DEBUG.EVENTS) {
      console.log(`🗑️ Confirmed deletion of parameter event: ${eventId}`);
    }
  }
}

handleQuickParameterEvent(e) {
  const beat = this.screenXToBeat(e.clientX);
  const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(beat) : beat;
  
  if (DEBUG.EVENTS) {
    console.log(`⚡ SHIFT+CLICK: Opening full Event Editor at beat ${snappedBeat.toFixed(0)}`);
  }
  
  // Find region index
  const regionIndex = this.findRegionIndexForBeat(snappedBeat);
  if (regionIndex === -1) {
    console.warn(`⚠️ No region found for Shift+Click at beat ${snappedBeat}`);
    return;
  }
  
  // Open full Event Editor (same as double-click region → Add Event)
  this.showStreamlinedParameterPicker(snappedBeat, regionIndex);
}


handleQuickRegionDelete(e) {
  const region = e.target;
  const regionIndex = parseInt(region.dataset.regionIndex);
  
  if (DEBUG.EVENTS) {
    console.log(`🗑️ ALT+CLICK: Quick delete region ${regionIndex}`);
  }
  
  // Get region info
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[regionIndex];
  
  if (targetRegion) {
    // Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Quick delete region ${targetRegion.start}-${targetRegion.end}`, true);
    }
    
    // Delete immediately (no confirmation for Alt+Click)
    this.handleRegionDeletion(regionIndex);
    
    // Show brief feedback
    this.showQuickDeleteFeedback(targetRegion);
  }
}

showQuickParameterDialog(beat, clientX, clientY) {
  const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
  const timeFormatted = formatMsToMMSS(timeMs);
  
  const quickDialog = document.createElement('div');
  quickDialog.style.cssText = `
    position: fixed;
    left: ${Math.min(clientX + 15, window.innerWidth - 200)}px;
    top: ${Math.max(clientY - 50, 20)}px;
    background: white;
    border: 2px solid #ffc107;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10001;
    min-width: 180px;
    padding: 10px;
  `;
  
  quickDialog.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; color: #f39c12; display: flex; align-items: center; gap: 6px;">
      <span>⚡</span>
      <span>Quick Event - Beat ${beat.toFixed(0)}</span>
    </div>
    <div style="font-size: 12px; color: #666; margin-bottom: 12px;">${timeFormatted}</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
      <button class="quick-param-btn" data-param="VOLUME" style="background: #28a745; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">🔊 Volume</button>
      <button class="quick-param-btn" data-param="TEMPO (BPM)" style="background: #dc3545; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">🎵 Tempo</button>
      <button class="quick-param-btn" data-param="MELODIC RANGE" style="background: #6f42c1; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">🎹 Range</button>
      <button class="quick-param-btn" data-param="REVERB" style="background: #17a2b8; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">🌊 Reverb</button>
    </div>
    <button onclick="this.remove()" style="background: #6c757d; color: white; border: none; padding: 4px 12px; border-radius: 3px; font-size: 12px; cursor: pointer; width: 100%;">Cancel</button>
  `;
  
  // Connect parameter buttons
  const paramButtons = quickDialog.querySelectorAll('.quick-param-btn');
  paramButtons.forEach(btn => {
    btn.onclick = () => {
      const paramName = btn.dataset.param;
      quickDialog.remove();
      
      // Create single-parameter event quickly
      this.createQuickParameterEvent(beat, paramName);
    };
  });
  
  document.body.appendChild(quickDialog);
  
  setTimeout(() => {
    if (quickDialog.parentElement) quickDialog.remove();
  }, 8000);
}

createQuickParameterEvent(beat, paramName) {
  // Create simple single-parameter event
  const currentParam = voiceData[this.voiceIndex].parameters[paramName];
  const parameterChanges = {};
  
  if (typeof currentParam.min === 'number') {
    parameterChanges[paramName] = {
      changeType: 'range',
      value: {
        min: currentParam.min,
        max: currentParam.max,
        behavior: currentParam.behavior || 50
      }
    };
  } else {
    // Use current values for other parameter types
    parameterChanges[paramName] = {
      changeType: 'current',
      value: currentParam
    };
  }
  
  // Find region index
  const regionIndex = this.findRegionIndexForBeat(beat);
  if (regionIndex === -1) {
    console.warn(`⚠️ No region found for quick event at beat ${beat}`);
    return;
  }
  
  // Create compound event
  const eventId = this.createCompoundParameterEvent(beat, regionIndex, parameterChanges);
  
  if (eventId) {
    this.showCompoundEventSuccessNotification(beat, parameterChanges);
    setTimeout(() => this.refresh(), 100);
  }
}

showQuickDeleteFeedback(targetRegion) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  feedback.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>⚡🗑️</span>
      <div>
        <div>Quick Delete</div>
        <div style="font-size: 11px; opacity: 0.9;">Region ${targetRegion.start}-${targetRegion.end} removed</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}



// ===== ENHANCED DOUBLE-CLICK HANDLERS (NEW) =====

handleGreenRegionDoubleClick(e, beat) {
  e.preventDefault();
  e.stopPropagation();
  
  const region = e.target;
  const regionIndex = parseInt(region.dataset.regionIndex);
  
  if (DEBUG.EVENTS) {
    console.log(`🟢 Green region double-click: region ${regionIndex} at beat ${beat.toFixed(0)}`);
  }
  
  // Get region info for menu context
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[regionIndex];
  
  if (!targetRegion) {
    console.warn(`⚠️ Could not find region ${regionIndex}`);
    return;
  }
  
  SmallContextMenu.show({
    header: `Region ${targetRegion.start}-${targetRegion.end}`,
    items: [
      {
        icon: '💎',
        text: 'Add Parameter Event',
        action: () => this.startParameterEventCreation(beat, regionIndex)
      },
      {
        icon: '📋',
        text: 'Copy Region',
        action: () => this.copyRegion(regionIndex, targetRegion)
      },
      {
        icon: '🗑️',
        text: 'Delete Region',
        action: () => this.confirmDeleteRegion(regionIndex, targetRegion)
      }
    ]
  }, e.clientX, e.clientY);
}

handleDiamondDoubleClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const diamond = e.target;
  const eventId = diamond.dataset.eventId;
  const parameterName = diamond.dataset.parameter;
  const regionIndex = parseInt(diamond.dataset.regionIndex);
  
  console.log(`💎 DIAMOND DOUBLE-CLICK DEBUG:`);
  console.log(`   Diamond eventId: "${eventId}"`);
  console.log(`   Diamond parameter: "${parameterName}"`);
  console.log(`   Diamond regionIndex: ${regionIndex}`);
  
  if (!eventId || !parameterName) {
    console.warn(`⚠️ Diamond missing data: eventId=${eventId}, param=${parameterName}`);
    return;
  }
  
  // Check registry before proceeding
  console.log(`🔍 Registry check before edit:`);
  console.log(`   Registry exists: ${!!eventRegistry}`);
  console.log(`   Event exists in registry: ${!!eventRegistry.getEvent(eventId)}`);
  
  if (DEBUG.EVENTS) {
    console.log(`💎 Diamond double-click: ${parameterName} event (${eventId}) in region ${regionIndex}`);
  }
  
  // Get event data for enhanced menu
  const event = eventRegistry.getEvent(eventId);
  if (!event) {
    console.error(`❌ Event ${eventId} not found in registry during diamond double-click`);
    return;
  }
  
  let headerText = `${parameterName} Event`;
  let affectedParams = [parameterName];

  // Check if it's a compound event
  if (event && event.type === 'compound-parameter' && event.changes) {
    affectedParams = Object.keys(event.changes);
    headerText = `Multi-Parameter Event (${affectedParams.length})`;
  }

  // STREAMLINED CONTEXT MENU - Call edit method directly for now
  console.log(`📝 Calling editParameterEvent directly with eventId: ${eventId}`);
  this.editParameterEvent(eventId, parameterName);
}





// ===== CONTEXT MENU ACTION METHODS =====

startParameterEventCreation(beat, regionIndex) {
  if (DEBUG.EVENTS) {
    console.log(`💎 Starting parameter event creation at beat ${beat.toFixed(0)} in region ${regionIndex}`);
  }
  
  // Use your existing system but call it differently
  this.createParameterEventAtBeat(beat, window.innerWidth / 2, window.innerHeight / 2);
}

copyRegion(regionIndex, targetRegion) {
  // Store region data for pasting
  const regionData = {
    start: targetRegion.start,
    end: targetRegion.end,
    width: targetRegion.end - targetRegion.start,
    voiceIndex: this.voiceIndex,
    timestamp: Date.now()
  };
  
  // Store in a simple global for now
  window.copiedRegion = regionData;
  
  if (DEBUG.EVENTS) {
    console.log(`📋 Copied region: ${targetRegion.start}-${targetRegion.end} beats (${regionData.width} beats wide)`);
  }
  
  // Show feedback
  this.showCopySuccessFeedback(regionData);
}

confirmDeleteRegion(regionIndex, targetRegion) {
  const confirmMessage = `🗑️ Delete Playing Region?

Region: Beat ${targetRegion.start} to ${targetRegion.end}
This will mute this timeline section.

Continue?`;

  if (confirm(confirmMessage)) {
    // Capture state for undo
    if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
      undoManager.captureState(`Timeline: Delete region ${targetRegion.start}-${targetRegion.end}`, true);
    }
    
    this.handleRegionDeletion(regionIndex);
    
    if (DEBUG.EVENTS) {
      console.log(`🗑️ Confirmed deletion of region ${regionIndex}: ${targetRegion.start}-${targetRegion.end}`);
    }
    
    // Show success feedback
    this.showDeleteSuccessFeedback(targetRegion);
  }
}

copyParameterEvent(eventId) {
  if (DEBUG.EVENTS) {
    console.log(`📋 Copying parameter event: ${eventId}`);
  }
  
  // Placeholder for Session 26
  this.showFeaturePlaceholder('Copy Parameter Event', 
    'Event copying will be implemented in Session 26');
}

confirmDeleteEvent(eventId, parameterName) {
  const confirmMessage = `🗑️ Delete Parameter Event?

Parameter: ${parameterName}
Event ID: ${eventId}

Continue?`;

  if (confirm(confirmMessage)) {
    // Use your existing delete method
    this.deleteParameterEvent(eventId);
  }
}

showCopySuccessFeedback(regionData) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #17a2b8;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  feedback.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>📋</span>
      <div>
        <div>Region Copied</div>
        <div style="font-size: 11px; opacity: 0.9;">${regionData.width} beats wide</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}



// FIXED: Direct region creation with proper click-drag-release behavior
startDirectRegionCreation(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const startBeat = this.screenXToBeat(e.clientX);
  const snappedStartBeat = this.snapToBeat ? this.snapBeatToGrid(startBeat) : startBeat;
  const clampedStartBeat = Math.max(0, Math.min(this.maxBeats - 1, snappedStartBeat));
  
  let isDragging = false;
  let currentEndBeat = clampedStartBeat; // Start with same position
  
  // Capture state for undo
  if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
    undoManager.captureState(`Timeline: Create region at beat ${clampedStartBeat}`, true);
  }
  
  if (DEBUG.EVENTS) {
    console.log(`🆕 Region creation starting at beat ${clampedStartBeat} - waiting for drag`);
  }
  
  // Don't show preview initially - wait for user to start dragging
  
  const handleDirectCreationMove = (moveEvent) => {
    const currentBeat = this.screenXToBeat(moveEvent.clientX);
    const snappedCurrentBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
    const clampedCurrentBeat = Math.max(clampedStartBeat + 1, Math.min(this.maxBeats, snappedCurrentBeat));
    
    if (!isDragging) {
      // Start dragging when mouse moves
      isDragging = true;
      if (DEBUG.EVENTS) {
        console.log(`🆕 Started dragging region creation from beat ${clampedStartBeat}`);
      }
    }
    
    currentEndBeat = clampedCurrentBeat;
    
    // Show dashed green preview - left side FIXED at start, right side follows mouse
    this.showRegionCreationPreview(clampedStartBeat, currentEndBeat);
    
    // Update tooltip with current size
    const width = currentEndBeat - clampedStartBeat;
    this.showCreationTooltip(moveEvent.clientX, moveEvent.clientY, clampedStartBeat, currentEndBeat);
    
    if (DEBUG.EVENTS && Math.random() < 0.1) {
      console.log(`🆕 Creating region: ${clampedStartBeat}-${currentEndBeat} (${width.toFixed(1)} beats)`);
    }
  };
  
  const handleDirectCreationEnd = (endEvent) => {
  // Remove global listeners
  document.removeEventListener('mousemove', handleDirectCreationMove);
  document.removeEventListener('mouseup', handleDirectCreationEnd);
  
  // Clear dashed preview
  this.clearRegionCreationPreview();
  
  // NEW: Clear creation tooltip immediately
  this.clearCreationTooltip();
  
  if (isDragging && currentEndBeat > clampedStartBeat + 0.5) {
    // User dragged to create a region - convert to solid green region
    const finalEndBeat = Math.max(clampedStartBeat + 1, Math.round(currentEndBeat));
    
    // Create the region in events array
    this.createNewRegionInEvents(clampedStartBeat, finalEndBeat);
    
    if (DEBUG.EVENTS) {
      console.log(`✅ Created solid region: ${clampedStartBeat}-${finalEndBeat} beats`);
    }
    
    // Show brief success message (not tooltip)
    this.showRegionCreatedSuccess(clampedStartBeat, finalEndBeat);
    
    // Refresh timeline to show solid green region
    setTimeout(() => {
      this.refresh();
    }, 50);
    
  } else {
    // No drag or very small drag - no region created
    if (DEBUG.EVENTS) {
      console.log(`❌ No region created - insufficient drag distance`);
    }
    // Already cleared tooltip above
  }
};

  
  // Add global mouse listeners immediately for drag detection
  document.addEventListener('mousemove', handleDirectCreationMove);
  document.addEventListener('mouseup', handleDirectCreationEnd);
}


// FIXED: Show region creation preview with proper drag visualization
showRegionCreationPreview(startBeat, endBeat) {
  // Remove existing preview
  this.clearRegionCreationPreview();
  
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  const leftPercent = (startBeat / this.maxBeats) * 100;
  const rightPercent = (endBeat / this.maxBeats) * 100;
  const width = Math.max(0.1, rightPercent - leftPercent); // Minimum tiny width
  
  const preview = document.createElement('div');
  preview.className = 'region-creation-preview';
  preview.style.cssText = `
    position: absolute;
    left: ${leftPercent.toFixed(2)}%;
    width: ${width.toFixed(2)}%;
    top: 15px;
    bottom: 15px;
    background: linear-gradient(45deg, rgba(40,167,69,0.3), rgba(52,206,87,0.3));
    border: 3px dashed #28a745;
    border-radius: 6px;
    z-index: 250;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: creationPulse 1.5s ease-in-out infinite alternate;
  `;
  
  // Add live updating label
  const previewLabel = document.createElement('div');
  previewLabel.className = 'preview-region-label';
  previewLabel.style.cssText = `
    color: #28a745;
    font-weight: bold;
    font-size: 11px;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.95);
    padding: 4px 8px;
    border-radius: 4px;
    border: 2px solid #28a745;
    animation: labelPulse 1.5s ease-in-out infinite alternate;
  `;
  
  const beatWidth = endBeat - startBeat;
  const effectiveWidth = width * this.zoomLevel;
  
  // Show different content based on drag progress
  if (beatWidth < 1) {
    previewLabel.textContent = 'Drag to size →';
    previewLabel.style.color = '#ffc107';
    previewLabel.style.borderColor = '#ffc107';
  } else if (effectiveWidth > 20) {
    previewLabel.textContent = `${startBeat.toFixed(0)}-${endBeat.toFixed(0)} (${beatWidth.toFixed(0)} beats)`;
  } else if (effectiveWidth > 10) {
    previewLabel.textContent = `${beatWidth.toFixed(0)}b`;
  } else {
    previewLabel.textContent = '▶';
  }
  
  preview.appendChild(previewLabel);
  track.appendChild(preview);
  
  if (DEBUG.EVENTS) {
    console.log(`🎬 Preview: ${startBeat.toFixed(1)}-${endBeat.toFixed(1)} beats (${width.toFixed(1)}% width)`);
  }
}


// NEW: Clear region creation preview
clearRegionCreationPreview() {
  const preview = this.container.querySelector('.region-creation-preview');
  if (preview) {
    preview.remove();
  }
}

// CLEAN: Diamond drag functionality (region-relative)
addDiamondDragFunctionality(diamond, eventData, regionStartBeat, regionEndBeat) {
  diamond.onmousedown = (e) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    let isDragging = false;
    const dragStartX = e.clientX;
    
    // Disable ALL region interactions
    const allRegions = this.container.querySelectorAll('.timeline-region');
    allRegions.forEach(r => r.style.pointerEvents = 'none');
    
    // Keep diamond interactive
    diamond.style.pointerEvents = 'auto';
    diamond.style.cursor = 'grabbing';
    diamond.style.zIndex = '600';
    diamond.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1.5)';
    diamond.style.boxShadow = '0 10px 30px rgba(243,156,18,1.0)';
    diamond.style.filter = 'brightness(1.3)';
    
    console.log(`💎 DIAMOND drag started: ${eventData.parameter}`);
    
    const moveHandler = (moveEvent) => {
  const dragDistance = Math.abs(moveEvent.clientX - dragStartX);
  
  if (!isDragging && dragDistance > 5) {
    isDragging = true;
    console.log(`💎 Diamond is now dragging`);
  }
  
  if (isDragging) {
    const currentBeat = this.screenXToBeat(moveEvent.clientX);
    const clampedBeat = Math.max(regionStartBeat + 0.1, Math.min(regionEndBeat - 0.1, currentBeat));
    
    // Calculate new relative position
    const newRelativePosition = (clampedBeat - regionStartBeat) / (regionEndBeat - regionStartBeat);
    
    // Update diamond position and data immediately
    this.updateDiamondPosition(diamond, clampedBeat);
    diamond.dataset.relativePosition = newRelativePosition;
    
    // Update title to show new position
    // Get proper parameter name for compound events
    let displayName = 'Unknown';
    if (diamond.dataset.eventType === 'compound-parameter') {
      displayName = diamond.dataset.parameter || 'Multi-Parameter Event';
    } else {
      displayName = eventData.parameter || diamond.dataset.parameter || 'Parameter Event';
    }

    diamond.title = `💎 ${displayName} - Beat ${clampedBeat.toFixed(0)} (${(newRelativePosition * 100).toFixed(1)}% in region)`;
        
        if (DEBUG.EVENTS && Math.random() < 0.1) {
          console.log(`💎 Diamond at ${(newRelativePosition * 100).toFixed(1)}% in region (beat ${clampedBeat.toFixed(1)})`);
        }
      }

      // FORCE SET TITLE (temporary fix)
if (event.type === 'compound-parameter' && event.changes) {
  const paramNames = Object.keys(event.changes);
  diamond.title = `💎 ${paramNames.join(', ')} Event - Beat ${eventBeat.toFixed(0)}`;
  console.log(`🔧 FORCED title: "${diamond.title}"`);
}

};

    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      
      // Re-enable all region interactions
      allRegions.forEach(r => r.style.pointerEvents = 'auto');
      
      // Reset diamond appearance
      diamond.style.cursor = 'grab';
      diamond.style.zIndex = '500';
      diamond.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1)';
      diamond.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
      diamond.style.filter = 'none';
      
      if (isDragging) {
        // Update events array with new relative position
        const newRelativePosition = parseFloat(diamond.dataset.relativePosition);
        this.updateParameterEventRelativePosition(eventData.id, newRelativePosition);
        
        console.log(`✅ Diamond moved to ${(newRelativePosition * 100).toFixed(1)}% in region`);
      }
      
      console.log(`💎 Diamond drag ended - regions re-enabled`);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };
}


// NEW: Update diamond position during drag
updateDiamondPosition(diamond, newBeat) {
  const newLeftPercent = (newBeat / this.maxBeats) * 100;
  diamond.style.left = `${newLeftPercent.toFixed(2)}%`;
  
  // Update dataset for reference
  diamond.dataset.beatPosition = newBeat;
  
  if (DEBUG.EVENTS && Math.random() < 0.05) {
    console.log(`💎 Diamond positioned at ${newLeftPercent.toFixed(1)}% (beat ${newBeat.toFixed(1)})`);
  }
}

// CLEAN: Update parameter event relative position (not absolute)
updateParameterEventPosition(eventId, newBeat) {
  // This method is now deprecated - use updateParameterEventRelativePosition instead
  console.warn(`⚠️ updateParameterEventPosition is deprecated - use relative positioning`);
}

// NEW: Update parameter event relative position
updateParameterEventRelativePosition(eventId, newRelativePosition) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  const eventIndex = lifeSpan.events.findIndex(event => event.id === eventId);
  
  if (eventIndex !== -1) {
    const oldRelativePosition = lifeSpan.events[eventIndex].relativePosition;
    lifeSpan.events[eventIndex].relativePosition = newRelativePosition;
    
    if (DEBUG.EVENTS) {
      console.log(`📝 Updated event ${eventId} relative position: ${(oldRelativePosition * 100).toFixed(1)}% → ${(newRelativePosition * 100).toFixed(1)}%`);
    }
  } else {
    console.error(`❌ Could not find event ${eventId} to update`);
  }
}

// NEW: Update parameter event relative position
updateParameterEventRelativePosition(eventId, newRelativePosition) {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) return;
  
  const eventIndex = lifeSpan.events.findIndex(event => event.id === eventId);
  
  if (eventIndex !== -1) {
    lifeSpan.events[eventIndex].relativePosition = newRelativePosition;
    
    if (DEBUG.EVENTS) {
      console.log(`📝 Updated event ${eventId} relative position: ${(newRelativePosition * 100).toFixed(1)}%`);
    }
  } else {
    console.error(`❌ Could not find event ${eventId} to update`);
  }
}

// showParameterSelectionDialog(beat, clientX, clientY) {
//   // Remove any existing dialog
//   const existingDialog = document.querySelector('.parameter-selection-dialog');
//   if (existingDialog) {
//     existingDialog.remove();
//   }
  
//   // Create parameter selection dialog
//   const dialog = document.createElement('div');
//   dialog.className = 'parameter-selection-dialog';
//   dialog.style.cssText = `
//     position: fixed;
//     left: ${clientX + 15}px;
//     top: ${Math.max(20, clientY - 100)}px;
//     background: white;
//     border: 2px solid #4a90e2;
//     border-radius: 8px;
//     box-shadow: 0 6px 20px rgba(0,0,0,0.3);
//     z-index: 10001;
//     min-width: 280px;
//     max-height: 500px;
//     height: auto;
//     min-height: 450px;
//     overflow-y: auto;
//   `;
  
//   const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
//   const timeFormatted = formatMsToMMSS(timeMs);
  
//   dialog.innerHTML = `
//     <div style="background: linear-gradient(to bottom, #f7f8f8, #c0def7); border-bottom: 2px solid #4a90e2; color: #333; padding: 10px 12px; font-weight: 600; font-size: 14px; display: flex; align-items: center; justify-content: space-between;">
      
//       <!-- Left side: Icon and title -->
//       <div style="display: flex; align-items: center; gap: 8px;">
//         <span>💎</span>
//         <span>Parameter Event - Beat ${beat.toFixed(0)}</span>
//       </div>
      
//       <!-- Right side: Delete button and time info -->
//       <div style="display: flex; align-items: center; gap: 8px;">
//         <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 1px;">
//           <span style="font-size: 10px; color: #666;">${timeFormatted}</span>
//         </div>
//         <button class="delete-region-btn" style="
//           background: #dc3545; color: white; border: none; padding: 4px 8px;
//           border-radius: 3px; font-size: 10px; font-weight: 600; cursor: pointer;
//           transition: all 0.2s ease;
//         " title="Delete this entire playing region">Delete Region</button>
//       </div>
//     </div>
    
//     <div style="padding: 15px; max-height: 375px; overflow-y: auto;">
//       <div style="margin-bottom: 15px; color: #666; font-size: 12px; font-style: italic; text-align: center;">
//         Select a parameter to automate at this beat position:
//       </div>
      
//       <!-- INSTRUMENT & SOUND PARAMETERS -->
//       <div class="param-category" style="margin-bottom: 15px;">
//         <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 3px;">
//           🎼 Instrument & Sound
//         </div>
//         <div class="param-option" data-param="INSTRUMENT" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Instrument</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Switch to different GM sound</span>
//         </div>
//         <div class="param-option" data-param="MELODIC RANGE" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Melodic Range</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change note range or apply scale/chord filter</span>
//         </div>
//         <div class="param-option" data-param="POLYPHONY" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Polyphony</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change number of simultaneous notes</span>
//         </div>
//         <div class="param-option" data-param="ATTACK VELOCITY" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Attack Velocity</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change note attack strength (0-127)</span>
//         </div>
//         <div class="param-option" data-param="DETUNING" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Detuning</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Adjust pitch offset in cents (±50)</span>
//         </div>
//         <div class="param-option" data-param="PORTAMENTO GLIDE TIME" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Portamento Glide</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change pitch bend time between notes</span>
//         </div>
//       </div>
      
//       <!-- RHYTHM & TIMING PARAMETERS -->
//       <div class="param-category" style="margin-bottom: 15px;">
//         <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 3px;">
//           🎵 Rhythm & Timing  
//         </div>
//         <div class="param-option" data-param="TEMPO (BPM)" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Tempo</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change BPM range (40-240)</span>
//         </div>
//         <div class="param-option" data-param="RHYTHMS" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Rhythms</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change selected note durations</span>
//         </div>
//         <div class="param-option" data-param="RESTS" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Rests</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change selected rest durations</span>
//         </div>
//       </div>
      
//       <!-- MIXING & LEVELS PARAMETERS -->
//       <div class="param-category" style="margin-bottom: 15px;">
//         <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 3px;">
//           🔊 Mixing & Levels
//         </div>
//         <div class="param-option" data-param="VOLUME" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Volume</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change volume range (0-100%)</span>
//         </div>
//         <div class="param-option" data-param="STEREO BALANCE" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Stereo Balance</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change pan position (-100 to +100)</span>
//         </div>
//       </div>
      
//       <!-- MODULATION EFFECTS PARAMETERS -->
//       <div class="param-category" style="margin-bottom: 15px;">
//         <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 3px;">
//           🌊 Modulation Effects
//         </div>
//         <div class="param-option" data-param="TREMOLO" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Tremolo</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change tremolo speed/depth</span>
//         </div>
//         <div class="param-option" data-param="CHORUS" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Chorus</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change chorus speed/depth</span>
//         </div>
//         <div class="param-option" data-param="PHASER" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Phaser</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change phaser speed/depth</span>
//         </div>
//       </div>
      
//       <!-- SPATIAL EFFECTS PARAMETERS -->
//       <div class="param-category" style="margin-bottom: 8px;">
//         <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 8px; padding: 4px 8px; background: #f8f9fa; border-radius: 3px;">
//           🎛️ Spatial Effects
//         </div>
//         <div class="param-option" data-param="REVERB" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease;">
//           <span style="font-weight: 500;">Reverb</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change reverb time/mix</span>
//         </div>
//         <div class="param-option" data-param="DELAY" style="padding: 8px 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s ease; margin-bottom: 0;">
//           <span style="font-weight: 500;">Delay</span>
//           <span style="font-size: 11px; color: #666; margin-left: 8px;">Change delay time/mix/feedback</span>
//         </div>
//       </div>
//     </div>
    
//     <div style="padding: 12px; border-top: 1px solid #eee; background: #f8f9fa; text-align: center; position: sticky; bottom: 0;">
//       <button onclick="this.closest('.parameter-selection-dialog').remove()" style="
//         background: #6c757d; color: white; border: none; padding: 8px 20px;
//         border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600;
//       ">Cancel</button>
//     </div>
//   `;
  
//   // Add hover effects and click handlers for parameter options
//   const options = dialog.querySelectorAll('.param-option');
//   options.forEach(option => {
//     option.onmouseenter = function() {
//       this.style.background = '#e7f3ff';
//       this.style.borderLeft = '3px solid #4a90e2';
//       this.style.paddingLeft = '7px';
//     };
//     option.onmouseleave = function() {
//       this.style.background = '';
//       this.style.borderLeft = '';
//       this.style.paddingLeft = '10px';
//     };
    
//     option.onclick = (e) => {
//       const parameterName = option.dataset.param;
//       console.log(`💎 Selected parameter: ${parameterName} at beat ${beat.toFixed(0)}`);
      
//       // Close dialog and proceed to value selection
//       dialog.remove();
//       this.showParameterValueDialog(parameterName, beat, clientX, clientY);
//     };
//   });
  
//   // Connect delete region button (in top-right of header)
//   const deleteBtn = dialog.querySelector('.delete-region-btn');
//   if (deleteBtn) {
//     deleteBtn.onclick = (e) => {
//       e.preventDefault();
//       e.stopPropagation();
      
//       // Find which region this beat belongs to
//       const targetRegionIndex = this.findRegionIndexForBeat(beat);
      
//       if (targetRegionIndex !== -1) {
//         const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
//         const playingRegions = this.convertEventsToRegions(lifeSpan.events);
//         const targetRegion = playingRegions[targetRegionIndex];
        
//         const confirmDelete = confirm(
//           `🗑️ Delete Playing Region?\n\n` +
//           `Beat ${targetRegion.start} to ${targetRegion.end} will be muted.\n\n` +
//           `Continue?`
//         );
        
//         if (confirmDelete) {
//           // Capture for undo
//           if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
//             undoManager.captureState(`Delete region ${targetRegion.start}-${targetRegion.end}`, true);
//           }
          
//           // Delete the region
//           this.handleRegionDeletion(targetRegionIndex);
          
//           // Close dialog
//           dialog.remove();
          
//           console.log(`🗑️ Region deleted: ${targetRegion.start}-${targetRegion.end}`);
//         }
//       } else {
//         alert('❌ Could not find region to delete.');
//       }
//     };
    
//     // Hover effect for delete button
//     deleteBtn.onmouseenter = function() {
//       this.style.background = '#c82333';
//       this.style.transform = 'scale(1.1)';
//     };
    
//     deleteBtn.onmouseleave = function() {
//       this.style.background = '#dc3545';
//       this.style.transform = 'scale(1)';
//     };
//   }
  
//   document.body.appendChild(dialog);
  
//   // Auto-close when clicking elsewhere
//   const closeDialog = (e) => {
//     if (!dialog.contains(e.target)) {
//       dialog.remove();
//       document.removeEventListener('click', closeDialog);
//     }
//   };
  
//   setTimeout(() => {
//     document.addEventListener('click', closeDialog);
//   }, 100);
// }

// showParameterValueDialog(parameterName, beat, clientX, clientY) {
//   // Get current parameter data
//   const paramData = voiceData[this.voiceIndex].parameters[parameterName];
//   if (!paramData) {
//     console.error(`Parameter ${parameterName} not found for Voice ${this.voiceIndex + 1}`);
//     return;
//   }
  
//   // Remove any existing dialog
//   const existingDialog = document.querySelector('.parameter-value-dialog');
//   if (existingDialog) {
//     existingDialog.remove();
//   }
  
//   const dialog = document.createElement('div');
//   dialog.className = 'parameter-value-dialog';
//   dialog.style.cssText = `
//     position: fixed;
//     left: ${Math.min(clientX + 20, window.innerWidth - 350)}px;
//     top: ${Math.max(20, clientY - 50)}px;
//     background: white;
//     border: 2px solid #4a90e2;
//     border-radius: 8px;
//     box-shadow: 0 8px 24px rgba(0,0,0,0.3);
//     z-index: 10002;
//     width: 320px;
//   `;
  
//   const timeMs = beatsToMs(beat, this.beatUnit, this.tempo);
//   const timeFormatted = formatMsToMMSS(timeMs);
  

// dialog.innerHTML = `
//   <div style="background: linear-gradient(to bottom, #f7f8f8, #c0def7); border-bottom: 2px solid #4a90e2; color: #333; padding: 12px 16px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
//     <span>💎</span>
//     <span>${parameterName} Event</span>
//     <span style="font-size: 12px; color: #666; margin-left: auto;">Beat ${beat.toFixed(0)}</span>
//   </div>
          
//     <div style="padding: 20px;">
//       <div style="margin-bottom: 20px; text-align: center; color: #666; font-size: 13px;">
//         Set new values for <strong>${parameterName}</strong> starting at beat ${beat.toFixed(0)} (${timeFormatted})
//       </div>
      
//       <div id="parameter-value-inputs">
//         <!-- Dynamic content based on parameter type -->
//       </div>
      
//       <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
//         <button class="create-event-btn" style="
//           background: #28a745; color: white; border: none; padding: 8px 20px;
//           border-radius: 4px; font-weight: 600; cursor: pointer;
//         ">Create Event</button>
//         <button onclick="this.closest('.parameter-value-dialog').remove()" style="
//           background: #6c757d; color: white; border: none; padding: 8px 16px;
//           border-radius: 4px; cursor: pointer;
//         ">Cancel</button>
//       </div>
//     </div>
//   `;
  
//   // Generate appropriate input interface
//   const inputsContainer = dialog.querySelector('#parameter-value-inputs');
//   this.createParameterInputInterface(parameterName, paramData, inputsContainer);
  
//   // Connect create button
//   const createBtn = dialog.querySelector('.create-event-btn');
//   createBtn.onclick = () => {
//     const eventData = this.collectParameterEventData(parameterName, inputsContainer);
//     if (eventData) {
//       this.insertParameterEvent(beat, parameterName, eventData);
//       dialog.remove();
      
//       // Show success feedback
//       this.showParameterEventCreated(beat, parameterName);
      
//       // Refresh timeline
//       setTimeout(() => this.refresh(), 100);
//     }
//   };
  
//   document.body.appendChild(dialog);

//   document.body.appendChild(dialog);

// // Connect delete region button
// const deleteBtn = dialog.querySelector('.delete-region-btn');
// if (deleteBtn) {
//   deleteBtn.onclick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
    
//     // Find which region this beat belongs to
//     const targetRegionIndex = this.findRegionIndexForBeat(beat);
    
//     if (targetRegionIndex !== -1) {
//       // Confirm deletion
//       const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
//       const playingRegions = this.convertEventsToRegions(lifeSpan.events);
//       const targetRegion = playingRegions[targetRegionIndex];
      
//       const confirmDelete = confirm(
//         `🗑️ Delete Playing Region?\n\n` +
//         `This will delete the playing region from Beat ${targetRegion.start} to ${targetRegion.end}.\n\n` +
//         `The timeline will be muted in this area.\n\n` +
//         `Continue with deletion?`
//       );
      
//       if (confirmDelete) {
//         // Capture state for undo
//         if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
//           undoManager.captureState(`Timeline: Delete region ${targetRegion.start}-${targetRegion.end}`, true);
//         }
        
//         // Delete the region
//         this.handleRegionDeletion(targetRegionIndex);
        
//         // Close dialog
//         dialog.remove();
        
//         // Show success feedback
//         setTimeout(() => {
//           this.showUnifiedBeatTooltip(window.innerWidth / 2, 100, {
//             type: 'context-help',
//             beat: beat,
//             operation: 'Region Deleted',
//             additionalInfo: `Playing region ${targetRegion.start}-${targetRegion.end} removed`
//           });
          
//           setTimeout(() => {
//             this.hideUnifiedTooltip();
//           }, 3000);
//         }, 200);
        
//         if (DEBUG.EVENTS) {
//           console.log(`🗑️ Deleted region via popup button: ${targetRegion.start}-${targetRegion.end}`);
//         }
//       }
//     } else {
//       alert('❌ Could not find region to delete.');
//     }
//   };
  
//   // Add hover effect to delete button
//   deleteBtn.onmouseenter = function() {
//     this.style.background = '#c82333';
//     this.style.transform = 'scale(1.05)';
//   };
  
//   deleteBtn.onmouseleave = function() {
//     this.style.background = '#dc3545';
//     this.style.transform = 'scale(1)';
//   };
// }

// }

// createParameterInputInterface(parameterName, paramData, container) {
//   container.innerHTML = '';
  
//   if (typeof paramData.min === 'number' && typeof paramData.max === 'number') {
//     // Range parameter (Volume, Tempo, Melodic Range, etc.)
//     this.createRangeInputInterface(parameterName, paramData, container);
//   } else if (paramData.selectedValues && Array.isArray(paramData.selectedValues)) {
//     // Multi-select parameter (Rhythms, Rests)
//     this.createMultiSelectInterface(parameterName, paramData, container);
//   } else if (typeof paramData === 'number') {
//     // Simple dropdown (Instrument)
//     this.createDropdownInterface(parameterName, paramData, container);
//   } else if (paramData.speed || paramData.depth) {
//     // Multi-dual parameter (Effects)
//     this.createEffectInterface(parameterName, paramData, container);
//   } else {
//     // Placeholder for complex parameters
//     container.innerHTML = `
//       <div style="text-align: center; color: #666; padding: 20px;">
//         <div>📋</div>
//         <div style="margin-top: 8px;">Parameter event interface for <strong>${parameterName}</strong><br>will be implemented in Phase A.2</div>
//       </div>
//     `;
//   }
// }

createRangeInputInterface(parameterName, paramData, container) {
  const currentMin = paramData.currentValue !== undefined ? paramData.currentValue : paramData.min;
  const currentMax = paramData.currentValue !== undefined ? paramData.currentValue : paramData.max;
  
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <div style="text-align: center; color: #666; font-size: 12px;">
        Current: ${currentMin.toFixed(0)} - ${currentMax.toFixed(0)}
      </div>
      
      <div style="display: flex; gap: 15px; align-items: center;">
        <div style="flex: 1;">
          <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">New Minimum:</label>
          <input type="number" class="new-min-input" value="${paramData.min}" 
                 min="${parameterName === 'TEMPO (BPM)' ? 40 : 0}" 
                 max="${parameterName === 'TEMPO (BPM)' ? 240 : 127}"
                 style="width: 100%; padding: 6px 8px; border: 1px solid #dee2e6; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">New Maximum:</label>
          <input type="number" class="new-max-input" value="${paramData.max}"
                 min="${parameterName === 'TEMPO (BPM)' ? 40 : 0}" 
                 max="${parameterName === 'TEMPO (BPM)' ? 240 : 127}"
                 style="width: 100%; padding: 6px 8px; border: 1px solid #dee2e6; border-radius: 4px;">
        </div>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 10px; font-size: 12px; color: #856404;">
        <div style="font-weight: 600; margin-bottom: 4px;">💡 Parameter Event Behavior:</div>
        <div>This will change the parameter's min/max range starting at beat ${Math.round(this.currentBeat || 0)}.</div>
        <div style="margin-top: 4px;">The voice will smoothly transition to the new range over time.</div>
      </div>
    </div>
  `;
}

collectParameterEventData(parameterName, container) {
  const minInput = container.querySelector('.new-min-input');
  const maxInput = container.querySelector('.new-max-input');
  
  if (minInput && maxInput) {
    const minValue = parseFloat(minInput.value);
    const maxValue = parseFloat(maxInput.value);
    
    if (isNaN(minValue) || isNaN(maxValue)) {
      alert('Please enter valid numbers for min and max values.');
      return null;
    }
    
    if (minValue > maxValue) {
      alert('Minimum value cannot be greater than maximum value.');
      return null;
    }
    
    return {
      changeType: 'range',
      value: {
        min: minValue,
        max: maxValue
      }
    };
  }
  
  // TODO: Add handlers for other parameter types
  return null;
}

insertParameterEvent(beat, parameterName, eventData) {
  console.log(`💎 Creating region-relative parameter event`);
  
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  if (!lifeSpan || !lifeSpan.events) {
    console.error(`❌ No life span or events array`);
    return;
  }
  
  // Find which region this beat belongs to
  const targetRegionIndex = this.findRegionIndexForBeat(beat);
  const playingRegions = this.convertEventsToRegions(lifeSpan.events);
  const targetRegion = playingRegions[targetRegionIndex];

  if (!targetRegion) {
    console.error(`❌ Cannot create parameter event - no region found at beat ${beat}`);
    alert(`Cannot create parameter event - beat ${beat.toFixed(0)} is not in a playing region.`);
    return;
  }

  // Calculate RELATIVE position within region (0.0 to 1.0)
  const relativePosition = (beat - targetRegion.start) / (targetRegion.end - targetRegion.start);
  
  // Capture state for undo
  if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
    undoManager.captureState(`Parameter event: ${parameterName} at beat ${beat.toFixed(0)}`, true);
  }
  
  // Generate unique ID
  const eventId = `param-${String(lifeSpan.nextEventId++).padStart(3, '0')}`;
  
  // Create parameter event - REGION-RELATIVE
  const newEvent = {
    type: 'parameter',
    regionIndex: targetRegionIndex,
    relativePosition: relativePosition, // 0.0 = start of region, 1.0 = end of region
    parameter: parameterName,
    changeType: eventData.changeType,
    value: eventData.value,
    id: eventId
  };
  
  // Insert in events array (position doesn't matter for parameter events)
  lifeSpan.events.push(newEvent);
  
  console.log(`💎 Parameter event created: ${parameterName} at ${(relativePosition * 100).toFixed(1)}% in region ${targetRegionIndex}`);
  console.log(`   Region: ${targetRegion.start}-${targetRegion.end} beats`);
  console.log(`   Event ID: ${eventId}`);
  
  // Show success notification
  this.showParameterEventCreated(beat, parameterName);
}

showParameterEventCreated(beat, parameterName) {
  // Clear any lingering tooltips first
  this.clearCreationTooltip();
  this.hideBeatIndicator();
  
  // Show success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">💎</span>
      <div>
        <div>Parameter Event Created</div>
        <div style="font-size: 11px; opacity: 0.9;">${parameterName} at Beat ${beat.toFixed(0)}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
  
  console.log(`✅ Parameter event created - timeline should remain stable`);
  
  // DON'T refresh automatically - just show the notification
}

// NEW: Update cursor based on position - CORRECTED TOOLTIPS
updateCursorForPosition(beat) {
  const track = this.container.querySelector('.visual-timeline-track');
  const isInPlayingRegion = this.checkIfBeatIsInPlayingRegion(beat);
  
  if (isInPlayingRegion) {
    // Over green region - show gray vertical bar cursor (will mute)
    track.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><rect x=\'11\' y=\'4\' width=\'2\' height=\'16\' fill=\'%23666\'/></svg>") 12 12, crosshair';
    track.title = `Beat ${beat.toFixed(0)} - Drag to mute | Click for event`;
  } else {
    // Over gray region - show green vertical bar cursor (will unmute)
    track.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><rect x=\'11\' y=\'4\' width=\'2\' height=\'16\' fill=\'%2328a745\'/></svg>") 12 12, crosshair';
    track.title = `Beat ${beat.toFixed(0)} - Drag to unmute | Click for event`;
  }
}


// NEW: Update legacy millisecond storage
updateLegacyStorage() {
  const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
  const tempo = getCurrentTempoForVoice(this.voiceIndex);
  const beatUnit = lifeSpan.beatUnit || 7;
  
  for (let i = 1; i <= 3; i++) {
    const span = lifeSpan[`lifeSpan${i}`];
    if (span) {
      if (!lifeSpan[`lifeSpan${i}Legacy`]) {
        lifeSpan[`lifeSpan${i}Legacy`] = {};
      }
      
      lifeSpan[`lifeSpan${i}Legacy`].enter = beatsToMs(span.enterBeats || 0, beatUnit, tempo);
      lifeSpan[`lifeSpan${i}Legacy`].exit = beatsToMs(span.exitBeats || 0, beatUnit, tempo);
    }
  }
  
  console.log(`💾 Updated legacy storage for Voice ${this.voiceIndex + 1}`);
}

// NEW: Show drag preview overlay
showDragPreview(startBeat, endBeat) {
  // Clear existing preview
  this.clearDragPreview();
  
  const track = this.container.querySelector('.visual-timeline-track');
  if (!track) return;
  
  const minBeat = Math.min(startBeat, endBeat);
  const maxBeat = Math.max(startBeat, endBeat);
  
  const leftPercent = (minBeat / this.maxBeats) * 100;
  const widthPercent = ((maxBeat - minBeat) / this.maxBeats) * 100;
  
  const preview = document.createElement('div');
  preview.className = 'timeline-drag-preview';
  preview.style.cssText = `
    position: absolute;
    left: ${leftPercent.toFixed(2)}%;
    width: ${widthPercent.toFixed(2)}%;
    top: 5px;
    bottom: 5px;
    background: ${this.currentMode === 'mute' ? 'rgba(108,117,125,0.5)' : 'rgba(40,167,69,0.5)'};
    border: 2px dashed ${this.currentMode === 'mute' ? '#6c757d' : '#28a745'};
    border-radius: 4px;
    z-index: 150;
    pointer-events: none;
  `;
  
  track.appendChild(preview);
}

// NEW: Clear drag preview
clearDragPreview() {
  const preview = this.container.querySelector('.timeline-drag-preview');
  if (preview) {
    preview.remove();
  }
}

// NEW: Update cursor based on position  
updateCursorForPosition(beat) {
  const track = this.container.querySelector('.visual-timeline-track');
  const isInPlayingRegion = this.checkIfBeatIsInPlayingRegion(beat);
  
  if (isInPlayingRegion) {
    // Over green region - show gray vertical bar cursor (will mute)
    track.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><rect x=\'11\' y=\'4\' width=\'2\' height=\'16\' fill=\'%23666\'/></svg>") 12 12, crosshair';
    track.title = `Beat ${beat.toFixed(0)} - Drag to MUTE this area`;
  } else {
    // Over gray region - show green vertical bar cursor (will unmute)
    track.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><rect x=\'11\' y=\'4\' width=\'2\' height=\'16\' fill=\'%2328a745\'/></svg>") 12 12, crosshair';
    track.title = `Beat ${beat.toFixed(0)} - Drag to UNMUTE this area`;
  }
}

// ===== REGION BODY DRAG FUNCTIONALITY (RESTORED) =====
addRegionBodyDragFunctionality(regionElement, regionIndex) {
  let isDragging = false;
  let dragStartX = 0;
  let regionStartBeat = 0;
  let regionWidth = 0;
  let clickOffset = 0;
  
  regionElement.onmousedown = (e) => {
    // Only handle clicks on region body, not handles
    if (e.target.classList.contains('region-drag-handle')) {
      return; // Let handle drag take over
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const lifeSpan = voiceData[this.voiceIndex].parameters['LIFE SPAN'];
    const playingRegions = this.convertEventsToRegions(lifeSpan.events);
    const targetRegion = playingRegions[regionIndex];
    
    if (!targetRegion) return;
    
    dragStartX = e.clientX;
    regionStartBeat = targetRegion.start;
    regionWidth = targetRegion.end - targetRegion.start;
    
    const clickBeat = this.screenXToBeat(e.clientX);
    clickOffset = clickBeat - regionStartBeat;
    
    // Visual feedback
    regionElement.style.cursor = 'grabbing';
    regionElement.style.boxShadow = '0 0 12px rgba(40,167,69,0.8)';
    regionElement.style.transform = 'translateY(-2px)';
    regionElement.style.opacity = '0.8';
    regionElement.style.border = '2px solid #28a745';
    
    if (DEBUG.EVENTS) {
      console.log(`🟢 Started region body drag: region ${regionIndex}, width ${regionWidth} beats`);
    }
    
    const handleMouseMove = (moveEvent) => {
      if (!isDragging) {
        const dragDistance = Math.abs(moveEvent.clientX - dragStartX);
        if (dragDistance > 5) {
          isDragging = true;
          
          // Capture state for undo
          if (undoManager && undoManager.isCapturing && this.voiceIndex === currentVoice) {
            undoManager.captureState(`Timeline: Move region ${targetRegion.start}-${targetRegion.end}`, true);
          }
          
          if (DEBUG.EVENTS) {
            console.log(`🖱️ Region drag started (threshold reached)`);
          }
        } else {
          return;
        }
      }
      
      const currentBeat = this.screenXToBeat(moveEvent.clientX);
      const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
      
      // Calculate new region position
      let newRegionStart = snappedBeat - clickOffset;
      let newRegionEnd = newRegionStart + regionWidth;
      
      // Clamp to timeline bounds
      if (newRegionStart < 0) {
        newRegionStart = 0;
        newRegionEnd = regionWidth;
      } else if (newRegionEnd > this.maxBeats) {
        newRegionEnd = this.maxBeats;
        newRegionStart = this.maxBeats - regionWidth;
      }
      
      newRegionStart = Math.max(0, newRegionStart);
      newRegionEnd = Math.min(this.maxBeats, newRegionEnd);
      
      // Update visual position with live label update
      this.updateWholeRegionPosition(regionElement, newRegionStart, newRegionEnd);
      
      // Update diamonds in real-time during region drag
      this.updateDiamondsForRegionDragRealTime(regionIndex, newRegionStart, newRegionEnd);
      
      // Show position in tooltip
      const timeMs = beatsToMs(newRegionStart, this.beatUnit, this.tempo);
      const timeFormatted = formatMsToMMSS(timeMs);
      
      this.showDragTooltip(moveEvent.clientX, moveEvent.clientY, newRegionStart, timeFormatted, 'region-move');
    };
    
    const handleMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (isDragging) {
        // Apply the drag operation to events array
        const currentBeat = this.screenXToBeat(upEvent.clientX);
        const snappedBeat = this.snapToBeat ? this.snapBeatToGrid(currentBeat) : currentBeat;
        
        let newRegionStart = snappedBeat - clickOffset;
        let newRegionEnd = newRegionStart + regionWidth;
        
        // Clamp and snap final positions
        if (newRegionStart < 0) {
          newRegionStart = 0;
          newRegionEnd = regionWidth;
        } else if (newRegionEnd > this.maxBeats) {
          newRegionEnd = this.maxBeats;
          newRegionStart = this.maxBeats - regionWidth;
        }
        
        newRegionStart = Math.round(Math.max(0, newRegionStart));
        newRegionEnd = Math.round(Math.min(this.maxBeats, newRegionEnd));
        
        // Update events array
        this.replaceRegionInEvents(regionIndex, newRegionStart, newRegionEnd);
        
        if (DEBUG.EVENTS) {
          console.log(`✅ Region moved to: ${newRegionStart}-${newRegionEnd} beats`);
        }
      }
      
      // Reset visual state
      regionElement.style.cursor = '';
      regionElement.style.boxShadow = '';
      regionElement.style.transform = '';
      regionElement.style.opacity = '';
      regionElement.style.border = '';
      
      // Remove tooltip
      const dragTooltip = document.querySelector('.drag-tooltip');
      if (dragTooltip) {
        dragTooltip.remove();
      }
      
      // Refresh timeline
      setTimeout(() => this.refresh(), 50);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
}


}

// Global visual timeline instance
let visualTimeline = null;

// ===== VIEW TOGGLE SYSTEM =====
let currentViewMode = 'parameter'; // 'parameter' or 'timeline'

// View state preservation
let viewState = {
  parameter: {
    currentVoice: 0,
    rollupStates: {},
    scrollPosition: 0,
    playheadPosition: 0
  },
  timeline: {
    selectedVoices: [],
    zoomLevel: 1.0,
    scrollPosition: 0,
    playheadPosition: 0
  }
};

function getCurrentViewMode() {
  return currentViewMode;
}

function setViewMode(newMode) {
  if (newMode === currentViewMode) {
    console.log(`🔄 Already in ${newMode} mode`);
    return;
  }
  
  console.log(`🔄 View mode change requested: ${currentViewMode} → ${newMode}`);
  
  // Save current view state
  saveCurrentViewState();
  
  // Switch views  
  const oldMode = currentViewMode;
  currentViewMode = newMode;
  
  // Apply new view
  renderViewMode(newMode);
  
  // Restore new view state
  restoreViewState(newMode);
  
  // Update toggle button
  updateViewToggleButton();
  
  console.log(`✅ View switched: ${oldMode} → ${newMode}`);
}

function saveCurrentViewState() {
  const currentState = viewState[currentViewMode];
  
  if (currentViewMode === 'parameter') {
    currentState.currentVoice = currentVoice;
    currentState.playheadPosition = masterClock ? masterClock.getElapsedTime() : 0;
    
    // Save parameter rollup states
    const rollups = document.querySelectorAll('.parameter-rollup');
    currentState.rollupStates = {};
    rollups.forEach(rollup => {
      const paramName = rollup.dataset.parameter;
      if (paramName) {
        currentState.rollupStates[paramName] = rollup.classList.contains('expanded');
      }
    });
    
    // Save scroll position
    const parameterSection = document.getElementById('parameter-section');
    if (parameterSection) {
      currentState.scrollPosition = parameterSection.scrollTop;
    }
    
    console.log(`💾 Saved parameter view state: voice ${currentState.currentVoice + 1}`);
  }
}

function restoreViewState(newMode) {
  const newState = viewState[newMode];
  
  if (newMode === 'parameter') {
    // Restore current voice if different
    if (newState.currentVoice !== currentVoice) {
      selectVoice(newState.currentVoice);
    }
    
    console.log(`♻️ Restored parameter view state: voice ${newState.currentVoice + 1}`);
  }
}

function renderViewMode(mode) {
  if (mode === 'parameter') {
    renderParameterView();
  } else if (mode === 'timeline') {
    renderTimelineView();
  } else {
    console.error(`❌ Unknown view mode: ${mode}`);
  }
}

function renderParameterView() {
  console.log('🎛️ Rendering Parameter View');
  
  // Show parameter section  
  const parameterSection = document.getElementById('parameter-section');
  if (parameterSection) {
    parameterSection.style.display = 'flex';
    console.log('✅ Parameter section visible');
  }
  
  // Hide master timeline container if it exists
  const masterTimelineContainer = document.getElementById('master-timeline-container');
  if (masterTimelineContainer) {
    masterTimelineContainer.style.display = 'none';
    console.log('🙈 Master timeline hidden');
  }
  
  // Ensure individual timeline is visible
  setTimeout(() => {
    if (!visualTimeline || !visualTimeline.isVisible) {
      showVisualTimeline();
    }
  }, 50);
}

function renderTimelineView() {
  console.log('📊 Rendering Timeline View');
  
  // Hide parameter section
  const parameterSection = document.getElementById('parameter-section');
  if (parameterSection) {
    parameterSection.style.display = 'none';
    console.log('🙈 Parameter section hidden');
  }
  
  // Show master timeline placeholder
  const mainContent = document.getElementById('main-content');
  let masterTimelineContainer = document.getElementById('master-timeline-container');
  
  if (!masterTimelineContainer) {
    masterTimelineContainer = createMasterTimelineContainer();
    mainContent.appendChild(masterTimelineContainer);
    console.log('🆕 Created master timeline container');
  }
  
  masterTimelineContainer.style.display = 'flex';
  
  setTimeout(() => {
    renderAllVoiceTimelines();
  }, 50);
}

function updateViewToggleButton() {
  const toggleBtn = document.getElementById('view-toggle-btn');
  if (!toggleBtn) return;
  
  const icon = toggleBtn.querySelector('.view-icon');
  const text = toggleBtn.querySelector('.view-text');
  
  if (currentViewMode === 'parameter') {
    if (icon) icon.textContent = '🎛️';
    if (text) text.textContent = 'Parameter View';
    toggleBtn.classList.add('active');
  } else {
    if (icon) icon.textContent = '📊';
    if (text) text.textContent = 'Timeline View';
    toggleBtn.classList.remove('active');
  }
}

function createMasterTimelineContainer() {
  const container = document.createElement('div');
  container.id = 'master-timeline-container';
  container.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
      text-align: center;
      gap: 20px;
    ">
      <div style="font-size: 48px;">📊</div>
      <h2 style="margin: 0; color: #333;">Master Timeline View</h2>
      <p>Multi-voice timeline orchestration (Session 27)</p>
    </div>
  `;
  
  return container;
}

function renderAllVoiceTimelines() {
  console.log('📊 renderAllVoiceTimelines() - placeholder');
}

// ===== END VIEW TOGGLE SYSTEM =====

// ===== GLOBAL VISUAL TIMELINE FUNCTIONS =====



// ===== GLOBAL VISUAL TIMELINE FUNCTIONS =====
// Updated showVisualTimeline function - FIXED to use VisualTimeline
function showVisualTimeline() {
  console.log('🎬 Showing Interactive Timeline for Voice', currentVoice + 1);
  
  // Find or create timeline container
  let timelineContainer = document.getElementById('visual-timeline-container');
  
  if (!timelineContainer) {
    timelineContainer = document.createElement('div');
    timelineContainer.id = 'visual-timeline-container';
    
    const parameterSection = document.getElementById('parameter-section');
    
    if (parameterSection) {
      parameterSection.insertBefore(timelineContainer, parameterSection.firstChild);
      console.log('✅ Created interactive timeline container');
    } else {
      console.error('❌ Could not find parameter section');
      return;
    }
  }
  
  // Create or update timeline instance using VisualTimeline
  if (!visualTimeline) {
    visualTimeline = new VisualTimeline(currentVoice);
  } else {
    visualTimeline.updateForVoice(currentVoice);
  }
  
  // Render timeline
  visualTimeline.render(timelineContainer);
  
  // Start updates if master clock is running
  if (masterClock && masterClock.isActive()) {
    visualTimeline.startUpdating();
  }
  
  console.log('✅ Interactive Timeline displayed with click-to-mute functionality');
}

function hideVisualTimeline() {
  const timelineContainer = document.getElementById('visual-timeline-container');
  
  if (timelineContainer) {
    timelineContainer.style.display = 'none';
  }
  
  if (visualTimeline) {
    visualTimeline.stopUpdating();
  }
  
  console.log('🙈 Visual Timeline hidden');
}

// Update visual timeline for voice changes - FIXED
function updateVisualTimelineForVoiceChange(newVoiceIndex) {
  if (visualTimeline && visualTimeline.isVisible) {
    visualTimeline.updateForVoice(newVoiceIndex);
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
    
    // NEW: Disable undo capturing during reset
    if (undoManager) {
      undoManager.isCapturing = false;
      
      if (DEBUG.UNDO_REDO) {
        console.log('🔒 Undo capturing disabled for NEW composition');
      }
    }

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
                // Re-enable capturing if user cancels
                if (undoManager) {
                  undoManager.isCapturing = true;
                }
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
        
    // NEW: Re-enable capturing and clear history after NEW composition
    setTimeout(() => {
      if (undoManager) {
        undoManager.isCapturing = true;
        undoManager.clear();
        updateUndoRedoButtons(); // NEW: Update button states after clear
        
        if (DEBUG.UNDO_REDO) {
          console.log('🔓 Undo capturing re-enabled after NEW composition');
          console.log('   History cleared - ready for user actions');
        }
      }
    }, 2500);

        
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
        
        // Re-enable capturing even on error
        if (undoManager) {
          undoManager.isCapturing = true;
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

// Initialize systems on page load
document.addEventListener('DOMContentLoaded', () => {
  audioManager = new AudioManager();
  
 // NEW: Initialize undo manager BEFORE voices
  undoManager = new UndoManager();
  
  // NEW: Initialize global event registry
  initializeEventRegistry();

  // NEW: Disable capturing during initialization
  undoManager.isCapturing = false;
  
  if (DEBUG.UNDO_REDO) {
    console.log('🔒 Undo capturing DISABLED during page load');
  }
  
  initializeVoices();
  createVoiceTabs();
  
  presetManager = new PresetManager();

  // NEW: Initialize view state manager ONCE (removed duplicate)
  viewStateManager = new ViewStateManager();

  if (DEBUG.TIMELINE) {
    console.log('🔄 ViewStateManager initialized ONCE');
    console.log('   Default mode: timeline');
    console.log('   State preservation: enabled');
    console.log('   Audio protection: active');
  }

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

  // NEW: Connect view toggle button with state preservation  
  setTimeout(() => {
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    if (viewToggleBtn) {
      // Remove any existing click handler
      viewToggleBtn.onclick = null;
      
      viewToggleBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Protect audio state before switch
        const audioState = protectAudioDuringViewSwitch();
        
        const newMode = viewStateManager.currentMode === 'parameter' ? 'timeline' : 'parameter';
        
        if (DEBUG.TIMELINE) {
          console.log(`🔘 View toggle clicked: switching to ${newMode} mode`);
          console.log(`   Audio protected: ${audioState.masterClockRunning ? 'playing' : 'stopped'}`);
        }
        
        const success = viewStateManager.switchMode(newMode);
        
        if (success) {
          // Validate audio continuity after switch
          setTimeout(() => {
            validateAudioAfterViewSwitch(audioState);
          }, 250);
        } else {
          console.warn(`⚠️ View switch failed or already in progress`);
        }
      };
      
      console.log('✅ View toggle button connected with state preservation');
    } else {
      console.warn('⚠️ View toggle button not found - check HTML structure');
    }
  }, 400);

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
  
  // NEW: Global keyboard shortcuts for undo/redo
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z (or Cmd+Z on Mac) - UNDO
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      
      if (undoManager && undoManager.undo()) {
        showUndoRedoFeedback('UNDO');
      } else {
        showUndoRedoFeedback('NOTHING TO UNDO', true);
      }
    }
    
    // Ctrl+Y (or Ctrl+Shift+Z, or Cmd+Shift+Z on Mac) - REDO
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      
      if (undoManager && undoManager.redo()) {
        showUndoRedoFeedback('REDO');
      } else {
        showUndoRedoFeedback('NOTHING TO REDO', true);
      }
    }
  });
  
  if (DEBUG.UNDO_REDO) {
    console.log('⌨️ Undo/Redo keyboard shortcuts registered');
  }
  
  // NEW: Re-enable undo capturing AFTER initialization complete
  setTimeout(() => {
    if (undoManager) {
      undoManager.isCapturing = true;
      undoManager.clear();
      
      if (DEBUG.UNDO_REDO) {
        console.log('🔓 Undo capturing ENABLED');
      }
    }
  }, 1000);

  // FINAL CLEAN INITIALIZATION (no competing timers)
  setTimeout(() => {
    if (viewStateManager) {
      console.log('🎯 FINAL: Setting Timeline View as default');
      
      // Force Timeline View without switching logic (avoid bounce)
      viewStateManager.currentMode = 'timeline';
      
      // Hide Parameter View
      const parameterSection = document.getElementById('parameter-section');
      if (parameterSection) {
        parameterSection.style.display = 'none';
      }
      
      // Show Master Timeline  
      let masterTimelineContainer = document.getElementById('master-timeline-container');
      if (!masterTimelineContainer) {
        masterTimelineContainer = viewStateManager.createMasterTimelineContainer();
        document.getElementById('main-content').appendChild(masterTimelineContainer);
      }
      masterTimelineContainer.style.display = 'flex';
      
      // Set button correctly
      viewStateManager.updateToggleButton('timeline');
      
      console.log('✅ FINAL: Timeline View set as default (no bounce)');
    }
  }, 100); // Faster initialization

});

// ===== UNDO/REDO VISUAL FEEDBACK =====

// ===== UNDO/REDO BUTTON FUNCTIONS =====

/**
 * Perform undo operation (called by UI button)
 */
function performUndo() {
  if (!undoManager) {
    console.error('❌ UndoManager not initialized');
    return;
  }
  
  if (undoManager.undo()) {
    showUndoRedoFeedback('UNDO');
    updateUndoRedoButtons();
  } else {
    showUndoRedoFeedback('NOTHING TO UNDO', true);
  }
}

/**
 * Perform redo operation (called by UI button)
 */
function performRedo() {
  if (!undoManager) {
    console.error('❌ UndoManager not initialized');
    return;
  }
  
  if (undoManager.redo()) {
    showUndoRedoFeedback('REDO');
    updateUndoRedoButtons();
  } else {
    showUndoRedoFeedback('NOTHING TO REDO', true);
  }
}

/**
 * Update undo/redo button states (enabled/disabled)
 */
function updateUndoRedoButtons() {
  if (!undoManager) return;
  
  const stats = undoManager.getStats();
  
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  
  if (undoBtn) {
    undoBtn.disabled = !stats.canUndo;
    undoBtn.style.opacity = stats.canUndo ? '1.0' : '0.5';
    undoBtn.style.cursor = stats.canUndo ? 'pointer' : 'not-allowed';
    
    // Update tooltip with action count
    if (stats.undoCount > 0) {
      const lastAction = undoManager.undoStack[undoManager.undoStack.length - 1];
      undoBtn.title = `Undo: ${lastAction.action} (Ctrl+Z)\n${stats.undoCount} actions available`;
    } else {
      undoBtn.title = 'Nothing to undo (Ctrl+Z)';
    }
  }
  
  if (redoBtn) {
    redoBtn.disabled = !stats.canRedo;
    redoBtn.style.opacity = stats.canRedo ? '1.0' : '0.5';
    redoBtn.style.cursor = stats.canRedo ? 'pointer' : 'not-allowed';
    
    // Update tooltip with action count
    if (stats.redoCount > 0) {
      const nextAction = undoManager.redoStack[undoManager.redoStack.length - 1];
      redoBtn.title = `Redo: ${nextAction.action} (Ctrl+Y)\n${stats.redoCount} actions available`;
    } else {
      redoBtn.title = 'Nothing to redo (Ctrl+Y)';
    }
  }
  
  if (DEBUG.UNDO_REDO) {
    console.log(`🔘 Button states updated: Undo=${stats.canUndo}, Redo=${stats.canRedo}`);
  }
}

/**
 * Show temporary visual feedback for undo/redo operations
 * @param {string} message - Message to display
 * @param {boolean} isWarning - Show as warning (nothing to undo/redo)
 */
function showUndoRedoFeedback(message, isWarning = false) {
  // Remove any existing feedback
  const existingFeedback = document.querySelector('.undo-redo-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'undo-redo-feedback';
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isWarning ? '#fff3cd' : '#28a745'};
    color: ${isWarning ? '#856404' : 'white'};
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    feedback.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      feedback.remove();
    }, 300);
  }, 2000);
  
  if (DEBUG.UNDO_REDO) {
    console.log(`💬 Feedback shown: "${message}"`);
  }
}

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

/**
 * Load legacy file format and convert to beat-based storage
 * Call this after loading a composition file
 */
function migrateLegacyLifeSpanData() {
  console.log('🔄 Checking for legacy Life Span data...');
  
  let migrationCount = 0;
  
  for (let i = 0; i < 16; i++) {
    const lifeSpan = voiceData[i].parameters['LIFE SPAN'];
    
    if (!lifeSpan) continue;
    
    // Check if this is legacy data (has ms but not beats)
    const isLegacy = (
      lifeSpan.maxTimeMs !== undefined && 
      lifeSpan.maxTimeBeats === undefined
    );
    
    if (isLegacy) {
      console.log(`📦 Migrating Voice ${i + 1} from legacy format...`);
      
      const tempo = getCurrentTempoForVoice(i);
      const beatUnit = lifeSpan.beatUnit || 7;
      
      // Convert max time
      lifeSpan.maxTimeBeats = msToBeats(lifeSpan.maxTimeMs, beatUnit, tempo);
      
      // Convert entrance/exit times
      for (let j = 1; j <= 3; j++) {
        const legacySpan = lifeSpan[`lifeSpan${j}`];
        
        if (legacySpan && legacySpan.enter !== undefined) {
          lifeSpan[`lifeSpan${j}`] = {
            enterBeats: msToBeats(legacySpan.enter, beatUnit, tempo),
            exitBeats: msToBeats(legacySpan.exit, beatUnit, tempo)
          };
          
          // Keep legacy data
          lifeSpan[`lifeSpan${j}Legacy`] = {
            enter: legacySpan.enter,
            exit: legacySpan.exit
          };
        }
      }
      
      migrationCount++;
      console.log(`✅ Migrated Voice ${i + 1}: ${lifeSpan.maxTimeBeats} beats`);
    }
  }
  
  if (migrationCount > 0) {
    console.log(`✅ Migrated ${migrationCount} voices from legacy format`);
  } else {
    console.log(`✅ No legacy data found (already using beat-based storage)`);
  }
}

// Add anywhere in scripts.js (around line ~5500)
function debugLifeSpanData(voiceIndex, context) {
  console.log(`\n🔍 LIFE SPAN DEBUG [${context}] - Voice ${voiceIndex + 1}:`);
  console.log('================================');
  
  const lifeSpan = voiceData[voiceIndex].parameters['LIFE SPAN'];
  
  if (!lifeSpan) {
    console.error('❌ LIFE SPAN parameter missing!');
    return;
  }
  
  console.log(`Max: ${lifeSpan.maxTimeBeats || 'MISSING'} beats`);
  console.log(`Beat Unit: ${lifeSpan.beatUnit} (${rhythmOptions[lifeSpan.beatUnit]})`);
  console.log(`Repeat: ${lifeSpan.repeat}`);
  
  for (let i = 1; i <= 3; i++) {
    const span = lifeSpan[`lifeSpan${i}`];
    
    if (!span) {
      console.warn(`   Entrance ${i}: MISSING DATA`);
      continue;
    }
    
    console.log(`   Entrance ${i}:`);
    console.log(`      enterBeats: ${span.enterBeats} (type: ${typeof span.enterBeats})`);
    console.log(`      exitBeats: ${span.exitBeats} (type: ${typeof span.exitBeats})`);
    
    // Check legacy data
    const legacy = lifeSpan[`lifeSpan${i}Legacy`];
    if (legacy) {
      console.log(`      Legacy: enter=${legacy.enter}ms, exit=${legacy.exit}ms`);
    }
  }
  
  console.log('================================\n');
}

// ===== UPDATE GLOBAL VISUAL TIMELINE FUNCTIONS =====

// Updated showVisualTimeline function - FIXED
function showVisualTimeline() {
  console.log('🎬 Showing Interactive Timeline for Voice', currentVoice + 1);
  
  // Find or create timeline container
  let timelineContainer = document.getElementById('visual-timeline-container');
  
  if (!timelineContainer) {
    timelineContainer = document.createElement('div');
    timelineContainer.id = 'visual-timeline-container';
    
    const parameterSection = document.getElementById('parameter-section');
    
    if (parameterSection) {
      parameterSection.insertBefore(timelineContainer, parameterSection.firstChild);
      console.log('✅ Created interactive timeline container');
    } else {
      console.error('❌ Could not find parameter section');
      return;
    }
  }
  
  // Create or update timeline instance using VisualTimeline only
  if (!visualTimeline) {
    visualTimeline = new VisualTimeline(currentVoice);
  } else {
    visualTimeline.updateForVoice(currentVoice);
  }
  
  // Render timeline
  visualTimeline.render(timelineContainer);
  
  // Start updates if master clock is running
  if (masterClock && masterClock.isActive()) {
    visualTimeline.startUpdating();
  }
  
  console.log('✅ Interactive Timeline displayed with click-to-mute functionality');
}

// Update visual timeline for voice changes
function updateVisualTimelineForVoiceChange(newVoiceIndex) {
  if (visualTimeline && visualTimeline.isVisible) {
    if (visualTimeline instanceof InteractiveTimeline) {
      visualTimeline.updateForVoice(newVoiceIndex);
    } else {
      // Upgrade to interactive timeline
      const container = document.getElementById('visual-timeline-container');
      if (container) {
        visualTimeline.destroy();
        visualTimeline = new InteractiveTimeline(newVoiceIndex);
        visualTimeline.render(container);
      }
    }
  }
}

// ===== SAFE AUDIO MONITORING =====

function startAudioMonitoring() {
  console.log('🔊 Starting safe audio monitoring...');
  
  // Check all dependencies first
  console.log('Dependencies check:');
  console.log('  masterClock exists:', !!masterClock);
  console.log('  voiceClockManager exists:', !!voiceClockManager);
  console.log('  voiceClockManager initialized:', voiceClockManager ? voiceClockManager.isInitialized : 'N/A');
  console.log('  eventRegistry exists:', !!eventRegistry);
  console.log('  EventProcessor exists:', !!EventProcessor);
  
  if (!voiceClockManager || !voiceClockManager.isInitialized) {
    console.log('❌ VoiceClockManager not ready - try starting PLAY first, then run this function');
    return false;
  }
  
  // Monitor EventRegistry parameter changes (this is the key one)
  if (EventProcessor && EventProcessor.applyEventToVoice) {
    const originalApplyToVoice = EventProcessor.applyEventToVoice;
    EventProcessor.applyEventToVoice = function(event) {
      const elapsedMs = masterClock ? masterClock.getElapsedTime() : 0;
      const lifeSpan = voiceData[event.voiceIndex].parameters['LIFE SPAN'];
      const currentBeat = Math.round(msToBeats(elapsedMs, lifeSpan.beatUnit || 7, getCurrentTempoForVoice(event.voiceIndex)));
      
      console.log(`🎚️ PARAM EVENT: Voice ${event.voiceIndex + 1} at beat ${currentBeat} (${formatMsToMMSS(elapsedMs)})`);
      if (event.type === 'parameter') {
        console.log(`   📝 ${event.parameterName}: ${JSON.stringify(event.value)}`);
      } else if (event.type === 'compound-parameter') {
        const changes = Object.keys(event.changes || {});
        console.log(`   📝 Compound: ${changes.join(', ')}`);
      }
      
      return originalApplyToVoice.apply(this, arguments);
    };
    
    console.log('✅ EventProcessor monitoring active');
  }
  
  // Simple timing monitor
  let monitorInterval = setInterval(() => {
    if (masterClock && masterClock.isActive()) {
      const elapsedMs = masterClock.getElapsedTime();
      const currentBeat = Math.round(msToBeats(elapsedMs, 7, 120)); // Approximate
      
      if (currentBeat % 4 === 0) { // Every 4th beat
        console.log(`⏰ PLAYBACK: Beat ${currentBeat} at ${formatMsToMMSS(elapsedMs)}`);
      }
    } else {
      // Stop monitoring when playback stops
      clearInterval(monitorInterval);
      console.log('⏹️ Audio monitoring stopped (playback ended)');
    }
  }, 250);
  
  console.log('✅ Safe audio monitoring started - start PLAY to see event timing');
  return true;
}

// Run it
// startAudioMonitoring();

// ===== END COMPREHENSIVE AUDIO MONITORING =====

