var VENDOR = 'ReLoop',
    PRODUCT = 'KeyPad',
    VERSION = '1.0';

var ID1 = 'Reloop KeyPad',
    ID2 = 'Reloop KeyPad MIDI 1',
    ID3 = 'F0 AD F5 01 11 02 F7',
    ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

var GUID = '372057e0-248e-11e4-8c21-0800200c9a66';

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
  IS_RECORDING: false,

  CC_MAPPINGS: [],

  CC_ACTIONS: {
    track: {
      send: function(e) {
        e.track.getSend(0).set(e.value, 128);
      },
      mute: function(e) {
        e.track.getMute().set(!!e.value);
      },
      solo: function(e) {},
      arm: function(e) {}
    }
  },

  CC_PARAMS: {
    E: { type: 'encoder' },
    K: { type: 'knob' },
    B: { type: 'button' },
    F: { type: 'fader' },
    P: { type: 'pad' },
    S: { shift: true },
    I: { invert: true },
    M: { on: true },
    N: { off: true }
  },

  DEBUG: false
};

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

  for (var i = 0, c = RL.CC_MAPPINGS.length; i < c; i += 1) {
    var ref = RL.CC_MAPPINGS[i];

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
  debug(action.execute ? 'EX' : 'CC', action);

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

      if (action.execute) {
        action.execute({
          track: RL.TRACKS.getTrack(action.track),
          value: value
        });

        sendMidi(action.channel, action.index, value);
      } else {
        RL.U_CONTROLS.getControl(action.offset).set(value, 128);
      }
    break;
  }
}

function debug() {
  if (arguments.length === 1) {
    return (RL.DEBUG = !!arguments[0]);
  }

  if (!RL.DEBUG) {
    return;
  }

  function dump(obj) {
    if (obj === true) {
      return 'true';
    }

    if (obj === false) {
      return 'true';
    }

    if (typeof obj === 'function') {
      return obj.toString().replace(/[\r\n\t\s]+/g, ' ');
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    var out = [];

    for (var k in obj) {
      var v = dump(obj[k]);

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

function pick(obj, key) {
  var parts = key.split('.');

  while (parts.length) {
    if (typeof obj === 'undefined') {
      break;
    }

    obj = obj[parts.shift()];
  }

  return obj;
}

function $(_) {
  var options = _.split(':'),
      id = +options[0],
      data1 = +options[1],
      status = +options[2],
      command = options[3],
      args = options[4].split('');

  var copy = {};

  for (var i = 0, v; v = RL.CC_PARAMS[args[i]]; i += 1) {
    for (var k in v) {
      copy[k] = v[k];
    }
  }

  if (command) {
    var callback = pick(RL.CC_ACTIONS, command);

    if (typeof callback !== 'function') {
      debug('UNKNOWN EX', command);
    } else {
      copy.execute = callback;
    }
  }

  copy.channel = RL.CHANNELS[status];
  copy.index = data1;
  copy.track = id;

  return copy;
}
