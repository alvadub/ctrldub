'use strict';

/* global host, println, DEBUG */

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

module.exports.copy = function(obj) {
  if (obj instanceof Array) {
    return obj.slice();
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  var target = {};

  for (var key in obj) {
    target[key] = obj[key];
  }

  return target;
};

module.exports.debug =  function() {
  if (typeof DEBUG !== 'undefined' && DEBUG === true) {
    var out = [];

    for (var i = 0, a; typeof (a = arguments[i]) !== 'undefined'; i += 1) {
      out.push(dump(a));
    }

    println('> ' + out.join(' '));
  }
};

module.exports.notify = function(action) {
  var text = '';

  switch (action.type) {
    case 'encoder':
      text += action.level;
    break;

    case 'fader':
    case 'knob':
      text += (action.level ? Math.round(action.level / 1.27) + '%' : 'OFF');
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
        text += action.type.toUpperCase() + ' ' + (!action.state ? 'ON' : 'OFF');
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
            text += action.command.toUpperCase() + ' ' +  (!action.state ? 'ON' : 'OFF');
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
      text = 'CC' + (action.offset + 1) + ' ' + text;
    }

    host.showPopupNotification(text);
  }
};
