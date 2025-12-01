/**
 * SpinningWheel - A reusable loading spinner overlay component
 * 
 * Creates a transparent overlay with a spinning wheel on top of any div element
 * to prevent user interaction while processing is happening.
 */
class SpinningWheel {
  constructor() {
    this.overlay = null;
    this.targetDiv = null;
    this.isActive = false;
  }

  /**
   * Start the spinning wheel overlay on the specified div
   * @param {HTMLElement} targetDiv - The div element to overlay the spinner on
   */
  start(targetDiv) {
    if (!targetDiv || this.isActive) {
      return;
    }

    this.targetDiv = targetDiv;
    this.isActive = true;

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'spinning-wheel-overlay';

    // Set overlay styles
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    this.overlay.style.display = 'flex';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.zIndex = '9999';
    this.overlay.style.cursor = 'wait';

    // Create spinning wheel container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    spinnerContainer.style.position = 'relative';

    // Create the spinning wheel
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    // Spinner styles
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid #f3f3f3';
    spinner.style.borderTop = '5px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.innerText = 'Processing...';
    loadingText.style.color = '#ffffff';
    loadingText.style.marginTop = '15px';
    loadingText.style.fontSize = '14px';
    loadingText.style.textAlign = 'center';
    loadingText.style.fontWeight = 'bold';
    loadingText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';

    // Add CSS keyframes for spinning animation if not already added
    if (!document.getElementById('spinner-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spinner-keyframes';
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Assemble the components
    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(loadingText);
    this.overlay.appendChild(spinnerContainer);

    // Ensure target div has relative positioning for overlay
    const originalPosition = targetDiv.style.position;
    if (!originalPosition || originalPosition === 'static') {
      targetDiv.style.position = 'relative';
    }

    // Add overlay to target div
    targetDiv.appendChild(this.overlay);

    // Prevent scrolling and interaction
    this.overlay.addEventListener('wheel', this.preventDefault);
    this.overlay.addEventListener('touchmove', this.preventDefault);
    this.overlay.addEventListener('click', this.preventDefault);
    this.overlay.addEventListener('mousedown', this.preventDefault);
  }

  /**
   * Stop the spinning wheel and remove the overlay
   */
  stop() {
    if (!this.isActive || !this.overlay) {
      return;
    }

    // Remove event listeners
    this.overlay.removeEventListener('wheel', this.preventDefault);
    this.overlay.removeEventListener('touchmove', this.preventDefault);
    this.overlay.removeEventListener('click', this.preventDefault);
    this.overlay.removeEventListener('mousedown', this.preventDefault);

    // Remove overlay from DOM
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    // Clean up
    this.overlay = null;
    this.targetDiv = null;
    this.isActive = false;
  }

  /**
   * Prevent default event behavior
   * @param {Event} event - The event to prevent
   */
  preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }

  /**
   * Check if the spinning wheel is currently active
   * @returns {boolean} True if the spinner is active
   */
  isSpinning() {
    return this.isActive;
  }

  /**
   * Update the loading text while spinning
   * @param {string} text - New text to display
   */
  updateText(text) {
    if (this.isActive && this.overlay) {
      const loadingText = this.overlay.querySelector('.loading-text');
      if (loadingText) {
        loadingText.innerText = text;
      }
    }
  }
}

// Make available globally for non-module usage (like functionMap.js)
if (typeof window !== 'undefined') {
  window.SpinningWheel = SpinningWheel;
}

// Also export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpinningWheel;
}