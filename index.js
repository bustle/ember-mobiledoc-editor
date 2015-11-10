/* jshint node: true */
'use strict';
var Funnel = require('broccoli-funnel');
var resolve = require('resolve');
var path = require('path');

module.exports = {
  name: 'ember-mobiledoc-editor',
  treeForVendor: function() {
    var mainPath = resolve.sync('mobiledoc-kit');
    var mainDir = path.dirname(mainPath);
    var files = new Funnel(mainDir + '/../../', {
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
