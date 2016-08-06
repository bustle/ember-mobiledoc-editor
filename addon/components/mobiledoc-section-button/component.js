import Ember from 'ember';
import layout from './template';
import titleize from '../../utils/titleize';

let { computed, observer, defineProperty, Component } = Ember;

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
    let fullPath = `editor.activeSectionTagNames.is${titleize(forProperty)}`;
    let cp = computed(fullPath, function() {
      return this.get(fullPath);
    });
    defineProperty(this, 'isActive', cp);
  },
  click() {
    let editor = this.get('editor');
    let forProperty = this.get('for');
    editor.toggleSection(forProperty);
  }
});
