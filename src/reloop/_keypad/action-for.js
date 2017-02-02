export default function (status, data1, data2) {
  const on = data2 > 65;

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

  if (this.CC_MAPPINGS[`${status}#${data1}`]) {
    const ref = this.CC_MAPPINGS[`${status}#${data1}`];
    const copy = {};

    Object.keys(ref).forEach(k => {
      copy[k] = ref[k];
    });

    return copy;
  }
};
