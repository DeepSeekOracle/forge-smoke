const { chromium } = require('playwright');
const fs = require('fs');

async function runMaxLoadTest() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--use-angle=d3d11', '--force-device-scale-factor=1']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[ERROR] ${err.message}`));

  // Test with higher enemy cap by overriding via URL param
  await page.goto('http://127.0.0.1:8796/preview/forge-smoke/?low=1&test=1&enemycap=50', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForFunction(() => window.__studio !== undefined, { timeout: 10000 });

  console.log('Studio ready, starting max load test...');

  // Start the run and resume simulation
  await page.evaluate(() => {
    window.__studio.begin();
    window.__studio.start();
  });

  // Wait for game to start and enemies to spawn
  await page.waitForTimeout(3000);

  // Inject inputs to simulate play (hold W to move)
  await page.evaluate(() => {
    window.__studio.injectInput({ down: ['KeyW'] });
  });

  // Run for 30 seconds to collect performance data under max load
  const duration = 30000;
  const sampleInterval = 500;
  const samples = [];

  console.log('Collecting performance samples under max load...');

  for (let elapsed = 0; elapsed < duration; elapsed += sampleInterval) {
    await page.waitForTimeout(sampleInterval);

    const stats = await page.evaluate(() => {
      const studio = window.__studio;
      if (!studio) return null;

      const inspect = studio.inspect();
      if (!inspect || !inspect.available) return null;

      const renderer = inspect.renderer;
      if (!renderer || !renderer.info) return null;

      const state = studio.state ? studio.state() : {};

      return {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        points: renderer.info.render.points,
        lines: renderer.info.render.lines,
        frame: renderer.info.render.frame,
        fps: state.fps || 60,
        enemies: state.enemies || 0,
        kills: state.kills || 0,
        health: state.health || 100,
        phase: state.flow?.phase || state.phase || 'unknown'
      };
    });

    if (stats) {
      samples.push({ ...stats, time: elapsed });
      if (elapsed % 5000 === 0) console.log(`Sample at ${elapsed}ms:`, stats);
    } else {
      console.log(`Sample at ${elapsed}ms: inspect not available`);
    }
  }

  // Stop input
  await page.evaluate(() => {
    window.__studio.injectInput({ up: ['KeyW'] });
  });

  // Calculate p95 frame time from FPS samples
  const frameTimes = samples.map(s => 1000 / (s.fps || 60)).filter(f => f > 0);
  frameTimes.sort((a, b) => a - b);
  const p95Index = Math.floor(frameTimes.length * 0.95);
  const p95FrameTime = frameTimes[p95Index] || 0;
  const avgFps = frameTimes.length > 0 ? Math.round(frameTimes.reduce((a, b) => a + 1000/b, 0) / frameTimes.length) : 0;

  const maxCalls = samples.length > 0 ? Math.max(...samples.map(s => s.calls)) : 0;
  const maxTriangles = samples.length > 0 ? Math.max(...samples.map(s => s.triangles)) : 0;
  const maxEnemies = samples.length > 0 ? Math.max(...samples.map(s => s.enemies || 0)) : 0;

  // Get texture memory using inspect
  const textureMemory = await page.evaluate(() => {
    const inspect = window.__studio.inspect();
    if (!inspect || !inspect.available) return 0;

    const scene = inspect.scene;
    if (!scene) return 0;

    let totalBytes = 0;

    scene.traverse(obj => {
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'envMap', 'lightMap', 'alphaMap', 'displacementMap'].forEach(key => {
            if (mat[key] && mat[key].image) {
              const tex = mat[key];
              const w = tex.image.width || tex.image.videoWidth || 0;
              const h = tex.image.height || tex.image.videoHeight || 0;
              totalBytes += w * h * 4;
            }
          });
        }
      }
    });

    return totalBytes;
  });

  const results = {
    timestamp: new Date().toISOString(),
    url: 'http://127.0.0.1:8796/preview/forge-smoke/?low=1&test=1&enemycap=50',
    resolution: '1280x720',
    preset: 'low',
    durationMs: duration,
    sampleCount: samples.length,
    testType: 'max-load',
    fps: {
      average: avgFps,
      p95FrameTimeMs: p95FrameTime,
      target: 60,
      p95TargetMs: 18,
      pass: p95FrameTime <= 18
    },
    drawCalls: {
      max: maxCalls,
      target: 90,
      pass: maxCalls <= 90
    },
    triangles: {
      max: maxTriangles,
      target: 150000,
      pass: maxTriangles <= 150000
    },
    textureMemory: {
      bytes: textureMemory,
      mb: Math.round(textureMemory / (1024 * 1024) * 100) / 100,
      targetMB: 96,
      pass: textureMemory <= 96 * 1024 * 1024
    },
    maxEnemies: maxEnemies,
    samples: samples
  };

  console.log('\n=== MAX LOAD TEST RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('max-load-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to max-load-results.json');

  await browser.close();
  return results;
}

runMaxLoadTest().catch(console.error);