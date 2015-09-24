import jQuery from 'jquery';
import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  didInsertElement() {
    Ember.run.schedule('afterRender', () => {
      var selection = window.getSelection();
      var range = selection && selection.rangeCount && selection.getRangeAt(0);

      if (range) {
        var rect = range.getBoundingClientRect();
        let wrapperOffset = jQuery('.content-kit-editor').offset();
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
