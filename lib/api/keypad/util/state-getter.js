'use strict';

var $ = require('../../helpers');

module.exports = function(RL) {
  return function(from, key) {
    if (from.indexOf('.') > 0) {
      key = from.split('.')[1];
      from = from.split('.')[0];
    }

    var obj = (RL.CC_STATE[from] && $.copy(RL.CC_STATE[from])) ||
              (RL.CC_USER_STATE[from] && $.copy(RL.CC_USER_STATE[from]));

    if (typeof key !== 'undefined') {
      return obj ? obj[key] : null;
    }

    return obj || null;
  };
};
