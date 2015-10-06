import Ember from 'ember';

let { capitalize, camelize } = Ember.String;

export default function(string) {
  return capitalize(camelize(string));
}
