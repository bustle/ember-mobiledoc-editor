import Ember from 'ember';
import layout from './template';

let { computed } = Ember;

export default Ember.Component.extend({
  tagName: 'button',
  layout,
  classNameBindings: ['isActive:active'],
  isActive: computed.bool('contentKit.activeMarkupTagNames.isA'),
  click() {
    let contentKit = this.get('contentKit');
    contentKit.toggleLink();
  }
});
