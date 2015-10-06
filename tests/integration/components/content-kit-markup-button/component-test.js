import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

let { run, Object: EObject } = Ember;

moduleForComponent('content-kit-markup-button', 'Integration | Component | content kit markup button', {
  integration: true
});

test('it displays button', function(assert) {
  let contentKit = EObject.create({
    toggleMarkup() {},
    activeMarkupTagNames: {}
  });
  this.set('contentKit', contentKit);
  this.render(hbs`{{content-kit-markup-button contentKit=contentKit for="strong"}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Strong',
    'default text is capitalization of `for`');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    contentKit.set('activeMarkupTagNames', { isStrong: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it yields for html', function(assert) {
  this.set('contentKit', {
    toggleMarkup() {},
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~#content-kit-markup-button contentKit=contentKit for="strong"~}}
      Fuerte
    {{~/content-kit-markup-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleMarkup on click', function(assert) {
  assert.expect(2);
  this.set('contentKit', {
    toggleMarkup(tag) {
      assert.ok(true, 'toggleMarkup called');
      assert.equal(tag, 'strong', 'toggleMarkup called with "for" value');
    },
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~content-kit-markup-button contentKit=contentKit for="strong"~}}
  `);

  let button = this.$('button');
  button.click();
});
