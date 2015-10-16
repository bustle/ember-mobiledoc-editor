/* jshint node: true */
'use strict';
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-content-kit',
  treeForVendor: function() {
    var files = new Funnel(__dirname + '/node_modules/content-kit-editor/dist/', {
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
