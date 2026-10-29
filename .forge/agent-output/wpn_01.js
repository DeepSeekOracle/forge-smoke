class AAFLAK {
  constructor() {
    this.name = 'AA FLAK';
    this.profile = 'air-only';
    this.damage = { air: 15, ground: 2 }; // strong vs air, weak vs ground
    this.range = 1000;
    this.fireRate = 1500; // ms between shots
    this.recoil = 0.5;
    this.trajectory = 'cone';
    this.impactEffect = 'explosion';
    this.ttkRow = [1.2, 2.5, 4.0]; // TTK row for air targets
    this.screenshot = true;
  }

  fire(target) {
    if (target.airTarget) {
      return this.damage.air;
    }
    return 0; // weak vs ground
  }
}

// Initialize weapon
const flak = new AAFLAK();