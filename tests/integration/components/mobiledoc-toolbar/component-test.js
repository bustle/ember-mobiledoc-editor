import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {
  alignCenterMobileDoc,
  linkMobileDoc,
  mobiledocWithList
} from '../../../helpers/create-mobiledoc';
import MobiledocKit from 'mobiledoc-kit';

moduleForComponent('mobiledoc-toolbar', 'Integration | Component | mobiledoc toolbar', {
  integration: true
});

const buttonTitles = ['Bold', 'Italic', 'Link', 'Heading', 'Subheading',
  'Block Quote', 'Pull Quote', 'List', 'Numbered List', 'Align Left', 'Align Center', 'Align Right'];

test('it displays buttons', function(assert) {
  assert.expect(buttonTitles.length);

  let mockEditor = {
    toggleLink() {},
    toggleMarkup() {},
    toggleSection() {},
    setAttribute() {}
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
  let editor;
  this.on('did-create-editor', _editor => editor = _editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc autofocus=false did-create-editor=(action 'did-create-editor') as |editor|}}
      {{mobiledoc-toolbar editor=editor}}
    {{/mobiledoc-editor}}
  `);

  let button = this.$('button[title="Link"]');
  assert.ok(button.length, 'has link button');
  assert.ok(!button.hasClass('active'), 'precond - not active');

  editor.selectRange(new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition()));

  assert.ok(button.hasClass('active'), 'button is active after selecting link text');
});

test('List button is action when text is in list', function(assert) {
  let text = 'Hello';
  this.set('mobiledoc', mobiledocWithList(text, 'ul'));
  this.on('did-create-editor', (editor) => this._editor = editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc autofocus=false did-create-editor=(action 'did-create-editor') as |editor|}}
      {{mobiledoc-toolbar editor=editor}}
    {{/mobiledoc-editor}}
  `);

  let ulButton = this.$('button[title="List"]');
  let olButton = this.$('button[title="Numbered List"]');
  assert.ok(!ulButton.hasClass('active'), 'precond - ul not active');
  assert.ok(!olButton.hasClass('active'), 'precond - ol not active');

  let { _editor: editor } = this;
  editor.selectRange(new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition()));

  assert.ok(ulButton.hasClass('active'), 'ul button is active after selecting ul list text');
  assert.ok(!olButton.hasClass('active'), 'ol button is not active after selecting ul list text');

  // toggle ul->ol
  olButton.click();

  assert.ok(!ulButton.hasClass('active'), 'ul button is inactive after toggle');
  assert.ok(olButton.hasClass('active'), 'ol button is active after toggle');

  // toggle ol->p
  olButton.click();

  assert.ok(!ulButton.hasClass('active') && !olButton.hasClass('active'),
            'ul and ol button are inactive after toggle off list');
});

test('Align Center button is active when text is aligned center', function(assert) {
  let text = 'Hello';
  this.set('mobiledoc', alignCenterMobileDoc(text));
  let editor;
  this.on('did-create-editor', _editor => editor = _editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc autofocus=false did-create-editor=(action 'did-create-editor') as |editor|}}
      {{mobiledoc-toolbar editor=editor}}
    {{/mobiledoc-editor}}
  `);

  let button = this.$('button[title="Align Center"]');
  assert.ok(button.length, 'has Align Center button');
  assert.ok(!button.hasClass('active'), 'precond - not active');

  editor.selectRange(new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition()));

  assert.ok(button.hasClass('active'), 'button is active after selecting text');
});
