var VENDOR = 'ReLoop',
    PRODUCT = 'KeyPad',
    VERSION = '1.0';

var ID1 = 'Reloop KeyPad',
    ID2 = 'Reloop KeyPad MIDI 1',
    ID3 = 'F0 AD F5 01 11 02 F7',
    ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

var GUID = 'BD3405A8-9C77-449F-BA6D-2E91D9873878';

var RL = {
  PLAY: 105,
  PLAYS: 108,
  STOP: 106,
  STOPS: 109,
  RECORD: 107,
  RECORDS: 110,

  OCTAVE_DOWNS: 111,
  OCTAVE_UPS: 112,
  CHANNEL1: 177,

  OVERDUB: false,
  IS_PLAYING: false,
  IS_RECORDING: false
};

function actionFor(status, data1, data2) {
  // RECORDING
  var on = data2 > 65;

  if (data1 === RL.PLAY) {
    return { type: 'play', toggle: on, state: RL.IS_PLAYING };
  } if (data1 === RL.PLAYS) {
    return { type: 'play-all', toggle: on };
  } else if (data1 === RL.STOP) {
    return { type: 'stop', toggle: on };
  } else if (data1 === RL.STOPS) {
    return { type: 'stop-all', toggle: on };
  } else if (data1 === RL.RECORD) {
    return { type: 'record', toggle: on, state: RL.IS_RECORDING };
  } else if (data1 === RL.RECORDS) {
    return { type: 'overdub', toggle: on, state: RL.OVERDUB };
  }

  if (RL.CC_MAPPINGS[status + '#' + data1]) {
    var ref = RL.CC_MAPPINGS[status + '#' + data1],
        copy = {};

    for (var k in ref) {
      copy[k] = ref[k];
    }

    return copy;
  }
}

function execute(action) {
  switch (action.type) {
    case 'overdub':
      if (action.toggle) {
        RL.host.transport.toggleOverdub();
      }
    break;

    case 'record':
      if (action.toggle) {
        RL.host.transport.record();
        RL.IS_RECORDING = !RL.IS_RECORDING;
      }
    break;

    case 'play':
      if (action.toggle) {
        RL.host.transport.play();
      }
    break;

    case 'play-all':
      for (var i = 0; i < 8; i += 1) {
        RL.host.trackBank.getClipLauncherScenes().launch(i);
      }
    break;

    case 'stop':
      if (action.toggle) {
        if (RL.IS_RECORDING) {
          RL.host.transport.record();
        }

        RL.IS_RECORDING = false;
        RL.IS_PLAYING = false;

        RL.host.transport.stop();
      }
    break;

    case 'stop-all':
      RL.host.trackBank.getClipLauncherScenes().stop();
    break;

    default:
      if (!action.command) {
        RL.host.userControls.getControl(action.offset).set(action.value, 128);
      }
    break;
  }

  action.value = [127, 0][+action.toggle] || action.level || 0;

  var callback = RL.CC_USER_ACTIONS[action.command];

  if (!callback) {
    var proxy = ('on-' + action.type).replace(/-[a-z]/g, function(match) {
      return match.substr(1).toUpperCase();
    });

    callback = RL.CC_USER_ACTIONS[proxy];
  }

  if (typeof callback === 'function') {
    var scope = copy(RL.host);

    if (action.grouped) {
      scope.all = RL.CC_STATE['commonMappings'][action.command].map(function(cc) {
        return copy(cc);
      });
    }

    callback.call(scope, action);

    if (typeof RL.CC_STATE['commonValues'][action.offset] !== 'undefined') {
      action.state = RL.CC_STATE['commonValues'][action.offset];
    }

    if (!action.toggle && action.state && action.command) {
      sendMidi(action.channel, action.index, 127);
    }
  }

  if (typeof action.notify === 'string') {
    host.showPopupNotification(action.notify);
  } else if (action.notify !== false) {
    notify(action);
  }
}
