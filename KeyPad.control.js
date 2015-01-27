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
  RL.CC_SCENES = [];
  RL.CC_MAPPINGS = [];
  RL.CC_ACTIONS = userActions();

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
          case 'map': delete RL.CC_STATE[label][index]; break;
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

    set.forEach(function(e) {
      RL.CC_MAPPINGS[e.channel + '#' + e.index] = e;

      switch (e.command) {
        case 'scene':
          RL.CC_SCENES.push(e);
        break;

        case 'mute': tracks[e.track].getMute().addValueObserver(stateObserver('stateTrack', e, 'io')); break;
        case 'solo': tracks[e.track].getSolo().addValueObserver(stateObserver('stateTrack', e, 'io')); break;
        case 'arm': tracks[e.track].getArm().addValueObserver(stateObserver('stateTrack', e, 'io')); break;

        default:
          var c = RL.host.userControls.getControl(e.offset);

          c.setLabel('CC' + (e.offset + 1));
          c.setIndication(true);
        break;
      }
    });
  };

  var tracks = [];

  for (var i = 0, c = 16; i < c; i += 1) {
    tracks[i] = RL.host.trackBank.getTrack(i);
    tracks[i].addIsSelectedObserver(stateObserver('currentTrack', i, 'scalar'));
    tracks[i].addNameObserver(20, '', stateObserver('labelTrack', i, 'map'));
  }

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

  initMappings(userMappings());

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
