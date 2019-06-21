import { debug }from './helpers';
import {
  $$, CHANNEL1, RECORD, PLAY,
} from './keypad';

/* global sendMidi, host */

// import stateObserver from './state-observer';
// import stateGetter from './state-getter';
// import stateSetter from './state-setter';
// import getterFor from './getter-for';

export default function () {
  const _host = {
    trackBank: host.createTrackBank(16, 2, 8),
    transport: host.createTransport(),
    cursorTrack: host.createCursorTrack(16, 2),
    cursorDevice: host.createCursorDevice(),
  };

  // _host.cursorDevice.addNameObserver(20, '', stateObserver(this, 'primaryDevice', false, 'scalar'));

  _host.transport.addIsRecordingObserver(on => {
    $$.IS_RECORDING = on;
    debug(`IS_RECORDING: ${on}`);
    sendMidi(CHANNEL1, RECORD, on ? 127 : 0);
  });

  _host.transport.addIsPlayingObserver(on => {
    $$.IS_PLAYING = on;
    debug(`IS_PLAYING: ${on}`);
    sendMidi(CHANNEL1, PLAY, on ? 127 : 0);
  });

  // _host.transport.addOverdubObserver(on => {
  //   if (!this.IS_RECORDING) {
  //     sendMidi(this.CHANNEL1, this.RECORD, 0);
  //   }

  //   this.OVERDUB = on;

  //   sendMidi(this.CHANNEL1, this.RECORDS, on ? 127 : 0);
  // });


  // _host.get = stateGetter(this);
  // _host.set = stateSetter(this);

  _host.isPlaying = () => $$.IS_PLAYING;
  _host.isRecording = () => $$.IS_RECORDING;

  return _host;
}
