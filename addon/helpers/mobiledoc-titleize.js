import Ember from 'ember';
import titleize from '../utils/titleize';

export function mobiledocTitleize([string]) {
  return titleize(string);
}

export default Ember.Helper.helper(mobiledocTitleize);
