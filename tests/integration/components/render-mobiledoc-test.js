import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { CARD_ELEMENT_CLASS } from 'ember-mobiledoc-dom-renderer/components/render-mobiledoc';

moduleForComponent('render-mobiledoc', 'Integration | Component | render-mobiledoc', {
  integration: true
});

let mobiledoc = {
  version: '0.2.0',
  sections: [
    [],
    [
      [1, 'P', [
        [[], 0, 'Hello, world!']
      ]]
    ]
  ]
};

let mobiledoc2 = {
  version: '0.2.0',
  sections: [
    [],
    [
      [1, 'P', [
        [[], 0, 'Goodbye, world!']
      ]]
    ]
  ]
};

let cardName = 'sample-test-card';

let mobiledocWithCard = {
  version: '0.2.0',
  sections: [
    [],
    [
      [10, cardName, {foo: 'bar'}]
    ]
  ]
};

test('it renders mobiledoc', function(assert) {
  this.set('mobiledoc', mobiledoc);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc}}`);

  assert.ok(this.$('p:contains(Hello, world)').length, 'renders hello world');
});

test('it renders mobiledoc with cards', function(assert) {
  this.set('mobiledoc', mobiledocWithCard);
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
  this.set('mobiledoc', mobiledocWithCard);
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


test('it updates when its input changes', function(assert) {
  this.set('mobiledoc', mobiledoc);
  this.render(hbs`{{render-mobiledoc mobiledoc=mobiledoc}}`);
  this.set('mobiledoc', mobiledoc2);
  assert.equal(this.$().text().trim(), 'Goodbye, world!');
});
