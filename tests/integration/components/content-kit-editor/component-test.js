import { moduleForComponent, test } from 'ember-qunit';
import { selectRange } from 'dummy/tests/helpers/selection';
import hbs from 'htmlbars-inline-precompile';
import createComponentCard from 'ember-content-kit/utils/create-component-card';

function simpleMobileDoc(text) {
  return {
    version: '0.2.0',
    sections: [
      [],
      [
        [1, 'p', [
          [[], 0, text]
        ]]
      ]
    ]
  };
}

function linkMobileDoc(text) {
  return {
    version: '0.0.1',
    sections: [
      [
        ['a', ['href', 'http://example.com']]
      ],
      [
        [1, 'p', [
          [[0], 1, text]
        ]]
      ]
    ]
  };
}

moduleForComponent('content-kit-editor', 'Integration | Component | content kit editor', {
  integration: true
});

test('it boots content-kit', function(assert) {
  assert.expect(1);
  this.render(hbs`{{content-kit-editor}}`);
  assert.ok(
    this.$('.content-kit-editor__editor').prop('contenteditable'),
    'ContentKit is booted'
  );
});
test('it boots content-kit with mobiledoc', function(assert) {
  assert.expect(2);
  let mobiledoc = simpleMobileDoc('Howdy');
  this.set('mobiledoc', mobiledoc);
  this.render(hbs`{{content-kit-editor mobiledoc=mobiledoc}}`);
  assert.ok(
    this.$('.content-kit-editor__editor').prop('contenteditable'),
    'ContentKit is booted'
  );
  assert.ok(
    !!this.$('.content-kit-editor__editor:contains(Howdy)').length,
    'ContentKit is booted with text'
  );
});

test('it renders a yielded toolbar content-kit', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#content-kit-editor as |contentKit|}}
      Toolbar
    {{/content-kit-editor}}
  `);
  assert.ok(
    !!this.$(':contains(Toolbar)').length,
    'Toolbar is yielded'
  );
});


test('it bolds the text and fires `on-change`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', (mobiledoc) => {
    assert.ok(!!mobiledoc, 'change event fired with mobiledoc');
  });
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |contentKit|}}
      <button {{action contentKit.toggleMarkup 'strong'}}>Bold</button>
    {{/content-kit-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();
  assert.ok(
    !!this.$('strong:contains(Howdy)').length,
    'Bold tag contains text'
  );
});

test('it toggle the section type and fires `on-change`', function(assert) {
  assert.expect(6);

  let onChangeCount = 0;

  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', () => onChangeCount++);
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |contentKit|}}
      <button {{action contentKit.toggleSectionTagName 'h2'}}>H2</button>
    {{/content-kit-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);

  assert.ok(!this.$('h2').length, 'precond - no h2');
  assert.equal(onChangeCount, 0, 'precond - no on-change');

  this.$('button').click();

  assert.equal(onChangeCount, 1, 'fires on-change');
  assert.ok(!!this.$('h2:contains(Howdy)').length, 'Changes to h2 tag');

  onChangeCount = 0;
  this.$('button').click();
  assert.equal(onChangeCount, 1, 'fires on-change again');
  assert.ok(!this.$('h2').length, 'toggles h2 tag off again');
});

test('toolbar buttons can be active', function(assert) {
  let text = 'abc';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc as |contentKit|}}
      {{#content-kit-toolbar contentKit=contentKit}}
      {{/content-kit-toolbar}}
    {{/content-kit-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);

  const button = this.$(`button[title=Heading]`);
  assert.ok(button.length, 'has heading toolbar button');
  button.click();

  assert.ok(this.$(`h1:contains(${text})`).length, 'heading-ifies text');
  assert.ok(button.hasClass('active'), 'heading button is active');

  button.click();

  assert.ok(!this.$(`h1`).length, 'heading is gone');
  assert.ok(!button.hasClass('active'), 'heading button is no longer active');
});


test('toolbar has list insertion button', function(assert) {
  let text = 'abc';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc as |contentKit|}}
      {{#content-kit-toolbar contentKit=contentKit}}
      {{/content-kit-toolbar}}
    {{/content-kit-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);

  const button = this.$(`button[title=List]`);
  assert.ok(button.length, 'has list toolbar button');
  button.click();

  assert.ok(this.$(`ul li:contains(${text})`).length, 'list-ifies text');
});

test('it links selected text and fires `on-change`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', (mobiledoc) => {
    assert.ok(!!mobiledoc, 'change event fired with mobiledoc');
  });
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |contentKit|}}
      <button {{action contentKit.toggleLink}}>Link</button>
    {{/content-kit-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button:contains(Link)').click();
  this.$('input').val('http://example.com');
  this.$('input').change();
  this.$('button:contains(Link):eq(1)').click();
  assert.ok(
    !!this.$('a[href="http://example.com"]:contains(Howdy)').length,
    'a tag contains text'
  );
});

test('it de-links selected text and fires `on-change`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', linkMobileDoc(text));
  this.on('on-change', (mobiledoc) => {
    assert.ok(!!mobiledoc, 'change event fired with mobiledoc');
  });
  this.render(hbs`
    {{#content-kit-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |contentKit|}}
      <button {{action contentKit.toggleLink}}>Link</button>
    {{/content-kit-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild.firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();
  assert.ok(
    !this.$('a[href="http://example.com"]:contains(Howdy)').length,
    'a tag removed'
  );
});

test('it adds a component to the content-kit editor', function(assert) {
  assert.expect(1);
  this.registry.register('template:components/demo-card-editor', hbs`DEMO`);
  this.set('cards', [
    createComponentCard('demo-card')
  ]);
  this.render(hbs`
    {{#content-kit-editor cards=cards as |contentKit|}}
      <button {{action contentKit.addCard 'demo-card'}}></button>
    {{/content-kit-editor}}
  `);
  this.$('button').click();
  assert.ok(!!this.$(`div:contains(DEMO)`).length, 'Card added');
});
