import { mobiledocTitleize } from 'ember-mobiledoc-editor/helpers/mobiledoc-titleize';
import { module, test } from 'qunit';

module('Unit | Helper | mobiledoc titleize', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let result = mobiledocTitleize(['foo-bar']);
    assert.equal(result, 'FooBar');
  });
});
