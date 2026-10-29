"""One-shot HUD card rewrite: consistent grid, visible photo skin, no overlapping rows."""
from pathlib import Path

p = Path("src/main.js")
t = p.read_text(encoding="utf-8")

start = t.index("    if (hudHealth !== Math.round(state.health)) {")
end = t.index("    const activeConfig = weaponManager.getActiveConfig();", start)
new_block = '''    if (hudHealth !== Math.round(state.health)) {
      hudHealth = Math.round(state.health);
      // ── operator status card: one grid, one photo skin, no overlapping rows ──
      const cx = 0.014, cy = 0.024, cw = 0.30, ch = 0.142;
      const px = cx + 0.018;
      h.image("vitals-photo", "./assets/start-still-a.jpg", { x: cx, y: cy, w: cw, h: ch });
      P("vitals", { x: cx, y: cy, w: cw, h: ch, radius: 0.009, fill: "rgba(4,8,13,0.55)", stroke: "rgba(214,178,94,0.45)", width: 0.0012 });
      const br = "rgba(255,196,104,0.92)";
      P("vitals-br-tl-h", { x: cx, y: cy, w: 0.026, h: 0.0022, fill: br });
      P("vitals-br-tl-v", { x: cx, y: cy, w: 0.0022, h: 0.014, fill: br });
      P("vitals-br-br-h", { x: cx + cw - 0.026, y: cy + ch - 0.0022, w: 0.026, h: 0.0022, fill: br });
      P("vitals-br-br-v", { x: cx + cw - 0.0022, y: cy + ch - 0.014, w: 0.0022, h: 0.014, fill: br });
      P("vitals-accent", { x: cx, y: cy, w: cw, h: 0.0035, radius: 0.002, fill: color, stroke: "rgba(0,0,0,0)", width: 0 });
      T("vitals-title", activeSkin.name.toUpperCase(), { x: px, y: 0.035, size: TYPE_SCALE.micro, color: "#e6eef7", weight: 800 });
      T("vitals-sub", "AUTONOMOUS COMBAT FRAME", { x: px, y: 0.050, size: TYPE_SCALE.micro, color: "#8fa3b6", weight: 700 });
      B("health", ratio, { x: px, y: 0.070, w: 0.186, h: 0.017, color, back: "rgba(255,255,255,0.10)" });
      T("health-num", String(Math.round(state.health)), { x: cx + cw - 0.012, y: 0.058, size: TYPE_SCALE.subhead, color, weight: 800, align: "right" });
      T("health-cap", "INTEGRITY", { x: px, y: 0.094, size: TYPE_SCALE.micro, color: "#8fa3b6", weight: 700 });

      // ── weapon card: same grid, photo skin, ammo right-aligned inside the card ──
      const wx = 0.722, wy = 0.812, ww = 0.264, wh = 0.152;
      const wpx = wx + 0.014;
      h.image("weapon-photo", "./assets/art-05.jpg", { x: wx, y: wy, w: ww, h: wh });
      P("weapon-module", { x: wx, y: wy, w: ww, h: wh, radius: 0.009, fill: "rgba(4,8,13,0.55)", stroke: "rgba(214,178,94,0.45)", width: 0.0012 });
      P("weapon-br-tl-h", { x: wx, y: wy, w: 0.026, h: 0.0022, fill: br });
      P("weapon-br-tl-v", { x: wx, y: wy, w: 0.0022, h: 0.014, fill: br });
      P("weapon-br-br-h", { x: wx + ww - 0.026, y: wy + wh - 0.0022, w: 0.026, h: 0.0022, fill: br });
      P("weapon-br-br-v", { x: wx + ww - 0.0022, y: wy + wh - 0.014, w: 0.0022, h: 0.014, fill: br });
      P("weapon-accent", { x: wx, y: wy, w: ww, h: 0.0035, radius: 0.002, fill: PALETTE.ui, stroke: "rgba(0,0,0,0)", width: 0 });
      T("weapon-tag", "PRIMARY", { x: wpx, y: 0.820, size: TYPE_SCALE.micro, color: "#8fa3b6", weight: 700 });
    }
    const killsKey = `${state.kills}:${cardSystem.level}`;
    if (hudKills !== killsKey) {
      hudKills = killsKey;
      weaponManager.syncReloadMeta(cardSystem.level, weaponManager.reloadUpgradesCount);
      T("kills", `THREATS ${state.kills}`, { x: 0.032, y: 0.108, size: TYPE_SCALE.small, color: "#dbe7f2", weight: 700 });
      T("level-chip", `LV ${cardSystem.level}`, { x: 0.300, y: 0.108, size: TYPE_SCALE.small, color: PALETTE.ui, weight: 800, align: "right" });
    }

'''
t = t[:start] + new_block + t[end:]

