'use strict';

module.exports = function(RL) {
  return function(key, value) {
    RL.CC_USER_STATE[key] = value;
  };
};
