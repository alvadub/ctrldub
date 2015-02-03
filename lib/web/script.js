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
