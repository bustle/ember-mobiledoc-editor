import Ember from 'ember';

let { computed } = Ember;

export default Ember.Controller.extend({
  cardNames: ['sample-card'],
  mobiledoc: computed(function() {
    return {
      version: '0.2.0',
      sections: [
        [],
        [
          [1, 'P', [
            [[], 0, 'Hello world!']
          ]],
          [10, 'sample-card', {foo: 'bar'}],
          [1, 'P', [
            [[], 0, 'Hello world!']
          ]],
        ]
      ]
    };
  })
});
