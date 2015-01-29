var PARAMS = {
  E: { type: 'encoder' },
  K: { type: 'knob' },
  B: { type: 'button' },
  F: { type: 'fader' },
  P: { type: 'pad' },
  S: { shift: true },
  G: { grouped: true },
  I: { inverted: true },
  M: { toggle: true },
  N: { toggle: false }
};

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

  copy.offset = key;
  copy.track = +options[0];
  copy.channel = +options[1];
  copy.index = +options[2];

  return copy;
}

function defaultMappings() {
  var PAGE_1 = [
    // Channels 1-8 (normal)
    '0:177:57:E', '1:177:58:E', '2:177:59:E', '3:177:60:E', '4:177:61:E', '5:177:62:E', '6:177:63:E', '7:177:64:E',
    '0:177:89:K:send:0', '1:177:90:K:send:0', '2:177:91:K:send:0', '3:177:92:K:send:0', '4:177:93:K:send:0', '5:177:94:K:send:0', '6:177:95:K:send:0', '7:177:96:K:send:0',
    '0:177:97:K:send:1', '1:177:98:K:send:1', '2:177:99:K:send:1', '3:177:100:K:send:1', '4:177:101:K:send:1', '5:177:102:K:send:1', '6:177:103:K:send:1', '7:177:104:K:send:1',
    '0:177:8:BI:mute', '1:177:9:BI:mute', '2:177:10:BI:mute', '3:177:11:BI:mute', '4:177:12:BI:mute', '5:177:13:BI:mute', '6:177:14:BI:mute', '7:177:15:BI:mute',
    '0:177:24:B:solo', '1:177:25:B:solo', '2:177:26:B:solo', '3:177:27:B:solo', '4:177:28:B:solo', '5:177:29:B:solo', '6:177:30:B:solo', '7:177:31:B:solo',
    '0:177:40:B:arm', '1:177:41:B:arm', '2:177:42:B:arm', '3:177:43:B:arm', '4:177:44:B:arm', '5:177:45:B:arm', '6:177:46:B:arm', '7:177:47:B:arm',
    '0:177:0:F:vol', '1:177:1:F:vol', '2:177:2:F:vol', '3:177:3:F:vol', '4:177:4:F:vol', '5:177:5:F:vol', '6:177:6:F:vol', '7:177:7:F:vol',
    '0:148:44:PM', '0:132:44:PN', '1:148:45:PM', '1:132:45:PN', '2:148:46:PM', '2:132:46:PN', '3:148:47:PM', '3:132:47:PN', '4:148:48:PM', '4:132:48:PN', '5:148:49:PM', '5:132:49:PN', '6:148:50:PM', '6:132:50:PN', '7:148:51:PM', '7:132:51:PN',
    '0:148:36:PM', '0:132:36:PN', '1:148:37:PM', '1:132:37:PN', '2:148:38:PM', '2:132:38:PN', '3:148:39:PM', '3:132:39:PN', '4:148:40:PM', '4:132:40:PN', '5:148:41:PM', '5:132:41:PN', '6:148:42:PM', '6:132:42:PN', '7:148:43:PM', '7:132:43:PN',
    '0:180:121:PI', '1:180:122:PI', '2:180:123:PI', '3:180:124:PI', '4:180:125:PI', '5:180:126:PI', '6:180:127:PI', '7:179:0:PI',
    '0:180:113:PI', '1:180:114:PI', '2:180:115:PI', '3:180:116:PI', '4:180:117:PI', '5:180:118:PI', '6:180:119:PI', '7:180:120:PI',

    // Channels 1-8 (shift)
    '0:177:65:ES:track',  '1:177:66:ES:device',  '2:177:67:ES',  '3:177:68:ES',  '4:177:69:ES',  '5:177:70:ES',  '6:177:71:ES',  '7:177:72:ES',
    '0:177:16:BIS', '1:177:17:BIS', '2:177:18:BIS', '3:177:19:BIS', '4:177:20:BIS', '5:177:21:BIS', '6:177:22:BIS', '7:177:23:BIS',
    '0:177:32:BSG:scene', '1:177:33:BSG:scene', '2:177:34:BSG:scene', '3:177:35:BSG:scene', '4:177:36:BSG:scene', '5:177:37:BSG:scene', '6:177:38:BSG:scene', '7:177:39:BSG:scene',
    '8:177:49:BSG:scene', '9:177:50:BSG:scene', '10:177:51:BSG:scene', '11:177:52:BSG:scene', '12:177:53:BSG:scene', '13:177:54:BSG:scene', '14:177:55:BSG:scene', '15:177:56:BSG:scene'
  ];

  return PAGE_1.map(function(data, i) {
    return $(data, i);
  });
}
