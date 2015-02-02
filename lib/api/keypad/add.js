'use strict';

var initActions = require('./util/init-actions');

module.exports = function(actions) {
  initActions(this, actions);

  return this;
};
