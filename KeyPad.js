var VENDOR = 'ReLoop',
    PRODUCT = 'KeyPad',
    VERSION = '1.0';

var ID1 = 'Reloop KeyPad',
    ID2 = 'Reloop KeyPad MIDI 1',
    ID3 = 'F0 AD F5 01 11 02 F7',
    ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

var GUID = '372057e0-248e-11e4-8c21-0800200c9a66';

var E = { type: 'encoder' },
    K = { type: 'knob' },
    B = { type: 'button' },
    F = { type: 'fader' },
    P = { type: 'pad' },
    S = { shift: true },
    I = { invert: true },
    M = { on: true },
    N = { off: true };

function $(id, data1, status) {
  var copy = {},
      args = Array.prototype.slice.call(arguments, 3);

  for (var i = 0, v; v = args[i]; i += 1) {
    for (var k in v) {
      copy[k] = v[k];
    }
  }

  copy.channel = RL.CHANNELS[status];
  copy.index = data1;
  copy.track = id;

  return copy;
}

var RL = {
  PLAY: 105,
  PLAYS: 108,
  STOP: 106,
  STOPS: 109,
  RECORD: 107,
  RECORDS: 110,

  OCTAVE_DOWNS: 111,
  OCTAVE_UPS: 112,

  CHANNELS: [176, 177, 178, 179, 180, 144, 128],

  OVERDUB: false,
  IS_PLAYING: false,
  IS_RECORDING: false
};

RL.MAPPINGS = [
  // #1
  $(0, 57, 0, E), $(0, 65, 0, E, S), $(0, 73, 0, E, B), $(0, 81, 0, E, B, S), // encoder (mixed)
  $(0, 89, 0, K), $(0, 97, 0, K), // knobs (singles)
  $(0, 8, 0, B, I), $(0, 16, 0, B, I, S), // mute (inverted-shift)
  $(0, 24, 0, B), $(0, 32, 0, B, S), // solo (shift)
  $(0, 40, 0, B), $(0, 49, 0, B, S), // arm (shift)
  $(0, 0, 0, F), // fader (single)
  $(0, 44, 5, P, M), $(0, 44, 6, P, N), // pad1 (on-off)
  $(0, 36, 5, P, M), $(0, 36, 6, P, N), // pad2 (on-off)
  $(0, 121, 0, P), $(0, 113, 0, P) // pad1, pad2 (cc-mode)
];

function actionFor(status, data1, data2) {
  // RECORDING
  if (data1 === RL.PLAY) {
    return { type: 'play' };
  } if (data1 === RL.PLAYS) {
    return { type: 'play-all' };
  } else if (data1 === RL.STOP) {
    return { type: 'stop' };
  } else if (data1 === RL.STOPS) {
    return { type: 'stop-all' };
  } else if (data1 === RL.RECORD) {
    return { type: 'record' };
  } else if (data1 === RL.RECORDS) {
    return { type: 'overdub' };
  }

  for (var i = 0, c = RL.MAPPINGS.length; i < c; i += 1) {
    var ref = RL.MAPPINGS[i];

    if (ref.channel === status && ref.index === data1) {
      var copy = {};

      for (var k in ref) {
        copy[k] = ref[k];
      }

      copy.offset = i;

      return copy;
    }
  }
}

function execute(action) {
  debug(action);

  switch (action.type) {
    case 'overdub':
      if (action.toggle) {
        RL.TRANSPORT.toggleOverdub();
      }
    break;

    case 'record':
      if (action.toggle) {
        RL.TRANSPORT.record();
        RL.IS_RECORDING = !RL.IS_RECORDING;
      }
    break;

    case 'play':
      if (action.toggle) {
        RL.TRANSPORT.play();
      }
    break;

    case 'play-all':
      println('TODO');
    break;

    case 'stop':
      if (action.toggle) {
        if (RL.IS_RECORDING) {
          RL.TRANSPORT.record();
        }

        RL.IS_RECORDING = false;
        RL.IS_PLAYING = false;

        RL.TRANSPORT.stop();
      }
    break;

    case 'stop-all':
      RL.TRACKS.getClipLauncherScenes().stop();
    break;

    default:
      var value;

      if (typeof action.level === 'number') {
        value = action.level;
      } else {
        value = [127, 0][+(action.on || action.toggle)];
      }

      RL.U_CONTROLS.getControl(action.offset).set(value, 128);
    break;
  }
}

function debug() {
  function dump(obj) {
    if (obj === true) {
      return 'true';
    }

    if (obj === false) {
      return 'true';
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    var out = [];

    for (var k in obj) {
      var v = typeof obj[k] === 'object' ? dump(obj[k]) : obj[k];

      out.push(obj instanceof Array ? v : (k + ': ' + v));
    }

    if (obj instanceof Array) {
      return '[ ' + out.join(', ') + ' ]';
    }

    return '{ ' + out.join(', ') + ' }';
  }

  var out = [];

  for (var i = 0, a; typeof (a = arguments[i]) !== 'undefined'; i += 1) {
    out.push(dump(a));
  }

  println('> ' + out.join(' '));
}
