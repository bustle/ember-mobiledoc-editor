import Ember from 'ember';
import titleize from '../utils/titleize';

export function contentKitTitleize([string]) {
  return titleize(string);
}

export default Ember.Helper.helper(contentKitTitleize);
