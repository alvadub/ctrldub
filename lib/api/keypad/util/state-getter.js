'use strict';

var $ = require('../../helpers');

module.exports = function(RL) {
  return function(from, key) {
    if (from.indexOf('.') > 0) {
      key = from.split('.')[1];
      from = from.split('.')[0];
    }

    var obj;

    if (typeof RL.CC_STATE[from] !== 'undefined') {
      obj = $.copy(RL.CC_STATE[from]);
    }

    if (typeof RL.CC_USER_STATE[from] !== 'undefined') {
      obj = $.copy(RL.CC_USER_STATE[from]);
    }

    if (typeof key !== 'undefined') {
      return obj ? obj[key] : null;
    }

    return obj;
  };
};
