import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

let { run, Object: EObject } = Ember;

moduleForComponent('mobiledoc-link-button', 'Integration | Component | mobiledoc link button', {
  integration: true
});

test('it displays button', function(assert) {
  let editor = EObject.create({
    toggleLink() {},
    activeMarkupTagNames: {}
  });
  this.set('editor', editor);
  this.render(hbs`{{mobiledoc-link-button editor=editor}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Link',
    'default text is "Link"');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    editor.set('activeMarkupTagNames', { isA: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it yields for html', function(assert) {
  this.set('editor', {
    toggleLink() {},
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~#mobiledoc-link-button editor=editor~}}
      Fuerte
    {{~/mobiledoc-link-button~}}
  `);

  assert.equal(
    this.$('button').html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleLink on click', function(assert) {
  assert.expect(1);
  let mockEditor = {
    toggleLink() {
      assert.ok(true, 'toggleLink called');
    },
    activeMarkupTagNames: {}
  };
  this.set('editor', mockEditor);
  this.render(hbs`
    {{~mobiledoc-link-button editor=editor~}}
  `);

  this.$('button').click();
});
