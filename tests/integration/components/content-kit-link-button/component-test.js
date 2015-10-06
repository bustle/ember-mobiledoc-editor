import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

let { run, Object: EObject } = Ember;

moduleForComponent('content-kit-link-button', 'Integration | Component | content kit link button', {
  integration: true
});

test('it displays button', function(assert) {
  let contentKit = EObject.create({
    toggleLink() {},
    activeMarkupTagNames: {}
  });
  this.set('contentKit', contentKit);
  this.render(hbs`{{content-kit-link-button contentKit=contentKit}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Link',
    'default text is "Link"');
  assert.ok(
    !button.hasClass('active'),
    'button is not active');

  run(() => {
    contentKit.set('activeMarkupTagNames', { isA: true });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it yields for html', function(assert) {
  this.set('contentKit', {
    toggleLink() {},
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~#content-kit-link-button contentKit=contentKit~}}
      Fuerte
    {{~/content-kit-link-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Fuerte',
    'text is yielded');
});

test('it calls toggleLink on click', function(assert) {
  assert.expect(1);
  this.set('contentKit', {
    toggleLink() {
      assert.ok(true, 'toggleLink called');
    },
    activeMarkupTagNames: {}
  });
  this.render(hbs`
    {{~content-kit-link-button contentKit=contentKit~}}
  `);

  let button = this.$('button');
  button.click();
});
