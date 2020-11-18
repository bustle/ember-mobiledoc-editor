import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  didInsertElement() {
    this.element.querySelector('input').focus();
  }
});
