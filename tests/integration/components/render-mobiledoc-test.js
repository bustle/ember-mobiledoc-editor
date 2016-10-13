import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { CARD_ELEMENT_CLASS, ATOM_ELEMENT_CLASS } from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';
import Ember from 'ember';
import { createSimpleMobiledoc, createMobiledocWithCard, createMobiledocWithAtom } from '../../helpers/mobiledoc';

moduleForComponent('render-mobiledoc', 'Integration | Component | render-mobiledoc', {
  integration: true
});

const cardName = 'sample-test-card';
const atomName = 'sample-test-atom';

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

test('teardown destroys atom components', function(assert) {
  this.set('showRendered', true);
  this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
  this.set('atomNames', ['test-atom']);

  let MyRenderComponent = this.container.lookupFactory('component:render-mobiledoc');
  let didDestroy = [], didInsert = [];
  this.registry.register('component:my-render-mobiledoc', MyRenderComponent.extend({
    willDestroy() {
      didDestroy.push('my-render-mobiledoc');
    }
  }));

  let Component = Ember.Component.extend({
    didInsertElement() { didInsert.push('test-atom'); },
    willDestroy() { didDestroy.push('test-atom'); }
  });
  this.registry.register('component:test-atom', Component);

  this.render(
    hbs`{{#if showRendered}}
      {{my-render-mobiledoc mobiledoc=mobiledoc atomNames=atomNames}}
    {{/if}}`
  );

  assert.deepEqual(didDestroy, [], 'nothing destroyed');
  assert.deepEqual(didInsert, ['test-atom'], 'test-atom inserted');

  didInsert = [];

  this.set('mobiledoc', createSimpleMobiledoc('no cards or atoms'));

  assert.deepEqual(didDestroy, ['test-atom'], 'test-atom destroyed');
  assert.deepEqual(didInsert, [], 'nothing inserted');

  didDestroy = [];

  this.set('mobiledoc', createMobiledocWithAtom('test-atom'));

  didInsert = [];
  didDestroy = [];

  this.set('showRendered', false);

  assert.deepEqual(didDestroy, ['my-render-mobiledoc', 'test-atom'], 'destroyed all');
  assert.deepEqual(didInsert, [], 'nothing inserted');
});

test('changing mobiledoc calls teardown and destroys atom component', function(assert) {
  this.set('mobiledoc', createMobiledocWithAtom('test-atom'));
  this.set('atomNames', ['test-atom', 'other-atom']);

  let MyRenderComponent = this.container.lookupFactory('component:render-mobiledoc');
  let didDestroy = [], didInsert = [];
  this.registry.register('component:my-render-mobiledoc', MyRenderComponent.extend({
    willDestroy() {
      didDestroy.push('my-render-mobiledoc');
    }
  }));

  this.registry.register('component:test-atom', Ember.Component.extend({
    didInsertElement() { didInsert.push('test-atom'); },
    willDestroy() { didDestroy.push('test-atom'); }
  }));
  this.registry.register('component:other-atom', Ember.Component.extend({
    didInsertElement() { didInsert.push('other-atom'); },
    willDestroy() { didDestroy.push('other-atom'); }
  }));

  this.render(hbs`{{my-render-mobiledoc mobiledoc=mobiledoc atomNames=atomNames}}`);

  assert.deepEqual(didDestroy, [], 'nothing destroyed');
  assert.deepEqual(didInsert, ['test-atom'], 'test-atom inserted');

  didInsert = [];

  this.set('mobiledoc', createMobiledocWithAtom('other-atom'));

  assert.deepEqual(didInsert, ['other-atom'], 'inserted other atom');
  assert.deepEqual(didDestroy, ['test-atom'], 'destroyed test-atom');
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

test('teardown destroys card components', function(assert) {
  this.set('showRendered', true);
  this.set('mobiledoc', createMobiledocWithCard('test-card'));
  this.set('cardNames', ['test-card']);

  let MyRenderComponent = this.container.lookupFactory('component:render-mobiledoc');
  let didDestroy = [], didInsert = [];
  this.registry.register('component:my-render-mobiledoc', MyRenderComponent.extend({
    willDestroy() {
      didDestroy.push('my-render-mobiledoc');
    }
  }));

  let Component = Ember.Component.extend({
    didInsertElement() { didInsert.push('test-card'); },
    willDestroy() { didDestroy.push('test-card'); }
  });
  this.registry.register('component:test-card', Component);

  this.render(
    hbs`{{#if showRendered}}
      {{my-render-mobiledoc mobiledoc=mobiledoc cardNames=cardNames}}
    {{/if}}`
  );

  assert.deepEqual(didDestroy, [], 'nothing destroyed');
  assert.deepEqual(didInsert, ['test-card'], 'test-card inserted');

  didInsert = [];

  this.set('mobiledoc', createSimpleMobiledoc('no cards'));

  assert.deepEqual(didDestroy, ['test-card'], 'test-card destroyed');
  assert.deepEqual(didInsert, [], 'nothing inserted');

  // Change back to mobiledoc with card
  this.set('mobiledoc', createMobiledocWithCard('test-card'));

  didInsert = [];
  didDestroy = [];

  this.set('showRendered', false);

  assert.deepEqual(didDestroy, ['my-render-mobiledoc', 'test-card'], 'destroyed all');
  assert.deepEqual(didInsert, [], 'nothing inserted');
});

test('changing mobiledoc calls teardown and destroys card components', function(assert) {
  this.set('mobiledoc', createMobiledocWithCard('test-card'));
  this.set('cardNames', ['test-card', 'other-card']);

  let MyRenderComponent = this.container.lookupFactory('component:render-mobiledoc');
  let didDestroy = [], didInsert = [];
  this.registry.register('component:my-render-mobiledoc', MyRenderComponent.extend({
    willDestroy() {
      didDestroy.push('my-render-mobiledoc');
    }
  }));

  this.registry.register('component:test-card', Ember.Component.extend({
    didInsertElement() { didInsert.push('test-card'); },
    willDestroy() { didDestroy.push('test-card'); }
  }));
  this.registry.register('component:other-card', Ember.Component.extend({
    didInsertElement() { didInsert.push('other-card'); },
    willDestroy() { didDestroy.push('other-card'); }
  }));

  this.render(hbs`{{my-render-mobiledoc mobiledoc=mobiledoc cardNames=cardNames}}`);

  assert.deepEqual(didDestroy, [], 'nothing destroyed');
  assert.deepEqual(didInsert, ['test-card'], 'test-card inserted');

  didInsert = [];

  // change mobiledoc to one with other-card
  this.set('mobiledoc', createMobiledocWithCard('other-card'));

  assert.deepEqual(didInsert, ['other-card'], 'inserted other card');
  assert.deepEqual(didDestroy, ['test-card'], 'destroyed test-card');
});
