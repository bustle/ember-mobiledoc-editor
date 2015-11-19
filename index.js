/* jshint node: true */
'use strict';
var Funnel = require('broccoli-funnel');
var path = require('path');

module.exports = {
  name: 'ember-mobiledoc-editor',

  treeForVendor: function() {
    var distDir = path.join(
      path.dirname(require.resolve('mobiledoc-kit/package.json')),
      'dist'
    );

    var files = new Funnel(distDir, {
      files: [
        'css/mobiledoc-kit.css',
        'global/mobiledoc-kit.js',
        'global/mobiledoc-kit.map'
      ],
      destDir: 'mobiledoc-kit'
    });
    return files;
  },

  included: function(app) {
    app.import('vendor/mobiledoc-kit/css/mobiledoc-kit.css');
    app.import('vendor/mobiledoc-kit/global/mobiledoc-kit.js');
  }
};
