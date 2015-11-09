import Ember from 'ember';
import layout from './template';

let { Component } = Ember;

export default Component.extend({
  layout,
  tagName: 'ul',
  classNames: ['mobiledoc-toolbar'],
});
