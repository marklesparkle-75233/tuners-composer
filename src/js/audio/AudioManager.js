/**
 * AudioManager - Core Audio Implementation
 */
// class AudioManager {
//     constructor() {
//         this.audioContext = null;
//         this.masterGainNode = null;
//         this.isInitialized = false;
//         this.testOscillator = null;
//         this.testGainNode = null;
//         this.stereoPannerNode = null;
//         this.isPlaying = false;
//     }

/**
 * AudioManager - Core Audio Implementation
 */
// class AudioManager {
//     constructor() {
//         this.audioContext = null;
//         this.masterGainNode = null;
//         this.isInitialized = false;
//         this.testOscillator = null;
//         this.testGainNode = null;
//         this.stereoPannerNode = null;
//         this.isPlaying = false;
        
//         // FIXED: Track preview audio nodes for real-time control
//         this.previewGainNodes = new Set(); // Track all active preview gain nodes
//         this.previewPanNodes = new Set();  // Track all active preview pan nodes
//         this.previewEffectGainNodes = new Set(); // Track effect-specific gain nodes (tremolo, chorus, etc.)
//         this.currentUserVolume = 50;       // Store current user volume (0-100)
//         this.currentUserBalance = 0;       // Store current user balance (-100 to +100)
//         this.previousUserVolume = 0.5;     // Track previous volume for ADSR coordination
//     }
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
    
    // Performance monitoring instances - will be initialized in initialize()
    this.performanceMonitor = null;
    this.audioHealthMonitor = null;
    this.memoryMonitor = null;
    this.oscillatorPool = null;
  }

    /**
     * Initialize Web Audio API context
     * Must be called after user interaction due to browser autoplay policies
    //  */
    // async initialize() {
    //     try {
    //         this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
    //         if (this.audioContext.state === 'suspended') {
    //             await this.audioContext.resume();
    //         }
            
    //         this.masterGainNode = this.audioContext.createGain();
    //         this.masterGainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    //         this.masterGainNode.connect(this.audioContext.destination);
            
    //         this.isInitialized = true;
            
    //     } catch (error) {
    //         this.isInitialized = false;
    //     }
    // }
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
      console.log('🚀 Initializing performance monitoring systems...');
      
      this.performanceMonitor = new PerformanceMonitor();
      this.audioHealthMonitor = new AudioHealthMonitor(this.audioContext);
      this.memoryMonitor = new MemoryMonitor();
      this.oscillatorPool = new OscillatorPool(this.audioContext, 100);
      
      // Start monitoring loops
      this.startMonitoring();
      
      this.isInitialized = true;
      
      console.log('✅ AudioManager initialized with performance monitoring');
      console.log('📊 Performance systems:', {
        performanceMonitor: !!this.performanceMonitor,
        audioHealthMonitor: !!this.audioHealthMonitor,
        memoryMonitor: !!this.memoryMonitor,
        oscillatorPool: !!this.oscillatorPool
      });
      
      return true;
    } catch (error) {
      console.error('❌ AudioManager initialization failed:', error);
      return false;
    }
  }
  
  // REPLACE the startMonitoring method in AudioManager with this:

startMonitoring() {
  // Performance monitoring every 33ms (30fps) - less aggressive
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
  
  // Memory sampling every 10 seconds (less frequent)
  setInterval(() => {
    if (this.memoryMonitor) {
      this.memoryMonitor.sample();
    }
  }, 10000);
  
  // Pool stats every 15 seconds
  setInterval(() => {
    if (this.oscillatorPool && this.isPlaying) {
      const poolStats = this.oscillatorPool.getStats();
      console.log(`🎛️ Pool: ${poolStats.active} active, ${poolStats.available} available, ${poolStats.hitRate}% hit rate`);
    }
  }, 15000);
  
  console.log('📊 Optimized monitoring loops started');
}


    /**
     * Create a simple test oscillator
     */
    createTestOscillator() {
        if (!this.isInitialized) return;

        this.stopTestOscillator();

        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        this.testOscillator.type = 'sine';
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.masterGainNode);

        this.testOscillator.start();
        this.isPlaying = true;
    }



/**
 * Stop the test oscillator
 * FIXED: Also cleanup preview nodes
 */
