import { clone, notify } from './helpers';

import {
  get,
  set,
  observe,
  PLAY,
  PLAYS,
  STOP,
  STOPS,
  RECORD,
  RECORDS,
  CC_STATE,
  CC_TRACKS,
  CC_MAPPINGS,
  CC_USER_ACTIONS,
} from './state';

export function action(status, data1, data2) {
  const on = data2 > 65;

  if (data1 === PLAY) return { type: 'play', toggle: on, state: get('isPlaying') };
  if (data1 === PLAYS) return { type: 'play-all', toggle: on };
  if (data1 === STOP) return { type: 'stop', toggle: on };
  if (data1 === STOPS) return { type: 'stop-all', toggle: on };
  if (data1 === RECORD) return { type: 'record', toggle: on, state: get('isRecording') };
  if (data1 === RECORDS) return { type: 'overdub', toggle: on, state: get('isOverdub') };
  if (CC_MAPPINGS[`${status}#${data1}`]) return clone(CC_MAPPINGS[`${status}#${data1}`]);
}

export function execute(context, action) {
  const { transport, trackBank, userControls } = context;

  if (typeof action.value === 'undefined') {
    action.value = [127, 0][+action.toggle] || action.level || 0;
  }

  switch (action.type) {
    case 'overdub':
      if (action.toggle) {
        transport.toggleOverdub();
      }
      break;

    case 'record':
      if (action.toggle) {
        transport.record();
        set('isRecording', !get('isRecording'));
      }
      break;

    case 'play':
      if (action.toggle) {
        transport.play();
      }
      break;

    case 'play-all':
      for (let i = 0; i < 8; i += 1) {
        trackBank.getClipLauncherScenes().launch(i);
      }
      break;

    case 'stop':
      if (action.toggle) {
        if (get('isRecording')) {
          transport.record();
        }

        set('isRecording', false);
        set('isPlaying', false);
        transport.stop();
      }
      break;

    case 'stop-all':
      trackBank.getClipLauncherScenes().stop();
      break;

    default:
      if (typeof action.offset === 'number') {
        userControls.getControl(action.offset).set(action.value, 128);
      }
      break;
  }

  let callback = CC_USER_ACTIONS[action.command];
  if (!callback) {
    const proxy = (`on-${action.type}`)
      .replace(/-[a-z]/g, match => match.substr(1).toUpperCase());

    callback = CC_USER_ACTIONS[proxy];
  }

  if (typeof callback === 'function') {
    const api = clone(context);

    if (action.grouped) {
      api.all = CC_STATE.commonMappings[action.command].map(clone);
    }

    callback.call(api, action);

    if (typeof CC_STATE.commonValues[`${action.channel}#${action.index}`] !== 'undefined') {
      action.state = CC_STATE.commonValues[`${action.channel}#${action.index}`];
    }

    if (!action.toggle && action.state && action.command) {
      sendMidi(action.channel, action.index, 127);
    }
  }

  if (typeof action.notify === 'string') {
    host.showPopupNotification(action.notify);
  } else if (action.notify !== false) {
    notify(action);
  }
}

export function mappings(context, length, items) {
  const userControls = context.userControls = host.createUserControlsSection(length);

  CC_STATE.commonMappings = {};
  CC_STATE.commonValues = {};

  items.forEach(e => {
    CC_MAPPINGS[`${e.channel}#${e.index}`] = e;

    if (e.grouped && e.command) {
      if (!CC_STATE.commonMappings[e.command]) {
        CC_STATE.commonMappings[e.command] = [];
      }

      CC_STATE.commonMappings[e.command].push(e);
    }

    switch (e.command) {
      case 'toggleMute':
        CC_TRACKS[e.track].getMute()
          .addValueObserver(observe('commonValues', e, 'io'));
        break;

      case 'toggleSolo':
        CC_TRACKS[e.track].getSolo()
          .addValueObserver(observe('commonValues', e, 'io'));
        break;

      case 'toggleArm':
        CC_TRACKS[e.track].getArm()
          .addValueObserver(observe('commonValues', e, 'io'));
        break;

      default: break;
    }

    if (typeof e.offset === 'number') {
      const cc = userControls.getControl(e.offset);

      cc.setLabel(`LCC ${e.offset + 1}`);
      cc.setIndication(true);
    }
  });
}
