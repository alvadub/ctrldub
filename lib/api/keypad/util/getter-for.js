'use strict';

module.exports = function(RL, key) {
  return function() {
    return RL[key];
  };
};
