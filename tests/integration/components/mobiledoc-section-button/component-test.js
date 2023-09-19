import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mobiledoc section button', function (hooks) {
  setupRenderingTest(hooks);

  test('it displays button', async function (assert) {
    let editor = EObject.create({
      toggleSection() {},
      activeSectionTagNames: {},
    });
    this.set('editor', editor);
    await render(
      hbs`<MobiledocSectionButton @editor={{this.editor}} @for="h1" />`
    );

    assert
      .dom('button')
      .containsText('H1', 'default text is capitalization of `for`');
    assert.dom('button').doesNotHaveClass('active', 'button is not active');

    run(() => {
      editor.set('activeSectionTagNames', { isH1: true });
    });

    assert.dom('button').hasClass('active', 'button activates');
  });

  test('it includes `title` attribute when provided', async function (assert) {
    await render(
      hbs`<MobiledocSectionButton @for="strong" @title={{this.title}} />`
    );

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
      toggleSection() {},
      activeSectionTagNames: {},
    });
    await render(hbs`
      <MobiledocSectionButton @editor={{this.editor}} @for="h1">
        Fuerte
      </MobiledocSectionButton>
    `);

    assert.dom('button').containsText('Fuerte', 'text is yielded');
  });

  test('it calls toggleSection on click', async function (assert) {
    assert.expect(2);
    this.set('editor', {
      toggleSection(tag) {
        assert.ok(true, 'toggleSection called');
        assert.equal(tag, 'h1', 'toggleSection called with "for" value');
      },
      activeSectionTagNames: {},
    });
    await render(hbs`
      <MobiledocSectionButton @editor={{this.editor}} @for="h1" />
    `);

    await click('button');
  });
});
