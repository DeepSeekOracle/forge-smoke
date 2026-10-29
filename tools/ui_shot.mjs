// Visual evidence for the HUD/character pass: playing HUD, low-integrity vignette, phone width.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });

async function shot(width, height, name, hurtTo) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
  await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(7000);
  await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
  await page.waitForTimeout(6000);
  for (let i = 0; i < 3; i += 1) { await page.keyboard.press("1"); await page.waitForTimeout(250); }
  if (hurtTo) await page.evaluate((n) => window.__forgeSmokeTest.hurt(n), hurtTo);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `docs/evidence/${name}` });
  console.log(name, errors.length ? "ERRORS " + errors.join(" | ") : "clean");
  await page.close();
}

await shot(1280, 800, "ui-hud-playing.png");
await shot(1280, 800, "ui-hud-low-health.png", 72);
await shot(390, 844, "ui-hud-390x844.png");
await browser.close();
