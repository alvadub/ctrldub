export function keys(obj, cb) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cb(key);
    }
  }
}

export function clone(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Array) {
    return obj.map(clone);
  }

  const copy = {};

  keys(obj, key => {
    copy[key] = obj[key];
  });

  return copy;
}

export function reduce(list, fn) {
  if (!(list instanceof Array)) {
    fn(list);
  } else {
    list.forEach(value => {
      if (value !== null) {
        reduce(value, fn);
      }
    });
  }
}

export function notify(action) {
  let text = '';

  switch (action.type) {
    case 'encoder':
      text += action.range === -1 ? 'DOWN' : 'UP';
      text += ` (${action.level})`;
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
