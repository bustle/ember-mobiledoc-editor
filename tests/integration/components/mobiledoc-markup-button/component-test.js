import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mobiledoc markup button', function (hooks) {
  setupRenderingTest(hooks);

  test('it displays button', async function (assert) {
    let editor = EObject.create({
      toggleMarkup() {},
      activeMarkupTagNames: {},
    });
    this.set('editor', editor);
    await render(
      hbs`<MobiledocMarkupButton @editor={{editor}} @for="strong" />`
    );

    assert
      .dom('button')
      .containsText('Strong', 'default text is capitalization of `for`');
    assert.dom('button').doesNotHaveClass('active', 'button is not active');

    run(() => {
      editor.set('activeMarkupTagNames', { isStrong: true });
    });
    await settled();

    assert.dom('button').hasClass('active', 'button activates');
  });

  test('it includes `title` attribute when provided', async function (assert) {
    await render(hbs`<MobiledocMarkupButton @for="strong" @title={{title}} />`);

    assert
      .dom('button')
      .doesNotHaveAttribute(
        'title',
        'button does not have a `title` attribute by default'
      );

    this.set('title', 'Bold');

    assert
      .dom('button')
      .hasAttribute(
        'title',
        'Bold',
        'button has `title` attribute when provided'
      );
  });

  test('it yields for html', async function (assert) {
    this.set('editor', {
      toggleMarkup() {},
      activeMarkupTagNames: {},
    });
    await render(hbs`
      <MobiledocMarkupButton @editor={{editor}} @for="strong">
        Fuerte
      </MobiledocMarkupButton>
    `);

    assert.dom('button').containsText('Fuerte', 'text is yielded');
  });

  test('it calls toggleMarkup on click', async function (assert) {
    assert.expect(2);
    this.set('editor', {
      toggleMarkup(tag) {
        assert.ok(true, 'toggleMarkup called');
        assert.equal(tag, 'strong', 'toggleMarkup called with "for" value');
      },
      activeMarkupTagNames: {},
    });
    await render(hbs`
      <MobiledocMarkupButton @editor={{editor}} @for="strong" />
    `);

    await click('button');
  });
});
