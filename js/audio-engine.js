/**
 * Audio Engine Module
 * Handles Web Audio API interactions, sound generation, and playback
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.tempo = 120;
        this.samples = {};
        this.analyser = null;
        this.sounds = {};
        this.masterGain = null;
        this.isPlaying = false;
        this.nextStepTime = 0;
        this.scheduleAheadTime = 0.1; // seconds ahead to schedule audio
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create analyser for waveform visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            // Connect analyser to destination
            this.analyser.connect(this.audioContext.destination);
            
            // Load samples
            await this.loadSamples();
            
            this.isInitialized = true;
            console.log('Audio engine initialized');
            
            // Resume audio context if it was suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Load default sounds
            this.loadDefaultSounds();
        } catch (error) {
            console.error('Error initializing audio engine:', error);
            throw error;
        }
    }
    
    // Get the analyser node for waveform visualization
    getAnalyser() {
        return this.analyser;
    }
    
    // Load default 16-bit style sounds
    loadDefaultSounds() {
        // Create synthesized sounds for each instrument
        this.createKickSound();
        this.createSnareSound();
        this.createHihatSound();
        this.createPercussionSound();
        this.createBassSound();
        this.createLeadSound();
        this.createChordSound();
        this.createEffectSound();
        
        console.log('Default sounds loaded');
    }
    
    // Create a kick drum sound
    createKickSound() {
        this.sounds.kick = (time) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.frequency.setValueAtTime(150, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            gainNode.gain.setValueAtTime(1, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.3);
        };
    }
    
    // Create a snare drum sound
    createSnareSound() {
        this.sounds.snare = (time) => {
            // Noise component
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(1, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            // Tone component
            const osc = this.audioContext.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, time);
            
            const oscGain = this.audioContext.createGain();
            oscGain.gain.setValueAtTime(0.7, time);
            oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            // Connect everything
            noise.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            osc.connect(oscGain);
            oscGain.connect(this.masterGain);
            
            noise.start(time);
            osc.start(time);
            osc.stop(time + 0.2);
        };
    }
    
    // Create a hi-hat sound
    createHihatSound() {
        this.sounds.hihat = (time) => {
            const bufferSize = this.audioContext.sampleRate * 0.1;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 8000;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.8, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            noise.start(time);
        };
    }
    
    // Create a percussion sound
    createPercussionSound() {
        this.sounds.percussion = (time) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, time);
            osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);
            
            gainNode.gain.setValueAtTime(0.7, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.2);
        };
    }
    
    // Create a bass sound
    createBassSound() {
        this.sounds.bass = (time) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, time);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, time);
            filter.frequency.exponentialRampToValueAtTime(500, time + 0.2);
            
            gainNode.gain.setValueAtTime(0.9, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.4);
        };
    }
    
    // Create a lead sound
    createLeadSound() {
        this.sounds.lead = (time) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, time);
            
            gainNode.gain.setValueAtTime(0.5, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.3);
        };
    }
    
    // Create a chord/pad sound
    createChordSound() {
        this.sounds.chord = (time) => {
            const frequencies = [261.63, 329.63, 392.00]; // C major chord
            const oscillators = [];
            
            for (const freq of frequencies) {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);
                
                gainNode.gain.setValueAtTime(0.2, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
                
                osc.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillators.push(osc);
                
                osc.start(time);
                osc.stop(time + 0.5);
            }
        };
    }
    
    // Create an effect sound
    createEffectSound() {
        this.sounds.effect = (time) => {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, time);
            osc.frequency.exponentialRampToValueAtTime(300, time + 0.3);
            
            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.3);
        };
    }
    
    // Play a specific sound
    playSound(trackName, time = this.audioContext.currentTime) {
        if (!this.isInitialized) this.init();
        
        if (this.sounds[trackName]) {
            this.sounds[trackName](time);
            console.log(`Playing sound: ${trackName} at time ${time}`);
        } else {
            console.warn(`Sound not found: ${trackName}`);
        }
    }
    
    // Calculate time for the next step based on tempo
    getNextStepTime() {
        const secondsPerBeat = 60.0 / this.tempo;
        // Assuming 16th notes (4 steps per beat)
        return secondsPerBeat * 0.25;
    }
    
    // Start playback of the sequence
    startPlayback() {
        if (!this.isInitialized) this.init();
        this.isPlaying = true;
        this.nextStepTime = this.audioContext.currentTime;
        console.log('Playback started');
    }
    
    // Pause playback
    pausePlayback() {
        this.isPlaying = false;
        console.log('Playback paused');
    }
    
    // Stop playback completely
    stopPlayback() {
        this.isPlaying = false;
        console.log('Playback stopped');
    }
    
    // Set the tempo in BPM
    setTempo(bpm) {
        this.tempo = bpm;
        console.log(`Tempo set to ${bpm} BPM`);
    }
}

// Create and export a singleton instance
const audioEngine = new AudioEngine();