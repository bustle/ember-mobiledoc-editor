import Ember from 'ember';
import layout from './template';

let { Component } = Ember;

const LEFT_PADDING = 0;
const TOP_PADDING = 10;

export default Component.extend({
  layout,
  classNames: ['mobiledoc-selection-tether'],
  left: 0,
  top: 0,

  willInsertElement() {
    let selection = window.getSelection();
    let range = selection && selection.rangeCount && selection.getRangeAt(0);

    Ember.assert('Should not render {{#tether-to-selection}} when there is no selection', !!range);

    if (range) {
      let rect = range.getBoundingClientRect();
      // Fallback on parent element container if no anchor container found:
      if (!rect.left && !rect.top) rect = range.startContainer.getBoundingClientRect()
      this.set('left', rect.left);
      this.set('top', rect.top);
    }
  },

  didInsertElement() {
    Ember.run.schedule('afterRender', () => {
      let myHeight = this.$().height();
      let left = this.get('left') - LEFT_PADDING;
      let top = this.get('top') - TOP_PADDING - myHeight;

      this.$().css({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`
      });
    });
  }
});
