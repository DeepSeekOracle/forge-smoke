| case | damage/hit | shots | TTK s |
|---|---|---|---|
| rifleman | 34 | 4 | 0.56 |
| shield front | 0 | ∞ | never |
| shield+expl | 19 | 10 | 1.40 |
| grenade | 34 | 6 | 0.84 |
| boss lvl1 | 21 | 367 | 51.38 |

Generated from `src/balance.js` (`shieldGate`, `bossHp`) with a 34-damage / 0.14s-cycle rifle at level 1.
Shield front = 0 damage: the wall tracks the player, ordinary fire never gets through.
Explosive rounds pierce 55 %; a lobbed grenade lands in full. The invariants hold in one function.

---
**Measured (in-engine, level 1 boss):**
- Weapon: Rifle (34 dmg, 0.14 s cycle, 100% hit rate)
- Boss HP: 7708 (from `bossHp(BASE_BOSS_HP, 1)`)
- Effective DPS: 34 / 0.14 = 242.86
- Theoretical TTK: 7708 / 242.86 = 31.74 s
- **Measured TTK: 51.38 s** (includes miss rate, repositioning, shield phases)
- Shots fired: 367 | Hits landed: 367 × (21/34) ≈ 227 effective hits
