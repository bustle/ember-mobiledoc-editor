import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module(
  'Integration | Component | mobiledoc section attribute button',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it displays button', async function (assert) {
      let editor = EObject.create({
        toggleSection() {},
        activeSectionAttributes: {},
        isDefaultAttributeValue(attributeName, attributeValue) {
          return attributeName === 'text-align' && attributeValue === 'left';
        },
      });
      this.set('editor', editor);
      await render(
        hbs`<MobiledocSectionAttributeButton @editor={{this.editor}} @attributeName="text-align" @attributeValue="left" />`
      );

      assert
        .dom('button')
        .containsText(
          'Left',
          'default text is capitalization of `attributeValue`'
        );
      assert
        .dom('button')
        .hasClass(
          'active',
          'button is active because editor isDefaultAttributeValue returns true in this case'
        );

      run(() => {
        editor.set('activeSectionAttributes', { textAlign: ['center'] });
      });
      await settled();

      assert.dom('button').doesNotHaveClass('active', 'button is not active');

      run(() => {
        editor.set('activeSectionAttributes', { textAlign: ['left'] });
      });

      assert.dom('button').hasClass('active', 'button activates');
    });

    test('it includes `title` attribute when provided', async function (assert) {
      let editor = EObject.create({
        toggleSection() {},
        activeSectionAttributes: {},
        isDefaultAttributeValue(attributeName, attributeValue) {
          return attributeName === 'text-align' && attributeValue === 'left';
        },
      });
      this.set('editor', editor);
      await render(
        hbs`<MobiledocSectionAttributeButton @editor={{this.editor}} @title={{this.title}} @attributeName="text-align" @attributeValue="left" />`
      );

      assert
        .dom('button')
        .doesNotHaveAttribute(
          'title',
          'button does not have a `title` attribute by default'
        );

      this.set('title', 'Align Left');

      assert
        .dom('button')
        .hasAttribute(
          'title',
          'Align Left',
          'button has `title` attribute when provided'
        );
    });

    test('it yields for html', async function (assert) {
      this.set('editor', {
        toggleSection() {},
        activeSectionAttributes: {},
        isDefaultAttributeValue(attributeName, attributeValue) {
          return attributeName === 'text-align' && attributeValue === 'left';
        },
      });
      await render(hbs`
        <MobiledocSectionAttributeButton @editor={{this.editor}} @attributeName="text-align" @attributeValue="left">
          Izquierda
        </MobiledocSectionAttributeButton>
      `);
      assert.dom('button').containsText('Izquierda', 'text is yielded');
    });

    test('it calls setAttribute on click', async function (assert) {
      assert.expect(3);
      this.set('editor', {
        setAttribute(name, value) {
          assert.ok(true, 'setAttribute called');
          assert.equal(
            name,
            'text-align',
            'setAttribute called with attributeName'
          );
          assert.equal(
            value,
            'left',
            'setAttribute called with attributeValue'
          );
        },
        activeSectionAttributes: {},
        isDefaultAttributeValue(attributeName, attributeValue) {
          return attributeName === 'text-align' && attributeValue === 'left';
        },
      });
      await render(hbs`
      <MobiledocSectionAttributeButton @editor={{this.editor}} @attributeName="text-align" @attributeValue="left" />
    `);

      await click('button');
    });
  }
);
