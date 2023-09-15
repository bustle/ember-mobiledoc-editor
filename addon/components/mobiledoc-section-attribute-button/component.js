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
    let attributeName = this.attributeName;
    let fullPath = `editor.activeSectionAttributes.${camelize(attributeName)}`;
    let cp = computed(fullPath, 'attributeValue', function(){
      let activeValues = this.get(fullPath) || [];
      let attributeValue = this.attributeValue;
      return activeValues.includes(attributeValue) || (isEmpty(activeValues) && this.editor.isDefaultAttributeValue(attributeName, attributeValue));
    });
    defineProperty(this, 'isActive', cp);
  },
  click() {
    let editor = this.editor;
    let attributeName = this.attributeName;
    let attributeValue = this.attributeValue;
    editor.setAttribute(attributeName, attributeValue);
  }
});
