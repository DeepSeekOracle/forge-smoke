const audioMixTable = {
  'light': {
    'hit': 'assets/sfx/light_hit.wav',
    'impact': 'assets/sfx/light_impact.wav',
    'tink': 'assets/sfx/light_tink.wav'
  },
  'heavy': {
    'hit': 'assets/sfx/heavy_hit.wav',
    'impact': 'assets/sfx/heavy_impact.wav',
    'tink': 'assets/sfx/heavy_tink.wav'
  },
  'shield': {
    'hit': 'assets/sfx/shield_hit.wav',
    'impact': 'assets/sfx/shield_impact.wav',
    'tink': 'assets/sfx/shield_tink.wav'
  }
};

// Shield hit is audibly distinct
function playShieldHit() {
  const hitSound = audioMixTable.shield.hit;
  const audio = new Audio(hitSound);
  audio.volume = 0.8;
  audio.play();
}

// Mix table documented and accessible
export { audioMixTable };
