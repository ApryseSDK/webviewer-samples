// ChatbotSpinner - A spinner implementation for the chatbot panel
export class ChatbotSpinner {
  constructor() {
    this.spinnerElement = null;
    this.overlayElement = null;
    this.targetElement = null;
  }


  // Start the spinner on the specified element
  spin(target) {
    if (!target) {
      console.error('ChatbotSpinner: No target element provided');
      return;
    }

    // If already spinning, stop first
    if (this.spinnerElement) {
      this.stop();
    }

    this.targetElement = target;

    // Create overlay to freeze the panel
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'chatbot-spinner-overlay';

    // Create spinner container (continuous circle)
    this.spinnerElement = document.createElement('div');
    this.spinnerElement.className = 'chatbot-spinner';

    // Add spinner and overlay to target
    this.overlayElement.appendChild(this.spinnerElement);
    target.appendChild(this.overlayElement);
  }

  // Stop and remove the spinner
  stop() {
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }

    this.spinnerElement = null;
    this.overlayElement = null;
    this.targetElement = null;
  }

  // Check if spinner is currently active
  isSpinning() {
    return this.spinnerElement !== null;
  }
}

export default ChatbotSpinner;