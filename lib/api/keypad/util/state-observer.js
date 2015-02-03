'use strict';

/* global sendMidi */

module.exports = function(RL, label, index, type) {
  if (typeof RL.CC_STATE[label] === 'undefined') {
    switch (type) {
      case 'scalar': RL.CC_STATE[label] = index; break;
      case 'list': RL.CC_STATE[label] = []; break;
      default: RL.CC_STATE[label] = {}; break;
    }
  }

  return function(value) {
    if (type === 'io') {
      if (index.inverted) {
        value = !value;
      }

      RL.CC_STATE[label][index.channel + '#' + index.index] = value;

      sendMidi(index.channel, index.index, value ? 127 : 0);
    } else if (!value) {
      switch (type) {
        case 'list': Array.prototype.splice.call(RL.CC_STATE[label], index, 1); break;
        case 'scalar':
          if (typeof value === 'string') {
            RL.CC_STATE[label] = index;
          }
        break;
      }
    } else {
      switch (type) {
        case 'scalar': RL.CC_STATE[label] = index !== false ? index : value; break;
        default: RL.CC_STATE[label][index] = value; break;
      }
    }
  };
};