stopTestOscillator() {
    if (this.testOscillator) {
        try {
            this.testOscillator.stop();
        } catch (e) {
            // Oscillator already stopped
        }
        this.testOscillator.disconnect();
        this.testOscillator = null;
    }
    if (this.testGainNode) {
        this.testGainNode.disconnect();
        this.testGainNode = null;
    }
    if (this.stereoPannerNode) {
        this.stereoPannerNode.disconnect();
        this.stereoPannerNode = null;
    }
    
    // FIXED: Cleanup preview nodes when stopping
    this.cleanupPreviewNodes();
    
    this.isPlaying = false;

    // Reset master gain to original value
    if (this.originalMasterGain !== undefined) {
        this.masterGainNode.gain.setValueAtTime(this.originalMasterGain, this.audioContext.currentTime);
        this.originalMasterGain = undefined;
    }

}


    /**
     * Set the volume of the test oscillator (0-100 range from UI)
     */
    setTestVolume(volume) {
        if (!this.testGainNode) return;
        
        const gainValue = Math.max(0, Math.min(1, volume / 100));
        
        this.testGainNode.gain.setTargetAtTime(
            gainValue, 
            this.audioContext.currentTime, 
            0.1
        );
    }

    /**
     * Create a test oscillator with specific waveform type
     * @param {string} oscillatorType - 'sine', 'sawtooth', 'square', 'triangle'
     */
    createTestOscillatorWithType(oscillatorType = 'sine') {
        if (!this.isInitialized) return;

        this.stopTestOscillator();

        this.testOscillator = this.audioContext.createOscillator();
        this.testGainNode = this.audioContext.createGain();

        this.testOscillator.type = oscillatorType;
        this.testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

        this.testGainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

        this.stereoPannerNode = this.audioContext.createStereoPanner();
        this.stereoPannerNode.pan.setValueAtTime(0, this.audioContext.currentTime);

        this.testOscillator.connect(this.testGainNode);
        this.testGainNode.connect(this.stereoPannerNode);
        this.stereoPannerNode.connect(this.masterGainNode);

        this.testOscillator.start();
        this.isPlaying = true;
    }

    /**
    //  * Update volume in real-time during playback
    //  * @param {number} volume - Volume level 0-100 from UI
    //  */
    // setVolumeRealTime(volume) {
    //     if (!this.testGainNode) return;
        
    //     const gainValue = Math.max(0, Math.min(1, volume / 100));
        
    //     this.testGainNode.gain.setValueAtTime(
    //         gainValue, 
    //         this.audioContext.currentTime
    //     );
    // }
    /**
 * Update volume in real-time during playback
 * FIXED: Controls both test oscillator AND preview ADSR nodes
 * @param {number} volume - Volume level 0-100 from UI
//  */
// setVolumeRealTime(volume) {
//     this.currentUserVolume = volume; // Store for new notes
//     const gainValue = Math.max(0, Math.min(1, volume / 100));
    
//     // Update test oscillator gain node (simple preview)
//     if (this.testGainNode) {
//         this.testGainNode.gain.setValueAtTime(
//             gainValue, 
//             this.audioContext.currentTime
//         );
//     }
    
//     // FIXED: Update all active preview gain nodes (ADSR preview)
//     this.previewGainNodes.forEach(gainNode => {
//         if (gainNode && gainNode.gain) {
//             try {
//                 // Apply user volume directly - let ADSR handle its own automation
//                 gainNode.gain.setValueAtTime(
//                     gainValue, 
//                     this.audioContext.currentTime
//                 );
//             } catch (e) {
//                 // Node might be disconnected, remove from set
//                 this.previewGainNodes.delete(gainNode);
//             }
//         }
//     });
    
//     // FIXED: Update effect gain nodes (tremolo, chorus gain nodes)
//     this.previewEffectGainNodes.forEach(effectGainNode => {
//         if (effectGainNode && effectGainNode.gain) {
//             try {
//                 // Apply volume scaling to effect gain nodes
//                 const currentGainValue = effectGainNode.gain.value;
//                 const scaledGainValue = currentGainValue * gainValue;
//                 effectGainNode.gain.setValueAtTime(
//                     scaledGainValue, 
//                     this.audioContext.currentTime
//                 );
//             } catch (e) {
//                 // Node might be disconnected, remove from set
//                 this.previewEffectGainNodes.delete(effectGainNode);
//             }
//         }
//     });
    
//     this.previousUserVolume = gainValue; // Track for next update
// }


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
        
        console.log(`🔊 Volume: ${volume}% (Master Gain: ${masterGainValue.toFixed(3)})`);
    }
}


    /**
     * Set stereo balance in real-time
     * FIXED: Controls both test oscillator AND preview ADSR pan nodes
     * @param {number} balance - Balance -100 to +100 from UI
     */
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

        /**
     * Set tremolo effect in real-time (speed and depth)
     * @param {number} speed - LFO frequency in Hz
     * @param {number} depth - Modulation depth 0-1
     */
    
    cleanupPreviewNodes() {
        this.previewGainNodes.clear();
        this.previewPanNodes.clear();
        this.previewEffectGainNodes.clear();
    }
}

// Global audio manager instance
let audioManager = null;