loadAPI(1);

load('KeyPad.js');
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
  RL.CC_MAPPINGS = (userMappings() || defaultMappings()).map($);
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
    if (action.type === 'pad' && (action.off || action.on)) {
      action.level = action.off ? 0 : data2;
    } else if (action.type === 'button') {
      action.toggle = data2 > 65;
    } else {
      action.level = data2;
    }

    /*if (action.invert) {
      if (action.on) {
        delete action.on;
        action.off = true;
      } else if (typeof action.off === 'boolean') {
        action.on = true;
        delete action.off;
      }

      if (typeof action.toggle === 'boolean') {
        action.toggle = !action.toggle;
      }

      if (typeof action.level === 'number') {
        action.level = 127 - action.level;
      }

      delete action.invert;
    }*/

    execute(action);
  }
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}

// TODO: move this...
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
