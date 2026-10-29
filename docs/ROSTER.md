# Weapon roster (generated from src/tuning.js + src/models.js)

| style | name | damage | cycle | mag | range | role | weakness |
|---|---|---|---|---|---|---|---|
| spray | SMG // SPRAY | 6 | 0.125 | 30 | 10.7 | volume fire | low per-shot, short range |
| flak | AA FLAK | 22 | 0.55 | 6 | 34 | **anti-air** (x2.6 vs airborne, x0.45 vs ground) | useless against ground targets |
| breach | BREACHER | 11 | 0.78 | 5 | 6.2 | **shield pierce 0.7**, close range | outside 6 m it does nothing |
| rail2 | SIEGE RAIL | 190 | 2.1 | 2 | 40 | **penetrates 3 targets** | 2.1 s per shot, 2 rounds |

Shield invariants (from `src/balance.js` `shieldGate`): front = 0 damage, explosive rounds pierce 55 %,
lobbed grenade lands in full. `breach` adds its own 0.7 pierce through the same function.

Measured TTK: see `docs/TTK.md`.
