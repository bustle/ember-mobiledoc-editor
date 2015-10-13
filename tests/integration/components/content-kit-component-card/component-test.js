import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moveCursorTo from '../../../helpers/move-cursor-to';
import simulateMouseup from '../../../helpers/simulate-mouse-up';

moduleForComponent('content-kit-component-card', 'Integration | Component | content kit component card', {
  integration: true,
  setup() {
    this.registry.register('template:components/my-card', hbs`
      <button {{action data.edit}}>Edit</button>
    `);
    this.registry.register('template:components/my-card-editor', hbs`
      <button {{action data.cancel}}>Cancel</button>
    `);
  },

});

test('it renders', function(assert) {
  this.set('data', {
    edit() {},
    cancel() {}
  });
  this.render(hbs`{{content-kit-component-card cardName="my-card" data=data}}`);

  let cancelButton = this.$('button:contains(Cancel)');
  assert.ok(!!cancelButton.length, '`Cancel` buttons found');
  cancelButton.click();
  assert.ok(!!this.$('button:contains(Edit)').length, '`Edit` buttons found');
});

test('#activeSectionTagNames is correct', function(assert) {
  let done = assert.async();

  this.set('mobiledoc', {
    version: '0.2.0',
    sections: [
      [],
      [
        [1, 'p', [[[], 0, "first paragraph"]]],
        [1, 'blockquote', [[[], 0, "blockquote section"]]]
      ]
    ]
  });
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc as |contentKit|}}
      {{#if contentKit.activeSectionTagNames.isBlockquote}}
        <div id='is-block-quote'>is block quote</div>
      {{/if}}
      {{#if contentKit.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{/if}}
    {{/content-kit-editor}}
  `);

  moveCursorTo(this, 'blockquote:contains(blockquote section)');
  simulateMouseup();

  setTimeout(() => {
    assert.ok(this.$('#is-block-quote').length, 'is block quote');

    moveCursorTo(this, 'p:contains(first paragraph)');
    simulateMouseup();

    setTimeout(() => {
      assert.ok(this.$('#is-p').length, 'is p');
      done();
    }, 10);
  }, 10);
});

test('#activeSectionTagNames is correct when a card is selected', function(assert) {
  let done = assert.async();

  this.set('mobiledoc', {
    version: '0.2.0',
    sections: [
      [],
      [
        [1, 'p', [[[], 0, "first paragraph"]]],
        [10, 'test-card', {}]
      ]
    ]
  });

  this.set('cards', [{
    name: 'test-card',
    display: {
      setup(element) {
        let input = $('<input id="test-card-inner">');
        $(element).append(input);
        setTimeout(() => {
          input.focus();
        });
      }
    }
  }]);

  this.render(hbs`
    {{#content-kit-editor cards=cards mobiledoc=mobiledoc as |contentKit|}}
      {{#if contentKit.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{else}}
        <div id='not-p'>not p</div>
      {{/if}}
    {{/content-kit-editor}}
  `);

  // Since the card focuses on itself, the editor will report the card
  // as the active selection after mouseup, triggering a bug in the
  // cursorDidChange handler of the content-kit-editor component
  simulateMouseup();

  setTimeout(() => {
    assert.ok(this.$('#not-p').length, 'is not p');
    done();
  });
});
