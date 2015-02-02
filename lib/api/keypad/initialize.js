'use strict';

/*  global println, printSysex, host */

var $ = require('../helpers');

var makeHost = require('./util/make-host'),
    initTracks = require('./util/init-tracks'),
    initActions = require('./util/init-actions');

// TODO: mappings...

//initMappings = require('./util/init-mappings')
//defaultMappings = require('../default/mappings')

var defaultActions = require('../default/actions');

module.exports = function() {
  println('CONNECTED');

  makeHost(this);

  var RL = this;

  initTracks(RL);
  initActions(RL, defaultActions);
  // initMappings(RL, defaultMappings);

  host.getMidiInPort(0).setMidiCallback(function(status, data1, data2) {
    var action = RL.actionFor(status, data1, data2);

    if (!action) {
      $.debug('MIDI', status, data1, data2);
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
          if (!RL.CC_STATE.encoderValues) {
            RL.CC_STATE.encoderValues = {};
          }

          var old = RL.CC_STATE.encoderValues[action.offset] || 0,
              diff = Math.max(old, data2) - Math.min(old, data2);

          $.debug('> diff', diff);

          if (old !== data2) {
            action.range = data2 < old ? -1 : 1;
          }

          if (data2 === 0 || data2 === 127) {
            action.range = data2 ? 1 : -1;
          }

          RL.CC_STATE.encoderValues[action.offset] = data2;

        default:
          action.level = data2;
      }

      RL.execute(action);
    }
  });

  host.getMidiInPort(0).setSysexCallback(function(data) {
    println('SYSEX');
    printSysex(data);
  });

  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);
};
