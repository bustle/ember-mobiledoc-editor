export default function createComponentCard(name) {

  return {
    name,

    display: {
      // TODO: This is sort of actually a `beforeAll/afterAll`, exploiting the
      // fact that `display` is (currently) the initial state for cards; plus,
      // we’re not ever triggering edit mode, only directly accessing the
      // callbacks in `env`
      setup(element, options, env, payload) {
        let card = options.onAddComponentCard(element, name, env, payload);
        return function() { options.onRemoveComponentCard(card); };
      },

      teardown(removeComponentCard) {
        removeComponentCard();
      }
    }

  };

}
