export const $$ = {
  HOST: null,
  OVERDUB: false,
  IS_PLAYING: false,
  IS_RECORDING: false,
};

export const PLAY = 105;
export const PLAYS = 108;
export const STOP = 106;
export const STOPS = 109;
export const RECORD = 107;
export const RECORDS = 110;

export const OCTAVE_DOWNS = 111;
export const OCTAVE_UPS = 112;
export const CHANNEL1 = 177;
export const TRACKS = 16;

export const CC_STATE = {};

export const CC_TRACKS = [];
export const CC_MAPPINGS = {};

export const CC_USER_STATE = {};

export const CC_USER_ACTIONS = {
  sendLevel(e) {
    $$.HOST.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

    e.notify = e.value ? `${Math.round(e.value / 1.27)}%` : 'OFF';
  },
  volumeLevel(e) {
    $$.HOST.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
  },
  toggleMute(e) {
    $$.HOST.trackBank.getTrack(e.track).getMute().set(e.toggle);
  },
  toggleSolo(e) {
    if (e.toggle) {
      $$.HOST.trackBank.getTrack(e.track).getSolo().toggle();
    }
  },
  toggleArm(e) {
    if (e.toggle) {
      $$.HOST.trackBank.getTrack(e.track).getArm().toggle();
    }
  },
};

export const VENDOR = 'Reloop';
export const PRODUCT = 'KeyPad';
export const VERSION = '1.0';

export const ID1 = 'Reloop KeyPad';
export const ID2 = 'Reloop KeyPad MIDI 1';
export const ID3 = 'F0 AD F5 01 11 02 F7';
export const ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

export const GUID = 'BD3405A8-9C77-449F-BA6D-2E91D9873878';
