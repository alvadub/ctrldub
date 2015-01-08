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

  function dump(obj) {
    var out = [];

    for (var k in obj) {
      out.push(k + ': ' + (typeof obj[k] === 'object' ? dump(obj[k]) : obj[k]));
    }

    return '{ ' + out.join(', ') + ' }';
  }

  println(buttonType + ' ' + noteName + ' ' + dump(action));

  println('- isMTCQuarterFrame? ' + isMTCQuarterFrame(status));
  println('- isSongPositionPointer? ' + isSongPositionPointer(status));
  println('- isSongSelect? ' + isSongSelect(status));
  println('- isTuneRequest? ' + isTuneRequest(status));
  println('- isTimingClock? ' + isTimingClock(status));
  println('- isMIDIStart? ' + isMIDIStart(status));
  println('- isMIDIContinue? ' + isMIDIContinue(status));
  println('- isMIDIStop? ' + isMIDIStop(status));
  println('- isActiveSensing? ' + isActiveSensing(status));
  println('- isSystemReset? ' + isSystemReset(status));

  switch (action.type) {
    case 'record':
      if (data2 > 65) {
        RL.IS_RECORDING = !RL.IS_RECORDING;
      }
    break;

    case 'play':
    break;

    case 'stop':
      RL.IS_PLAYING = false;
      RL.IS_RECORDING = false;
    break;

    case 'up':
    case 'down':
    case 'scene':
      println('CHANGE');
    break;

    default:
      if (action) {
        println('DELEGATE');
      }
    break;
  }

  println('- isRecording? ' + RL.IS_RECORDING);
}

function onSysex(data) {
  println('SYSEX');
  printSysex(data);
}
