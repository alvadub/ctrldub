DEBUG = 1;

loadAPI(1);

load('Utils.js');
load('KeyPad.js');
load('Actions.js');
load('Mappings.js');

host.defineMidiPorts(1, 1);
host.defineController(VENDOR, PRODUCT, VERSION, GUID);

host.addDeviceNameBasedDiscoveryPair([ID1], [ID1]);
host.addDeviceNameBasedDiscoveryPair([ID2], [ID2]);

host.defineSysexIdentityReply(ID4);

function init() {
  sendSysex(ID3);

  var keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????'),
      pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

  keys.setShouldConsumeEvents(false);
  pads.setShouldConsumeEvents(false);

  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);
  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

  RL.host = {
    trackBank: host.createTrackBank(16, 2, 8),
    transport: host.createTransport(),
    cursorTrack: host.createCursorTrack(16, 2),
    cursorDevice: host.createCursorDevice()
  };

  RL.CC_STATE = {};
  RL.CC_TRACKS = [];
  RL.CC_MAPPINGS = {};

  RL.CC_USER_STATE = {};
  RL.CC_USER_ACTIONS = defaultActions();

  var initializeTracks = function() {
    for (var i = 0, c = 16; i < c; i += 1) {
      RL.CC_TRACKS[i] = RL.host.trackBank.getTrack(i);
      RL.CC_TRACKS[i].addIsSelectedObserver(stateObserver('activeTrack', i, 'scalar'));
      RL.CC_TRACKS[i].addNameObserver(20, '', stateObserver('currentTracks', i, 'list'));
    }
  };

  var stateObserver = function(label, index, type) {
    if (typeof RL.CC_STATE[label] === 'undefined') {
      switch (type) {
        case 'scalar': RL.CC_STATE[label] = index; break;
        case 'list': RL.CC_STATE[label] = []; break;
        default: RL.CC_STATE[label] = {}; break;
      }
    }

    return function(value) {
      if (type === 'io') {
        if (index.inverted) {
          value = !value;
        }

        RL.CC_STATE[label][index.offset] = value;

        sendMidi(index.channel, index.index, value ? 127 : 0);
      } else if (!value) {
        switch (type) {
          case 'list': Array.prototype.splice.call(RL.CC_STATE[label], index, 1); break;
          case 'scalar':
            if (typeof value === 'string') {
              RL.CC_STATE[label] = index;
            }
          break;
        }
      } else {
        switch (type) {
          case 'scalar': RL.CC_STATE[label] = index !== null ? index : value; break;
          default: RL.CC_STATE[label][index] = value; break;
        }
      }
    };
  };

  var initMappings = function(set) {
    RL.host.userControls = host.createUserControls(set.length);

    RL.CC_STATE['commonMappings'] = {};

    set.forEach(function(e) {
      RL.CC_MAPPINGS[e.channel + '#' + e.index] = e;

      if (e.grouped) {
        if (!RL.CC_STATE['commonMappings'][e.command]) {
          RL.CC_STATE['commonMappings'][e.command] = [];
        }

        RL.CC_STATE['commonMappings'][e.command].push(e);
      }

      switch (e.command) {
        case 'mute': RL.CC_TRACKS[e.track].getMute().addValueObserver(stateObserver('commonValues', e, 'io')); break;
        case 'solo': RL.CC_TRACKS[e.track].getSolo().addValueObserver(stateObserver('commonValues', e, 'io')); break;
        case 'arm': RL.CC_TRACKS[e.track].getArm().addValueObserver(stateObserver('commonValues', e, 'io')); break;

        default:
          var c = RL.host.userControls.getControl(e.offset);

          c.setLabel('CC' + (e.offset + 1));
          c.setIndication(true);
        break;
      }
    });
  };

  var stateGetter = function(from, key) {
    if (from.indexOf('.') > 0) {
      key = from.split('.')[1];
      from = from.split('.')[0];
    }

    var obj = (RL.CC_STATE[from] && copy(RL.CC_STATE[from])) ||
              (RL.CC_USER_STATE[from] && copy(RL.CC_USER_STATE[from]));

    if (typeof key !== 'undefined') {
      return obj ? obj[key] : null;
    }

    return obj || null;
  };

  var stateSetter = function(key, value) {
    RL.CC_USER_STATE[key] = value;
  };

  var getterFor = function(key) {
    return function() {
      return RL[key];
    };
  };

  RL.host.cursorDevice.addNameObserver(20, '', stateObserver('primaryDevice', null, 'scalar'));

  RL.host.transport.addIsRecordingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.RECORD, (RL.IS_RECORDING = on) ? 127 : 0);
  });

  RL.host.transport.addIsPlayingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.PLAY, (RL.IS_PLAYING = on) ? 127 : 0);
  });

  RL.host.transport.addOverdubObserver(function(on) {
    if (!RL.IS_RECORDING) {
      sendMidi(RL.CHANNEL1, RL.RECORD, 0);
    }

    sendMidi(RL.CHANNEL1, RL.RECORDS, (RL.OVERDUB = on) ? 127 : 0);
  });


  RL.host.get = stateGetter;
  RL.host.set = stateSetter;

  RL.host.isPlaying = getterFor('IS_PLAYING');
  RL.host.isRecording = getterFor('IS_RECORDING');

  initializeTracks();
  initMappings(defaultMappings());

  println('CONNECTED');
}

function exit() {
  println('DISCONNECTED');
}

function onMidi(status, data1, data2) {
  var action = actionFor(status, data1, data2)

  if (!action) {
    debug('MIDI', status, data1, data2);
  } else {
    if (action.inverted) {
      if (typeof action.toggle === 'boolean') {
        action.toggle = !action.toggle;
      }

      data2 = 127 - data2;

      delete action.inverted;
    }

    switch (action.type) {
      case 'button':
        action.toggle = data2 > 65;
      break;

      case 'encoder':
        if (!RL.CC_STATE['encoderValues']) {
          RL.CC_STATE['encoderValues'] = {};
        }

        var old = RL.CC_STATE['encoderValues'][action.offset] || 0,
            diff = Math.max(old, data2) - Math.min(old, data2);

        if (old !== data2) {
          action.range = data2 < old ? -1 : 1;
        }

        if (data2 === 0 || data2 === 127) {
          action.range = data2 ? 1 : -1;
        }

        RL.CC_STATE['encoderValues'][action.offset] = data2;

      default:
        action.level = data2;
      break;
    }

    execute(action);
  }
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}
