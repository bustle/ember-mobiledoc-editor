import Ember from 'ember';
import layout from './template';

let { Component } = Ember;

export default Component.extend({
  layout,

  didInsertElement() {
    this.$('input').focus();
  }
});
