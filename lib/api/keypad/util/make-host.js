'use strict';

/* global sendMidi, host */

var stateObserver = require('./state-observer'),
    stateGetter = require('./state-getter'),
    stateSetter = require('./state-setter'),
    getterFor = require('./getter-for');

module.exports = function(RL) {
  RL.host = {
    trackBank: host.createTrackBank(16, 2, 8),
    transport: host.createTransport(),
    cursorTrack: host.createCursorTrack(16, 2),
    cursorDevice: host.createCursorDevice()
  };

  RL.host.cursorDevice.addNameObserver(20, '', stateObserver(RL, 'primaryDevice', null, 'scalar'));

  RL.host.transport.addIsRecordingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.RECORD, (RL.IS_RECORDING = on) ? 127 : 0);
  });

  RL.host.transport.addIsPlayingObserver(function (on) {
    sendMidi(RL.CHANNEL1, RL.PLAY, (RL.IS_PLAYING = on) ? 127 : 0);
  });

  RL.host.transport.addOverdubObserver(function(on) {
    if (!RL.IS_RECORDING) {
      sendMidi(RL.CHANNEL1, RL.RECORD, 0);
    }

    sendMidi(RL.CHANNEL1, RL.RECORDS, (RL.OVERDUB = on) ? 127 : 0);
  });


  RL.host.get = stateGetter(RL);
  RL.host.set = stateSetter(RL);

  RL.host.isPlaying = getterFor(RL, 'IS_PLAYING');
  RL.host.isRecording = getterFor(RL, 'IS_RECORDING');
};
