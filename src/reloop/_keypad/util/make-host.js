/* global sendMidi, host */

import stateObserver from './state-observer';
import stateGetter from './state-getter';
import stateSetter from './state-setter';
import getterFor from './getter-for';

export default RL => {
  RL.host = {
    trackBank: host.createTrackBank(16, 2, 8),
    transport: host.createTransport(),
    cursorTrack: host.createCursorTrack(16, 2),
    cursorDevice: host.createCursorDevice(),
  };

  RL.host.cursorDevice.addNameObserver(20, '', stateObserver(RL, 'primaryDevice', false, 'scalar'));

  RL.host.transport.addIsRecordingObserver(on => {
    RL.IS_RECORDING = on;

    sendMidi(RL.CHANNEL1, RL.RECORD, on ? 127 : 0);
  });

  RL.host.transport.addIsPlayingObserver(on => {
    RL.IS_PLAYING = on;

    sendMidi(RL.CHANNEL1, RL.PLAY, on ? 127 : 0);
  });

  RL.host.transport.addOverdubObserver(on => {
    if (!RL.IS_RECORDING) {
      sendMidi(RL.CHANNEL1, RL.RECORD, 0);
    }

    RL.OVERDUB = on;

    sendMidi(RL.CHANNEL1, RL.RECORDS, on ? 127 : 0);
  });


  RL.host.get = stateGetter(RL);
  RL.host.set = stateSetter(RL);

  RL.host.isPlaying = getterFor(RL, 'IS_PLAYING');
  RL.host.isRecording = getterFor(RL, 'IS_RECORDING');
};
