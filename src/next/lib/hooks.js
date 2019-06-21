/*  global println, printSysex, host */

import { debug } from './helpers';

export function initialize() {
  println('ReLoop KeyPad -- ON');

  host.getMidiInPort(0).setMidiCallback((status, data1, data2) => {
    // FIXME: probably a hardware issue...
    debug('MIDI', status, data1, data2);
    // if (data1 === 100 || (status === 177 && (data1 === 7 || data1 === 96 || data1 === 104))) return;
  });

  host.getMidiInPort(0).setSysexCallback(printSysex);
  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);
}

export function teardown() {
  println('ReLoop KeyPad -- OFF');
}
