function $(_, key) {
  var options = _.split(':'),
      args = options[3].split('');

  var copy = {};

  for (var i = 0, v; v = PARAMS[args[i]]; i += 1) {
    for (var k in v) {
      copy[k] = v[k];
    }
  }

  if (options[4]) {
    var values = (options[5] || '').split(',');

    for (var i = 0, v; (v = values[i] || '').length; i += 1) {
      values[i] = /\d+/.test(values[i]) ? +values[i] : values[i];
    }

    copy.command = options[4];
    copy.params = values;
  }

  copy.channel = +options[2];
  copy.index = +options[1];
  copy.track = +options[0];
  copy.offset = key;

  return copy;
}

function dump(obj) {
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

  var out = [];

  for (var k in obj) {
    var v = dump(obj[k]);

    out.push(obj instanceof Array ? v : (k + ': ' + v));
  }

  if (obj instanceof Array) {
    return '[ ' + out.join(', ') + ' ]';
  }

  return '{ ' + out.join(', ') + ' }';
}

function debug() {
  if (arguments.length === 1) {
    return (DEBUG = !!arguments[0]);
  }

  if (!DEBUG) {
    return;
  }

  var out = [];

  for (var i = 0, a; typeof (a = arguments[i]) !== 'undefined'; i += 1) {
    out.push(dump(a));
  }

  println('> ' + out.join(' '));
}

function notify(action) {
  switch (action.type) {
    case 'encoder':
      host.showPopupNotification(action.type.toUpperCase() + ' ' + (action.level || 'OFF'));
    break;

    case 'fader':
    case 'knob':
      host.showPopupNotification(action.type.toUpperCase() + ' ' + (action.level ? Math.round(action.level / 1.27) + '%' : 'OFF'));
    break;

    case 'pad':
      if (action.toggle) {
        host.showPopupNotification('PAD ' + action.level);
      }

      if (typeof action.toggle === 'undefined') {
        if (action.level === 127) {
          host.showPopupNotification('ON');
        } else {
          host.showPopupNotification('OFF');
        }
      }
    break;

    case 'play':
      if (action.toggle) {
        host.showPopupNotification(!action.state ? 'PLAY' : 'PAUSE');
      }
    break;

    case 'record':
    case 'overdub':
      if (action.toggle) {
        host.showPopupNotification(action.type.toUpperCase() + ' ' + (!action.state ? 'ON' : 'OFF'));
      }
    break;

    default:
      switch (action.command) {
        case 'track.mute':
          if (action.toggle) {
            host.showPopupNotification('MUTE');
          } else {
            host.showPopupNotification('UNMUTE');
          }
        break;

        case 'track.solo':
        case 'track.arm':
          if (action.toggle) {
            host.showPopupNotification(action.command.split('.')[1].toUpperCase() + ' ' +  (!action.state ? 'ON' : 'OFF'));
          }
        break;

        default:
          if (action.toggle) {
            host.showPopupNotification(action.type.replace(/-/g, ' ').toUpperCase());
          }
        break;
      }
    break;
  }
}
