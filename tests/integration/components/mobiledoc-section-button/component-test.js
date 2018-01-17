import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobiledoc-section-button', 'Integration | Component | mobiledoc section button', {
  integration: true
});

test('it displays button', function(assert) {
  let editor = EObject.create({
    toggleSection() {},
    activeSectionTagNames: {}
  });
  this.set('editor', editor);
  this.render(hbs`{{mobiledoc-section-button editor=editor for="h1"}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'H1',
    'default text is capitalization of `for`');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    editor.set('activeSectionTagNames', { isH1: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it includes `title` attribute when provided', function(assert) {
  this.render(hbs`{{mobiledoc-section-button for="strong" title=title}}`);

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
    toggleSection() {},
    activeSectionTagNames: {}
  });
  this.render(hbs`
    {{~#mobiledoc-section-button editor=editor for="h1"~}}
      Fuerte
    {{~/mobiledoc-section-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleSection on click', function(assert) {
  assert.expect(2);
  this.set('editor', {
    toggleSection(tag) {
      assert.ok(true, 'toggleSection called');
      assert.equal(tag, 'h1', 'toggleSection called with "for" value');
    },
    activeSectionTagNames: {}
  });
  this.render(hbs`
    {{~mobiledoc-section-button editor=editor for="h1"~}}
  `);

  let button = this.$('button');
  button.click();
});
