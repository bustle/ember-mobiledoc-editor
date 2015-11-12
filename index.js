/* jshint node: true */
'use strict';

var path = require('path');

module.exports = {
  name: 'ember-mobiledoc-dom-renderer',

  included: function() {
    var libRoot = require.resolve('mobiledoc-dom-renderer/lib');
    var libPath = path.dirname(libRoot);

    this.treePaths.addon = libPath;
  }
};
