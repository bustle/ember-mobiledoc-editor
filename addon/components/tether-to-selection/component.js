import jQuery from 'jquery';
import Ember from 'ember';
import layout from './template';

let { Component } = Ember;

export default Component.extend({
  layout,
  didInsertElement() {
    Ember.run.schedule('afterRender', () => {
      var selection = window.getSelection();
      var range = selection && selection.rangeCount && selection.getRangeAt(0);

      if (range) {
        var rect = range.getBoundingClientRect();
        let wrapperOffset = jQuery('.mobiledoc-editor').offset();
        let myHeight = this.$().height();
        this.$().css({
          position: 'absolute',
          left: `${rect.left - wrapperOffset.left}px`,
          top: `${rect.top - wrapperOffset.top - myHeight - 10}px`
        });
      }
    });
  }
});
