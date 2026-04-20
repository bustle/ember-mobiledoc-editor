import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  alignCenterMobileDoc,
  linkMobileDoc,
  mobiledocWithList,
} from '../../../helpers/create-mobiledoc';
import { Range } from 'mobiledoc-kit';

module('Integration | Component | mobiledoc toolbar', function (hooks) {
  setupRenderingTest(hooks);

  const buttonTitles = [
    'Bold',
    'Italic',
    'Link',
    'Heading',
    'Subheading',
    'Block Quote',
    'Pull Quote',
    'List',
    'Numbered List',
    'Align Left',
    'Align Center',
    'Align Right',
  ];

  test('it displays buttons', async function (assert) {
    assert.expect(buttonTitles.length);

    let mockEditor = {
      toggleLink() {},
      toggleMarkup() {},
      toggleSection() {},
      setAttribute() {},
    };
    this.set('editor', mockEditor);
    await render(hbs`<MobiledocToolbar @editor={{this.editor}} />`);

    buttonTitles.forEach((title) => {
      assert.dom(`button[title="${title}"]`).exists(`${title} button exists`);
    });
  });

  test('Link button is active when text is linked', async function (assert) {
    let text = 'Hello';
    this.set('mobiledoc', linkMobileDoc(text));
    let editor;
    this.didCreateEditor = (_editor) => (editor = _editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @autofocus={{false}} @did-create-editor={{this.didCreateEditor}} as |editor|>
        <MobiledocToolbar @editor={{editor}} />
      </MobiledocEditor>
    `);

    assert.dom('button[title="Link"]').exists('has link button');
    assert
      .dom('button[title="Link"]')
      .doesNotHaveClass('active', 'precond - not active');

    editor.selectRange(
      new Range(editor.post.headPosition(), editor.post.tailPosition())
    );

    assert
      .dom('button[title="Link"]')
      .hasClass('active', 'button is active after selecting link text');
  });

  test('List button is action when text is in list', async function (assert) {
    let text = 'Hello';
    this.set('mobiledoc', mobiledocWithList(text, 'ul'));
    this.didCreateEditor = (editor) => (this._editor = editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @autofocus={{false}} @did-create-editor={{this.didCreateEditor}} as |editor|>
        <MobiledocToolbar @editor={{editor}} />
      </MobiledocEditor>
    `);

    assert
      .dom('button[title="List"]')
      .doesNotHaveClass('active', 'precond - ul not active');
    assert
      .dom('button[title="Numbered List"]')
      .doesNotHaveClass('active', 'precond - ol not active');

    let { _editor: editor } = this;
    editor.selectRange(
      new Range(editor.post.headPosition(), editor.post.tailPosition())
    );

    assert
      .dom('button[title="List"]')
      .hasClass('active', 'ul button is active after selecting ul list text');
    assert
      .dom('button[title="Numbered List"]')
      .doesNotHaveClass(
        'active',
        'ol button is not active after selecting ul list text'
      );

    // toggle ul->ol
    await click('button[title="Numbered List"]');

    assert
      .dom('button[title="List"]')
      .doesNotHaveClass('active', 'ul button is inactive after toggle');
    assert
      .dom('button[title="Numbered List"]')
      .hasClass('active', 'ol button is active after toggle');

    // toggle ol->p
    await click('button[title="Numbered List"]');

    assert
      .dom('button[title="List"]')
      .doesNotHaveClass(
        'active',
        'ul button is inactive after toggle off list'
      );
    assert
      .dom('button[title="Numbered List"]')
      .doesNotHaveClass(
        'active',
        'ol button is inactive after toggle off list'
      );
  });

  test('Align Center button is active when text is aligned center', async function (assert) {
    let text = 'Hello';
    this.set('mobiledoc', alignCenterMobileDoc(text));
    let editor;
    this.didCreateEditor = (_editor) => (editor = _editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @autofocus={{false}} @did-create-editor={{this.didCreateEditor}} as |editor|>
        <MobiledocToolbar @editor={{editor}} />
      </MobiledocEditor>
    `);

    assert
      .dom('button[title="Align Center"]')
      .exists('has Align Center button');
    assert
      .dom('button[title="Align Center"]')
      .doesNotHaveClass('active', 'precond - not active');

    editor.selectRange(
      new Range(editor.post.headPosition(), editor.post.tailPosition())
    );

    assert
      .dom('button[title="Align Center"]')
      .hasClass('active', 'button is active after selecting text');
  });
});
