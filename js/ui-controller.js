/**
 * UI Controller Module
 * Handles user interactions and updates the UI
 */

class UIController {
    constructor() {
        this.initialized = false;
        this.playPauseButton = document.getElementById('play-pause');
        this.stopButton = document.getElementById('stop');
        this.tempoSlider = document.getElementById('tempo');
        this.sequencerGrid = document.getElementById('sequencer-grid');
    }
    
    // Initialize the UI controller
    init() {
        if (this.initialized) return;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize the grid with the current pattern
        this.updatePatternUI(sequencer.getPatternData());
        
        this.initialized = true;
        console.log('UI controller initialized');
    }
    
    // Set up event listeners for UI elements
    setupEventListeners() {
        // Play/Pause button
        this.playPauseButton.addEventListener('click', () => {
            const isPlaying = this.playPauseButton.classList.contains('playing');
            
            if (isPlaying) {
                this.pauseSequencer();
            } else {
                this.playSequencer();
            }
        });
        
        // Stop button
        this.stopButton.addEventListener('click', () => {
            this.stopSequencer();
        });
        
        // Tempo slider
        this.tempoSlider.addEventListener('input', (e) => {
            const tempo = parseInt(e.target.value, 10);
            this.updateTempo(tempo);
        });
        
        // Step toggle events
        const tracks = document.querySelectorAll('.track');
        tracks.forEach(track => {
            const trackId = track.dataset.track;
            const steps = track.querySelectorAll('.step');
            
            steps.forEach((step, index) => {
                step.addEventListener('click', () => {
                    const isActive = sequencer.toggleStep(trackId, index);
                    step.dataset.active = isActive;
                    step.classList.toggle('active', isActive);
                    console.log(`Toggled step ${index} for track ${trackId}: ${isActive}`);
                });
                
                // Keyboard accessibility
                step.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        step.click();
                    }
                });
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space bar to play/pause
            if (e.key === ' ' && !e.target.classList.contains('step')) {
                e.preventDefault();
                this.playPauseButton.click();
            }
            
            // Escape key to stop
            if (e.key === 'Escape') {
                e.preventDefault();
                this.stopButton.click();
            }
        });
    }
    
    // Play the sequencer
    playSequencer() {
        this.playPauseButton.classList.add('playing');
        const playIcon = this.playPauseButton.querySelector('.play-icon');
        const pauseIcon = this.playPauseButton.querySelector('.pause-icon');
        
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        
        // Start the sequencer and audio engine
        sequencer.start();
        audioEngine.startPlayback();
        
        console.log('Playback started from UI');
    }
    
    // Pause the sequencer
    pauseSequencer() {
        this.playPauseButton.classList.remove('playing');
        const playIcon = this.playPauseButton.querySelector('.play-icon');
        const pauseIcon = this.playPauseButton.querySelector('.pause-icon');
        
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        
        // Pause the sequencer and audio engine
        sequencer.pause();
        audioEngine.pausePlayback();
        
        console.log('Playback paused from UI');
    }
    
    // Stop the sequencer
    stopSequencer() {
        this.playPauseButton.classList.remove('playing');
        const playIcon = this.playPauseButton.querySelector('.play-icon');
        const pauseIcon = this.playPauseButton.querySelector('.pause-icon');
        
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        
        // Stop the sequencer and audio engine
        sequencer.stop();
        audioEngine.stopPlayback();
        
        console.log('Playback stopped from UI');
    }
    
    // Update the tempo
    updateTempo(tempo) {
        document.getElementById('tempo-value').textContent = tempo;
        audioEngine.setTempo(tempo);
        console.log(`Tempo updated to ${tempo} BPM from UI`);
    }
    
    // Update the step indicators to show the current step
    updateStepIndicators(currentStep) {
        // Remove 'current' class from all steps
        const allSteps = document.querySelectorAll('.step');
        allSteps.forEach(step => step.classList.remove('current'));
        
        // Add 'current' class to current steps
        if (currentStep >= 0) {
            const currentSteps = document.querySelectorAll(`.step[data-step="${currentStep}"]`);
            currentSteps.forEach(step => step.classList.add('current'));
        }
    }
    
    // Update the UI to reflect the current pattern
    updatePatternUI(patternData) {
        if (!patternData || !Array.isArray(patternData)) return;
        
        patternData.forEach(trackData => {
            const trackElement = document.querySelector(`.track[data-track="${trackData.id}"]`);
            if (!trackElement) return;
            
            const steps = trackElement.querySelectorAll('.step');
            steps.forEach((step, index) => {
                const isActive = trackData.steps[index];
                step.dataset.active = isActive;
                step.classList.toggle('active', isActive);
            });
        });
        
        console.log('Pattern UI updated');
    }
    
    // Create a default pattern (for testing or as a starting point)
    createDefaultPattern() {
        // Simple four-on-the-floor pattern
        const defaultPattern = [
            { id: 'kick', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
            { id: 'snare', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
            { id: 'hihat', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
            { id: 'percussion', steps: Array(16).fill(false) },
            { id: 'bass', steps: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false] },
            { id: 'lead', steps: Array(16).fill(false) },
            { id: 'chord', steps: Array(16).fill(false) },
            { id: 'effect', steps: Array(16).fill(false) }
        ];
        
        sequencer.loadPattern(defaultPattern);
    }
}

// Create and export a singleton instance
const uiController = new UIController();

// Initialize the UI controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    uiController.init();
});