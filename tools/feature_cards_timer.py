"""Card tray 10 s auto-pick badge."""
from pathlib import Path

p = Path("src/cardsui.js")
t = p.read_text(encoding="utf-8")

t = t.replace('''  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);''','''  const style = document.createElement("style");
  style.textContent = CSS + `
#fs-cards-timer{position:fixed;top:9vh;left:50%;transform:translateX(-50%);z-index:60;
  font-family:"Arial Black",Impact,system-ui,sans-serif;font-weight:900;letter-spacing:2px;
  font-size:17px;color:#ffd27a;background:rgba(6,10,16,.86);border:1px solid rgba(255,179,71,.55);
  border-radius:999px;padding:9px 20px;text-shadow:0 2px 0 rgba(0,0,0,.6);
  box-shadow:0 6px 24px rgba(0,0,0,.45);pointer-events:none;transition:color .15s,border-color .15s}
#fs-cards-timer.urgent{color:#ff5a5a;border-color:rgba(255,90,90,.75)}
#fs-cards-timer b{color:#ffffff}`;
  document.head.appendChild(style);''')

t = t.replace('''  const root = document.createElement("div");
  root.id = "fs-cards";
  document.body.appendChild(root);''','''  const root = document.createElement("div");
  root.id = "fs-cards";
  document.body.appendChild(root);

  let timerEl = null;
  function ensureTimer() {
    if (!timerEl) {
      timerEl = document.createElement("div");
      timerEl.id = "fs-cards-timer";
      document.body.appendChild(timerEl);
    }
    timerEl.style.display = "block";
    return timerEl;
  }
  function setCountdown(seconds) {
    const el = ensureTimer();
    const s = Math.max(0, Number(seconds) || 0);
    el.innerHTML = `AUTO-PICK IN <b>${s.toFixed(1)}s</b>`;
    el.classList.toggle("urgent", s <= 3);
  }''')

t = t.replace('''    scrim.classList.add("open");
    root.classList.add("open");''','''    scrim.classList.add("open");
    root.classList.add("open");
    setCountdown(10);''')

t = t.replace('''  function hide() {
    root.classList.remove("open");
    root.innerHTML = "";''','''  function hide() {
    root.classList.remove("open");
    root.innerHTML = "";
    if (timerEl) timerEl.style.display = "none";''')

t = t.replace('return { show: render, hide, root, get open() { return root.classList.contains("open"); } };',
              'return { show: render, hide, setCountdown, root, get open() { return root.classList.contains("open"); } };')
p.write_text(t, encoding="utf-8")
print("card countdown")
