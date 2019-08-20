import { defineProperty, observer, computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import { camelize } from '@ember/string';
import { isEmpty } from '@ember/utils';

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
  onNameOrValueDidChange: observer('attributeName', 'attributeValue', function() {
    this._updateIsActiveCP();
  }),
  _updateIsActiveCP() {
    let attributeName = this.get('attributeName');
    let fullPath = `editor.activeSectionAttributes.${camelize(attributeName)}`;
    let cp = computed(fullPath, 'attributeValue', function(){
      let activeValues = this.get(fullPath) || [];
      let attributeValue = this.get('attributeValue');
      return activeValues.includes(attributeValue) || (isEmpty(activeValues) && this.editor.isDefaultAttributeValue(attributeName, attributeValue));
    });
    defineProperty(this, 'isActive', cp);
  },
  click() {
    let editor = this.get('editor');
    let attributeName = this.get('attributeName');
    let attributeValue = this.get('attributeValue');
    editor.setAttribute(attributeName, attributeValue);
  }
});
