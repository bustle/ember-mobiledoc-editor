const EDITOR_CARD_SUFFIX = '-editor';

export default function createComponentCard(name) {

  return {
    name,

    display: {
      setup(element, options, env, payload) {
        let card = options.onAddComponentCard(element, name, env, payload);
        return function() { options.onRemoveComponentCard(card); };
      },

      teardown(removeComponentCard) {
        removeComponentCard();
      }
    },

    edit: {
      setup(element, options, env, payload) {
        let cardName = name + EDITOR_CARD_SUFFIX;
        let card = options.onAddComponentCard(element, cardName, env, payload);
        return function() { options.onRemoveComponentCard(card); };
      },

      teardown(removeComponentCard) {
        removeComponentCard();
      }
    }

  };

}
