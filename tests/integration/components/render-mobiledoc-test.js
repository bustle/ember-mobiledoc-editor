import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { CARD_ELEMENT_CLASS, ATOM_ELEMENT_CLASS } from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';
import Ember from 'ember';

moduleForComponent('render-mobiledoc', 'Integration | Component | render-mobiledoc', {
  integration: true
});

const cardName = 'sample-test-card';
const atomName = 'sample-test-atom';

function createSimpleMobiledoc(text) {
  return {
    version: '0.3.0',
    markups: [],
    atoms: [],
    cards: [],
    sections: [
      [1, 'P', [
        [0, [], 0, text]
      ]]
    ]
  };
}

function createMobiledocWithAtom(atomName) {
  return {
    version: '0.3.0',
    markups: [],
    atoms: [
      [atomName, 'value', {foo: 'bar'}]
    ],
    cards: [],
    sections: [
      [1, 'P', [
        [1, [], 0, 0]
      ]]
    ]
  };
}

function createMobiledocWithCard(cardName) {
  return {
    version: '0.3.0',
    markups: [],
    atoms: [],
    cards: [
      [cardName, {foo: 'bar'}]
    ],
    sections: [
      [10, 0]
    ]
  };
}


test('it renders mobiledoc', function(assert) {
  this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc}}`);

  assert.ok(this.$('p:contains(Hello, world!)').length, 'renders hello world');
});

test('it renders mobiledoc with cards', function(assert) {
  this.set('mobiledoc', createMobiledocWithCard(cardName));
  this.set('cardNames', [cardName]);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc cardNames=cardNames}}`);

  assert.ok(this.$('#sample-test-card').length, 'renders card template');
  assert.ok(this.$('#sample-test-card:contains(foo: bar)').length,
            'renders card payload');
  assert.ok(this.$('.' + CARD_ELEMENT_CLASS).length,
            `renders card with class ${CARD_ELEMENT_CLASS}`);
  assert.ok(this.$('.' + CARD_ELEMENT_CLASS + '-' + cardName).length,
            `renders card with class ${CARD_ELEMENT_CLASS}-${cardName}`);
});

test('it uses `cardNameToComponentName` to allow selecting components', function(assert) {
  this.set('mobiledoc', createMobiledocWithCard(cardName));
  this.set('cardNames', [cardName]);

  let passedCardName;
  let Component = this.container.lookupFactory('component:render-mobiledoc');
  this.registry.register('component:my-render-mobiledoc', Component.extend({
    cardNameToComponentName(cardName) {
      passedCardName = cardName;
      return 'sample-changed-name-test-card';
    }
  }));

  this.render(hbs`{{my-render-mobiledoc mobiledoc=mobiledoc cardNames=cardNames}}`);

  assert.ok(this.$('#sample-changed-name-test-card').length,
            'renders card template');
  assert.ok(this.$('#sample-changed-name-test-card:contains(foo: bar)').length,
            'renders card payload');
  assert.equal(passedCardName, 'sample-test-card',
               'calls `cardNameToComponentName` with correct card');
});

test('it renders mobiledoc with atoms', function(assert) {
  this.set('mobiledoc', createMobiledocWithAtom(atomName));
  this.set('atomNames', [atomName]);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc atomNames=atomNames}}`);

  assert.ok(this.$('#sample-test-atom').length, 'renders atom template');
  assert.ok(this.$('#sample-test-atom:contains(value: value)').length,
            'renders atom value');
  assert.ok(this.$('#sample-test-atom:contains(payload: bar)').length,
            'renders atom payload');
  assert.ok(this.$('.' + ATOM_ELEMENT_CLASS).length,
            `renders atom with class ${ATOM_ELEMENT_CLASS}`);
  assert.ok(this.$('.' + ATOM_ELEMENT_CLASS + '-' + atomName).length,
            `renders atom with class ${ATOM_ELEMENT_CLASS}-${atomName}`);
});

test('it uses `atomNameToComponentName` to allow selecting components', function(assert) {
  this.set('mobiledoc', createMobiledocWithAtom(atomName));
  this.set('atomNames', [atomName]);

  let passedAtomName;
  let Component = this.container.lookupFactory('component:render-mobiledoc');
  this.registry.register('component:my-render-mobiledoc', Component.extend({
    atomNameToComponentName(atomName) {
      passedAtomName = atomName;
      return 'sample-changed-name-test-atom';
    }
  }));

  this.render(hbs`{{my-render-mobiledoc mobiledoc=mobiledoc atomNames=atomNames}}`);

  assert.ok(this.$('#sample-changed-name-test-atom').length,
            'renders atom template');
  assert.ok(this.$('#sample-changed-name-test-atom:contains(value: value)').length,
            'renders atom value');
  assert.ok(this.$('#sample-changed-name-test-atom:contains(payload: bar)').length,
            'renders atom payload');
  assert.equal(passedAtomName, 'sample-test-atom',
               'calls `atomNameToComponentName` with correct atom');
});

test('it does not rerender if a atom component changes its card\'s payload or value', function(assert) {
  let inserted = 0;
  let atom;
  let Component = Ember.Component.extend({
    didInsertElement() {
      atom = this;
      inserted++;
    }
  });
  this.registry.register('component:test-atom', Component);
  this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
  this.set('atomNames', ['test-atom']);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc atomNames=atomNames}}`);

  assert.equal(inserted, 1, 'inserts component once');
  Ember.run(() => atom.set('payload', {}));
  assert.equal(inserted, 1, 'after modifying payload, does not insert component atom again');
  Ember.run(() => atom.set('value', {}));
  assert.equal(inserted, 1, 'after modifying value, does not insert component atom again');
});

test('it rerenders when its mobiledoc changes', function(assert) {
  this.set('mobiledoc', createSimpleMobiledoc('Hello, world!'));
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc}}`);
  this.set('mobiledoc', createSimpleMobiledoc('Goodbye, world!'));
  assert.equal(this.$().text().trim(), 'Goodbye, world!');
});

test('it does not rerender if a card component changes its card\'s payload', function(assert) {
  let inserted = 0;
  let card;
  let Component = Ember.Component.extend({
    didInsertElement() {
      card = this;
      inserted++;
    }
  });
  this.registry.register('component:test-card', Component);
  this.set('mobiledoc', createMobiledocWithCard('test-card'));
  this.set('cardNames', ['test-card']);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc cardNames=cardNames}}`);

  assert.equal(inserted, 1, 'inserts component once');
  Ember.run(() => card.set('payload', {}));
  assert.equal(inserted, 1, 'after modifying payload, does not insert component card again');
});
