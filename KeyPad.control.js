loadAPI(1);

load('KeyPad.js');

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

  RL.U_CONTROLS = host.createUserControls(RL.MAPPINGS.length);

  RL.TRANSPORT.addIsRecordingObserver(function (on) {
    sendMidi(RL.CHANNELS[1], RL.RECORD, (RL.IS_RECORDING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addIsPlayingObserver(function (on) {
    sendMidi(RL.CHANNELS[1], RL.PLAY, (RL.IS_PLAYING = on) ? 127 : 0);
  });

  RL.TRANSPORT.addOverdubObserver(function(on) {
    if (!RL.IS_RECORDING) {
      sendMidi(RL.CHANNELS[1], RL.RECORD, 0);
    }

    sendMidi(RL.CHANNELS[1], RL.RECORDS, (RL.OVERDUB = on) ? 127 : 0);
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

    if (action.invert) {
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
    }

    execute(action);
  }
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}
