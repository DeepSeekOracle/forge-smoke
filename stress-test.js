const { chromium } = require('playwright');
const fs = require('fs');

async function runStressTest() {
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
  
  await page.goto('http://127.0.0.1:8796/preview/forge-smoke/?low=1&test=1', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForFunction(() => window.__studio !== undefined, { timeout: 10000 });
  
  console.log('Studio ready, starting stress test...');
  
  await page.evaluate(() => {
    window.__studio.begin();
  });
  
  await page.waitForTimeout(500);
  
  await page.evaluate(() => {
    window.__studio.injectInput({ down: ['KeyW'] });
  });
  
  const duration = 15000;
  const sampleInterval = 200;
  const samples = [];
  
  console.log('Collecting sustained performance samples...');
  
  for (let elapsed = 0; elapsed < duration; elapsed += sampleInterval) {
    await page.waitForTimeout(sampleInterval);
    
    const stats = await page.evaluate(() => {
      const inspect = window.__studio.inspect();
      if (!inspect || !inspect.available) return null;
      
      const renderer = inspect.renderer;
      if (!renderer || !renderer.info) return null;
      
      const state = window.__studio.state();
      return {
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        points: renderer.info.render.points,
        lines: renderer.info.render.lines,
        frame: renderer.info.render.frame,
        fps: state.fps,
        enemies: state.probes?.enemies || 0
      };
    });
    
    if (stats) {
      samples.push({ ...stats, time: elapsed });
      if (elapsed % 2000 === 0) console.log(`Sample at ${elapsed}ms:`, stats);
    }
  }
  
  await page.evaluate(() => {
    window.__studio.injectInput({ up: ['KeyW'] });
  });
  
  const frameTimes = samples.map(s => 1000 / (s.fps || 60)).filter(f => f > 0);
  frameTimes.sort((a, b) => a - b);
  const p95Index = Math.floor(frameTimes.length * 0.95);
  const p95FrameTime = frameTimes[p95Index] || 0;
  const avgFps = frameTimes.length > 0 ? Math.round(frameTimes.reduce((a, b) => a + 1000/b, 0) / frameTimes.length) : 0;
  
  const maxCalls = samples.length > 0 ? Math.max(...samples.map(s => s.calls)) : 0;
  const maxTriangles = samples.length > 0 ? Math.max(...samples.map(s => s.triangles)) : 0;
  const maxEnemies = samples.length > 0 ? Math.max(...samples.map(s => s.enemies || 0)) : 0;
  
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
    url: 'http://127.0.0.1:8796/preview/forge-smoke/?low=1&test=1',
    resolution: '1280x720',
    preset: 'low',
    durationMs: duration,
    sampleCount: samples.length,
    testType: 'sustained',
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
  
  console.log('\n=== STRESS TEST RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  fs.writeFileSync('stress-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to stress-results.json');
  
  await browser.close();
  return results;
}

runStressTest().catch(console.error);