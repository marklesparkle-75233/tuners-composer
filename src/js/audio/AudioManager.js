class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentUserVolume = 75;
    this.currentUserBalance = 0;
    this.previewGainNodes = new Set();
    this.previewPanNodes = new Set();
    this.previewEffectGainNodes = new Set();
    // Performance monitor instances
    this.performanceMonitor = null;
    this.audioHealthMonitor = null;
    this.memoryMonitor = null;
    this.oscillatorPool = null;
  }

async initialize() {
if (this.isInitialized) return true;

try {
  this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  if (this.audioContext.state === 'suspended') {
    await this.audioContext.resume();
  }
  
  this.masterGainNode = this.audioContext.createGain();
  this.masterGainNode.connect(this.audioContext.destination);
  this.masterGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
  
  // INITIALIZE PERFORMANCE MONITORING SYSTEMS
  
  this.performanceMonitor = new PerformanceMonitor();
  this.audioHealthMonitor = new AudioHealthMonitor(this.audioContext);
  this.memoryMonitor = new MemoryMonitor();
  this.oscillatorPool = new OscillatorPool(this.audioContext, 100);
  
  // Start monitoring loops
  this.startMonitoring();
  
  this.isInitialized = true;
        
  return true;
} catch (error) {
  console.error('❌ AudioManager initialization failed:', error);
  return false;
}
}
  
startMonitoring() {
  setInterval(() => {
    if (this.performanceMonitor) {
      this.performanceMonitor.update();
    }
  }, 33);
  
  // Audio health check only every 500ms and only during playback
  setInterval(() => {
    if (this.audioHealthMonitor && this.isPlaying) {
      this.audioHealthMonitor.checkHealth();
    }
  }, 500);
  
  // Memory sampling every 10 seconds
  setInterval(() => {
    if (this.memoryMonitor) {
      this.memoryMonitor.sample();
    }
  }, 10000);
  
  // Pool stats every 15 seconds
  setInterval(() => {
    if (this.oscillatorPool && this.isPlaying) {
      const poolStats = this.oscillatorPool.getStats();
    }
  }, 15000);
  
}

setVolumeRealTime(volume) {
    this.currentUserVolume = volume; // Store for new notes
    const gainValue = Math.max(0, Math.min(1, volume / 100));
    
    // Update test oscillator gain node (simple preview)
    if (this.testGainNode) {
        this.testGainNode.gain.setValueAtTime(
            gainValue, 
            this.audioContext.currentTime
        );
    }
    
    // FIXED: Use master gain node to control overall volume without interfering with ADSR
    if (this.masterGainNode && this.isPlaying) {
        // Store original master gain if not already stored
        if (this.originalMasterGain === undefined) {
            this.originalMasterGain = this.masterGainNode.gain.value;
        }
        
        // Apply user volume to master gain node
        const masterGainValue = this.originalMasterGain * gainValue;
        this.masterGainNode.gain.setValueAtTime(
            masterGainValue, 
            this.audioContext.currentTime
        );
        
    }
}

setBalanceRealTime(balance) {
    this.currentUserBalance = balance; // Store for new notes
    const panValue = Math.max(-1, Math.min(1, balance / 100));
    
    // Update test oscillator pan node (simple preview)
    if (!this.stereoPannerNode && this.testGainNode) {
        this.stereoPannerNode = this.audioContext.createStereoPanner();
        
        this.testGainNode.disconnect();
        this.testGainNode.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(this.masterGainNode);
    }
    
    if (this.stereoPannerNode) {
        this.stereoPannerNode.pan.setValueAtTime(
            panValue,
            this.audioContext.currentTime
        );
    }
    
    // FIXED: Update all active preview pan nodes (ADSR preview)
    this.previewPanNodes.forEach(panNode => {
        if (panNode && panNode.pan) {
            try {
                panNode.pan.setValueAtTime(
                    panValue,
                    this.audioContext.currentTime
                );
            } catch (e) {
                // Node might be disconnected, remove from set
                this.previewPanNodes.delete(panNode);
            }
        }
    });
}


cleanupPreviewNodes() {
    this.previewGainNodes.clear();
    this.previewPanNodes.clear();
    this.previewEffectGainNodes.clear();
}
}

// Global audio manager instance
let audioManager = null;