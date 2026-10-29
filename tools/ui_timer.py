"""Arcade top-centre timer: no chip, big outlined numerals, rules and small beat/score lines."""
from pathlib import Path

p = Path("src/main.js")
t = p.read_text(encoding="utf-8")

old_start = t.index("    // Beat name + timer, in a compact top-centre chip")
old_end = t.index("    // Airdrop countdown", old_start)
new = '''    // Arcade top-centre timer: no chip, outlined numerals with gold rules either side.
    const beat = beatDirector.getCurrentBeat();
    const beatText = beat.name.toUpperCase();
    const timeLeft = beatDirector.getBeatTimeRemaining();
    const timerText = timeLeft >= 10 ? timeLeft.toFixed(1) : `0${timeLeft.toFixed(1)}`;
    const timerColor = timeLeft <= 10 ? "#ff5a5a" : "#ffd27a";
    const timerFont = "ui-monospace, Consolas, monospace";
    const beatKey = `${beatText}:${timerText}`;
    if (hudBeat !== beatKey) {
      hudBeat = beatKey;
      // two hairlines flanking the numerals, like an arcade countdown rail
      P("timer-rule-l", { x: 0.330, y: 0.052, w: pw(0.070), h: 0.0016, fill: "rgba(255,196,104,0.55)" });
      P("timer-rule-r", { x: 0.600, y: 0.052, w: pw(0.070), h: 0.0016, fill: "rgba(255,196,104,0.55)" });
      T("beat-timer-shadow", timerText, { x: 0.5, y: 0.021, size: 54, color: "rgba(0,0,0,0.9)", weight: 900, align: "center", font: timerFont });
      T("beat-timer", timerText, { x: 0.5, y: 0.018, size: 54, color: timerColor, weight: 900, align: "center", font: timerFont });
      T("beat", beatText, { x: 0.5, y: 0.083, size: TYPE_SCALE.micro, color: "#c9d8e6", weight: 800, align: "center" });
    }
    T("timer-cap", timeLeft <= 10 ? "CONTACT // CLOSING" : "CONTACT", { x: 0.5, y: 0.006, size: TYPE_SCALE.micro, color: timeLeft <= 10 ? "#ff8a8a" : "#ffb347", weight: 800, align: "center" });

    // Score under the timer, no frame.
    const currentScore = scoreSystem.getCurrentScore(beatDirector.runTime);
    if (hudScore !== currentScore) {
      hudScore = currentScore;
      T("score", `${currentScore}`, { x: 0.5, y: 0.100, size: TYPE_SCALE.label, color: "#cfdeee", weight: 800, align: "center" });
      T("score-cap", "SCORE", { x: 0.5, y: 0.112, size: TYPE_SCALE.micro, color: "#576a7e", weight: 700, align: "center" });
    }

'''
t = t[:old_start] + new + t[old_end:]

# airdrop line now sits below the score block
t = t.replace('T("airdrop", airdropText, { x: 0.5, y: 0.08, size: TYPE_SCALE.small',
              'T("airdrop", airdropText, { x: 0.5, y: 0.128, size: TYPE_SCALE.small')
p.write_text(t, encoding="utf-8")
print("arcade timer")
