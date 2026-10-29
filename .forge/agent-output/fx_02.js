const ShellCasing = function (style, position, velocity) {
  this.style = style;
  this.position = position || { x: 0, y: 0 };
  this.velocity = velocity || { x: 0, y: 0 };
  this.lifetime = 1000;
  this.age = 0;
  this.visible = true;
};

ShellCasing.prototype.update = function (dt) {
  this.age += dt;
  this.position.x += this.velocity.x * dt;
  this.position.y += this.velocity.y * dt;
  this.lifetime -= dt;
  if (this.lifetime <= 0) {
    this.visible = false;
  }
};

ShellCasing.prototype.render = function (ctx) {
  const size = 8;
  const offset = this.style === 'pierce' ? 2 : 0;
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
  ctx.fillStyle = this.style === 'pierce' ? '#ff4444' : '#888888';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size + offset, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size - offset, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Pooled instance manager
const ShellCasingPool = {
  instances: [],
  maxPoolSize: 100,
  create: function (style, position, velocity) {
    const index = this.instances.findIndex(i => i.visible === false);
    if (index !== -1) {
      const instance = this.instances[index];
      instance.style = style;
      instance.position = position || { x: 0, y: 0 };
      instance.velocity = velocity || { x: 0, y: 0 };
      instance.visible = true;
      instance.age = 0;
      instance.lifetime = 1000;
      return instance;
    }
    if (this.instances.length >= this.maxPoolSize) {
      // Evict oldest
      this.instances.shift();
    }
    const instance = new ShellCasing(style, position, velocity);
    this.instances.push(instance);
    return instance;
  },
  destroy: function (instance) {
    const index = this.instances.findIndex(i => i === instance);
    if (index !== -1) {
      this.instances[index].visible = false;
    }
  }
};

export { ShellCasing, ShellCasingPool }