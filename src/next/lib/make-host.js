import stateObserver from './state-observer';
import { debug } from './helpers';
import {
  $$, CHANNEL1, RECORD, RECORDS, PLAY,
} from './keypad';

/* global sendMidi, host */

export default () => {
  $$.HOST = {
    trackBank: host.createTrackBank(16, 2, 8),
    transport: host.createTransport(),
    cursorTrack: host.createCursorTrack(16, 2),
    cursorDevice: host.createCursorDevice(),
  };

  $$.HOST.cursorDevice.addNameObserver(20, '', stateObserver('primaryDevice', false, 'scalar'));

  $$.HOST.transport.addIsRecordingObserver(on => {
    $$.IS_RECORDING = on;
    debug(`IS_RECORDING: ${on}`);
    sendMidi(CHANNEL1, RECORD, on ? 127 : 0);
  });

  $$.HOST.transport.addIsPlayingObserver(on => {
    $$.IS_PLAYING = on;
    debug(`IS_PLAYING: ${on}`);
    sendMidi(CHANNEL1, PLAY, on ? 127 : 0);
  });

  $$.HOST.transport.addOverdubObserver(on => {
    if (!$$.IS_RECORDING) {
      sendMidi(CHANNEL1, RECORD, 0);
    }

    $$.OVERDUB = on;
    debug(`OVERDUB: ${on}`);
    sendMidi(CHANNEL1, RECORDS, on ? 127 : 0);
  });
};