# weapon rows (name/ammo/tag/bar/alt) on the new grid
t = t.replace('T("weapon-active", activeName, { x: 0.754, y: 0.852, size: TYPE_SCALE.label, color: "#f2f7ff", weight: 800 });',
              'T("weapon-active", activeName, { x: 0.736, y: 0.836, size: TYPE_SCALE.label, color: "#f2f7ff", weight: 800 });')
t = t.replace('T("weapon-inactive", `ALT  ${inactiveName}`, { x: 0.752, y: 0.919, size: TYPE_SCALE.micro, color: "#8ea3b8", weight: 600 });',
              'T("weapon-inactive", `ALT  ${inactiveName}`, { x: 0.760, y: 0.903, size: TYPE_SCALE.micro, color: "#a9bccd", weight: 600 });')
t = t.replace('T("ammo-tag", activeWeapon.isReloading ? "RELOADING" : (activeWeapon.isHeatWeapon ? "HEAT" : "MAGAZINE"), { x: 0.962, y: 0.880, size: TYPE_SCALE.micro, color: "#6b7f92", weight: 700, align: "right" });',
              'T("ammo-tag", activeWeapon.isReloading ? "RELOADING" : (activeWeapon.isHeatWeapon ? "HEAT" : "MAGAZINE"), { x: 0.974, y: 0.868, size: TYPE_SCALE.micro, color: "#8fa3b6", weight: 700, align: "right" });')
t = t.replace('T("ammo-count", ammoText, { x: 0.962, y: 0.850, size: TYPE_SCALE.subhead, color: activeWeapon.isReloading ? PALETTE.healthWarn : "#eaf3ff", weight: 800, align: "right" });',
              'T("ammo-count", ammoText, { x: 0.974, y: 0.832, size: TYPE_SCALE.subhead, color: activeWeapon.isReloading ? PALETTE.healthWarn : "#eaf3ff", weight: 800, align: "right" });')
t = t.replace('B("reload-bar", barFrac, { x: 0.754, y: 0.902, w: 0.219, h: 0.007, color: activeWeapon.isReloading ? PALETTE.healthWarn : PALETTE.ui, back: "rgba(255,255,255,0.08)" });',
              'B("reload-bar", barFrac, { x: 0.736, y: 0.886, w: 0.236, h: 0.006, color: activeWeapon.isReloading ? PALETTE.healthWarn : PALETTE.ui, back: "rgba(255,255,255,0.10)" });')
t = t.replace('h.image("weapon-icon-active", activeIconSrc, { x: 0.946, y: 0.828, h: 0.016 });',
              'h.image("weapon-icon-active", activeIconSrc, { x: 0.736, y: 0.926, h: 0.018 });')
t = t.replace('h.image("weapon-icon-inactive", inactiveIconSrc, { x: 0.946, y: 0.930, h: 0.010 });',
              'h.image("weapon-icon-inactive", inactiveIconSrc, { x: 0.760, y: 0.930, h: 0.010 });')
t = t.replace('T("vitals-warning", ratio < 0.25 ? "INTEGRITY CRITICAL" : "INTEGRITY LOW", { x: 0.028, y: 0.128,',
              'T("vitals-warning", ratio < 0.25 ? "INTEGRITY CRITICAL" : "INTEGRITY LOW", { x: 0.032, y: 0.128,')
p.write_text(t, encoding="utf-8")
print("hud rewrite applied")
