function defaultActions() {
  return {
    device: function(e) {
      this.cursorDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();

      if (get('primaryDevice')) {
        e.label = get('primaryDevice');
      } else {
        e.notify = false;
      }
    },
    scene: function(e) {
      this.trackBank.launchScene(e.track);

      e.label = 'Scene ' + (e.track + 1);
    },
    track: function(e) {
      this.trackBank.getTrack(e.value).select();

      e.label = get('currentTracks', e.value);
    },
    send: function(e) {
      this.trackBank.getTrack(e.track).getSend(e.params[0]).set(e.value, 128);

      e.label = e.value ? Math.round(e.value / 1.27) + '%' : 'OFF';
    },
    mute: function(e) {
      this.trackBank.getTrack(e.track).getMute().set(e.toggle);
    },
    solo: function(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getSolo().toggle();
      }
    },
    arm: function(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getArm().toggle();
      }
    },
    vol: function(e) {
      this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
    }
  };
};
