// Speech function using Web Speech API
export const speakText = (text) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean IPA notation - remove slashes and brackets
    let cleanText = text;
    if (typeof text === "string") {
      // Remove IPA notation markers: /, [, ]
      cleanText = text.replace(/[\/\[\]]/g, "");
      
      // If it's still IPA symbols, try to use a more readable format
      // For now, we'll just remove the slashes and let the TTS try
      // In a real implementation, you might want an IPA to readable text converter
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
};

