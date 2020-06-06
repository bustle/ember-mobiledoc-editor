import { run } from '@ember/runloop';
import EObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobiledoc-section-attribute-button', 'Integration | Component | mobiledoc section attribute button', {
  integration: true
});

test('it displays button', function(assert) {
  let editor = EObject.create({
    toggleSection() {},
    activeSectionAttributes: {},
    isDefaultAttributeValue(attributeName, attributeValue) {
      return (attributeName === 'text-align' && attributeValue === 'left');
    }
  });
  this.set('editor', editor);
  this.render(hbs`{{mobiledoc-section-attribute-button editor=editor attributeName="text-align" attributeValue="left"}}`);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Left',
    'default text is capitalization of `attributeValue`');
  assert.ok(
    button.hasClass('active'),
    'button is active because editor isDefaultAttributeValue returns true in this case');

  run(() => {
    editor.set('activeSectionAttributes', { textAlign: ['center'] });
  });

  assert.ok(
  !button.hasClass('active'),
  'button is not active');

  run(() => {
    editor.set('activeSectionAttributes', { textAlign: ['left'] });
  });

  assert.ok(
    button.hasClass('active'),
    'button activates');
});

test('it includes `title` attribute when provided', function(assert) {
  let editor = EObject.create({
    toggleSection() {},
    activeSectionAttributes: {},
    isDefaultAttributeValue(attributeName, attributeValue) {
      return (attributeName === 'text-align' && attributeValue === 'left');
    }
  });
  this.set('editor', editor);
  this.render(hbs`{{mobiledoc-section-attribute-button editor=editor title=title attributeName="text-align" attributeValue="left"}}`);

  let button = this.$('button');
  assert.equal(
    button.attr('title'),
    undefined,
    'button does not have a `title` attribute by default');

  this.set('title', 'Align Left');

  assert.equal(
    button.attr('title'),
    'Align Left',
    'button has `title` attribute when provided');
});

test('it yields for html', function(assert) {
  this.set('editor', {
    toggleSection() {},
    activeSectionAttributes: {},
    isDefaultAttributeValue(attributeName, attributeValue) {
      return (attributeName === 'text-align' && attributeValue === 'left');
    }
  });
  this.render(hbs`
    {{~#mobiledoc-section-attribute-button editor=editor attributeName="text-align" attributeValue="left"~}}
      Izquierda
    {{~/mobiledoc-section-attribute-button~}}
  `);

  let button = this.$('button');
  assert.equal(
    button.html(), 'Izquierda',
    'text is yielded');
});

test('it calls setAttribute on click', function(assert) {
  assert.expect(3);
  this.set('editor', {
    setAttribute(name, value) {
      assert.ok(true, 'setAttribute called');
      assert.equal(name, 'text-align', 'setAttribute called with attributeName');
      assert.equal(value, 'left', 'setAttribute called with attributeValue');
    },
    activeSectionAttributes: {},
    isDefaultAttributeValue(attributeName, attributeValue) {
      return (attributeName === 'text-align' && attributeValue === 'left');
    }
  });
  this.render(hbs`
    {{~mobiledoc-section-attribute-button editor=editor attributeName="text-align" attributeValue="left"~}}
  `);

  let button = this.$('button');
  button.click();
});
