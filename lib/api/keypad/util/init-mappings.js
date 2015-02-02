'use strict';

/* global host */

var stateObserver = require('./state-observer');

module.exports = function(RL, set) {
  RL.host.userControls = host.createUserControls(set.length);

  RL.CC_STATE.commonMappings = {};

  set.forEach(function(e) {
    RL.CC_MAPPINGS[e.channel + '#' + e.index] = e;

    if (e.grouped) {
      if (!RL.CC_STATE.commonMappings[e.command]) {
        RL.CC_STATE.commonMappings[e.command] = [];
      }

      RL.CC_STATE.commonMappings[e.command].push(e);
    }

    switch (e.command) {
      case 'mute': RL.CC_TRACKS[e.track].getMute().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;
      case 'solo': RL.CC_TRACKS[e.track].getSolo().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;
      case 'arm': RL.CC_TRACKS[e.track].getArm().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;

      default:
        var c = RL.host.userControls.getControl(e.offset);

        c.setLabel('CC' + (e.offset + 1));
        c.setIndication(true);
      break;
    }
  });
};
