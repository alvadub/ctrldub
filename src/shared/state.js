import { clone } from './helpers';

export const PLAY = 105;
export const PLAYS = 108;
export const STOP = 106;
export const STOPS = 109;
export const RECORD = 107;
export const RECORDS = 110;

export const CHANNEL1 = 177;
export const TRACKS = 16;

export const CC_STATE = {};

export const CC_TRACKS = [];
export const CC_MAPPINGS = {};

export const CC_USER_STATE = {};
export const CC_USER_ACTIONS = {};


export function set(key, value) {
  CC_USER_STATE[key] = value;
}

export function get(from, key) {
  if (from.indexOf('.') > 0) {
    key = from.split('.')[1];
    from = from.split('.')[0];
  }

  let obj;

  if (typeof CC_STATE[from] !== 'undefined') {
    obj = clone(CC_STATE[from]);
  }

  if (typeof CC_USER_STATE[from] !== 'undefined') {
    obj = clone(CC_USER_STATE[from]);
  }

  if (typeof key !== 'undefined') {
    return obj ? obj[key] : null;
  }

  return obj;
}

export function observe(label, index, type) {
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

      CC_STATE[label][`${index.channel}#${index.index}`] = value;
      sendMidi(index.channel, index.index, value ? 127 : 0);
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
