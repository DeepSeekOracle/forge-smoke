const XP_CURVE = {
  base: 100,
  growthRate: 0.8,
  cap: 1000000
};

const CARD_PACING = {
  cardsPerRun: 3.5,
  minCards: 3,
  maxCards: 5,
  runCount: 20,
  cardInterval: 90000 // 90 seconds between card spawns
};

// Validate pacing: ensures 3-5 cards per run in 20-run table
function validatePacing() {
  const totalCards = CARD_PACING.cardsPerRun * CARD_PACING.runCount;
  const minTotal = CARD_PACING.minCards * CARD_PACING.runCount;
  const maxTotal = CARD_PACING.maxCards * CARD_PACING.runCount;
  
  if (totalCards < minTotal || totalCards > maxTotal) {
    console.error(`Pacing violation: ${totalCards} cards total, expected [${minTotal}, ${maxTotal}]`);
    return false;
  }
  return true;
}

// Export constants for engine use
export { XP_CURVE, CARD_PACING, validatePacing };