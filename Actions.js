function defaultActions() {
  return {
    stop: function(e) {
      if (e.toggle && this.get('currentScene')) {
        var cc = this.get('currentScene');

        sendMidi(cc.channel, cc.index, 0);
      }
    },
    device: function(e) {
      this.cursorDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();

      e.notify = this.get('primaryDevice') || false;
    },
    scene: function(e) {
      this.trackBank.launchScene(e.track);

      this.set('currentScene', e);

      this.all.forEach(function(cc) {
        sendMidi(cc.channel, cc.index, cc.offset === e.offset ? 127 : 0);
      });

      e.notify = 'Scene ' + (e.track + 1);
    },
    track: function(e) {
      var track = this.get('activeTrack'),
          total = this.get('currentTracks.length') - 1;

      if (e.range > 0) {
        track += 1;
      } else {
        track -= 1;
      }

      var index = Math.min(total, Math.max(0, track));

      this.trackBank.getTrack(index).select();

      e.notify = this.get('currentTracks', index);
    },
    send: function(e) {
      this.trackBank.getTrack(e.track).getSend(e.params[0]).set(e.value, 128);

      e.notify = e.value ? Math.round(e.value / 1.27) + '%' : 'OFF';
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
