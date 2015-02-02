'use strict';

module.exports = function(status, data1, data2) {
  var on = data2 > 65;

  if (data1 === this.PLAY) {
    return { type: 'play', toggle: on, state: this.IS_PLAYING };
  } if (data1 === this.PLAYS) {
    return { type: 'play-all', toggle: on };
  } else if (data1 === this.STOP) {
    return { type: 'stop', toggle: on };
  } else if (data1 === this.STOPS) {
    return { type: 'stop-all', toggle: on };
  } else if (data1 === this.RECORD) {
    return { type: 'record', toggle: on, state: this.IS_RECORDING };
  } else if (data1 === this.RECORDS) {
    return { type: 'overdub', toggle: on, state: this.OVERDUB };
  }

  if (this.CC_MAPPINGS[status + '#' + data1]) {
    var ref = this.CC_MAPPINGS[status + '#' + data1],
        copy = {};

    for (var k in ref) {
      copy[k] = ref[k];
    }

    return copy;
  }
};
