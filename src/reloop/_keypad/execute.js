/* global sendMidi, host */

import { copy, notify } from './helpers';

export default function (action) {
  if (typeof action.value === 'undefined') {
    action.value = [127, 0][+action.toggle] || action.level || 0;
  }

  switch (action.type) {
    case 'overdub':
      if (action.toggle) {
        this.host.transport.toggleOverdub();
      }
      break;

    case 'record':
      if (action.toggle) {
        this.host.transport.record();
        this.IS_RECORDING = !this.IS_RECORDING;
      }
      break;

    case 'play':
      if (action.toggle) {
        this.host.transport.play();
      }
      break;

    case 'play-all':
      for (let i = 0; i < 8; i += 1) {
        this.host.trackBank.getClipLauncherScenes().launch(i);
      }
      break;

    case 'stop':
      if (action.toggle) {
        if (this.IS_RECORDING) {
          this.host.transport.record();
        }

        this.IS_RECORDING = false;
        this.IS_PLAYING = false;

        this.host.transport.stop();
      }
      break;

    case 'stop-all':
      this.host.trackBank.getClipLauncherScenes().stop();
      break;

    default:
      if (typeof action.offset === 'number') {
        this.host.userControls.getControl(action.offset).set(action.value, 128);
      }
      break;
  }

  let callback = this.CC_USER_ACTIONS[action.command];

  if (!callback) {
    const proxy = (`on-${action.type}`)
      .replace(/-[a-z]/g, match => match.substr(1).toUpperCase());

    callback = this.CC_USER_ACTIONS[proxy];
  }

  if (typeof callback === 'function') {
    const api = copy(this.host);

    if (action.grouped) {
      api.all = this.CC_STATE.commonMappings[action.command].map(copy);
    }

    callback.call(api, action);

    if (typeof this.CC_STATE.commonValues[`${action.channel}#${action.index}`] !== 'undefined') {
      action.state = this.CC_STATE.commonValues[`${action.channel}#${action.index}`];
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

  return this;
};
