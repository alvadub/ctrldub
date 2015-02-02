'use strict';

/* global sendMidi, host */

var $ = require('../helpers');

module.exports = function(action) {
  action.value = [127, 0][+action.toggle] || action.level || 0;

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
      for (var i = 0; i < 8; i += 1) {
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

  var callback = this.CC_USER_ACTIONS[action.command];

  if (!callback) {
    var proxy = ('on-' + action.type).replace(/-[a-z]/g, function(match) {
      return match.substr(1).toUpperCase();
    });

    callback = this.CC_USER_ACTIONS[proxy];
  }

  if (typeof callback === 'function') {
    var api = $.copy(this.host);

    if (action.grouped) {
      api.all = this.CC_STATE.commonMappings[action.command].map($.copy);
    }

    api.sendMidi = function() {
      sendMidi.apply(null, [action.channel, action.index].concat(Array.protype.slice.call(arguments)));
    };

    callback.apply(api, action);

    if (typeof this.CC_STATE.commonValues[action.offset] !== 'undefined') {
      action.state = this.CC_STATE.commonValues[action.offset];
    }

    if (!action.toggle && action.state && action.command) {
      sendMidi(action.channel, action.index, 127);
    }
  }

  if (typeof action.notify === 'string') {
    host.showPopupNotification(action.notify);
  } else if (action.notify !== false) {
    $.notify(action);
  }

  return this;
};
