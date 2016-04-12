import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  linkMobileDoc
} from '../../../helpers/create-mobiledoc';
import MobiledocKit from 'mobiledoc-kit';

moduleForComponent('mobiledoc-toolbar', 'Integration | Component | mobiledoc toolbar', {
  integration: true
});

const buttonTitles = ['Bold', 'Italic', 'Link', 'Heading', 'Subheading',
  'Block Quote', 'Pull Quote', 'List', 'Numbered List'];

test('it displays buttons', function(assert) {
  assert.expect(buttonTitles.length);

  let mockEditor = {
    toggleMarkup() {},
    toggleSection() {},
    createListSection() {},
    toggleLink() {}
  };
  this.set('editor', mockEditor);
  this.render(hbs`{{mobiledoc-toolbar editor=editor}}`);

  buttonTitles.forEach(title => {
    assert.ok(!!this.$(`button[title="${title}"]`).length, `${title} button`);
  });
});

test('Link button is active when text is linked', function(assert) {
  let text = 'Hello';
  this.set('mobiledoc', linkMobileDoc(text));
  this.on('did-create-editor', (editor) => this._editor = editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc did-create-editor=(action 'did-create-editor') as |editor|}}
      {{mobiledoc-toolbar editor=editor}}
    {{/mobiledoc-editor}}
  `);

  let button = this.$('button[title="Link"]');
  assert.ok(button.length, 'has link button');
  assert.ok(!button.hasClass('active'), 'precond - not active');

  let { _editor: editor } = this;
  editor.selectRange(new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition()));

  assert.ok(button.hasClass('active'), 'button is active after selecting link text');
});
