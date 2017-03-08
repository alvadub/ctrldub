/*  global println, printSysex, host */

import { debug } from './helpers';

import makeHost from './util/make-host';
import initTracks from './util/init-tracks';

export default function () {
  println('ReLoop KeyPad -- ON');

  makeHost(this);
  initTracks(this);

  host.getMidiInPort(0).setMidiCallback((status, data1, data2) => {
    const action = this.actionFor(status, data1, data2);

    if (!action) {
      debug('MIDI', status, data1, data2);
    } else {
      if (action.inverted) {
        if (typeof action.toggle === 'boolean') {
          action.toggle = !action.toggle;
        }

        data2 = 127 - data2;

        delete action.inverted;
      }

      switch (action.type) {
        case 'button':
          action.toggle = data2 > 65;
          break;

        case 'encoder': {
          if (!this.CC_STATE.encoderValues) {
            this.CC_STATE.encoderValues = {};
          }

          const old = this.CC_STATE.encoderValues[`${action.channel}#${action.index}`] || 0;

          if (old !== data2) {
            action.range = data2 < old ? -1 : 1;
          }

          if (data2 === 0 || data2 === 127) {
            action.range = data2 ? 1 : -1;
          }

          this.CC_STATE.encoderValues[`${action.channel}#${action.index}`] = data2;
        } break;

        default:
          action.level = data2;
          break;
      }

      debug('CC', action);

      this.execute(action);
    }
  });

  host.getMidiInPort(0).setSysexCallback(printSysex);
  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

  return this;
}
