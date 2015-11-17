/* jshint node: true */
'use strict';

var path = require('path');
var Funnel = require('broccoli-funnel');
var merge = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-mobiledoc-dom-renderer',

  treeForAddon: function(tree) {
    var libRoot = require.resolve('mobiledoc-dom-renderer/lib');
    var libPath = path.dirname(libRoot);

    var rendererTree = new Funnel(libPath, {
      include: ['**/*.js'],
      destDir: '/mobiledoc-dom-renderer'
    });
    var mergedTree = merge([tree, rendererTree]);
    return this._super.treeForAddon.call(this, mergedTree);
  }
};
