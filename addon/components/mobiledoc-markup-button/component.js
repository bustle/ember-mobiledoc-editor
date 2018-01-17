import { defineProperty, observer, computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import titleize from '../../utils/titleize';

export default Component.extend({
  tagName: 'button',
  layout,
  attributeBindings: ['type', 'title'],
  classNameBindings: ['isActive:active'],
  type: 'button',
  init() {
    this._super(...arguments);
    this._updateIsActiveCP();
  },
  onForDidChange: observer('for', function() {
    this._updateIsActiveCP();
  }),
  _updateIsActiveCP() {
    let forProperty = this.get('for');
    let fullPath = `editor.activeMarkupTagNames.is${titleize(forProperty)}`;
    let cp = computed(fullPath, function() {
      return this.get(fullPath);
    });
    defineProperty(this, 'isActive', cp);
  },
  click() {
    let editor = this.get('editor');
    let forProperty = this.get('for');
    editor.toggleMarkup(forProperty);
  }
});
