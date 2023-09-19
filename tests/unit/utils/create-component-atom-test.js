import createComponentAtom from 'ember-mobiledoc-editor/utils/create-component-atom';
import { module, test } from 'qunit';
import MobiledocDOMRenderer from 'mobiledoc-dom-renderer';

module('Unit | Utility | create component atom', function () {
  test('it creates an atom', function (assert) {
    let result = createComponentAtom('foo-atom');
    assert.ok(
      // eslint-disable-next-line qunit/no-assert-logical-expression
      result.name === 'foo-atom' &&
        result.type === 'dom' &&
        typeof result.render === 'function',
      'created a named atom'
    );
  });

  test('it creates a renderable atom', function (assert) {
    let atom = createComponentAtom('foo-atom');
    let renderer = new MobiledocDOMRenderer({ atoms: [atom] });

    let { result } = renderer.render({
      version: '0.3.2',
      atoms: [['foo-atom', '', {}]],
      sections: [[1, 'P', [[1, [], 0, 0]]]],
    });

    assert.ok(result, 'atom rendered');
  });
});
