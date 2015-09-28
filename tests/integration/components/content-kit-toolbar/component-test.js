import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('content-kit-toolbar', 'Integration | Component | content kit toolbar', {
  integration: true
});

const buttonTitles = ['Bold', 'Italic', 'Link', 'Heading', 'Subheading',
  'Block Quote', 'Pull Quote', 'List', 'Numbered List'];

test('it displays buttons', function(assert) {
  assert.expect(buttonTitles.length);

  this.set('contentKit', {
    toggleMarkup() {},
    toggleSectionTagName() {},
    createListSection() {},
    toggleLink() {}
  });
  this.render(hbs`{{content-kit-toolbar contentKit=contentKit}}`);

  buttonTitles.forEach(title => {
    assert.ok(!!this.$(`button[title="${title}"]`).length, `${title} button`);
  });
});
