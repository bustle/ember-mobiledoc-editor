import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { insertText, run } from '../../tests/helpers/ember-mobiledoc-editor';

moduleForAcceptance('Acceptance | /');

test('visiting / and insertText', function(assert) {
  assert.expect(3);

  visit('/');

  andThen(() => {
    assert.equal(find('#has-changed').text().trim(), 'HAS CHANGED 0', 'precond - no change until insert text');
    let editorEl = find('.mobiledoc-editor')[0];
    return insertText(editorEl, 'abcdef');
  });

  andThen(() => {
    assert.ok(find('.mobiledoc-editor:contains(abcdef)').length, 'inserts text');
    assert.equal(find('#has-changed').text().trim(), 'HAS CHANGED 1');
  });
});

test('visiting / and run', function(assert) {
  assert.expect(4);

  visit('/');

  andThen(() => {
    assert.equal(find('#has-changed').text().trim(), 'HAS CHANGED 0', 'precond - no change until insert text');

    let editorEl = find('.mobiledoc-editor')[0];
    return run(editorEl, postEditor => {
      let { editor } = postEditor;
      let { post } = editor;
      let section = postEditor.builder.createMarkupSection('p');
      postEditor.insertSectionBefore(post.sections, section);

      let position = post.tailPosition();
      position = postEditor.insertText(position, 'abc');
      let em = postEditor.builder.createMarkup('em');
      postEditor.insertTextWithMarkup(position, 'def', [em]);
    });
  });

  andThen(() => {
    assert.ok(find('.mobiledoc-editor:contains(abcdef)').length, 'inserts text');
    assert.ok(find('.mobiledoc-editor em:contains(def)').length, 'inserts marked-up text');
    assert.equal(find('#has-changed').text().trim(), 'HAS CHANGED 1');
  });
});

