class BreacherShotgun {
  constructor() {
    this.pierce = 0.7;
    this.fireRate = 1.5; // slow close fire
    this.damage = 20;
    this.range = 80;
    this.shieldPenetration = true;
    this.pierceMode = true;
  }

  fire(target, player) {
    if (this.pierceMode && target.hasShield()) {
      // Pierce through shield with 70% chance
      if (Math.random() < this.pierce) {
        target.takeDamage(this.damage, true); // true = pierce
        return true;
      }
    } else {
      // Normal damage
      target.takeDamage(this.damage);
    }
    return false;
  }

  getFireStyle() {
    return 'close, slow, pierce 0.7';
  }
}

// Register weapon
window.WPNS = window.WPNS || {};
window.WPNS.BREACHER_SHOTGUN = BreacherShotgun;