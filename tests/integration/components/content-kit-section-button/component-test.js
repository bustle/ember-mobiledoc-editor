import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

let { run, Object: EObject } = Ember;

moduleForComponent('content-kit-section-button', 'Integration | Component | content kit section button', {
  integration: true
});

test('it displays button', function(assert) {
  let contentKit = EObject.create({
    toggleSectionTagName() {},
    activeSectionTagNames: {}
  });
  this.set('contentKit', contentKit);
  this.render(hbs`{{content-kit-section-button contentKit=contentKit for="h1"}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'H1',
    'default text is capitalization of `for`');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    contentKit.set('activeSectionTagNames', { isH1: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it yields for html', function(assert) {
  this.set('contentKit', {
    toggleSectionTagName() {},
    activeSectionTagNames: {}
  });
  this.render(hbs`
    {{~#content-kit-section-button contentKit=contentKit for="h1"~}}
      Fuerte
    {{~/content-kit-section-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleSectionTagName on click', function(assert) {
  assert.expect(2);
  this.set('contentKit', {
    toggleSectionTagName(tag) {
      assert.ok(true, 'toggleSectionTagName called');
      assert.equal(tag, 'h1', 'toggleSectionTagName called with "for" value');
    },
    activeSectionTagNames: {}
  });
  this.render(hbs`
    {{~content-kit-section-button contentKit=contentKit for="h1"~}}
  `);

  let button = this.$('button');
  button.click();
});
