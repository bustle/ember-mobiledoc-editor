import { helper } from '@ember/component/helper';
import titleize from '../utils/titleize';

export function mobiledocTitleize([string]) {
  return titleize(string);
}

export default helper(mobiledocTitleize);
