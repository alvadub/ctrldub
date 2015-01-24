DEBUG = 0;

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

  RL.TRACKS = host.createTrackBank(8, 2, 8);
  RL.TRANSPORT = host.createTransport();
  RL.CURSORTRACK = host.createCursorTrack(8, 2);
  RL.CURSORDEVICE = host.createCursorDevice();

  for (var i = 0, c = 8; i < c; i += 1) {
    RL.TRACKS.getTrack(i).addIsSelectedObserver(trackObserver(i));
    RL.TRACKS.getTrack(i).addNameObserver(20, '', nameObserver(i, RL.CC_TRACKS));
  }

  RL.CURSORDEVICE.addNameObserver(20, '', nameObserver('primaryDevice', RL.CC_STATE));

  RL.CC_ACTIONS = userActions() || defaultActions();

  var CC_FIXED = (userMappings() || defaultMappings());

  RL.U_CONTROLS = host.createUserControls(CC_FIXED.length);

  CC_FIXED.forEach(function(data, i) {
    var e = $(data, i);

    RL.CC_MAPPINGS[e.channel + '#' + e.index] = e;

    switch (e.command) {
      case 'mute': RL.TRACKS.getTrack(e.track).getMute().addValueObserver(valueObserver(e)); break;
      case 'solo': RL.TRACKS.getTrack(e.track).getSolo().addValueObserver(valueObserver(e)); break;
      case 'arm': RL.TRACKS.getTrack(e.track).getArm().addValueObserver(valueObserver(e)); break;

      default:
        var c = RL.U_CONTROLS.getControl(e.offset);

        c.setLabel('CC' + (e.offset + 1));
        c.setIndication(true);
      break;
    }
  });

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
        var old = RL.CC_LAST[action.offset] || 0,
            diff = Math.max(old, data2) - Math.min(old, data2);

        if (old !== data2) {
          action.range = data2 < old ? -1 : 1;
        }

        if (data2 === 0 || data2 === 127) {
          action.range = data2 ? 1 : -1;
        }

        RL.CC_LAST[action.offset] = data2;
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

function nameObserver(k, set) {
  return function(value) {
    if (!value && set instanceof Array) {
      Array.prototype.splice.call(set, k, 1)
    } else {
      set[k] = value;
    }
  };
}

function trackObserver(i) {
  return function(state) {
    if (state) {
      RL.CC_STATE['activeTrack'] = i;

      if (RL.CC_TRACKS[i]) {
        host.showPopupNotification(RL.CC_TRACKS[i]);
      }
    }
  };
}

function valueObserver(e) {
  return function(state) {
    if (e.inverted) {
      state = !state;
    }

    RL.CC_STATE[e.offset] = state;

    sendMidi(e.channel, e.index, state ? 127 : 0);
  };
}

function defaultActions() {
  return {
    device: function(e) {
      this.cDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();

      if (RL.CC_STATE['primaryDevice']) {
        e.label = RL.CC_STATE['primaryDevice'];
      } else {
        e.notify = false;
      }
    },
    track: function(e) {
      var old = RL.CC_STATE['activeTrack'] || 0;

      if (e.range > 0) {
        old += 1;
      } else {
        old -= 1;
      }

      var fixed = Math.min(RL.CC_TRACKS.length - 1, Math.max(0, old));

      if (RL.CC_TRACKS[fixed]) {
        this.trackBank.getTrack(fixed).select();

        e.label = RL.CC_TRACKS[fixed];
      } else {
        e.label = fixed;
      }

      RL.CC_STATE['activeTrack'] = fixed;
    },
    mute: function(e) {
      this.trackBank.getTrack(e.track).getMute().set(e.toggle);
    },
    solo: function(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getSolo().toggle();
      }
    },
    arm: function(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getArm().toggle();
      }
    },
    vol: function(e) {
      this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
    }
  };
}

function defaultMappings() {
  var PAGE_1 = [
    // Channels 1-8 (normal)
    '0:177:57:E:track', '1:177:58:E:device', '2:177:59:E', '3:177:60:E', '4:177:61:E', '5:177:62:E', '6:177:63:E', '7:177:64:E',
    '0:177:89:K', '1:177:90:K', '2:177:91:K', '3:177:92:K', '4:177:93:K', '5:177:94:K', '6:177:95:K', '7:177:96:K',
    '0:177:97:K', '1:177:98:K', '2:177:99:K', '3:177:100:K', '4:177:101:K', '5:177:102:K', '6:177:103:K', '7:177:104:K',
    '0:177:8:BI:mute', '1:177:9:BI:mute', '2:177:10:BI:mute', '3:177:11:BI:mute', '4:177:12:BI:mute', '5:177:13:BI:mute', '6:177:14:BI:mute', '7:177:15:BI:mute',
    '0:177:24:B:solo', '1:177:25:B:solo', '2:177:26:B:solo', '3:177:27:B:solo', '4:177:28:B:solo', '5:177:29:B:solo', '6:177:30:B:solo', '7:177:31:B:solo',
    '0:177:40:B:arm', '1:177:41:B:arm', '2:177:42:B:arm', '3:177:43:B:arm', '4:177:44:B:arm', '5:177:45:B:arm', '6:177:46:B:arm', '7:177:47:B:arm',
    '0:177:0:F', '1:177:1:F', '2:177:2:F', '3:177:3:F', '4:177:4:F', '5:177:5:F', '6:177:6:F', '7:177:7:F',
    '0:148:44:PM', '0:132:44:PN', '1:148:45:PM', '1:132:45:PN', '2:148:46:PM', '2:132:46:PN', '3:148:47:PM', '3:132:47:PN', '4:148:48:PM', '4:132:48:PN', '5:148:49:PM', '5:132:49:PN', '6:148:50:PM', '6:132:50:PN', '7:148:51:PM', '7:132:51:PN',
    '0:148:36:PM', '0:132:36:PN', '1:148:37:PM', '1:132:37:PN', '2:148:38:PM', '2:132:38:PN', '3:148:39:PM', '3:132:39:PN', '4:148:40:PM', '4:132:40:PN', '5:148:41:PM', '5:132:41:PN', '6:148:42:PM', '6:132:42:PN', '7:148:43:PM', '7:132:43:PN',
    '0:180:121:P', '1:180:122:P', '2:180:123:P', '3:180:124:P', '4:180:125:P', '5:180:126:P', '6:180:127:P', '7:179:0:P',
    '0:180:113:P', '1:180:114:P', '2:180:115:P', '3:180:116:P', '4:180:117:P', '5:180:118:P', '6:180:119:P', '7:180:120:P',

    // Channels 1-8 (shift)
    '0:177:65:ES',  '1:177:66:ES',  '2:177:67:ES',  '3:177:68:ES',  '4:177:69:ES',  '5:177:70:ES',  '6:177:71:ES',  '7:177:72:ES',
    '0:177:16:BIS', '1:177:17:BIS', '2:177:18:BIS', '3:177:19:BIS', '4:177:20:BIS', '5:177:21:BIS', '6:177:22:BIS', '7:177:23:BIS',
    '0:177:32:BS',  '1:177:33:BS',  '2:177:34:BS',  '3:177:35:BS',  '4:177:36:BS',  '5:177:37:BS',  '6:177:38:BS',  '7:177:39:BS',
    '0:177:49:BS',  '1:177:50:BS',  '2:177:51:BS',  '3:177:52:BS',  '4:177:53:BS',  '5:177:54:BS',  '6:177:55:BS',  '7:177:56:BS'
  ];

  return PAGE_1;
}
