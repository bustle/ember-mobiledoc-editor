/* eslint-disable ember/no-classic-components */
/* eslint-disable ember/no-component-lifecycle-hooks */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  didInsertElement() {
    this._super(...arguments);
    this.element.querySelector('input').focus();
  },
});
