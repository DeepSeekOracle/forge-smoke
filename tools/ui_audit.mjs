// Brief 09 B acceptance: 1440x900 + 390x844 screenshots, a printed Tab order, and a visible focus ring.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL = process.env.FORGE_URL || "http://127.0.0.1:8796/preview/forge-smoke/";
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 120)));
await page.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(7500);
await page.screenshot({ path: "docs/evidence/ui-1440-start.png" });

const focusables = await page.evaluate(() => Array.from(document.querySelectorAll(
  "a[href], button, input, select, textarea, [tabindex]",
)).filter((el) => el.getAttribute("tabindex") !== "-1" && el.tabIndex >= 0)
  .filter((el) => el.offsetParent !== null || el.getClientRects().length).map((el) => ({
  tag: el.tagName.toLowerCase(),
  id: el.id || "",
  text: (el.innerText || el.getAttribute("aria-label") || el.value || "").trim().slice(0, 28),
})));

const walk = [];
for (let i = 0; i < 12; i += 1) {
  await page.keyboard.press("Tab");
  walk.push(await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 28),
      outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor,
      shadow: cs.boxShadow.slice(0, 40),
    };
  }));
}
const ringVisible = walk.some((w) => (w.outline && !/none 0px/.test(w.outline)) || (w.shadow && w.shadow !== "none"));
writeFileSync("docs/evidence/tab-order.txt", [
  "FORGE SMOKE — Tab order at 1440x900 (title screen)",
  ...focusables.map((f, i) => `${i + 1}. <${f.tag}> ${f.id} "${f.text}"`),
  "",
  "Observed focus walk (12 presses):",
  ...walk.map((w, i) => `${i + 1}. <${w.tag}> ${w.id} "${w.text}"  outline=${w.outline} shadow=${w.shadow}`),
  "",
  `Visible focus ring on at least one stop: ${ringVisible}`,
].join("\n"));

await page.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await page.waitForTimeout(1100);
await page.screenshot({ path: "docs/evidence/ui-1440-bay.png" });
await page.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await page.waitForTimeout(3500);
await page.screenshot({ path: "docs/evidence/ui-1440-game.png" });

const small = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await small.goto(URL + "?test=1&cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 60000 });
await small.waitForTimeout(7500);
await small.screenshot({ path: "docs/evidence/ui-390-start.png" });
await small.evaluate(() => document.querySelector("#fs-start [data-enter]").click());
await small.waitForTimeout(1100);
await small.evaluate(() => document.querySelector("#cyborg-manager [data-launch]").click());
await small.waitForTimeout(3200);
await small.evaluate(() => {
  const cs = window.__forgeSmokeTest.getCards();
  cs.queuedCards.push([
    { type: "part", name: "AP Rounds", part: { id: "ap_rounds", name: "AP Rounds", rarity: "rare", effect: { pierceCount: 1 } } },
    { type: "part", name: "Ceramic Plate", part: { id: "ceramic", name: "Ceramic Plate", rarity: "common", effect: { armor: 15 } } },
    { type: "part", name: "Overclock", part: { id: "overclock", name: "Overclock", rarity: "rare", effect: { cycleMult: 0.85 } } },
  ]);
  window.__studio.step(400);
});
await small.waitForTimeout(600);
const trayFit = await small.evaluate(() => {
  const tray = document.querySelector("#fs-cards");
  if (!tray) return null;
  const r = tray.getBoundingClientRect();
  return { open: tray.classList.contains("open"), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, cards: tray.querySelectorAll(".card").length };
});
await small.screenshot({ path: "docs/evidence/ui-390-cards.png" });

console.log(JSON.stringify({ focusables: focusables.length, walk: walk.length, ringVisible, trayFit, errors }, null, 1));
await browser.close();
