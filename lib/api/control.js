'use strict';

/* global loadAPI, sendSysex, host */

loadAPI(1);

var RL;

var KeyPad = require('./keypad');

var exports = new Function('return this')();

host.defineMidiPorts(1, 1);
host.defineController(KeyPad.VENDOR, KeyPad.PRODUCT, KeyPad.VERSION, KeyPad.GUID);

host.addDeviceNameBasedDiscoveryPair([KeyPad.ID1], [KeyPad.ID1]);
host.addDeviceNameBasedDiscoveryPair([KeyPad.ID2], [KeyPad.ID2]);

host.defineSysexIdentityReply(KeyPad.ID4);

exports.DEBUG = true;

exports.init = function() {
  sendSysex(KeyPad.ID3);

  var keys = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????'),
      pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

  keys.setShouldConsumeEvents(false);
  pads.setShouldConsumeEvents(false);

  RL = new KeyPad();
  RL.initialize();
};

exports.exit = function() {
  RL.teardown();
};
