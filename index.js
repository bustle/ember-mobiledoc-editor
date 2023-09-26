/* jshint node: true */
'use strict';

module.exports = {
  name: require('./package').name,

  included: function (app) {
    this._super.included.apply(this, app);

    app.import('node_modules/mobiledoc-kit/dist/mobiledoc.css');
  },
};
