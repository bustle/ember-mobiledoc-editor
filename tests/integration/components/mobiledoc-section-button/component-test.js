import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

let { run, Object: EObject } = Ember;

moduleForComponent('mobiledoc-section-button', 'Integration | Component | mobiledoc section button', {
  integration: true
});

test('it displays button', function(assert) {
  let editor = EObject.create({
    toggleSectionTagName() {},
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

test('it yields for html', function(assert) {
  this.set('editor', {
    toggleSectionTagName() {},
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

test('it calls toggleSectionTagName on click', function(assert) {
  assert.expect(2);
  this.set('editor', {
    toggleSectionTagName(tag) {
      assert.ok(true, 'toggleSectionTagName called');
      assert.equal(tag, 'h1', 'toggleSectionTagName called with "for" value');
    },
    activeSectionTagNames: {}
  });
  this.render(hbs`
    {{~mobiledoc-section-button editor=editor for="h1"~}}
  `);

  let button = this.$('button');
  button.click();
});
