/* eslint-disable no-restricted-syntax */
/* global host, println, DEBUG */

export function keys(obj, cb) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cb(key);
    }
  }
}

function dump(obj) {
  if (obj === null) {
    return 'null';
  }

  if (obj === true) {
    return 'true';
  }

  if (obj === false) {
    return 'false';
  }

  if (typeof obj === 'function') {
    return obj.toString().replace(/[\r\n\t\s]+/g, ' ');
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const out = [];

  keys(obj, k => {
    const v = dump(obj[k]);

    out.push(obj instanceof Array ? v : `${k}: ${v}`);
  });

  if (obj instanceof Array) {
    return `[ ${out.join(', ')} ]`;
  }

  return `{ ${out.join(', ')} }`;
}

export function copy(obj) {
  if (obj instanceof Array) {
    return obj.slice();
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const target = {};

  keys(obj, key => {
    target[key] = obj[key];
  });

  return target;
}

export function debug(...args) {
  if (typeof DEBUG !== 'undefined' && DEBUG === true) {
    const out = [];

    args
    .filter(x => typeof x !== 'undefined')
    .forEach(x => {
      out.push(dump(x));
    });

    println(`> ${out.join(' ')}`);
  }
}

export function notify(action) {
  let text = '';

  switch (action.type) {
    case 'encoder':
      text += action.level;
      break;

    case 'fader':
    case 'knob':
      text += (action.level ? `${Math.round(action.level / 1.27)}%` : 'OFF');
      break;

    case 'pad':
      if (action.toggle) {
        text += action.level;
      } else if (typeof action.toggle === 'undefined') {
        if (action.level === 127) {
          text += 'ON';
        } else {
          text += 'OFF';
        }
      }
      break;

    case 'play':
      if (action.toggle) {
        text += !action.state ? 'PLAY' : 'PAUSE';
      }
      break;

    case 'record':
    case 'overdub':
      if (action.toggle) {
        text += `${action.type.toUpperCase()} ${!action.state ? 'ON' : 'OFF'}`;
      }
      break;

    default:
      switch (action.command) {
        case 'mute':
          if (action.toggle) {
            text += 'MUTE';
          } else {
            text += 'UNMUTE';
          }
          break;

        case 'solo':
        case 'arm':
          if (action.toggle) {
            text += `${action.command.toUpperCase()} ${!action.state ? 'ON' : 'OFF'}`;
          }
          break;

        default:
          if (action.toggle) {
            text += action.type.replace(/-/g, ' ').toUpperCase();
          }
          break;
      }
      break;
  }

  if (text) {
    if (typeof action.offset === 'number') {
      text = `ACC ${action.offset + 1} ${text}`;
    }

    host.showPopupNotification(text);
  }
}
