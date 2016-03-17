import Ember from 'ember';
import Renderer from 'ember-mobiledoc-dom-renderer';
import { RENDER_TYPE } from 'ember-mobiledoc-dom-renderer';
import layout from '../templates/components/render-mobiledoc';

let { $, computed, assert } = Ember;
let { run: { schedule, join } } = Ember;

const ADD_CARD_HOOK      = 'addComponentCard';
const REMOVE_CARD_HOOK   = 'removeComponentCard';
const ADD_ATOM_HOOK      = 'addComponentAtom';
const REMOVE_ATOM_HOOK   = 'removeComponentAtom';

const COMPONENT_NAME          = 'render-mobiledoc';
const ELEMENT_CLASS = '__rendered-mobiledoc';
const UUID_PREFIX   = '__rendered-mobiledoc-card-';
export const CARD_ELEMENT_CLASS = '__rendered-mobiledoc-card';
export const ATOM_ELEMENT_CLASS = '__rendered-mobiledoc-atom';

function createComponentCard(name) {
  return {
    name,
    type: RENDER_TYPE,
    render({env, options}) {
      let addHook = options[ADD_CARD_HOOK];
      let removeHook = options[REMOVE_CARD_HOOK];
      let { onTeardown } = env;

      let { card, element } = addHook(...arguments);
      onTeardown(() => removeHook(card));

      return element;
    }
  };
}

function createComponentAtom(name) {
  return {
    name,
    type: RENDER_TYPE,
    render({env, options}) {
      let addHook = options[ADD_ATOM_HOOK];
      let removeHook = options[REMOVE_ATOM_HOOK];
      let { onTeardown } = env;

      let { atom, element } = addHook(...arguments);
      onTeardown(() => removeHook(atom));

      return element;
    }
  };
}

export default Ember.Component.extend({
  layout: layout,

  // pass in an array of card names that the mobiledoc may have. These
  // map to component names using `cardNameToComponentName`
  cardNames: [],

  // pass in an array of atom names that the mobiledoc may have. These
  // map to component names using `atomNameToComponentName`
  atomNames: [],

  _mdcCards: computed('cardNames', function() {
    return this.get('cardNames').map(name => createComponentCard(name));
  }),

  _mdcAtoms: computed('atomNames', function() {
    return this.get('atomNames').map(name => createComponentAtom(name));
  }),

  _renderMobiledoc: Ember.observer('mobiledoc', '_mdcCards', Ember.on('didInsertElement', function() {
    if (this._teardownRender) {
      this._teardownRender();
      this._teardownRender = null;
    }

    let cardOptions = {
      [ADD_CARD_HOOK]: ({env, options, payload}) => {
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
      [ADD_ATOM_HOOK]: ({env, options, value, payload}) => {
        let { name: atomName } = env;
        let uuid = this.generateUuid();
        let element = $("<span></span>")
          .attr('id', uuid)
          .addClass(ATOM_ELEMENT_CLASS)
          .addClass(ATOM_ELEMENT_CLASS + '-' + atomName)[0];

        let componentName = this.atomNameToComponentName(atomName);

        let atom = {
          componentName,
          destinationElementId: uuid,
          payload,
          value
        };
        this.addAtom(atom);
        return { atom, element };
      },
      [REMOVE_CARD_HOOK]: (card) => this.removeCard(card),
      [REMOVE_ATOM_HOOK]: (atom) => this.removeAtom(atom)
    };

    let cards = this.get('_mdcCards');
    let atoms = this.get('_mdcAtoms');
    let mobiledoc = this.get('mobiledoc');
    assert(`Must pass mobiledoc to "${COMPONENT_NAME}" component`, !!mobiledoc);

    let renderer = new Renderer({cards, atoms, cardOptions});
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

  // override in subclass to change the mapping of atom name -> component name
  atomNameToComponentName(name) {
    return name;
  },

  // @private

  _componentCards: computed(function() {
    return Ember.A();
  }),

  _componentAtoms: computed(function() {
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

  addAtom(atom) {
    schedule('afterRender', () => {
      this.get('_componentAtoms').pushObject(atom);
    });
  },

  removeAtom(atom) {
    join(() => {
      this.get('_componentAtoms').removeObject(atom);
    });
  },

  getRenderElement() {
    return this.$('.' + ELEMENT_CLASS)[0];
  },

  generateUuid() {
    return `${UUID_PREFIX}${Ember.uuid()}`;
  }
});
