/**
 * Test script for waveform visualization
 * This script tests the waveform visualization functionality
 */

// Function to test the waveform visualization
function testWaveformVisualization() {
    console.log('Testing waveform visualization...');
    
    // Check if audio engine is initialized
    if (!audioEngine.isInitialized) {
        console.log('Audio engine not initialized. Initializing...');
        audioEngine.init();
    }
    
    // Check if analyser node exists
    const analyser = audioEngine.getAnalyser();
    if (!analyser) {
        console.error('Analyser node not found in audio engine');
        return false;
    }
    console.log('Analyser node found in audio engine');
    
    // Check if waveform viewer is initialized
    if (!waveformViewer.isInitialized) {
        console.log('Waveform viewer not initialized. Initializing...');
        waveformViewer.init();
    }
    
    // Connect waveform viewer to analyser
    waveformViewer.connectAnalyser(analyser);
    console.log('Waveform viewer connected to analyser');
    
    // Start animation
    waveformViewer.startAnimation();
    console.log('Waveform animation started');
    
    // Play a test sound
    console.log('Playing test sounds...');
    audioEngine.playSound('kick');
    
    setTimeout(() => {
        audioEngine.playSound('snare');
    }, 200);
    
    setTimeout(() => {
        audioEngine.playSound('hihat');
    }, 400);
    
    // Test complete
    console.log('Waveform visualization test complete');
    return true;
}

// Run the test when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a test button to the page
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Waveform';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '1000';
    testButton.addEventListener('click', testWaveformVisualization);
    document.body.appendChild(testButton);
    
    console.log('Test button added to page');
});