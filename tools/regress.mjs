import { runTest } from '../utils/test-runner.js';

// End-to-end gate for DBG-04: start→bay→play→card→boss→death→summary
// Non-zero exit on any page error

const testSequence = [
  { stage: 'start', action: 'load initial state', expected: 'no errors', timeout: 5000 },
  { stage: 'bay', action: 'enter bay phase', expected: 'no page errors', timeout: 3000 },
  { stage: 'play', action: 'begin gameplay', expected: 'no page errors', timeout: 10000 },
  { stage: 'card', action: 'interact with card system', expected: 'no page errors', timeout: 5000 },
  { stage: 'boss', action: 'engage boss fight', expected: 'no page errors', timeout: 15000 },
  { stage: 'death', action: 'trigger player death', expected: 'no page errors', timeout: 2000 },
  { stage: 'summary', action: 'render final summary', expected: 'no page errors', timeout: 3000 }
];

async function main() {
  console.log('Starting DBG-04 end-to-end regression test...');
  
  for (const step of testSequence) {
    try {
      await runTest(step.stage, step.action, step.expected, step.timeout);
      console.log(`✅ Passed: ${step.stage} - ${step.action}`);
    } catch (error) {
      console.error(`❌ Failed: ${step.stage} - ${step.action}:`, error);
      process.exit(1);
    }
  }
  
  console.log('✅ All stages completed successfully.');
  process.exit(0);
}

main();