/* global MobiledocDOMRenderer */
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import { module, test } from 'qunit';

module('Unit | Utility | create component card');

test('it creates a card', function(assert) {
  var result = createComponentCard('foo-card');
  assert.ok(result.name === 'foo-card' &&
            result.type === 'dom' &&
            typeof result.render === 'function' &&
            typeof result.edit === 'function',
    'created a named card'
  );
});

test('it creates a renderable card', function(assert) {
  var card = createComponentCard('foo-card');
  let renderer = new MobiledocDOMRenderer({cards: [card]});

  let {result} = renderer.render({
    version: '0.3.0',
    cards: [
      ['foo-card', {}]
    ],
    sections: [
      [10, 0]
    ]
  });

  assert.ok(result, 'card rendered');
});
