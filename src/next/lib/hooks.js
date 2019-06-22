/*  global println, printSysex, host */

import { debug } from './helpers';
import { toggleMute } from './actions';
import actionFor from './action-for';
import execute from './execute';

export function initialize() {
  println('ReLoop KeyPad -- ON');

  host.getMidiInPort(0).setMidiCallback((status, data1, data2) => {
    // FIXME: hardward problem... add some settings to configure this from outside
    if (data1 === 100 || (status === 177 && (data1 === 7 || data1 === 96 || data1 === 104))) return;

    const action = actionFor(status, data1, data2);

    if (!action) {
      debug('MIDI', status, data1, data2);
    } else {
      debug('CC', action);
      execute(action);
    }
  });

  host.getMidiInPort(0).setSysexCallback(printSysex);
  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);
}

export function teardown() {
  println('ReLoop KeyPad -- OFF');
}
