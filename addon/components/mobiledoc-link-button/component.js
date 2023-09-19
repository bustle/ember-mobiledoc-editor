/* eslint-disable ember/no-classic-components */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
import { bool } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  tagName: 'button',
  layout,
  attributeBindings: ['type', 'title'],
  classNameBindings: ['isActive:active'],
  type: 'button',
  isActive: bool('editor.activeMarkupTagNames.isA'),
  click() {
    let editor = this.editor;
    editor.toggleLink();
  },
});
