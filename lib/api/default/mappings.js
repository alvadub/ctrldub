'use strict';

var PAGE_1 = [
  [
    { channel: 177, index: 57, type: 'encoder', command: 'setTrack' },
    { channel: 177, index: 89, type: 'knob' },
    { channel: 177, index: 97, type: 'knob' },
    { channel: 177, index: 8, type: 'button', inverted: true, command: 'toggleMute', track: 0, shift: { channel: 177, index: 16, grouped: true, command: 'scenePlay', scene: 0 } },
    { channel: 177, index: 24, type: 'button', command: 'toggleSolo', track: 0 },
    { channel: 177, index: 40, type: 'button', command: 'toggleArm', track: 0 },
    { channel: 177, index: 0, type: 'fader'/*, command: 'volumeLevel', track: 0*/ },
    { channel: 180, index: 121, type: 'button' },
    { channel: 180, index: 113, type: 'button' }
  ],
  [
    { channel: 177, index: 58, type: 'encoder', command: 'setDevice' },
    { channel: 177, index: 90, type: 'knob' },
    { channel: 177, index: 98, type: 'knob' },
    { channel: 177, index: 9, type: 'button', inverted: true, command: 'toggleMute', track: 1, shift: { channel: 177, index: 17, grouped: true, command: 'scenePlay', scene: 1 } },
    { channel: 177, index: 25, type: 'button', command: 'toggleSolo', track: 1 },
    { channel: 177, index: 41, type: 'button', command: 'toggleArm', track: 1 },
    { channel: 177, index: 1, type: 'fader'/*, command: 'volumeLevel', track: 1*/ },
    { channel: 180, index: 122, type: 'button' },
    { channel: 180, index: 114, type: 'button' }
  ],
  [
    { channel: 177, index: 59, type: 'encoder' },
    { channel: 177, index: 91, type: 'knob' },
    { channel: 177, index: 99, type: 'knob' },
    { channel: 177, index: 10, type: 'button', inverted: true, command: 'toggleMute', track: 2, shift: { channel: 177, index: 18, grouped: true, command: 'scenePlay', scene: 2 } },
    { channel: 177, index: 26, type: 'button', command: 'toggleSolo', track: 2 },
    { channel: 177, index: 42, type: 'button', command: 'toggleArm', track: 2 },
    null, //{ channel: 177, index: 2, type: 'fader'/*, command: 'volumeLevel', track: 2*/ },
    { channel: 180, index: 123, type: 'button' },
    { channel: 180, index: 115, type: 'button' }
  ],
  [
    { channel: 177, index: 60, type: 'encoder' },
    { channel: 177, index: 92, type: 'knob' },
    null, //{ channel: 177, index: 100, type: 'knob' },
    { channel: 177, index: 11, type: 'button', inverted: true, command: 'toggleMute', track: 3, shift: { channel: 177, index: 19, grouped: true, command: 'scenePlay', scene: 3 } },
    { channel: 177, index: 27, type: 'button', command: 'toggleSolo', track: 3 },
    { channel: 177, index: 43, type: 'button', command: 'toggleArm', track: 3 },
    { channel: 177, index: 3, type: 'fader'/*, command: 'volumeLevel', track: 3*/ },
    { channel: 180, index: 124, type: 'button' },
    { channel: 180, index: 116, type: 'button' }
  ],
  [
    { channel: 177, index: 61, type: 'encoder' },
    { channel: 177, index: 93, type: 'knob' },
    { channel: 177, index: 101, type: 'knob' },
    { channel: 177, index: 12, type: 'button', inverted: true, command: 'toggleMute', track: 4, shift: { channel: 177, index: 20, grouped: true, command: 'scenePlay', scene: 4 } },
    { channel: 177, index: 28, type: 'button', command: 'toggleSolo', track: 4 },
    { channel: 177, index: 44, type: 'button', command: 'toggleArm', track: 4 },
    { channel: 177, index: 4, type: 'fader'/*, command: 'volumeLevel', track: 4*/ },
    { channel: 180, index: 125, type: 'button' },
    { channel: 180, index: 117, type: 'button' }
  ],
  [
    { channel: 177, index: 62, type: 'encoder' },
    { channel: 177, index: 94, type: 'knob' },
    { channel: 177, index: 102, type: 'knob' },
    { channel: 177, index: 13, type: 'button', inverted: true, command: 'toggleMute', track: 5, shift: { channel: 177, index: 21, grouped: true, command: 'scenePlay', scene: 5 } },
    { channel: 177, index: 29, type: 'button', command: 'toggleSolo', track: 5 },
    { channel: 177, index: 45, type: 'button', command: 'toggleArm', track: 5 },
    { channel: 177, index: 5, type: 'fader'/*, command: 'volumeLevel', track: 5*/ },
    { channel: 180, index: 126, type: 'button' },
    { channel: 180, index: 118, type: 'button' }
  ],
  [
    { channel: 177, index: 63, type: 'encoder' },
    { channel: 177, index: 95, type: 'knob' },
    { channel: 177, index: 103, type: 'knob' },
    { channel: 177, index: 14, type: 'button', inverted: true, command: 'toggleMute', track: 6, shift: { channel: 177, index: 22, grouped: true, command: 'scenePlay', scene: 6 } },
    { channel: 177, index: 30, type: 'button', command: 'toggleSolo', track: 6 },
    { channel: 177, index: 46, type: 'button', command: 'toggleArm', track: 6 },
    { channel: 177, index: 6, type: 'fader'/*, command: 'volumeLevel', track: 6*/ },
    { channel: 180, index: 127, type: 'button' },
    { channel: 180, index: 119, type: 'button' }
  ],
  [
    { channel: 177, index: 64, type: 'encoder' },
    { channel: 177, index: 96, type: 'knob' },
    { channel: 177, index: 104, type: 'knob' },
    { channel: 177, index: 15, type: 'button', inverted: true, command: 'toggleMute', track: 7, shift: { channel: 177, index: 23, grouped: true, command: 'scenePlay', scene: 7 } },
    { channel: 177, index: 31, type: 'button', command: 'toggleSolo', track: 7 },
    { channel: 177, index: 47, type: 'button', command: 'toggleArm', track: 7 },
    { channel: 177, index: 7, type: 'fader'/*, command: 'volumeLevel', track: 7*/ },
    { channel: 179, index: 0, type: 'button' },
    { channel: 180, index: 120, type: 'button' }
  ]
];

var PAGE_2 = [];

module.exports = [PAGE_1, PAGE_2];
