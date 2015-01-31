function defaultMappings() {
  var PAGE_1 = [
    [
      { channel: 177, index: 57, type: 'encoder' },
      { channel: 177, index: 89, type: 'knob' },
      { channel: 177, index: 97, type: 'knob' },
      { channel: 177, index: 8, type: 'button', inverted: true },
      { channel: 177, index: 24, type: 'button' },
      { channel: 177, index: 40, type: 'button' },
      { channel: 177, index: 0, type: 'fader' }
    ],
    [
      { channel: 177, index: 58, type: 'encoder' },
      { channel: 177, index: 90, type: 'knob' },
      { channel: 177, index: 98, type: 'knob' },
      { channel: 177, index: 9, type: 'button', inverted: true },
      { channel: 177, index: 25, type: 'button' },
      { channel: 177, index: 41, type: 'button' },
      { channel: 177, index: 1, type: 'fader' }
    ],
    [
      { channel: 177, index: 59, type: 'encoder' },
      { channel: 177, index: 91, type: 'knob' },
      { channel: 177, index: 99, type: 'knob' },
      { channel: 177, index: 10, type: 'button', inverted: true },
      { channel: 177, index: 26, type: 'button' },
      { channel: 177, index: 42, type: 'button' },
      { channel: 177, index: 2, type: 'fader' }
    ],
    [
      { channel: 177, index: 60, type: 'encoder' },
      { channel: 177, index: 92, type: 'knob' },
      { channel: 177, index: 100, type: 'knob' },
      { channel: 177, index: 11, type: 'button', inverted: true },
      { channel: 177, index: 27, type: 'button' },
      { channel: 177, index: 43, type: 'button' },
      { channel: 177, index: 3, type: 'fader' }
    ],
    [
      { channel: 177, index: 61, type: 'encoder' },
      { channel: 177, index: 93, type: 'knob' },
      { channel: 177, index: 101, type: 'knob' },
      { channel: 177, index: 12, type: 'button', inverted: true },
      { channel: 177, index: 28, type: 'button' },
      { channel: 177, index: 44, type: 'button' },
      { channel: 177, index: 4, type: 'fader' }
    ],
    [
      { channel: 177, index: 62, type: 'encoder' },
      { channel: 177, index: 94, type: 'knob' },
      { channel: 177, index: 102, type: 'knob' },
      { channel: 177, index: 13, type: 'button', inverted: true },
      { channel: 177, index: 29, type: 'button' },
      { channel: 177, index: 45, type: 'button' },
      { channel: 177, index: 5, type: 'fader' }
    ],
    [
      { channel: 177, index: 63, type: 'encoder' },
      { channel: 177, index: 95, type: 'knob' },
      { channel: 177, index: 103, type: 'knob' },
      { channel: 177, index: 14, type: 'button', inverted: true },
      { channel: 177, index: 30, type: 'button' },
      { channel: 177, index: 46, type: 'button' },
      { channel: 177, index: 6, type: 'fader' }
    ],
    [
      { channel: 177, index: 64, type: 'encoder' },
      { channel: 177, index: 96, type: 'knob' },
      { channel: 177, index: 104, type: 'knob' },
      { channel: 177, index: 15, type: 'button', inverted: true },
      { channel: 177, index: 31, type: 'button' },
      { channel: 177, index: 47, type: 'button' },
      { channel: 177, index: 7, type: 'fader' }
    ]


    // '0:148:44:PM', '0:132:44:PN', '1:148:45:PM', '1:132:45:PN', '2:148:46:PM', '2:132:46:PN', '3:148:47:PM', '3:132:47:PN', '4:148:48:PM', '4:132:48:PN', '5:148:49:PM', '5:132:49:PN', '6:148:50:PM', '6:132:50:PN', '7:148:51:PM', '7:132:51:PN',
    // '0:148:36:PM', '0:132:36:PN', '1:148:37:PM', '1:132:37:PN', '2:148:38:PM', '2:132:38:PN', '3:148:39:PM', '3:132:39:PN', '4:148:40:PM', '4:132:40:PN', '5:148:41:PM', '5:132:41:PN', '6:148:42:PM', '6:132:42:PN', '7:148:43:PM', '7:132:43:PN',

    // '0:180:121:PI', '1:180:122:PI', '2:180:123:PI', '3:180:124:PI', '4:180:125:PI', '5:180:126:PI', '6:180:127:PI', '7:179:0:PI',
    // '0:180:113:PI', '1:180:114:PI', '2:180:115:PI', '3:180:116:PI', '4:180:117:PI', '5:180:118:PI', '6:180:119:PI', '7:180:120:PI',

    // // Channels 1-8 (shift)
    // '0:177:65:ES:track',  '1:177:66:ES:device',  '2:177:67:ES',  '3:177:68:ES',  '4:177:69:ES',  '5:177:70:ES',  '6:177:71:ES',  '7:177:72:ES',
    // '0:177:16:BIS', '1:177:17:BIS', '2:177:18:BIS', '3:177:19:BIS', '4:177:20:BIS', '5:177:21:BIS', '6:177:22:BIS', '7:177:23:BIS',
    // '0:177:32:BSG:scene', '1:177:33:BSG:scene', '2:177:34:BSG:scene', '3:177:35:BSG:scene', '4:177:36:BSG:scene', '5:177:37:BSG:scene', '6:177:38:BSG:scene', '7:177:39:BSG:scene',
    // '8:177:49:BSG:scene', '9:177:50:BSG:scene', '10:177:51:BSG:scene', '11:177:52:BSG:scene', '12:177:53:BSG:scene', '13:177:54:BSG:scene', '14:177:55:BSG:scene', '15:177:56:BSG:scene'
  ];

  var PAGE_2 = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
  ];

  return [PAGE_1, PAGE_2];
}
