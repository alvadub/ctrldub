import actionFor from './action-for';
import execute from './execute';
import initialize from './initialize';
import teardown from './teardown';
import add from './add';
import set from './set';

export default class KeyPad {
  constructor() {
    this.PLAY = 105;
    this.PLAYS = 108;
    this.STOP = 106;
    this.STOPS = 109;
    this.RECORD = 107;
    this.RECORDS = 110;

    this.OCTAVE_DOWNS = 111;
    this.OCTAVE_UPS = 112;
    this.CHANNEL1 = 177;
    this.TRACKS = 16;

    this.OVERDUB = false;
    this.IS_PLAYING = false;
    this.IS_RECORDING = false;

    this.CC_STATE = {};

    this.CC_TRACKS = [];
    this.CC_MAPPINGS = {};

    this.CC_USER_STATE = {};
    this.CC_USER_ACTIONS = {};

    this.actionFor = actionFor;
    this.execute = execute;

    this.initialize = initialize;
    this.teardown = teardown;

    this.add = add;
    this.set = set;
  }
}

KeyPad.VENDOR = 'Reloop';
KeyPad.PRODUCT = 'KeyPad';
KeyPad.VERSION = '1.0';

KeyPad.ID1 = 'Reloop KeyPad';
KeyPad.ID2 = 'Reloop KeyPad MIDI 1';
KeyPad.ID3 = 'F0 AD F5 01 11 02 F7';
KeyPad.ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

KeyPad.GUID = 'BD3405A8-9C77-449F-BA6D-2E91D9873878';
