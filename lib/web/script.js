'use strict';

/* global Ractive */

var defaultMappings = require('../api/default/mappings');

function store(key, value) {
  localStorage[key] = JSON.stringify(value);
}

function read(key) {
  try {
    return JSON.parse(localStorage[key]);
  } catch (e) {}
}

var data = read('userMappings') || defaultMappings;

function pageInfo(pages) {
  var count = 0;

  return pages.map(function(tracks) {
    return {
      tracks: tracks.map(function(track) {
        return {
          controls: track.map(function(control) {
            if (control) {
              control.offset = count++;
            }

            return control;
          })
        };
      })
    };
  });
}

function reduce(map, fn) {
  if (!Array.isArray(map)) {
    fn(map);
  } else {
    map.forEach(function(value) {
      reduce(value, fn);
    });
  }
}

var $ = new Ractive({
  el: 'application',
  template: '#layout',
  oninit: function() {
    var WS = require('ws');

    var ws = new WS('ws://localhost:' + (+document.location.port + 1));

    ws.onopen = function() {
      ws.send(JSON.stringify({
        status: 'ping'
      }));
    };

    ws.onmessage = function(message) {
      var info = JSON.parse(message.data);

      if (info.data) {
        reduce(data, function(e) {
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

    activePage: function(page) {
      return page === this.get('selectedPage');
    },

    activeControl: function(control) {
      var classes = [];

      if (control.offset === this.get('selectedControl.offset')) {
        classes.push('active');
      }

      classes.push('enabled');

      return classes.join(' ');
    }
  }
});

$.on({
  setPage: function(e) {
    $.set('selectedPage', +e.node.value);
    $.set('selectedControl', null);
  },
  setControl: function(e) {
    $.set('selectedControl', e.context.controls[+e.node.value]);
  },
  resetConfiguration: function() {
    $.set('pages', pageInfo(defaultMappings));
  },
  saveConfiguration: function() {
    store('userMappings', data);
  }
});
