/**
 * FORGE SMOKE — START MENU
 *
 * The first screen. A bay door, not a splash: wordmark, the machine waiting behind it, and three
 * choices. ENTER THE BAY hands off to the cyborg manager, where the player builds the fighter.
 *
 * Pure DOM; the 3D operator turntable keeps running on the canvas behind it.
 */
import { xpForLevel } from "./save.js";

const CSS = `
#fs-start{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:flex-start;
  padding:0 clamp(28px,7vw,140px);pointer-events:none;
  background:radial-gradient(900px 620px at 22% 46%,rgba(7,9,12,.90),rgba(7,9,12,.55) 55%,rgba(7,9,12,.15));
  font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#E8F1F8}
#fs-start.open{display:flex}
#fs-start .wrap{pointer-events:auto;max-width:620px}
#fs-start .kicker{display:flex;align-items:center;gap:10px;font:700 10px ui-monospace,Consolas,monospace;
  letter-spacing:.32em;color:#FFB347;margin-bottom:18px}
#fs-start .kicker i{display:block;width:34px;height:1px;background:#FFB347;opacity:.8}
#fs-start h1{margin:0;font:800 clamp(52px,8.4vw,104px)/0.92 "Barlow Condensed","Oswald",ui-sans-serif,sans-serif;
  letter-spacing:.02em;text-transform:uppercase;color:#F4F8FC;
  text-shadow:0 0 44px rgba(255,179,71,.16),0 2px 0 rgba(0,0,0,.6)}
#fs-start h1 span{color:#FFB347}
#fs-start .tag{margin:14px 0 0;font:600 11px ui-monospace,Consolas,monospace;letter-spacing:.26em;color:#8FA3B8}
#fs-start .rule{height:1px;background:linear-gradient(90deg,rgba(255,179,71,.5),rgba(30,42,53,0));margin:26px 0 22px;max-width:420px}
#fs-start .menu{display:flex;flex-direction:column;gap:9px;max-width:360px}
#fs-start button{position:relative;text-align:left;padding:15px 20px;border-radius:3px;cursor:pointer;
  border:1px solid #1E2A35;background:linear-gradient(180deg,rgba(19,26,34,.92),rgba(14,19,25,.92));
  color:#E8F1F8;font:700 13px ui-sans-serif,system-ui,sans-serif;letter-spacing:.18em;transition:border-color .12s,transform .12s,box-shadow .12s}
#fs-start button small{display:block;margin-top:4px;font:600 8.5px ui-monospace,Consolas,monospace;letter-spacing:.2em;color:#7E93A6}
#fs-start button:hover:not(:disabled){border-color:#FFB347;transform:translateX(2px);box-shadow:0 0 22px -8px rgba(255,179,71,.5)}
#fs-start button:focus-visible{outline:2px solid #6FE3FF;outline-offset:2px}
#fs-start button.primary{border-color:rgba(255,179,71,.85);background:linear-gradient(180deg,#FFC063,#E99732);color:#0A0D11;
  box-shadow:0 0 30px -10px rgba(255,179,71,.6),inset 0 1px 0 rgba(255,255,255,.4)}
#fs-start button.primary small{color:rgba(10,13,17,.62)}
#fs-start button.primary:hover{transform:translateX(3px);box-shadow:0 0 40px -10px rgba(255,179,71,.75)}
#fs-start button:disabled{opacity:.45;cursor:not-allowed}
#fs-start .stats{margin-top:26px;display:flex;gap:22px;font:600 9px ui-monospace,Consolas,monospace;letter-spacing:.18em;color:#7E93A6}
#fs-start .stats b{display:block;font:700 20px ui-monospace,Consolas,monospace;letter-spacing:0;color:#E8F1F8;margin-bottom:2px}
#fs-start .stats .gold b{color:#FFD166}
#fs-start .foot{position:absolute;left:clamp(28px,7vw,140px);bottom:22px;font:600 9px ui-monospace,Consolas,monospace;
  letter-spacing:.2em;color:rgba(126,147,166,.6)}
`;

export function createStartMenu(opts = {}) {
  const onEnter = opts.onEnter || (() => {});
  const onOptions = opts.onOptions || (() => {});
  const getProfile = opts.getProfile || (() => null);

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "fs-start";
  root.innerHTML = `
    <div class="wrap">
      <div class="kicker"><i></i> Δ9 · EXCAVATIONPRO · BAY 01</div>
      <h1>FORGE<br><span>SMOKE</span></h1>
      <p class="tag">CYBORG MANAGER · AUTONOMOUS ARENA</p>
      <div class="rule"></div>
      <div class="menu">
        <button class="primary" data-enter>ENTER THE BAY<small>MANAGE · LOADOUT · LAUNCH</small></button>
        <button data-options>OPTIONS<small>AUDIO · CONTROLS · VIDEO</small></button>
      </div>
      <div class="stats">
        <div><b data-level>1</b>LEVEL</div>
        <div><b data-runs>0</b>RUNS</div>
        <div><b data-cleared>0</b>ARENAS CLEARED</div>
        <div class="gold"><b data-legacy>0</b>LEGENDARY</div>
      </div>
    </div>
    <div class="foot">CONTACT THE BAY · [ENTER] TO DEPLOY TO MANAGER</div>
  `;
  document.body.appendChild(root);

  const q = (s) => root.querySelector(s);

  function render() {
    const p = getProfile() || { level: 1, xp: 0, runs: 0, arenasCleared: 0, legacy: [] };
    q("[data-level]").textContent = p.level || 1;
    q("[data-runs]").textContent = p.runs || 0;
    q("[data-cleared]").textContent = p.arenasCleared || 0;
    q("[data-legacy]").textContent = (p.legacy || []).length;
  }

  q("[data-enter]").onclick = () => onEnter();
  q("[data-options]").onclick = () => onOptions();

  function show() { render(); root.classList.add("open"); }
  function hide() { root.classList.remove("open"); }

  return { show, hide, render, root, get open() { return root.classList.contains("open"); } };
}
