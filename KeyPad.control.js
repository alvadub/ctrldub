loadAPI(1);

load('Ctrl.js');

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

  RL.USER_ACTIONS_CC = []
    .concat(RL.BUTTON2S)
    .concat(RL.BUTTON3S)
    .concat(RL.KNOB1)
    .concat(RL.KNOB1S)
    .concat(RL.KNOB1P)
    .concat(RL.KNOB1PS)
    .concat(RL.KNOB2)
    .concat(RL.KNOB3);

  RL.U_CONTROLS = host.createUserControls(RL.USER_ACTIONS_CC.length);

  RL.TRANSPORT.addIsRecordingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.RECORD, (RL.IS_RECORDING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addIsPlayingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.PLAY, (RL.IS_PLAYING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addOverdubObserver(function(on) {
    sendMidi(RL.CHANNEL1, RL.RECORDS, (RL.OVERDUB = on) ? 127 : 0);
  });

  function buttonObserver(index, registry, button, set) {
    return function (on) {
      registry[index] = on;

      sendMidi(RL.CHANNEL1, button[index], set[+on]);
    };
  }

  for (var j = 0, track; j < 8; j += 1) {
    track = RL.TRACKS.getTrack(j);

    track.getMute().addValueObserver(buttonObserver(j, RL.MUTE, RL.BUTTON1, [127, 0]));
    track.getSolo().addValueObserver(buttonObserver(j, RL.SOLO, RL.BUTTON2, [0, 127]));
    track.getArm().addValueObserver(buttonObserver(j, RL.ARM, RL.BUTTON3, [0, 127]));
  }

  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

  println('CONNECTED');
}

function exit() {
  println('DISCONNECTED');
}

function onMidi(status, data1, data2) {
  var channelId = MIDIChannel(status);

  var noteName = isNoteOn(status) ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][data1 % 12] : false;

  var buttonType = ({
    0x80: 'NoteOff',
    0x90: data1 === 0 ? 'NoteOff' : 'NoteOn',
    0xA0: 'KeyPressure',
    0xB0: 'CC',
    0xC0: 'ProgramChange',
    0xD0: 'ChannelPressure',
    0xE0: 'PitchBend'
  })[status & 0xF0] || 'Other';

  printMidi(status, data1, data2);
  
  println('CHANNEL: ' + channelId + ' ' + status);

  var action = buttonType === 'CC' ? actionFor(status, data1, data2) : false;

  var toggle = data2 > 65;

  function dump(obj) {
    var out = [];

    for (var k in obj) {
      out.push(k + ': ' + (typeof obj[k] === 'object' ? dump(obj[k]) : obj[k]));
    }

    return '{ ' + out.join(', ') + ' }';
  }

  println(buttonType + ' ' + noteName + ' ' + toggle + ' ' + dump(action));

  function data1IsUserActionCC() {
    for (var i = 0, c = RL.USER_ACTIONS_CC.length; i < c; i += 1) {
      if (data1 === RL.USER_ACTIONS_CC[i]) {
        return i;
      }
    }

    return -1;
  }

  function userActionCC() {
    var i = typeof action.left === 'number' ? action.left :
            typeof action.right === 'number' ? action.right : action.index;

    if (typeof i === 'object') {
      i = typeof i.top === 'number' ? i.top :
          typeof i.middle === 'number' ? i.middle : i.bottom;
    }

    RL.U_CONTROLS.getControl(data1IsUserActionCC()).set(data2, 128);
  }

  switch (action.type) {
    case 'fader':
      RL.TRACKS.getTrack(action.index).getVolume().set(action.level, 128);
    break;

    case 'button':
      if (data1IsUserActionCC() === -1) {
        if (typeof action.index.top === 'number') {
          RL.TRACKS.getTrack(action.index.top).getMute().set(!toggle);
          sendMidi(RL.CHANNEL1, data1, toggle ? 127 : 0);
        }

        if (typeof action.index.middle === 'number') {
          if (toggle) {
            RL.TRACKS.getTrack(action.index.middle).getSolo().toggle();
          } else {
            sendMidi(RL.CHANNEL1, data1, RL.SOLO[action.index.middle] ? 127 : 0);
          }
        }

        if (typeof action.index.bottom === 'number') {
          if (toggle) {
            RL.TRACKS.getTrack(action.index.bottom).getArm().toggle();
          } else {
            sendMidi(RL.CHANNEL1, data1, RL.ARM[action.index.bottom] ? 127 : 0);
          }
        }
      } else {
        userActionCC();
      }

      break;

    case 'overdub':
      RL.TRANSPORT.toggleOverdub();
    break;

    case 'record':
      if (toggle) {
        RL.TRANSPORT.record();

        RL.IS_RECORDING = !RL.IS_RECORDING;
      }
    break;

    case 'play':
      if (toggle) {
        RL.TRANSPORT.play();
      }
    break;

    case 'stop':
      if (toggle) {
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

    case 'up':
    case 'down':
    case 'scene':
      println('CHANGE');
    break;

    default:
      if (action && (data1IsUserActionCC() > -1)) {
        userActionCC();
      }
    break;
  }
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}
