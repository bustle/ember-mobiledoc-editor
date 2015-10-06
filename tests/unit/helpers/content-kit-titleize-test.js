import { contentKitTitleize } from 'ember-content-kit/helpers/content-kit-titleize';
import { module, test } from 'qunit';

module('Unit | Helper | content kit titleize');

// Replace this with your real tests.
test('it works', function(assert) {
  var result = contentKitTitleize(['foo-bar']);
  assert.equal(result, 'FooBar');
});
