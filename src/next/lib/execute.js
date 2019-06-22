/* global sendMidi, host */

import { copy, notify } from './helpers';
import { $$, CC_STATE, CC_USER_ACTIONS } from './keypad';

export default action => {
  if (typeof action.value === 'undefined') {
    action.value = [127, 0][+action.toggle] || action.level || 0;
  }

  switch (action.type) {
    case 'overdub':
      if (action.toggle) {
        $$.HOST.transport.toggleOverdub();
      }
      break;

    case 'record':
      if (action.toggle) {
        $$.HOST.transport.record();
        $$.IS_RECORDING = !$$.IS_RECORDING;
      }
      break;

    case 'play':
      if (action.toggle) {
        $$.HOST.transport.play();
      }
      break;

    case 'play-all':
      for (let i = 0; i < 8; i += 1) {
        $$.HOST.trackBank.getClipLauncherScenes().launch(i);
      }
      break;

    case 'stop':
      if (action.toggle) {
        if ($$.IS_RECORDING) {
          $$.HOST.transport.record();
        }

        $$.IS_RECORDING = false;
        $$.IS_PLAYING = false;

        $$.HOST.transport.stop();
      }
      break;

    case 'stop-all':
      $$.HOST.trackBank.getClipLauncherScenes().stop();
      break;

    default:
      if (typeof action.offset === 'number') {
        $$.HOST.userControls.getControl(action.offset).set(action.value, 128);
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
    const api = copy($$.HOST);

    if (action.grouped) {
      api.all = CC_STATE.commonMappings[action.command].map(copy);
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
};
