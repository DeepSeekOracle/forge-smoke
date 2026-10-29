// UI-08: Ground zone markers wired to objZones
// Ring per zone, amber current, pulse on hold

const UI08 = {
  init: function() {
    this.zones = game.objZones || [];
    this.updateMarkers();
    this.bindEvents();
  },

  bindEvents: function() {
    // Listen for zone state changes
    game.on('zone:active', this.onZoneActive.bind(this));
    game.on('zone:hold', this.onZoneHold.bind(this));
    game.on('zone:inactive', this.onZoneInactive.bind(this));
  },

  updateMarkers: function() {
    this.zones.forEach((zone, index) => {
      const marker = this.getMarker(index);
      if (marker) {
        this.renderZoneRing(zone, marker);
        this.renderCurrentStatus(zone, marker);
        this.renderHoldPulse(zone, marker);
      }
    });
  },

  renderZoneRing: function(zone, marker) {
    const radius = zone.radius || 100;
    const centerX = zone.x || 0;
    const centerY = zone.y || 0;
    
    // Draw ring (circle) around zone
    const ringPath = new Path2D();
    ringPath.arc(centerX, centerY, radius, 0, Math.PI * 2);
    
    marker.ctx.beginPath();
    marker.ctx.strokeStyle = '#000';
    marker.ctx.lineWidth = 4;
    marker.ctx.stroke(ringPath);
  },

  renderCurrentStatus: function(zone, marker) {
    if (zone.active) {
      marker.ctx.strokeStyle = '#ffcc00'; // Amber current
      marker.ctx.lineWidth = 6;
      marker.ctx.stroke();
    }
  },

  renderHoldPulse: function(zone, marker) {
    if (zone.hold) {
      // Pulse effect: alternating opacity
      const pulse = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
      marker.ctx.globalAlpha = pulse;
      this.renderZoneRing(zone, marker);
      marker.ctx.globalAlpha = 1;
    }
  },

  getMarker: function(index) {
    return this.markers?.[index] || {
      ctx: document.createElement('canvas').getContext('2d'),
      x: 0,
      y: 0
    };
  },

  onZoneActive: function(zone) {
    this.updateMarkers();
  },

  onZoneHold: function(zone) {
    this.updateMarkers();
  },

  onZoneInactive: function(zone) {
    this.updateMarkers();
  }
};

// Initialize UI-08 on load
window.addEventListener('load', () => {
  UI08.init();
});