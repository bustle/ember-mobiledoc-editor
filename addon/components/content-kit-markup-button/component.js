import Ember from 'ember';
import layout from './template';
import titleize from '../../utils/titleize';

let { computed, observer, defineProperty } = Ember;

export default Ember.Component.extend({
  tagName: 'button',
  layout,
  classNameBindings: ['isActive:active'],
  init() {
    this._super(...arguments);
    this._updateIsActiveCP();
  },
  onForDidChange: observer('for', function() {
    this._updateIsActiveCP();
  }),
  _updateIsActiveCP() {
    let forProperty = this.get('for');
    let fullPath = `contentKit.activeMarkupTagNames.is${titleize(forProperty)}`;
    let cp = computed(fullPath, function() {
      return this.get(fullPath);
    }); 
    defineProperty(this, 'isActive', cp);
  },
  click() {
    let contentKit = this.get('contentKit');
    let forProperty = this.get('for');
    contentKit.toggleMarkup(forProperty);
  }
});
