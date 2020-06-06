import { helper } from '@ember/component/helper';

export function includes([array, item] /* , attributeHash */) {
  if (!array || !array.includes) {
    return false;
  }
  return array.includes(item);
}

export default helper(includes);
