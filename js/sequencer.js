/**
 * Sequencer Module
 * Manages the sequencer state, pattern data, and playback logic
 */

class Sequencer {
    constructor() {
        this.tracks = [
            { id: 'kick', name: 'Kick', steps: Array(16).fill(false) },
            { id: 'snare', name: 'Snare', steps: Array(16).fill(false) },
            { id: 'hihat', name: 'Hi-hat', steps: Array(16).fill(false) },
            { id: 'percussion', name: 'Percussion', steps: Array(16).fill(false) },
            { id: 'bass', name: 'Bass', steps: Array(16).fill(false) },
            { id: 'lead', name: 'Lead', steps: Array(16).fill(false) },
            { id: 'chord', name: 'Chord/Pad', steps: Array(16).fill(false) },
            { id: 'effect', name: 'Effect', steps: Array(16).fill(false) }
        ];
        
        this.currentStep = -1;
        this.isPlaying = false;
        this.stepInterval = null;
        this.lookahead = 25.0; // milliseconds
        this.scheduleAheadTime = 0.1; // seconds
        this.nextNoteTime = 0.0; // when the next note is due
        this.timerID = null; // setInterval identifier
    }
    
    // Toggle a step in a track
    toggleStep(trackId, stepIndex) {
        const track = this.tracks.find(t => t.id === trackId);
        if (track) {
            track.steps[stepIndex] = !track.steps[stepIndex];
            return track.steps[stepIndex];
        }
        return false;
    }
    
    // Schedule notes from the current step
    scheduleNote(stepIndex, time) {
        // For each track, check if the current step is active
        this.tracks.forEach(track => {
            if (track.steps[stepIndex]) {
                // Play the sound for this track at the scheduled time
                audioEngine.playSound(track.id, time);
            }
        });
        
        // Update UI to show current step
        if (this.isPlaying) {
            // Use setTimeout to update UI at the right time
            const currentTime = audioEngine.audioContext.currentTime;
            const timeUntilNote = (time - currentTime) * 1000;
            setTimeout(() => {
                this.currentStep = stepIndex;
                this.updateStepIndicators();
            }, timeUntilNote);
        }
    }
    
    // Advance to the next step and schedule notes
    nextStep() {
        // Calculate time for next note based on current tempo
        const secondsPerBeat = 60.0 / audioEngine.tempo;
        // Assuming 16th notes (4 steps per beat)
        this.nextNoteTime += 0.25 * secondsPerBeat;
        
        // Advance current step
        this.currentStep = (this.currentStep + 1) % 16;
        
        // Schedule the notes for this step
        this.scheduleNote(this.currentStep, this.nextNoteTime);
    }
    
    // The main scheduler function - runs every lookahead milliseconds
    scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (this.nextNoteTime < audioEngine.audioContext.currentTime + this.scheduleAheadTime) {
            this.nextStep();
        }
        
        // Set up the next scheduler call
        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }
    
    // Start the sequencer playback
    start() {
        if (this.isPlaying) return;
        
        if (!audioEngine.isInitialized) {
            audioEngine.init();
        }
        
        this.isPlaying = true;
        this.currentStep = -1; // Start before the first step
        this.nextNoteTime = audioEngine.audioContext.currentTime;
        
        // Start the scheduler
        this.scheduler();
        
        console.log('Sequencer started');
    }
    
    // Pause the sequencer
    pause() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
        console.log('Sequencer paused');
    }
    
    // Stop the sequencer and reset position
    stop() {
        this.pause();
        this.currentStep = -1;
        // Reset UI highlighting
        this.updateStepIndicators();
        console.log('Sequencer stopped');
    }
    
    // Update the visual indicators for the current step
    updateStepIndicators() {
        // This will be implemented in the UI controller
        // We'll just notify the UI controller to update
        if (typeof uiController !== 'undefined') {
            uiController.updateStepIndicators(this.currentStep);
        }
        console.log(`Current step: ${this.currentStep}`);
    }
    
    // Get the current pattern data
    getPatternData() {
        return this.tracks.map(track => ({
            id: track.id,
            steps: [...track.steps]
        }));
    }
    
    // Load a pattern
    loadPattern(patternData) {
        if (!patternData || !Array.isArray(patternData)) return;
        
        patternData.forEach(trackData => {
            const track = this.tracks.find(t => t.id === trackData.id);
            if (track && Array.isArray(trackData.steps)) {
                track.steps = [...trackData.steps];
            }
        });
        
        // Update UI to reflect the loaded pattern
        if (typeof uiController !== 'undefined') {
            uiController.updatePatternUI(this.getPatternData());
        }
        
        console.log('Pattern loaded');
    }
    
    // Clear the current pattern
    clearPattern() {
        this.tracks.forEach(track => {
            track.steps.fill(false);
        });
        
        // Update UI to reflect the cleared pattern
        if (typeof uiController !== 'undefined') {
            uiController.updatePatternUI(this.getPatternData());
        }
        
        console.log('Pattern cleared');
    }
}

// Create and export a singleton instance
const sequencer = new Sequencer();