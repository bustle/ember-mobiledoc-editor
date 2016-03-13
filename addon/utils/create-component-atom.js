const RENDER_TYPE = 'dom';

import { ADD_ATOM_HOOK, REMOVE_ATOM_HOOK } from '../components/mobiledoc-editor/component';

function renderFallback() {
  let element = document.createElement('span');
  element.innerHTML = '[placeholder for Ember atom]';
  return element;
}

export default function createComponentAtom(name) {

  return {
    name,
    type: RENDER_TYPE,
    render(atomArg) {
      let {env, options} = atomArg;
      if (!options[ADD_ATOM_HOOK]) {
        return renderFallback();
      }

      let { atom, element } = options[ADD_ATOM_HOOK](atomArg);
      let { onTeardown } = env;

      onTeardown(() => options[REMOVE_ATOM_HOOK](atom));

      return element;
    }
  };

}
