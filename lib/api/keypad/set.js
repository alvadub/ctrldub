'use strict';

var initMappings = require('./util/init-mappings');

function reduce(set, fn) {
  if (!(set instanceof Array)) {
    fn(set);
  } else {
    for (var key in set) {
      reduce(set[key], fn);
    }
  }
}

module.exports = function(mappings) {
  var map = [],
      count = 0;

  reduce(mappings, function(e) {
    if (typeof e.channel === 'number' && typeof e.index === 'number') {
      if (!e.command) {
        e.offset = count;
        count += 1;
      }

      map.push(e);
    }
  });

  initMappings(this, map, count);

  return this;
};