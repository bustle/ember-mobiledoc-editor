import { find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { insertText, run } from '../../tests/helpers/ember-mobiledoc-editor';

module('Acceptance | /', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting / and insertText', async function (assert) {
    assert.expect(3);

    await visit('/');

    assert
      .dom('#has-changed')
      .hasText('HAS CHANGED 0', 'precond - no change until insert text');
    let editorEl = find('.mobiledoc-editor');
    insertText(editorEl, 'abcdef');
    assert.dom('.mobiledoc-editor').containsText('abcdef', 'inserts text');
    assert.dom('#has-changed').hasText('HAS CHANGED 1');
  });

  test('visiting / and run', async function (assert) {
    assert.expect(4);

    await visit('/');

    assert
      .dom('#has-changed')
      .hasText('HAS CHANGED 0', 'precond - no change until insert text');

    let editorEl = find('.mobiledoc-editor');
    run(editorEl, (postEditor) => {
      let { editor } = postEditor;
      let { post } = editor;
      let section = postEditor.builder.createMarkupSection('p');
      postEditor.insertSectionBefore(post.sections, section);

      let position = post.tailPosition();
      position = postEditor.insertText(position, 'abc');
      let em = postEditor.builder.createMarkup('em');
      postEditor.insertTextWithMarkup(position, 'def', [em]);
    });
    assert.dom('.mobiledoc-editor').containsText('abcdef', 'inserts text');
    assert
      .dom('.mobiledoc-editor em')
      .containsText('def', 'inserts marked-up text');
    assert.dom('#has-changed').hasText('HAS CHANGED 1');
  });
});
