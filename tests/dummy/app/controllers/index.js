import Ember from 'ember';

let mobiledocs = {
  simple: {
    version: '0.3.0',
    markups: [],
    cards: [],
    atoms: [],
    sections: [
      [1, 'P', [
        [0, [], 0, 'Hello world!']
      ]]
    ]
  },
  card: {
    version: '0.3.0',
    markups: [],
    cards: [['sample-card', {}]],
    atoms: [],
    sections: [
      [10, 0]
    ]
  },
  atom: {
    version: '0.3.0',
    markups: [],
    cards: [],
    atoms: [['sample-test-atom', 'bob', {foo: 'bar'}]],
    sections: [
      [1, 'P', [
        [0, [], 0, 'Hello card'],
        [1, 0, [], 0],
        [0, [], 0, '!']
      ]]
    ]
  }
};

export default Ember.Controller.extend({
  init() {
    this._super(...arguments);
    this.set('mobiledoc', mobiledocs['simple']);
    this.set('mobiledocNames', Object.keys(mobiledocs));
  },

  cardNames: ['sample-card'],
  atomNames: ['sample-test-atom'],

  actions: {
    selectMobiledoc({target: {value}}) {
      this.set('mobiledoc', mobiledocs[value]);
    }
  }
});
