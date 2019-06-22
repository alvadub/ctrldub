import pkg from '../../package.json';
import defaultMappings from '../next/lib/mappings';

/* global Ractive */

document.title = [pkg.description, pkg.version].join(' v');

function store(key, value) {
  localStorage[key] = JSON.stringify(value);
}

function read(key) {
  try {
    return JSON.parse(localStorage[key]);
  } catch (e) {
    // do nothing
  }
}

const data = read('userMappings') || defaultMappings;

function pageInfo(pages) {
  let count = 0;

  return pages.map(tracks => {
    return {
      tracks: tracks.map(track => {
        return {
          controls: track.map(control => {
            if (control) {
              count += 1;
              control.offset = count;
            }

            return control;
          }),
        };
      }),
    };
  });
}

function reduce(map, fn) {
  if (!Array.isArray(map)) {
    fn(map);
  } else {
    map.forEach(value => {
      reduce(value, fn);
    });
  }
}

const $ = new Ractive({
  el: 'application',
  template: '#layout',
  oninit() {
    const WS = require('ws');

    const ws = new WS(`ws://localhost:${+document.location.port + 1}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        status: 'ping',
      }));
    };

    ws.onmessage = message => {
      const info = JSON.parse(message.data);

      if (info.data) {
        reduce(data, e => {
          if (e && e.channel === info.data[0] && e.index === info.data[1]) {
            e.level = info.data[2];

            $.set('selectedControl', e);
          }
        });
      }
    };
  },
  data: {
    pages: pageInfo(data),

    selectedPage: 0,
    selectedControl: null,

    activePage(page) {
      return page === this.get('selectedPage');
    },

    activeControl(control) {
      const classes = [];

      if (control.offset === this.get('selectedControl.offset')) {
        classes.push('active');
      }

      classes.push('enabled');

      return classes.join(' ');
    },
  },
});

$.on({
  setPage(e) {
    $.set('selectedPage', +e.node.value);
    $.set('selectedControl', null);
  },
  setControl(e) {
    $.set('selectedControl', e.context.controls[+e.node.value]);
  },
  resetConfiguration() {
    $.set('pages', pageInfo(defaultMappings));
  },
  saveConfiguration() {
    store('userMappings', data);
  },
});
