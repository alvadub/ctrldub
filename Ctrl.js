var VENDOR = 'ReLoop',
    PRODUCT = 'KeyPad',
    VERSION = '1.0';

var ID1 = 'Reloop KeyPad',
    ID2 = 'Reloop KeyPad MIDI 1',
    ID3 = 'F0 AD F5 01 11 02 F7',
    ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

var GUID = '372057e0-248e-11e4-8c21-0800200c9a66';

var RL = {
  KNOB1:    [57, 58, 59, 60, 61, 62, 63, 64],
  KNOB1S:   [65, 66, 67, 68, 69, 70, 71, 72],
  KNOB1P:   [73, 74, 75, 76, 77, 78, 79, 80],
  KNOB1PS:  [81, 82, 83, 84, 85, 86, 87, 88],
  KNOB2:    [89, 90, 91, 92, 93, 94, 95, 96],
  KNOB3:    [97, 98, 99, 100, 101, 102, 103, 104],

  FADER:    [0, 1, 2, 3, 4, 5, 6, 7],

  BUTTON1:  [8, 9, 10, 11, 12, 13, 14, 15],
  BUTTON1S: [16, 17, 18, 19, 20, 21, 22, 23],
  BUTTON2:  [24, 25, 26, 27, 28, 29, 30, 31],
  BUTTON2S: [32, 33, 34, 35, 36, 37, 38, 39],
  BUTTON3:  [40, 41, 42, 43, 44, 45, 46, 47],
  BUTTON3S: [49, 50, 51, 52, 53, 54, 55, 56],

  PLAY: 105,
  PLAYS: 108,
  STOP: 106,
  STOPS: 109,
  RECORD: 107,
  RECORDS: 110,

  OCTAVE_DOWNS: 111,
  OCTAVE_UPS: 112,

  CHANNEL1: 177,
  CHANNEL2: 178,

  MUTE: [],
  SOLO: [],
  ARM: [],
  LAUNCH: [],

  OVERDUB: false,

  CURRENT_SCENE: -1,
  CAN_SCROLL_SCENES_DOWN: false,
  CAN_SCROLL_SCENES_UP: false,

  IS_PLAYING: false,
  IS_RECORDING: false
};

function actionFor(status, data1, data2) {
  var params = {};

  // RECORDING
  if (data1 === RL.PLAY) {
    params.type = 'play';
  } if (data1 === RL.PLAYS) {
    params.type = 'play-alls';
  } else if (data1 === RL.STOP) {
    params.type = 'stop';
  } else if (data1 === RL.STOPS) {
    params.type = 'stop-all';
  } else if (data1 === RL.RECORD) {
    params.type = 'record';
  } else if (data1 === RL.RECORDS) {
    params.type = 'overdub';
  }

  function data1IsInRange8(low) {
    return(data1 >= low && data1 <= (low + 7));
  }
  
  // SCENES
  if (data1IsInRange8(RL.BUTTON1S[0])) {
    params.type = 'scene';
    params.index = +(data1 - RL.BUTTON1S[0]);
  } else if (data1 === RL.OCTAVE_DOWNS) {
    params.type = 'down';
  } else if (data1 === RL.OCTAVE_UPS) {
    params.type = 'up';
  }

  // BUTTONS
  if (data1IsInRange8(RL.BUTTON1[0])) {
    params.index = { top: data1 - RL.BUTTON1[0] };
  } else if (data1IsInRange8(RL.BUTTON2[0])) {
    params.index = { middle: data1 - RL.BUTTON2[0] };
  } else if (data1IsInRange8(RL.BUTTON3[0])) {
    params.index = { bottom: data1 - RL.BUTTON3[0] };
  }

  if (data1IsInRange8(RL.BUTTON1S[0])) {
    params.shift = true;
    params.index = { top: data1 - RL.BUTTON1S[0] };
  } else if (data1IsInRange8(RL.BUTTON2S[0])) {
    params.shift = true;
    params.index = { middle: data1 - RL.BUTTON2S[0] };
  } else if (data1IsInRange8(RL.BUTTON3S[0])) {
    params.shift = true;
    params.index = { bottom: data1 - RL.BUTTON3S[0] };
  }

  if (params.index) {
    params.type = 'button';
  }

  // ROTATORIES / SHIFT
  if (data1IsInRange8(RL.KNOB1[0])) {
    params.type = 'rotatory'
    params.index = data1 - RL.KNOB1[0];
  } else if (data1IsInRange8(RL.KNOB1S[0])) {
    params.shift = true;
    params.type = 'rotatory'
    params.index = data1 - RL.KNOB1S[0];
  }

  // ROTATORIES / BUTTON
  if (data1IsInRange8(RL.KNOB1P[0])) {
    params.type = 'button'
    params.index = data1 - RL.KNOB1P[0];
  } else if (data1IsInRange8(RL.KNOB1PS[0])) {
    params.shift = true;
    params.type = 'button'
    params.index = data1 - RL.KNOB1PS[0];
  }

  if (params.type === 'button' && (data2 > 65)) {
    params.active = true;
  }

  // KNOBS / FADERS
  if (data1IsInRange8(RL.KNOB2[0])) {
    params.type = 'knob'
    params.left = data1 - RL.KNOB2[0];
  } else if (data1IsInRange8(RL.KNOB3[0])) {
    params.type = 'knob'
    params.right = data1 - RL.KNOB3[0];
  } if (data1IsInRange8(RL.FADER[0])) {
    params.type = 'fader';
    params.index = data1 - RL.FADER[0];
  }

  var isKnob = typeof params.left === 'number' || typeof params.right === 'number';

  if (isKnob || typeof params.index === 'number' && params.type !== 'button') {
    params.level = data2;
  }
  
  return params;
}
