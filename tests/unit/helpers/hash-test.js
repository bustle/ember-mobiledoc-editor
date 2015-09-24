import { hash } from 'ember-content-kit/helpers/hash';
import { module, test } from 'qunit';

module('Unit | Helper | hash');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = hash([], { foo: 'bar' });
  assert.ok(result.foo, 'hash contains arguments');
});
