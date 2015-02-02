'use strict';

module.exports = function(RL, map) {
  for (var key in map) {
    RL.CC_USER_ACTIONS[key] = map[key];
  }
};
