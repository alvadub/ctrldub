/* global loadAPI, sendSysex, host */
/* eslint-disable no-new-func */

import KeyPad from './_keypad';
import defaultActions from './_default/actions';
import defaultMappings from './_default/mappings';

loadAPI(1);

let RL;

// hack for exposing public symbols
const GLOBAL = new Function('return this')();

GLOBAL.DEBUG = true;

GLOBAL.init = () => {
  sendSysex(KeyPad.ID3);

  const keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????');
  const pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

  keys.setShouldConsumeEvents(false);
  pads.setShouldConsumeEvents(false);

  RL = new KeyPad()
    .initialize()
    .add(defaultActions)
    .set(defaultMappings);
};

GLOBAL.exit = () => {
  RL.teardown();
};

host.defineMidiPorts(1, 1);
host.defineController(KeyPad.VENDOR, KeyPad.PRODUCT, KeyPad.VERSION, KeyPad.GUID);

host.addDeviceNameBasedDiscoveryPair([KeyPad.ID1], [KeyPad.ID1]);
host.addDeviceNameBasedDiscoveryPair([KeyPad.ID2], [KeyPad.ID2]);

host.defineSysexIdentityReply(KeyPad.ID4);
