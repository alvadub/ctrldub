import stateObserver from './state-observer';
import mappings from './mappings';
import {
  $$, CC_STATE, CC_TRACKS, CC_MAPPINGS,
} from './keypad';

/* global host */

const map = [];

let length = 0;

function reduce(set, fn) {
  if (!(set instanceof Array)) {
    fn(set);
  } else {
    set.forEach(value => {
      if (value !== null) {
        reduce(value, fn);
      }
    });
  }
}

reduce(mappings, e => {
  if (typeof e.channel === 'number' && typeof e.index === 'number') {
    if (!e.command) {
      e.offset = length;
      length += 1;
    }

    map.push(e);
  }
});

export default () => {
  $$.HOST.userControls = host.createUserControlsSection(length);

  CC_STATE.commonMappings = {};
  CC_STATE.commonValues = {};

  map.forEach(e => {
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
          .addValueObserver(stateObserver('commonValues', e, 'io'));
        break;

      case 'toggleSolo':
        CC_TRACKS[e.track].getSolo()
          .addValueObserver(stateObserver('commonValues', e, 'io'));
        break;

      case 'toggleArm':
        CC_TRACKS[e.track].getArm()
          .addValueObserver(stateObserver('commonValues', e, 'io'));
        break;

      default: break;
    }

    if (typeof e.offset === 'number') {
      const cc = $$.HOST.userControls.getControl(e.offset);

      cc.setLabel(`LCC ${e.offset + 1}`);
      cc.setIndication(true);
    }
  });

  $$.HOST.cursorTrack.addNameObserver(50, 'None', name => {
    host.showPopupNotification('NONE?' + name);
  });
};
