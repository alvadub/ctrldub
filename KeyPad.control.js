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

  var fixed_controls = userMappings() || defaultMappings();

  fixed_controls.forEach(function(data, i) {
    var e = $(data, i);

    if (!RL.CC_MAPPINGS[e.channel]) {
      RL.CC_MAPPINGS[e.channel] = {};
    }

    RL.CC_MAPPINGS[e.channel][e.index] = e;

    switch (e.command) {
      case 'track.mute': RL.TRACKS.getTrack(e.track).getMute().addValueObserver(valueObserver(e)); break;
      case 'track.solo': RL.TRACKS.getTrack(e.track).getSolo().addValueObserver(valueObserver(e)); break;
      case 'track.arm': RL.TRACKS.getTrack(e.track).getArm().addValueObserver(valueObserver(e)); break;
    }
  });

  RL.U_CONTROLS = host.createUserControls(fixed_controls.length);

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

    sendMidi(e.channel, e.index, state ? 127 : 0);
  };
}

function defaultActions() {
  return {
    'track.send': function(e) {
      RL.TRACKS.getTrack(e.track).getSend(e.params[0]).set(e.value, 128);
    },
    'track.mute': function(e) {
      RL.TRACKS.getTrack(e.track).getMute().set(e.toggle);
    },
    'track.solo': function(e) {
      if (e.toggle) {
        RL.TRACKS.getTrack(e.track).getSolo().toggle();
      }
    },
    'track.arm': function(e) {
      if (e.toggle) {
        RL.TRACKS.getTrack(e.track).getArm().toggle();
      }
    },
    'track.vol': function(e) {
      RL.TRACKS.getTrack(e.track).getVolume().set(e.level, 128);
    }
  };
}

function defaultMappings() {
  return [
    '0:57:177:E',                 '1:58:177:E',                 '2:59:177:E',                 '3:60:177:E',                 '4:61:177:E',                 '5:62:177:E',                 '6:63:177:E',                 '7:64:177:E',
    '0:89:177:K:track.send:0',    '1:90:177:K:track.send:0',    '2:91:177:K:track.send:0',    '3:92:177:K:track.send:0',    '4:93:177:K:track.send:0',    '5:94:177:K:track.send:0',    '6:95:177:K:track.send:0',    '7:96:177:K:track.send:0',
    '0:97:177:K:track.send:1',    '1:98:177:K:track.send:1',    '2:99:177:K:track.send:1',    '3:100:177:K:track.send:1',   '4:101:177:K:track.send:1',   '5:102:177:K:track.send:1',   '6:103:177:K:track.send:1',   '7:104:177:K:track.send:1',
    '0:8:177:BI:track.mute',      '1:9:177:BI:track.mute',      '2:10:177:BI:track.mute',     '3:11:177:BI:track.mute',     '4:12:177:BI:track.mute',     '5:13:177:BI:track.mute',     '6:14:177:BI:track.mute',     '7:15:177:BI:track.mute',
    '0:24:177:B:track.solo',      '1:25:177:B:track.solo',      '2:26:177:B:track.solo',      '3:27:177:B:track.solo',      '4:28:177:B:track.solo',      '5:29:177:B:track.solo',      '6:30:177:B:track.solo',      '7:31:177:B:track.solo',
    '0:40:177:B:track.arm',       '1:41:177:B:track.arm',       '2:42:177:B:track.arm',       '3:43:177:B:track.arm',       '4:44:177:B:track.arm',       '5:45:177:B:track.arm',       '6:46:177:B:track.arm',       '7:47:177:B:track.arm',
    '0:0:177:F:track.vol',        '1:1:177:F:track.vol',        '2:2:177:F:track.vol',        '3:3:177:F:track.vol',        '4:4:177:F:track.vol',        '5:5:177:F:track.vol',        '6:6:177:F:track.vol',        '7:7:177:F:track.vol',
    '0:44:148:PM', '0:44:132:PN', '1:45:148:PM', '1:45:132:PN', '2:46:148:PM', '2:46:132:PN', '3:47:148:PM', '3:47:132:PN', '4:48:148:PM', '4:48:132:PN', '5:49:148:PM', '5:49:132:PN', '6:50:148:PM', '6:50:132:PN', '7:51:148:PM', '7:51:132:PN',
    '0:36:148:PM', '0:36:132:PN', '1:37:148:PM', '1:37:132:PN', '2:38:148:PM', '2:38:132:PN', '3:39:148:PM', '3:39:132:PN', '4:40:148:PM', '4:40:132:PN', '5:41:148:PM', '5:41:132:PN', '6:42:148:PM', '6:42:132:PN', '7:43:148:PM', '7:43:132:PN',
    '0:121:180:P',                '1:122:180:P',                '2:123:180:P',                '3:124:180:P',                '4:125:180:P',                '5:126:180:P',                '6:127:180:P',                '7:0:179:P',
    '0:113:180:P',                '1:114:180:P',                '2:115:180:P',                '3:116:180:P',                '4:117:180:P',                '5:118:180:P',                '6:119:180:P',                '7:120:180:P'
  ];
}
