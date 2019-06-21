export function sendLevel(e) {
  this.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

  e.notify = e.value ? `${Math.round(e.value / 1.27)}%` : 'OFF';
}

export function volumeLevel(e) {
  this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
}

export function toggleMute(e) {
  this.trackBank.getTrack(e.track).getMute().set(e.toggle);
}

export function toggleSolo(e) {
  if (e.toggle) {
    this.trackBank.getTrack(e.track).getSolo().toggle();
  }
}

export function toggleArm(e) {
  if (e.toggle) {
    this.trackBank.getTrack(e.track).getArm().toggle();
  }
}
