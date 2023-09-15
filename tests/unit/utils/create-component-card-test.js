import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import { module, test } from 'qunit';
import MobiledocDOMRenderer from 'mobiledoc-dom-renderer';

module('Unit | Utility | create component card', function() {
  test('it creates a card', function(assert) {
    let result = createComponentCard('foo-card');
    assert.ok(result.name === 'foo-card' &&
              result.type === 'dom' &&
              typeof result.render === 'function' &&
              typeof result.edit === 'function',
      'created a named card'
    );
  });

  test('it creates a renderable card', function(assert) {
    let card = createComponentCard('foo-card');
    let renderer = new MobiledocDOMRenderer({cards: [card]});

    let {result} = renderer.render({
      version: '0.3.2',
      cards: [
        ['foo-card', {}]
      ],
      sections: [
        [10, 0]
      ]
    });

    assert.ok(result, 'card rendered');
  });
});
