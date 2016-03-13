const RENDER_TYPE = 'dom';

import { ADD_CARD_HOOK, REMOVE_CARD_HOOK } from '../components/mobiledoc-editor/component';

function renderFallback() {
  let element = document.createElement('div');
  element.innerHTML = '[placeholder for Ember component card]';
  return element;
}

export default function createComponentCard(name) {

  return {
    name,
    type: RENDER_TYPE,
    render(cardArg) {
      let {env, options} = cardArg;
      if (!options[ADD_CARD_HOOK]) {
        return renderFallback();
      }

      let { card, element } = options[ADD_CARD_HOOK](cardArg);
      let { onTeardown } = env;

      onTeardown(() => options[REMOVE_CARD_HOOK](card));

      return element;
    },
    edit(cardArg) {
      let {env, options} = cardArg;
      if (!options[ADD_CARD_HOOK]) {
        return renderFallback();
      }

      let isEditing = true;
      let { card, element } = options[ADD_CARD_HOOK](cardArg, isEditing);
      let { onTeardown } = env;

      onTeardown(() => options[REMOVE_CARD_HOOK](card));

      return element;
    }
  };

}
