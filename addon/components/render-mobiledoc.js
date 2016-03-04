import Ember from 'ember';
import Renderer from 'ember-mobiledoc-dom-renderer';
import { RENDER_TYPE } from 'ember-mobiledoc-dom-renderer';
import layout from '../templates/components/render-mobiledoc';

let { $, computed, assert } = Ember;
let { run: { schedule, join } } = Ember;

const ADD_HOOK      = 'addComponentCard';
const REMOVE_HOOK   = 'removeComponentCard';
const COMPONENT_NAME          = 'render-mobiledoc';
const ELEMENT_CLASS = '__rendered-mobiledoc';
const UUID_PREFIX   = '__rendered-mobiledoc-card-';
export const CARD_ELEMENT_CLASS = '__rendered-mobiledoc-card';

function createComponentCard(name) {
  return {
    name,
    type: RENDER_TYPE,
    render({env, options}) {
      let addHook = options[ADD_HOOK];
      let removeHook = options[REMOVE_HOOK];
      let { onTeardown } = env;

      let { card, element } = addHook(...arguments);
      onTeardown(() => removeHook(card));

      return element;
    }
  };
}

export default Ember.Component.extend({
  layout: layout,

  // pass in an array of card names that the mobiledoc may have. These
  // map to component names using `cardNameToComponentName`
  cardNames: [],

  _mdcCards: computed('cardNames', function() {
    return this.get('cardNames').map(name => createComponentCard(name));
  }),

  _renderMobiledoc: Ember.observer('mobiledoc', '_mdcCards', Ember.on('didInsertElement', function() {
    if (this._teardownRender) {
      this._teardownRender();
      this._teardownRender = null;
    }

    let cardOptions = {
      [ADD_HOOK]: ({env, options, payload}) => {
        let { name: cardName } = env;
        let uuid = this.generateUuid();
        let element = $("<div></div>")
          .attr('id', uuid)
          .addClass(CARD_ELEMENT_CLASS)
          .addClass(CARD_ELEMENT_CLASS + '-' + cardName)[0];

        let componentName = this.cardNameToComponentName(cardName);

        let card = {
          componentName,
          destinationElementId: uuid,
          payload
        };
        this.addCard(card);
        return { card, element };
      },
      [REMOVE_HOOK]: (card) => this.removeCard(card)
    };

    let cards = this.get('_mdcCards');
    let mobiledoc = this.get('mobiledoc');
    assert(`Must pass mobiledoc to "${COMPONENT_NAME}" component`, !!mobiledoc);

    let renderer = new Renderer({cards, cardOptions});
    let { result, teardown } = renderer.render(mobiledoc);
    this.getRenderElement().appendChild(result);

    this._teardownRender = teardown;
  })),

  willDestroyElement() {
    if (this._teardownRender) {
      this._teardownRender();
    }
    return this._super(...arguments);
  },

  // override in subclass to change the mapping of card name -> component name
  cardNameToComponentName(name) {
    return name;
  },

  // @private

  _componentCards: computed(function() {
    return Ember.A();
  }),

  addCard(card) {
    schedule('afterRender', () => {
      this.get('_componentCards').pushObject(card);
    });
  },

  removeCard(card) {
    join(() => {
      this.get('_componentCards').removeObject(card);
    });
  },

  getRenderElement() {
    return this.$('.' + ELEMENT_CLASS)[0];
  },

  generateUuid() {
    return `${UUID_PREFIX}${Ember.uuid()}`;
  }
});
