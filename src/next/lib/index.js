import * as KeyPad from './keypad';
import makeHost from './make-host';
import initMappings from './init-mappings';
import { initialize, teardown } from './hooks';

export function run() {
  this.DEBUG = true;

  this.init = () => {
    sendSysex(KeyPad.ID3);

    const keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????');
    const pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

    keys.setShouldConsumeEvents(false);
    pads.setShouldConsumeEvents(false);

    makeHost();
    initialize();
    initMappings();
  };

  this.exit = () => {
    teardown();
  };

  host.defineMidiPorts(1, 1);
  host.defineController(KeyPad.VENDOR, KeyPad.PRODUCT, KeyPad.VERSION, KeyPad.GUID);

  host.addDeviceNameBasedDiscoveryPair([KeyPad.ID1], [KeyPad.ID1]);
  host.addDeviceNameBasedDiscoveryPair([KeyPad.ID2], [KeyPad.ID2]);

  host.defineSysexIdentityReply(KeyPad.ID4);
}
