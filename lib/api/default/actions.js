'use strict';

/* global sendMidi */

module.exports = {
  scenePlay: function(e) {
    this.trackBank.launchScene(e.scene);

    this.set('currentScene', e);

    this.all.forEach(function(cc) {
      sendMidi(cc.channel, cc.index, cc.scene === e.scene ? 127 : 0);
    });

    e.notify = 'Scene ' + (e.scene + 1);
  },
  setDevice: function(e) {
    this.cursorDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();
  },
  setTrack: function(e) {
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
  sendLevel: function(e) {
    this.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

    e.notify = e.value ? Math.round(e.value / 1.27) + '%' : 'OFF';
  },
  volumeLevel: function(e) {
    this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
  },
  toggleMute: function(e) {
    this.trackBank.getTrack(e.track).getMute().set(e.toggle);
  },
  toggleSolo: function(e) {
    if (e.toggle) {
      this.trackBank.getTrack(e.track).getSolo().toggle();
    }
  },
  toggleArm: function(e) {
    if (e.toggle) {
      this.trackBank.getTrack(e.track).getArm().toggle();
    }
  },
  onStop: function() {
    var cc = this.get('currentScene');

    if (cc) {
      sendMidi(cc.channel, cc.index, 0);
    }
  }
};
