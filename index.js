/* jshint node: true */
'use strict';
var Funnel = require('broccoli-funnel');
var resolve = require('resolve');
var path = require('path');

module.exports = {
  name: 'ember-content-kit',
  treeForVendor: function() {
    var mainPath = resolve.sync('content-kit-editor');
    var mainDir = path.dirname(mainPath);
    var files = new Funnel(mainDir + '/../../', {
      files: [
        'css/content-kit-editor.css',
        'global/content-kit-editor.js',
        'global/content-kit-editor.map'
      ],
      destDir: 'content-kit-editor'
    });
    return files;
  },
  included: function(app) {
    app.import('vendor/content-kit-editor/css/content-kit-editor.css');
    app.import('vendor/content-kit-editor/global/content-kit-editor.js');
  }

};
