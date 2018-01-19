import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobiledoc-markup-button', 'Integration | Component | mobiledoc markup button', {
  integration: true
});

test('it displays button', function(assert) {
  let editor = EObject.create({
    toggleMarkup() {},
    activeMarkupTagNames: {}
  });
  this.set('editor', editor);
  this.render(hbs`{{mobiledoc-markup-button editor=editor for="strong"}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Strong',
    'default text is capitalization of `for`');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    editor.set('activeMarkupTagNames', { isStrong: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it includes `title` attribute when provided', function(assert) {
  this.render(hbs`{{mobiledoc-markup-button for="strong" title=title}}`);

  let button = this.$('button');
  assert.equal(
    button.attr('title'),
    undefined,
    'button does not have a `title` attribute by default');

  this.set('title', 'Bold');

  assert.equal(
    button.attr('title'),
    'Bold',
    'button has `title` attribute when provided');
});

test('it yields for html', function(assert) {
  this.set('editor', {
    toggleMarkup() {},
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~#mobiledoc-markup-button editor=editor for="strong"~}}
      Fuerte
    {{~/mobiledoc-markup-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleMarkup on click', function(assert) {
  assert.expect(2);
  this.set('editor', {
    toggleMarkup(tag) {
      assert.ok(true, 'toggleMarkup called');
      assert.equal(tag, 'strong', 'toggleMarkup called with "for" value');
    },
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~mobiledoc-markup-button editor=editor for="strong"~}}
  `);

  let button = this.$('button');
  button.click();
});
