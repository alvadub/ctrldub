import { get, set } from './state';

export default {
  scenePlay(e) {
    this.trackBank.launchScene(e.scene);

    set('currentScene', e);

    if (this.all) {
      this.all.forEach((cc) => {
        sendMidi(cc.channel, cc.index, cc.scene === e.scene ? 127 : 0);
      });
    }

    e.notify = `Scene ${e.scene + 1}`;
  },
  setDevice(e) {
    this.cursorDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();

    e.notify = get('primaryDevice');
  },
  setTrack(e) {
    const total = get('currentTracks.length') - 1;

    let track = get('activeTrack');

    if (e.range > 0) {
      track += 1;
    } else {
      track -= 1;
    }

    const index = Math.min(total, Math.max(0, track));

    this.trackBank.getTrack(index).select();

    e.notify = get('currentTracks', index);
  },
  sendLevel(e) {
    this.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

    e.notify = e.value ? `${Math.round(e.value / 1.27)}%` : 'OFF';
  },
  volumeLevel(e) {
    this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
  },
  toggleMute(e) {
    this.trackBank.getTrack(e.track).getMute().set(e.toggle);
  },
  toggleSolo(e) {
    if (e.toggle) {
      this.trackBank.getTrack(e.track).getSolo().toggle();
    }
  },
  toggleArm(e) {
    if (e.toggle) {
      this.trackBank.getTrack(e.track).getArm().toggle();
    }
  },
  onStop() {
    const cc = get('currentScene');

    if (cc) {
      sendMidi(cc.channel, cc.index, 0);
    }
  },
};
