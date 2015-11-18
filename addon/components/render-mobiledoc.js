import Ember from 'ember';
import Renderer from 'ember-mobiledoc-dom-renderer';
import layout from '../templates/components/render-mobiledoc';

let { $, computed, assert } = Ember;
let { run: { schedule, join } } = Ember;

const ADD_HOOK      = 'addComponentCard';
const REMOVE_HOOK   = 'removeComponentCard';
const NAME          = 'render-mobiledoc';
const ELEMENT_CLASS = '__rendered-mobiledoc';
const UUID_PREFIX   = '__rendered-mobiledoc-card-';
export const CARD_ELEMENT_CLASS = '__rendered-mobiledoc-card';

function createComponentCard(name) {
  return {
    name,
    display: {
      setup(element, options /*, env, payload */) {
        let card = options[ADD_HOOK](...arguments);
        return () => options[REMOVE_HOOK](card);
      },
      teardown(teardownFn) {
        teardownFn();
      }
    }
  };
}

export default Ember.Component.extend({
  layout: layout,

  // pass in an array of card names that the mobiledoc may have. These
  // map to component names using `cardNameToComponentName`
  cardNames: [],

  _mdcCards: computed('cardNames', function() {
    return this.get('cardNames').reduce((acc, cardName) => {
      acc[cardName] = createComponentCard(cardName);
      return acc;
    }, {});
  }),

  didInsertElement() {
    this._super(...arguments);

    let rendererOptions = {
      cardOptions: {
        [ADD_HOOK]: (element, options, {name:cardName}, payload) => {
          let uuid = this.generateUuid();
          $(element).attr('id', uuid)
                    .addClass(CARD_ELEMENT_CLASS)
                    .addClass(CARD_ELEMENT_CLASS + '-' + cardName);
          let componentName = this.cardNameToComponentName(cardName);

          let card = {
            componentName,
            destinationElementId: uuid,
            payload
          };
          this.addCard(card);
          return card;
        },
        [REMOVE_HOOK]: (card) => this.removeCard(card)
      }
    };

    let element = this.getRenderElement();
    let cards = this.get('_mdcCards');
    let mobiledoc = this.get('mobiledoc');
    assert(`Must pass mobiledoc to "${NAME}" component`, !!mobiledoc);

    let renderer = new Renderer();
    renderer.render(mobiledoc, element, cards, rendererOptions);
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
