import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mobiledoc link button', function (hooks) {
  setupRenderingTest(hooks);

  test('it displays button', async function (assert) {
    let editor = EObject.create({
      toggleLink() {},
      activeMarkupTagNames: {},
    });
    this.set('editor', editor);
    await render(hbs`<MobiledocLinkButton @editor={{editor}} />`);

    let button = find('button');
    assert.dom(button).containsText('Link', 'default text is "Link"');
    assert.dom(button).doesNotHaveClass('active', 'button is not active');

    run(() => {
      editor.set('activeMarkupTagNames', { isA: true });
    });
    await settled();

    assert.dom(button).hasClass('active', 'button activates');
  });

  test('it includes `title` attribute when provided', async function (assert) {
    await render(hbs`<MobiledocLinkButton @title={{title}} />`);

    let button = find('button');
    assert
      .dom(button)
      .doesNotHaveAttribute(
        'title',
        'button does not have a `title` attribute by default'
      );

    this.set('title', 'Link');

    assert
      .dom(button)
      .hasAttribute(
        'title',
        'Link',
        'button has `title` attribute when provided'
      );
  });

  test('it yields for html', async function (assert) {
    this.set('editor', {
      toggleLink() {},
      activeMarkupTagNames: {},
    });
    await render(hbs`
      <MobiledocLinkButton @editor={{editor}}>
        Fuerte
      </MobiledocLinkButton>
    `);

    assert.dom('button').hasText('Fuerte', 'text is yielded');
  });

  test('it calls toggleLink on click', async function (assert) {
    assert.expect(1);
    let mockEditor = {
      toggleLink() {
        assert.ok(true, 'toggleLink called');
      },
      activeMarkupTagNames: {},
    };
    this.set('editor', mockEditor);
    await render(hbs`
      {{~mobiledoc-link-button editor=editor~}}
    `);

    await click('button');
  });
});
