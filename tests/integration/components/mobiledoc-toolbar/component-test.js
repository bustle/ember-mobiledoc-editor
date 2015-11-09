import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobiledoc-toolbar', 'Integration | Component | mobiledoc toolbar', {
  integration: true
});

const buttonTitles = ['Bold', 'Italic', 'Link', 'Heading', 'Subheading',
  'Block Quote', 'Pull Quote', 'List', 'Numbered List'];

test('it displays buttons', function(assert) {
  assert.expect(buttonTitles.length);

  this.set('editor', {
    toggleMarkup() {},
    toggleSectionTagName() {},
    createListSection() {},
    toggleLink() {}
  });
  this.render(hbs`{{mobiledoc-toolbar editor=editor}}`);

  buttonTitles.forEach(title => {
    assert.ok(!!this.$(`button[title="${title}"]`).length, `${title} button`);
  });
});
