import { hash } from 'ember-mobiledoc-editor/helpers/hash';
import { module, test } from 'qunit';

module('Unit | Helper | hash');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = hash([], { foo: 'bar' });
  assert.ok(result.foo, 'hash contains arguments');
});
