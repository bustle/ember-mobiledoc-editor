/* jshint node: true */
'use strict';
var MergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');
var path = require('path');

function distDirFor(packageName) {
  try {
    var resolved = require.resolve(packageName + '/package.json');
    return path.join(path.dirname(resolved), 'dist');
  } catch (e) {
    return null;
  }
}

module.exports = {
  name: 'ember-mobiledoc-editor',

  treeForVendor: function() {
    var files = [];

    files.push(new Funnel(distDirFor('mobiledoc-kit'), {
      files: [
        'css/mobiledoc-kit.css',
        'global/mobiledoc-kit.js',
        'global/mobiledoc-kit.map'
      ],
      destDir: 'mobiledoc-kit'
    }));

    var rendererDir = distDirFor('mobiledoc-dom-renderer');
    if (rendererDir) {
      files.push(new Funnel(rendererDir, {
        files: [
          'global/mobiledoc-dom-renderer.js'
        ],
        destDir: 'mobiledoc-dom-renderer'
      }));
    }

    return new MergeTrees(files);
  },

  included: function(app) {
    app.import('vendor/mobiledoc-kit/css/mobiledoc-kit.css');
    app.import('vendor/mobiledoc-kit/global/mobiledoc-kit.js');
    var rendererDir = distDirFor('mobiledoc-dom-renderer');
    if (rendererDir) {
      app.import('vendor/mobiledoc-dom-renderer/global/mobiledoc-dom-renderer.js');
    }
  }
};
