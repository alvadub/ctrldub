import {
  set,
  get,
  observe,
  CHANNEL1,
  PLAY,
  RECORD,
  RECORDS,
  TRACKS,
  CC_STATE,
  CC_TRACKS,
  CC_USER_ACTIONS,
} from './shared/state';

import { action, execute, mappings } from './shared/context';
import { keys, reduce } from './shared/helpers';

import handlers from './shared/handlers';
import actions from './shared/actions';

loadAPI(1);

host.defineController('CTRLDUB', 'Reloop KeyPad', '1.0', 'C298841B-DE2C-4909-B867-F742D2C0F99D');
host.defineMidiPorts(1, 1);

const context = {};

function init() {
  println('CTRLDUB. Reloop KeyPad -- ON');

  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiOutPort(0).setShouldSendMidiBeatClock(true);

  const keyboard = host.getMidiInPort(0).createNoteInput('Keys', '?0????', '?1????', '?2????');
  const pads = host.getMidiInPort(0).createNoteInput('Pads', '?4????');

  keyboard.setShouldConsumeEvents(false);
  pads.setShouldConsumeEvents(false);

  const trackBank = context.trackBank = host.createTrackBank(16, 2, 8);
  const transport = context.transport = host.createTransport();
  const cursorTrack = context.cursorTrack = host.createCursorTrack(16, 2);
  const cursorDevice = context.cursorDevice = host.createCursorDevice();

  cursorDevice.addNameObserver(20, '', observe('primaryDevice', false, 'scalar'));

  transport.addIsRecordingObserver(on => {
    set('isRecording', on);
    sendMidi(CHANNEL1, RECORD, on ? 127 : 0);
  });

  transport.addIsPlayingObserver(on => {
    set('isPlaying', on);
    sendMidi(CHANNEL1, PLAY, on ? 127 : 0);
  });

  transport.addOverdubObserver(on => {
    if (!get('isRecording')) {
      sendMidi(CHANNEL1, RECORD, 0);
    }

    set('isOverdub', on);
    sendMidi(CHANNEL1, RECORDS, on ? 127 : 0);
  });

  for (let i = 0, c = TRACKS; i < c; i += 1) {
    CC_TRACKS[i] = trackBank.getTrack(i);
    CC_TRACKS[i].addIsSelectedObserver(observe('activeTrack', i, 'scalar'));
    CC_TRACKS[i].addNameObserver(20, '', observe('currentTracks', i, 'list'));
  }

  keys(actions, key => {
    CC_USER_ACTIONS[key] = actions[key];
  });

  const map = [];

  let count = 0;
  reduce(handlers, e => {
    if (typeof e.channel === 'number' && typeof e.index === 'number') {
      if (!e.command) {
        e.offset = count;
        count += 1;
      }

      map.push(e);
    }
  });

  mappings(context, count, map);
}

function exit() {
  println('CTRLDUB. Reloop KeyPad -- OFF');
}

function onMidi(status, data1, data2) {
  if (status === 177 && (data1 === 7 || data1 === 104)) return;

  const info = action(status, data1, data2);

  if (!info) {
    println(`MIDI: ${status}, ${data1}, ${data2}`);
  } else {
    if (info.inverted) {
      if (typeof info.toggle === 'boolean') {
        info.toggle = !info.toggle;
      }

      data2 = 127 - data2;

      delete info.inverted;
    }

    switch (info.type) {
      case 'button':
        info.toggle = data2 > 65;
        break;

      case 'encoder': {
        if (!CC_STATE.encoderValues) {
          CC_STATE.encoderValues = {};
        }

        const old = CC_STATE.encoderValues[`${info.channel}#${info.index}`] || 0;

        if (old !== data2) info.range = data2 < old ? -1 : 1;
        if (data2 === 0 || data2 === 127) info.range = data2 ? 1 : -1;

        info.level = data2;
        CC_STATE.encoderValues[`${info.channel}#${info.index}`] = data2;
      } break;

      default:
        info.level = data2;
        break;
    }
    execute(context, info);
  }
}
