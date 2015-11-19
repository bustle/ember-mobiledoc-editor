import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import { module, test } from 'qunit';

module('Unit | Utility | create component card');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = createComponentCard('foo-card');
  assert.ok(result.name === 'foo-card' &&
            result.type === 'dom' &&
            typeof result.render === 'function' &&
            typeof result.edit === 'function',
    'created a named card'
  );
});
