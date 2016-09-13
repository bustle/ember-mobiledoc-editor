import Ember from 'ember';

export default Ember.Controller.extend({
  changeCount: 0,

  actions: {
    onChange() {
      this.incrementProperty('changeCount');
    }
  }
});
