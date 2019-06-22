import { $$ } from './keypad';

function sendLevel(e) {
  $$.HOST.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

  e.notify = e.value ? `${Math.round(e.value / 1.27)}%` : 'OFF';
}

function volumeLevel(e) {
  $$.HOST.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
}

function toggleMute(e) {
  $$.HOST.trackBank.getTrack(e.track).getMute().set(e.toggle);
}

function toggleSolo(e) {
  if (e.toggle) {
    $$.HOST.trackBank.getTrack(e.track).getSolo().toggle();
  }
}

function toggleArm(e) {
  if (e.toggle) {
    $$.HOST.trackBank.getTrack(e.track).getArm().toggle();
  }
}

export default {
  sendLevel,
  volumeLevel,
  toggleMute,
  toggleSolo,
  toggleArm,
};
