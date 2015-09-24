import createComponentCard from 'ember-content-kit/utils/create-component-card';
import { module, test } from 'qunit';

module('Unit | Utility | create component card');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = createComponentCard('foo-card');
  assert.ok(result.name === 'foo-card' && typeof result.display.setup === 'function' && typeof result.display.teardown === 'function',
    'created a named card');
});
