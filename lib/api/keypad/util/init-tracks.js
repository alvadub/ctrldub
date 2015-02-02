'use strict';

var stateObserver = require('./state-observer');

module.exports = function(RL) {
  for (var i = 0, c = 16; i < c; i += 1) {
    RL.CC_TRACKS[i] = RL.host.trackBank.getTrack(i);
    RL.CC_TRACKS[i].addIsSelectedObserver(stateObserver(RL, 'activeTrack', i, 'scalar'));
    RL.CC_TRACKS[i].addNameObserver(20, '', stateObserver(RL, 'currentTracks', i, 'list'));
  }
};
