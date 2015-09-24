import Ember from 'ember';

export function inArray([array, item]) {
  if (!array) { array = []; }
  return array.indexOf(item) !== -1;
}

export default Ember.Helper.helper(inArray);
