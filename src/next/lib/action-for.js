import { keys } from './helpers';
import {
  $$, PLAY, PLAYS, STOP, STOPS, RECORD, RECORDS, CC_MAPPINGS,
} from './keypad';

export default function (status, data1, data2) {
  const on = data2 > 65;

  if (data1 === PLAY) {
    return { type: 'play', toggle: on, state: $$.IS_PLAYING };
  } if (data1 === PLAYS) {
    return { type: 'play-all', toggle: on };
  } else if (data1 === STOP) {
    return { type: 'stop', toggle: on };
  } else if (data1 === STOPS) {
    return { type: 'stop-all', toggle: on };
  } else if (data1 === RECORD) {
    return { type: 'record', toggle: on, state: $$.IS_RECORDING };
  } else if (data1 === RECORDS) {
    return { type: 'overdub', toggle: on, state: $$.OVERDUB };
  }

  if (CC_MAPPINGS[`${status}#${data1}`]) {
    const ref = CC_MAPPINGS[`${status}#${data1}`];
    const copy = {};

    keys(ref, k => {
      copy[k] = ref[k];
    });

    return copy;
  }
}
