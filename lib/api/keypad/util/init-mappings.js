'use strict';

/* global host */

var stateObserver = require('./state-observer');

module.exports = function(RL, set, length) {
  RL.host.userControls = host.createUserControls(length);

  RL.CC_STATE.commonMappings = {};
  RL.CC_STATE.commonValues = {};

  RL.CC_MAPPINGS = {};

  set.forEach(function(e) {
    RL.CC_MAPPINGS[e.channel + '#' + e.index] = e;

    if (e.grouped && e.command) {
      if (!RL.CC_STATE.commonMappings[e.command]) {
        RL.CC_STATE.commonMappings[e.command] = [];
      }

      RL.CC_STATE.commonMappings[e.command].push(e);
    }

    switch (e.command) {
      case 'toggleMute': RL.CC_TRACKS[e.track].getMute().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;
      case 'toggleSolo': RL.CC_TRACKS[e.track].getSolo().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;
      case 'toggleArm': RL.CC_TRACKS[e.track].getArm().addValueObserver(stateObserver(RL, 'commonValues', e, 'io')); break;
    }

    if (typeof e.offset === 'number') {
      var cc = RL.host.userControls.getControl(e.offset);

      cc.setLabel('CC' + (e.offset + 1));
      cc.setIndication(true);
    }
  });
};
