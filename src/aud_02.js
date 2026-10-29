const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Rain/wind ambience bed - CC0, looped, lowpass ~1.8kHz, gain 0.10
function createAmbienceBed() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Set waveform to a soft, natural wind-like tone
  oscillator.type = 'sine';
  oscillator.frequency.setValue(100);

  // Apply lowpass filter to simulate rain/wind ambience (cutoff ~1800 Hz)
  const biquad = audioContext.createBiquadFilter();
  biquad.type = 'lowpass';
  biquad.frequency.setValueAtTime(1800, audioContext.currentTime);
  biquad.Q.setValueAtTime(0.7, audioContext.currentTime);

  // Set gain to 0.10 (10% of full volume)
  gainNode.gain.setValueAtTime(0.10, audioContext.currentTime);

  // Connect nodes
  oscillator.connect(biquad);
  biquad.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start oscillation (looped)
  oscillator.start();

  // Fade in over 2 seconds
  gainNode.gain.exponentialRampToValueAtTime(0.10, audioContext.currentTime + 2);

  // Fade out over 10 seconds when game ends
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 10);

  // Return reference to allow control
  return { oscillator, gainNode, biquad };
}

// Initialize ambience bed on load
const ambience = createAmbienceBed();

// Optional: fade out on game end
// window.gameEnd = () => { ambience.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1); }