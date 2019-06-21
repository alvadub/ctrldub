(function () {
  /* eslint-disable no-restricted-syntax */
  

  function keys(obj, cb) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cb(key);
      }
    }
  }

  function dump(obj) {
    if (obj === null) {
      return 'null';
    }

    if (obj === true) {
      return 'true';
    }

    if (obj === false) {
      return 'false';
    }

    if (typeof obj === 'function') {
      return obj.toString().replace(/[\r\n\t\s]+/g, ' ');
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    var out = [];

    keys(obj, function (k) {
      var v = dump(obj[k]);

      out.push(obj instanceof Array ? v : (k + ": " + v));
    });

    if (obj instanceof Array) {
      return ("[ " + (out.join(', ')) + " ]");
    }

    return ("{ " + (out.join(', ')) + " }");
  }

  function copy(obj) {
    if (obj instanceof Array) {
      return obj.slice();
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    var target = {};

    keys(obj, function (key) {
      target[key] = obj[key];
    });

    return target;
  }

  function debug() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (typeof DEBUG !== 'undefined' && DEBUG === true) {
      var out = [];

      args
      .filter(function (x) { return typeof x !== 'undefined'; })
      .forEach(function (x) {
        out.push(dump(x));
      });

      println(("> " + (out.join(' '))));
    }
  }

  function notify(action) {
    var text = '';

    switch (action.type) {
      case 'encoder':
        text += action.range === -1 ? 'DOWN' : 'UP';
        text += " (" + (action.level) + ")";
        break;

      case 'fader':
      case 'knob':
        text += (action.level ? ((Math.round(action.level / 1.27)) + "%") : 'OFF');
        break;

      case 'pad':
        if (action.toggle) {
          text += action.level;
        } else if (typeof action.toggle === 'undefined') {
          if (action.level === 127) {
            text += 'ON';
          } else {
            text += 'OFF';
          }
        }
        break;

      case 'play':
        if (action.toggle) {
          text += !action.state ? 'PLAY' : 'PAUSE';
        }
        break;

      case 'record':
      case 'overdub':
        if (action.toggle) {
          text += (action.type.toUpperCase()) + " " + (!action.state ? 'ON' : 'OFF');
        }
        break;

      default:
        switch (action.command) {
          case 'mute':
            if (action.toggle) {
              text += 'MUTE';
            } else {
              text += 'UNMUTE';
            }
            break;

          case 'solo':
          case 'arm':
            if (action.toggle) {
              text += (action.command.toUpperCase()) + " " + (!action.state ? 'ON' : 'OFF');
            }
            break;

          default:
            if (action.toggle) {
              text += action.type.replace(/-/g, ' ').toUpperCase();
            }
            break;
        }
        break;
    }

    if (text) {
      if (typeof action.offset === 'number') {
        text = "ACC " + (action.offset + 1) + " " + text;
      }

      host.showPopupNotification(text);
    }
  }

  function actionFor (status, data1, data2) {
    var on = data2 > 65;

    if (data1 === this.PLAY) {
      return { type: 'play', toggle: on, state: this.IS_PLAYING };
    } if (data1 === this.PLAYS) {
      return { type: 'play-all', toggle: on };
    } else if (data1 === this.STOP) {
      return { type: 'stop', toggle: on };
    } else if (data1 === this.STOPS) {
      return { type: 'stop-all', toggle: on };
    } else if (data1 === this.RECORD) {
      return { type: 'record', toggle: on, state: this.IS_RECORDING };
    } else if (data1 === this.RECORDS) {
      return { type: 'overdub', toggle: on, state: this.OVERDUB };
    }

    if (this.CC_MAPPINGS[(status + "#" + data1)]) {
      var ref = this.CC_MAPPINGS[(status + "#" + data1)];
      var copy = {};

      keys(ref, function (k) {
        copy[k] = ref[k];
      });

      return copy;
    }
  }

  

  function execute (action) {
    if (typeof action.value === 'undefined') {
      action.value = [127, 0][+action.toggle] || action.level || 0;
    }

    switch (action.type) {
      case 'overdub':
        if (action.toggle) {
          this.host.transport.toggleOverdub();
        }
        break;

      case 'record':
        if (action.toggle) {
          this.host.transport.record();
          this.IS_RECORDING = !this.IS_RECORDING;
        }
        break;

      case 'play':
        if (action.toggle) {
          this.host.transport.play();
        }
        break;

      case 'play-all':
        for (var i = 0; i < 8; i += 1) {
          this.host.trackBank.getClipLauncherScenes().launch(i);
        }
        break;

      case 'stop':
        if (action.toggle) {
          if (this.IS_RECORDING) {
            this.host.transport.record();
          }

          this.IS_RECORDING = false;
          this.IS_PLAYING = false;

          this.host.transport.stop();
        }
        break;

      case 'stop-all':
        this.host.trackBank.getClipLauncherScenes().stop();
        break;

      default:
        if (typeof action.offset === 'number') {
          this.host.userControls.getControl(action.offset).set(action.value, 128);
        }
        break;
    }

    var callback = this.CC_USER_ACTIONS[action.command];

    if (!callback) {
      var proxy = (("on-" + (action.type)))
        .replace(/-[a-z]/g, function (match) { return match.substr(1).toUpperCase(); });

      callback = this.CC_USER_ACTIONS[proxy];
    }

    if (typeof callback === 'function') {
      var api = copy(this.host);

      if (action.grouped) {
        api.all = this.CC_STATE.commonMappings[action.command].map(copy);
      }

      callback.call(api, action);

      if (typeof this.CC_STATE.commonValues[((action.channel) + "#" + (action.index))] !== 'undefined') {
        action.state = this.CC_STATE.commonValues[((action.channel) + "#" + (action.index))];
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

    return this;
  }

  

  function stateObserver (RL, label, index, type) {
    if (typeof RL.CC_STATE[label] === 'undefined') {
      switch (type) {
        case 'scalar': RL.CC_STATE[label] = index; break;
        case 'list': RL.CC_STATE[label] = []; break;
        default: RL.CC_STATE[label] = {}; break;
      }
    }

    return function (value) {
      if (type === 'io') {
        if (index.inverted) {
          value = !value;
        }

        RL.CC_STATE[label][((index.channel) + "#" + (index.index))] = value;

        sendMidi(index.channel, index.index, value ? 127 : 0);
      } else if (!value) {
        switch (type) {
          case 'list': Array.prototype.splice.call(RL.CC_STATE[label], index, 1); break;
          case 'scalar':
            if (typeof value === 'string') {
              RL.CC_STATE[label] = index;
            }
            break;

          // nothing to do
          default:break;
        }
      } else {
        switch (type) {
          case 'scalar': RL.CC_STATE[label] = index !== false ? index : value; break;
          default: RL.CC_STATE[label][index] = value; break;
        }
      }
    };
  }

  function stateGetter (RL) { return function (from, key) {
    if (from.indexOf('.') > 0) {
      key = from.split('.')[1];
      from = from.split('.')[0];
    }

    var obj;

    if (typeof RL.CC_STATE[from] !== 'undefined') {
      obj = copy(RL.CC_STATE[from]);
    }

    if (typeof RL.CC_USER_STATE[from] !== 'undefined') {
      obj = copy(RL.CC_USER_STATE[from]);
    }

    if (typeof key !== 'undefined') {
      return obj ? obj[key] : null;
    }

    return obj;
  }; }

  function stateSetter (RL) { return function (key, value) {
    RL.CC_USER_STATE[key] = value;
  }; }

  function getterFor (RL, key) { return function () { return RL[key]; }; }

  

  function makeHost (RL) {
    RL.host = {
      trackBank: host.createTrackBank(16, 2, 8),
      transport: host.createTransport(),
      cursorTrack: host.createCursorTrack(16, 2),
      cursorDevice: host.createCursorDevice(),
    };

    RL.host.cursorDevice.addNameObserver(20, '', stateObserver(RL, 'primaryDevice', false, 'scalar'));

    RL.host.transport.addIsRecordingObserver(function (on) {
      RL.IS_RECORDING = on;

      sendMidi(RL.CHANNEL1, RL.RECORD, on ? 127 : 0);
    });

    RL.host.transport.addIsPlayingObserver(function (on) {
      RL.IS_PLAYING = on;

      sendMidi(RL.CHANNEL1, RL.PLAY, on ? 127 : 0);
    });

    RL.host.transport.addOverdubObserver(function (on) {
      if (!RL.IS_RECORDING) {
        sendMidi(RL.CHANNEL1, RL.RECORD, 0);
      }

      RL.OVERDUB = on;

      sendMidi(RL.CHANNEL1, RL.RECORDS, on ? 127 : 0);
    });


    RL.host.get = stateGetter(RL);
    RL.host.set = stateSetter(RL);

    RL.host.isPlaying = getterFor(RL, 'IS_PLAYING');
    RL.host.isRecording = getterFor(RL, 'IS_RECORDING');
  }

  function initTracks (RL) {
    for (var i = 0, c = RL.TRACKS; i < c; i += 1) {
      RL.CC_TRACKS[i] = RL.host.trackBank.getTrack(i);
      RL.CC_TRACKS[i].addIsSelectedObserver(stateObserver(RL, 'activeTrack', i, 'scalar'));
      RL.CC_TRACKS[i].addNameObserver(20, '', stateObserver(RL, 'currentTracks', i, 'list'));
    }
  }

  

  function initialize () {
    var this$1 = this;

    println('ReLoop KeyPad -- ON');

    makeHost(this);
    initTracks(this);

    host.getMidiInPort(0).setMidiCallback(function (status, data1, data2) {
      // FIXME: probably a hardware issue...
      if (data1 === 100 || (status === 177 && (data1 === 7 || data1 === 64))) { return; }

      var action = this$1.actionFor(status, data1, data2);

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

          case 'encoder': {
            if (!this$1.CC_STATE.encoderValues) {
              this$1.CC_STATE.encoderValues = {};
            }

            var old = this$1.CC_STATE.encoderValues[((action.channel) + "#" + (action.index))] || 0;

            if (old !== data2) {
              action.range = data2 < old ? -1 : 1;
            }

            if (data2 === 0 || data2 === 127) {
              action.range = data2 ? 1 : -1;
            }

            action.level = data2;

            this$1.CC_STATE.encoderValues[((action.channel) + "#" + (action.index))] = data2;
          } break;

          default:
            action.level = data2;
            break;
        }

        debug('CC', action);

        this$1.execute(action);
      }
    });

    host.getMidiInPort(0).setSysexCallback(printSysex);
    host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

    return this;
  }

  

  function teardown () {
    println('ReLoop KeyPad -- OFF');
  }

  function initActions (RL, map) {
    keys(map, function (key) {
      RL.CC_USER_ACTIONS[key] = map[key];
    });
  }

  function add (actions) {
    initActions(this, actions);

    return this;
  }

  

  function initMappings (RL, set, length) {
    RL.host.userControls = host.createUserControlsSection(length);

    RL.CC_STATE.commonMappings = {};
    RL.CC_STATE.commonValues = {};

    RL.CC_MAPPINGS = {};

    set.forEach(function (e) {
      RL.CC_MAPPINGS[((e.channel) + "#" + (e.index))] = e;

      if (e.grouped && e.command) {
        if (!RL.CC_STATE.commonMappings[e.command]) {
          RL.CC_STATE.commonMappings[e.command] = [];
        }

        RL.CC_STATE.commonMappings[e.command].push(e);
      }

      switch (e.command) {
        case 'toggleMute':
          RL.CC_TRACKS[e.track].getMute()
            .addValueObserver(stateObserver(RL, 'commonValues', e, 'io'));
          break;

        case 'toggleSolo':
          RL.CC_TRACKS[e.track].getSolo()
            .addValueObserver(stateObserver(RL, 'commonValues', e, 'io'));
          break;

        case 'toggleArm':
          RL.CC_TRACKS[e.track].getArm()
            .addValueObserver(stateObserver(RL, 'commonValues', e, 'io'));
          break;

        default: break;
      }

      if (typeof e.offset === 'number') {
        var cc = RL.host.userControls.getControl(e.offset);

        cc.setLabel(("LCC " + (e.offset + 1)));
        cc.setIndication(true);
      }
    });

    // RL.host.cursorTrack.addNameObserver(50, 'None', name => {
    //   host.showPopupNotification('NONE?' + name);
    // });
  }

  function reduce(set, fn) {
    if (!(set instanceof Array)) {
      fn(set);
    } else {
      set.forEach(function (value) {
        if (value !== null) {
          reduce(value, fn);
        }
      });
    }
  }

  function set (mappings) {
    var map = [];

    var count = 0;

    reduce(mappings, function (e) {
      if (typeof e.channel === 'number' && typeof e.index === 'number') {
        if (!e.command) {
          e.offset = count;
          count += 1;
        }

        map.push(e);
      }
    });

    initMappings(this, map, count);

    return this;
  }

  var KeyPad = function KeyPad() {
    this.PLAY = 105;
    this.PLAYS = 108;
    this.STOP = 106;
    this.STOPS = 109;
    this.RECORD = 107;
    this.RECORDS = 110;

    this.OCTAVE_DOWNS = 111;
    this.OCTAVE_UPS = 112;
    this.CHANNEL1 = 177;
    this.TRACKS = 16;

    this.OVERDUB = false;
    this.IS_PLAYING = false;
    this.IS_RECORDING = false;

    this.CC_STATE = {};

    this.CC_TRACKS = [];
    this.CC_MAPPINGS = {};

    this.CC_USER_STATE = {};
    this.CC_USER_ACTIONS = {};

    this.actionFor = actionFor;
    this.execute = execute;

    this.initialize = initialize;
    this.teardown = teardown;

    this.add = add;
    this.set = set;
  };

  KeyPad.VENDOR = 'Reloop';
  KeyPad.PRODUCT = 'KeyPad';
  KeyPad.VERSION = '1.0';

  KeyPad.ID1 = 'Reloop KeyPad';
  KeyPad.ID2 = 'Reloop KeyPad MIDI 1';
  KeyPad.ID3 = 'F0 AD F5 01 11 02 F7';
  KeyPad.ID4 = 'F0 7E ?? 06 02 AD F5 ?? ?? F7';

  KeyPad.GUID = 'BD3405A8-9C77-449F-BA6D-2E91D9873878';

  

  var defaultActions = {
    scenePlay: function scenePlay(e) {
      this.trackBank.launchScene(e.scene);

      this.set('currentScene', e);

      if (this.all) {
        this.all.forEach(function (cc) {
          sendMidi(cc.channel, cc.index, cc.scene === e.scene ? 127 : 0);
        });
      }

      e.notify = "Scene " + (e.scene + 1);
    },
    setDevice: function setDevice(e) {
      this.cursorDevice[e.range > 0 ? 'selectNext' : 'selectPrevious']();

      e.notify = this.get('primaryDevice');
    },
    setTrack: function setTrack(e) {
      var total = this.get('currentTracks.length') - 1;

      var track = this.get('activeTrack');

      if (e.range > 0) {
        track += 1;
      } else {
        track -= 1;
      }

      var index = Math.min(total, Math.max(0, track));

      this.trackBank.getTrack(index).select();

      e.notify = this.get('currentTracks', index);
    },
    sendLevel: function sendLevel(e) {
      this.trackBank.getTrack(e.track).getSend(e.send).set(e.value, 128);

      e.notify = e.value ? ((Math.round(e.value / 1.27)) + "%") : 'OFF';
    },
    volumeLevel: function volumeLevel(e) {
      this.trackBank.getTrack(e.track).getVolume().set(e.value, 128);
    },
    toggleMute: function toggleMute(e) {
      this.trackBank.getTrack(e.track).getMute().set(e.toggle);
    },
    toggleSolo: function toggleSolo(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getSolo().toggle();
      }
    },
    toggleArm: function toggleArm(e) {
      if (e.toggle) {
        this.trackBank.getTrack(e.track).getArm().toggle();
      }
    },
    onStop: function onStop() {
      var cc = this.get('currentScene');

      if (cc) {
        sendMidi(cc.channel, cc.index, 0);
      }
    },
  };

  /* eslint-disable */
  var defaultMappings = [
    [
      [
        { channel: 177, index: 57, type: 'encoder', maximum: 7 },
        { channel: 177, index: 89, type: 'knob' },
        { channel: 177, index: 97, type: 'knob' },
        { channel: 177, index: 8, type: 'button', inverted: true, command: 'toggleMute', track: 0 },
        { channel: 177, index: 24, type: 'button', command: 'toggleSolo', track: 0 },
        { channel: 177, index: 40, type: 'button' },
        { channel: 177, index: 0, type: 'fader' } ],
      [
        { channel: 177, index: 58, type: 'encoder' },
        { channel: 177, index: 90, type: 'knob' },
        { channel: 177, index: 98, type: 'knob' },
        { channel: 177, index: 9, type: 'button', inverted: true, command: 'toggleMute', track: 1 },
        { channel: 177, index: 25, type: 'button', command: 'toggleSolo', track: 1 },
        { channel: 177, index: 41, type: 'button' },
        { channel: 177, index: 1, type: 'fader' } ],
      [
        { channel: 177, index: 59, type: 'encoder' },
        { channel: 177, index: 91, type: 'knob' },
        { channel: 177, index: 99, type: 'knob' },
        { channel: 177, index: 10, type: 'button', inverted: true, command: 'toggleMute', track: 2 },
        { channel: 177, index: 26, type: 'button', command: 'toggleSolo', track: 2 },
        { channel: 177, index: 42, type: 'button' },
        { channel: 177, index: 2, type: 'fader' } ],
      [
        { channel: 177, index: 60, type: 'encoder' },
        { channel: 177, index: 92, type: 'knob' },
        { channel: 177, index: 100, type: 'knob' },
        { channel: 177, index: 11, type: 'button', inverted: true, command: 'toggleMute', track: 3 },
        { channel: 177, index: 27, type: 'button', command: 'toggleSolo', track: 3 },
        { channel: 177, index: 43, type: 'button' },
        { channel: 177, index: 3, type: 'fader' } ],
      [
        { channel: 177, index: 61, type: 'encoder' },
        { channel: 177, index: 93, type: 'knob' },
        { channel: 177, index: 101, type: 'knob' },
        { channel: 177, index: 12, type: 'button', inverted: true, command: 'toggleMute', track: 4 },
        { channel: 177, index: 28, type: 'button', command: 'toggleSolo', track: 4 },
        { channel: 177, index: 44, type: 'button' },
        { channel: 177, index: 4, type: 'fader' } ],
      [
        { channel: 177, index: 62, type: 'encoder' },
        { channel: 177, index: 94, type: 'knob' },
        { channel: 177, index: 102, type: 'knob' },
        { channel: 177, index: 13, type: 'button', inverted: true, command: 'toggleMute', track: 5 },
        { channel: 177, index: 29, type: 'button', command: 'toggleSolo', track: 5 },
        { channel: 177, index: 45, type: 'button' },
        { channel: 177, index: 5, type: 'fader' } ],
      [
        { channel: 177, index: 63, type: 'encoder' },
        { channel: 177, index: 95, type: 'knob' },
        { channel: 177, index: 103, type: 'knob' },
        { channel: 177, index: 14, type: 'button', inverted: true, command: 'toggleMute', track: 6 },
        { channel: 177, index: 30, type: 'button', command: 'toggleSolo', track: 6 },
        { channel: 177, index: 46, type: 'button' },
        { channel: 177, index: 6, type: 'fader' } ],
      [
        { channel: 177, index: 64, type: 'encoder' },
        { channel: 177, index: 96, type: 'knob' },
        { channel: 177, index: 104, type: 'knob' },
        { channel: 177, index: 15, type: 'button', inverted: true, command: 'toggleMute', track: 7 },
        { channel: 177, index: 31, type: 'button', command: 'toggleSolo', track: 7 },
        { channel: 177, index: 47, type: 'button' },
        { channel: 177, index: 7, type: 'fader' } ] ],
    [
      { channel: 180, index: 113, type: 'button' },
      { channel: 180, index: 114, type: 'button' },
      { channel: 180, index: 115, type: 'button' },
      { channel: 180, index: 116, type: 'button' },
      { channel: 180, index: 117, type: 'button' },
      { channel: 180, index: 118, type: 'button' },
      { channel: 180, index: 119, type: 'button' },
      { channel: 180, index: 120, type: 'button' },
      { channel: 180, index: 121, type: 'button' },
      { channel: 180, index: 122, type: 'button' },
      { channel: 180, index: 123, type: 'button' },
      { channel: 180, index: 124, type: 'button' },
      { channel: 180, index: 125, type: 'button' },
      { channel: 180, index: 126, type: 'button' },
      { channel: 180, index: 127, type: 'button' },
      { channel: 179, index: 1, type: 'button' } ],
    [
      { channel: 178, index: 57, type: 'encoder', command: 'setTrack' },
      { channel: 178, index: 24, type: 'button', command: 'scenePlay', scene: 0 } ],
    [
      { channel: 178, index: 58, type: 'encoder', command: 'setDevice' },
      { channel: 178, index: 25, type: 'button', command: 'scenePlay', scene: 1 } ],
    [
      { channel: 178, index: 26, type: 'button', command: 'scenePlay', scene: 2 } ],
    [
      { channel: 178, index: 27, type: 'button', command: 'scenePlay', scene: 3 } ],
    [
      { channel: 178, index: 28, type: 'button', command: 'scenePlay', scene: 4 } ],
    [
      { channel: 178, index: 29, type: 'button', command: 'scenePlay', scene: 5 } ],
    [
      { channel: 178, index: 30, type: 'button', command: 'scenePlay', scene: 6 } ],
    [
      { channel: 178, index: 31, type: 'button', command: 'scenePlay', scene: 7 } ],
    [
      { channel: 178, index: 32, type: 'button', command: 'scenePlay', scene: 8 } ] ];

  

  function run (GLOBAL) {
    var RL;

    GLOBAL.DEBUG = true;

    GLOBAL.init = function () {
      sendSysex(KeyPad.ID3);

      var keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????');
      var pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

      keys.setShouldConsumeEvents(false);
      pads.setShouldConsumeEvents(false);

      RL = new KeyPad()
        .initialize()
        .add(defaultActions)
        .set(defaultMappings);
    };

    GLOBAL.exit = function () {
      RL.teardown();
    };

    host.defineMidiPorts(1, 1);
    host.defineController(KeyPad.VENDOR, KeyPad.PRODUCT, KeyPad.VERSION, KeyPad.GUID);

    host.addDeviceNameBasedDiscoveryPair([KeyPad.ID1], [KeyPad.ID1]);
    host.addDeviceNameBasedDiscoveryPair([KeyPad.ID2], [KeyPad.ID2]);

    host.defineSysexIdentityReply(KeyPad.ID4);
  }

  

  loadAPI(1);

  // hack for exposing public symbols
  run(new Function('return this')());

}());
