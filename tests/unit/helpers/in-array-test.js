import { inArray } from '../../../helpers/in-array';
import { module, test } from 'qunit';

module('Unit | Helper | in array');

test('it works', function(assert) {
  const array = ['a','b'];
  assert.ok(inArray([array, 'b']));
  assert.ok(!inArray([array, 'c']));
});
