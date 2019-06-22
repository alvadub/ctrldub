import { CC_STATE } from './keypad';
import { debug } from './helpers';

/* global sendMidi */

export default (label, index, type) => {
  if (typeof CC_STATE[label] === 'undefined') {
    switch (type) {
      case 'scalar': CC_STATE[label] = index; break;
      case 'list': CC_STATE[label] = []; break;
      default: CC_STATE[label] = {}; break;
    }
  }

  return value => {
    if (type === 'io') {
      if (index.inverted) {
        value = !value;
      }

      debug('SEND', index.channel, index.index, value);
      sendMidi(index.channel, index.index, value ? 127 : 0);
      CC_STATE[label][`${index.channel}#${index.index}`] = value;
    } else if (!value) {
      switch (type) {
        case 'list': Array.prototype.splice.call(CC_STATE[label], index, 1); break;
        case 'scalar':
          if (typeof value === 'string') {
            CC_STATE[label] = index;
          }
          break;

        // nothing to do
        default:break;
      }
    } else {
      switch (type) {
        case 'scalar': CC_STATE[label] = index !== false ? index : value; break;
        default: CC_STATE[label][index] = value; break;
      }
    }
  };
}
