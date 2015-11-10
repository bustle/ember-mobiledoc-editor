import Ember from 'ember';
import layout from './template';

let { computed, Component } = Ember;

export default Component.extend({
  tagName: 'button',
  layout,
  classNameBindings: ['isActive:active'],
  isActive: computed.bool('editor.activeMarkupTagNames.isA'),
  click() {
    let editor = this.get('editor');
    editor.toggleLink();
  }
});
