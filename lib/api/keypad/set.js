'use strict';

var $ = require('../helpers');

var initMappings = require('./util/init-mappings');

function reduce(set, fn) {
  if (!(set instanceof Array)) {
    fn(set);
  } else {
    set.forEach(function(value) {
      if (value !== null) {
        reduce(value, fn);
      }
    });
  }
}

module.exports = function(mappings) {
  var map = [],
      count = 0;

  function push(data) {
    if (typeof data.channel === 'number' && typeof data.index === 'number') {
      if (!data.command) {
        data.offset = count;
        count += 1;
      }

      if (data.shift) {
        var copy = $.copy(data.shift);

        copy.type = data.type;
        copy.shift = true;

        delete data.shift;

        push(copy);
      }

      map.push(data);
    }
  }

  reduce(mappings, push);

  initMappings(this, map, count);

  return this;
};
