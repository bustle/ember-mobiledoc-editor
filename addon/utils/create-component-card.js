const RENDER_TYPE = 'dom';

import { ADD_HOOK, REMOVE_HOOK } from '../components/mobiledoc-editor/component';

export default function createComponentCard(name) {

  return {
    name,
    type: RENDER_TYPE,
    render(cardArg) {
      let {env, options} = cardArg;
      let { card, element } = options[ADD_HOOK](cardArg);
      let { onTeardown } = env;

      onTeardown(() => options[REMOVE_HOOK](card));

      return element;
    },
    edit(cardArg) {
      let {env, options} = cardArg;
      let isEditing = true;
      let { card, element } = options[ADD_HOOK](cardArg, isEditing);
      let { onTeardown } = env;

      onTeardown(() => options[REMOVE_HOOK](card));

      return element;
    }
  };

}
