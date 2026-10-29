// ART-06: prefers-reduced-motion must show a 1536x864 still, not the GIF or the video.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7000);
const probe = await page.evaluate(() => {
  const el = document.querySelector("#fs-start");
  const cs = getComputedStyle(el);
  const vid = document.querySelector("#fs-start .artvid");
  return {
    classes: el.className,
    background: cs.backgroundImage,
    animation: cs.animationName,
    videoOpacity: vid ? getComputedStyle(vid).opacity : null,
    stillA: cs.backgroundImage.includes("start-still-a.jpg"),
  };
});
await page.screenshot({ path: "docs/evidence/art-06-reduced-motion.png" });
console.log("ART-06 reduce:", JSON.stringify(probe));
if (!probe.stillA) { console.log("FAIL reduced-motion still not used"); process.exitCode = 1; }
if (probe.animation !== "none") { console.log("FAIL still drift animation still running"); process.exitCode = 1; }
await browser.close();
