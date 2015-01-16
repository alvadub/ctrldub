loadAPI(1);

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

  var cTrack = host.createCursorTrack(3, 0);

  var keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????'),
      pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

  keys.setShouldConsumeEvents(false);
  pads.setShouldConsumeEvents(false);

  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

  RL.CTRACK = cTrack;
  RL.CDEVICE = cTrack.getPrimaryDevice();
  RL.TRACKS = host.createTrackBank(8, 2, 8);
  RL.TRANSPORT = host.createTransport();
  RL.APPLICATION = host.createApplication();

  RL.CC_ACTIONS = userActions() || defaultActions();

  (userMappings() || defaultMappings()).forEach(function(data, i) {
    var e = $(data, i);

    RL.CC_MAPPINGS.push(e);

    switch (e.command) {
      case 'track.mute': RL.TRACKS.getTrack(e.track).getMute().addValueObserver(valueObserver(e)); break;
      case 'track.solo': RL.TRACKS.getTrack(e.track).getSolo().addValueObserver(valueObserver(e)); break;
      case 'track.arm': RL.TRACKS.getTrack(e.track).getArm().addValueObserver(valueObserver(e)); break;
    }
  });

  RL.U_CONTROLS = host.createUserControls(RL.CC_MAPPINGS.length);

  RL.TRANSPORT.addIsRecordingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.RECORD, (RL.IS_RECORDING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addIsPlayingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.PLAY, (RL.IS_PLAYING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addOverdubObserver(function(on) {
    if (!RL.IS_RECORDING) {
      sendMidi(RL.CHANNEL1, RL.RECORD, 0);
    }

    sendMidi(RL.CHANNEL1, RL.RECORDS, (RL.OVERDUB = on) ? 127 : 0);
  });

  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

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

    if (action.type === 'pad' && action.toggle) {
      action.level = action.toggle ? 0 : data2;
    } else if (action.type === 'button') {
      action.toggle = data2 > 65;
    } else {
      action.level = data2;
    }

    execute(action);
  }
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}

function valueObserver(e) {
  return function (state) {
    if (e.inverted) {
      state = !state;
    }

    RL.CC_STATE[e.offset] = state;

    if (!state) {
      sendMidi(e.channel, e.index, 0);
    }
  };
}

function defaultActions() {
  return {
    'track.send': function(e) {
      e.track.getSend(0).set(e.value, 128);
    },
    'track.mute': function(e) {
      e.track.getMute().set(e.toggle);
    },
    'track.solo': function(e) {
      if (e.toggle) {
        e.track.getSolo().toggle();
      }
    },
    'track.arm': function(e) {
      if (e.toggle) {
        e.track.getArm().toggle();
      }
    }
  };
}

function defaultMappings() {
  return [
    '0:57:177::E', '0:65:177::ES', '0:73:177::EB', '0:81:177::EBS',
    '0:89:177::K', '0:97:177::K',
    '0:8:177:track.mute:BI', '0:16:177::BIS',
    '0:24:177:track.solo:B', '0:32:177::BS',
    '0:40:177:track.arm:B', '0:49:177::BS',
    '0:0:177:track.send:F',
    '0:44:148::PM', '0:44:132::PN',
    '0:36:148::PM', '0:36:132::PN',
    '0:121:180::P', '0:113:180::P'
  ];
}
