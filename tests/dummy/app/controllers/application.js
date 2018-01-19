import Controller from '@ember/controller';

export default Controller.extend({
  changeCount: 0,

  actions: {
    onChange() {
      this.incrementProperty('changeCount');
    }
  }
});
