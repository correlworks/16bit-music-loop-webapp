/**
 * Waveform Viewer Module
 * Handles the visualization of audio waveforms
 */

class WaveformViewer {
    constructor() {
        this.canvas = document.getElementById('waveform-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isInitialized = false;
        this.animationFrame = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = 0;
        
        // Visualization settings
        this.colors = {
            // Red background with blue waveform as requested
            background: '#ff0000',
            waveform: '#0000ff',
            grid: '#333333',
            glow: 'rgba(0, 0, 255, 0.4)'
        };
    }
    
    // Initialize the waveform viewer
    init() {
        if (this.isInitialized) return;
        
        // Set canvas dimensions to match its display size
        this.resizeCanvas();
        
        // Listen for window resize events
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.isInitialized = true;
        console.log('Waveform viewer initialized');
    }
    
    // Connect to the audio analyser
    connectAnalyser(analyser) {
        if (!analyser) {
            console.error('No analyser provided to waveform viewer');
            return;
        }
        
        this.analyser = analyser;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        
        console.log(`Waveform viewer connected to analyser with buffer length: ${this.bufferLength}`);
    }
    
    // Resize canvas to match its display size
    resizeCanvas() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        // Check if canvas is already at the right size
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.draw(); // Redraw after resize
        }
    }
    
    // Draw the waveform
    draw() {
        if (!this.ctx) return;
        
        // Clear the canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.drawGrid();
        
        // If no audio data or analyser, draw a placeholder
        if (!this.analyser || !this.dataArray) {
            this.drawPlaceholder();
            return;
        }
        
        // Get the current audio data
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Draw the waveform
        this.drawWaveform();
    }
    
    // Draw grid lines
    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        // Draw horizontal grid lines
        for (let y = 0; y < height; y += height / 8) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Draw vertical grid lines
        for (let x = 0; x < width; x += width / 16) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Draw center line with higher opacity
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
    }
    
    // Draw the actual waveform
    drawWaveform() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerY = height / 2;
        const sliceWidth = width / this.bufferLength;
        
        // Create glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors.glow;
        
        // Draw the waveform path
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.colors.waveform;
        this.ctx.lineWidth = 2;
        
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            // Convert the data value to a y-coordinate
            // dataArray values are 0-255, we need to normalize to -1.0 to 1.0
            const v = (this.dataArray[i] / 128.0) - 1.0;
            const y = centerY + (v * centerY * 0.9); // Scale to 90% of half-height
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Reset shadow for other drawings
        this.ctx.shadowBlur = 0;
    }
    
    // Draw a placeholder waveform
    drawPlaceholder() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerY = height / 2;
        
        // Draw a simple sine wave as placeholder
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        
        // Create glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.colors.glow;
        
        for (let x = 0; x < width; x++) {
            // Create a more interesting placeholder with multiple sine waves
            const y = centerY + 
                     Math.sin(x * 0.02) * (height * 0.2) + 
                     Math.sin(x * 0.04) * (height * 0.05);
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.strokeStyle = this.colors.waveform;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Add a "No Audio" text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No Audio Signal', width / 2, height / 2 + 40);
    }
    
    // Start the animation loop
    startAnimation(analyser) {
        if (analyser && !this.analyser) {
            this.connectAnalyser(analyser);
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        const animate = () => {
            this.draw();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('Waveform animation started');
    }
    
    // Stop the animation loop
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Draw the placeholder when stopped
        this.draw();
        
        console.log('Waveform animation stopped');
    }
}

// Create and export a singleton instance
const waveformViewer = new WaveformViewer();

// Initialize the waveform viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    waveformViewer.init();
});