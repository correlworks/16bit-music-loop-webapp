/**
 * Main Application Entry Point
 * Initializes the application and coordinates between modules
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the sequencer grid
    initializeSequencerGrid();
    
    // Initialize beat indicators
    initializeBeatIndicators();
    
    // Initialize the audio engine, sequencer, and UI controller
    initializeApplication();
    
    // Add mobile audio context initialization
    setupMobileAudio();
});

function initializeSequencerGrid() {
    const tracks = document.querySelectorAll('.track');
    
    tracks.forEach(track => {
        // Create 16 step cells for each track
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'step';
            cell.dataset.step = i;
            cell.dataset.active = 'false';
            cell.setAttribute('aria-label', `${track.dataset.track} step ${i + 1}`);
            cell.setAttribute('tabindex', '0');
            
            // Add click event listener
            cell.addEventListener('click', () => {
                const isActive = cell.dataset.active === 'true';
                cell.dataset.active = !isActive;
                cell.classList.toggle('active', !isActive);
                
                // Update sequencer pattern
                const trackId = track.dataset.track;
                sequencer.toggleStep(trackId, i);
            });
            
            track.appendChild(cell);
        }
    });
    
    console.log('Sequencer grid initialized');
}

function initializeBeatIndicators() {
    const beatIndicators = document.getElementById('beat-indicators');
    
    // Create 16 beat number indicators
    for (let i = 0; i < 16; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'beat-indicator';
        indicator.textContent = i + 1;
        beatIndicators.appendChild(indicator);
    }
    
    console.log('Beat indicators initialized');
}

function initializeApplication() {
    // Initialize the UI controller
    uiController.init();
    
    // Initialize the waveform viewer
    waveformViewer.init();
    
    // Set up audio context on first user interaction
    setupAudioContextInitialization();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Set up waveform visualization
    setupWaveformVisualization();
    
    console.log('Application initialized');
}

function setupAudioContextInitialization() {
    // Web Audio API requires user interaction to start audio context
    const userInteractionEvents = ['mousedown', 'keydown', 'touchstart'];
    
    const initAudioOnUserInteraction = () => {
        // Initialize audio engine
        audioEngine.init();
        
        // Connect waveform viewer to audio engine's analyser
        if (audioEngine.getAnalyser()) {
            waveformViewer.connectAnalyser(audioEngine.getAnalyser());
        }
        
        // Remove event listeners once initialized
        userInteractionEvents.forEach(event => {
            document.removeEventListener(event, initAudioOnUserInteraction);
        });
        
        console.log('Audio context initialized after user interaction');
    };
    
    // Add event listeners for user interaction
    userInteractionEvents.forEach(event => {
        document.addEventListener(event, initAudioOnUserInteraction, { once: true });
    });
}

function setupWaveformVisualization() {
    // Start/stop waveform animation based on sequencer state
    document.getElementById('play-pause').addEventListener('click', function() {
        const isPlaying = this.classList.contains('playing');
        
        if (isPlaying) {
            waveformViewer.startAnimation(audioEngine.getAnalyser());
        } else {
            waveformViewer.stopAnimation();
        }
    });
    
    document.getElementById('stop').addEventListener('click', function() {
        waveformViewer.stopAnimation();
    });
    
    console.log('Waveform visualization setup complete');
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Prevent default actions for our keyboard shortcuts
        if ((e.key === ' ' && !e.target.classList.contains('step')) || 
            e.key === 'Escape') {
            e.preventDefault();
        }
        
        // Space bar toggles play/pause (when not focused on a step)
        if (e.key === ' ' && !e.target.classList.contains('step')) {
            const playPauseButton = document.getElementById('play-pause');
            playPauseButton.click();
        }
        
        // Escape key stops playback
        if (e.key === 'Escape') {
            const stopButton = document.getElementById('stop');
            stopButton.click();
        }
    });
    
    console.log('Keyboard shortcuts set up');
}

// Create a demo pattern when the page loads
function createDemoPattern() {
    // Wait a moment to ensure everything is initialized
    setTimeout(() => {
        // Create a basic pattern to demonstrate functionality
        const demoPattern = [
            { id: 'kick', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
            { id: 'snare', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
            { id: 'hihat', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] }
        ];
        
        sequencer.loadPattern(demoPattern);
        console.log('Demo pattern loaded');
    }, 500);
}

// Call this function to load a demo pattern
// Uncomment the line below if you want to start with a demo pattern
createDemoPattern();

// Add mobile audio context initialization
function setupMobileAudio() {
    // Create a single button for audio initialization
    const audioInitButton = document.createElement('button');
    audioInitButton.id = 'audio-init-button';
    audioInitButton.textContent = 'Enable Audio';
    audioInitButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        background-color: var(--accent-color);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        display: none;
    `;
    
    document.body.appendChild(audioInitButton);
    
    // Check if we need to show the initialization button
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        audioInitButton.style.display = 'block';
        
        audioInitButton.addEventListener('click', function() {
            // Initialize audio context
            if (audioEngine && !audioEngine.isInitialized) {
                audioEngine.init();
            }
            
            // Hide the button
            this.style.display = 'none';
            
            // Resume audio context if it was suspended
            if (audioEngine.audioContext && audioEngine.audioContext.state === 'suspended') {
                audioEngine.audioContext.resume();
            }
        });
    }
}