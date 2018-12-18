import { Promise as EmberPromise } from 'rsvp';
import { run } from '@ember/runloop';
import Component from '@ember/component';
import { moduleForComponent, test } from 'ember-qunit';
import {
  selectRange,
  selectRangeWithEditor,
  moveCursorTo
} from 'dummy/tests/helpers/selection';
import hbs from 'htmlbars-inline-precompile';
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import createComponentAtom from 'ember-mobiledoc-editor/utils/create-component-atom';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';
import MobiledocKit from 'mobiledoc-kit';
import {
  WILL_CREATE_EDITOR_ACTION, DID_CREATE_EDITOR_ACTION
} from 'ember-mobiledoc-editor/components/mobiledoc-editor/component';
import {
  simpleMobileDoc, blankMobiledoc, linkMobileDoc, mobiledocWithCard, mobiledocWithAtom
} from '../../../helpers/create-mobiledoc';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';
import {
  setup as setupThrowingAdapter,
  teardown as teardownThrowingAdapter
} from '../../../helpers/create-throwing-adapter';

const COMPONENT_CARD_EXPECTED_PROPS = ['env', 'editCard', 'saveCard', 'cancelCard', 'removeCard', 'postModel', 'options'];

const COMPONENT_ATOM_EXPECTED_PROPS = ['saveAtom', 'options'];

moduleForComponent('mobiledoc-editor', 'Integration | Component | mobiledoc editor', {
  integration: true,
  beforeEach() {
    this.registerAtomComponent = (atomName, template, componentClass=Component.extend({tagName: 'span'})) => {
      this.registry.register(`component:${atomName}`, componentClass);
      this.registry.register(`template:components/${atomName}`, template);
      return createComponentAtom(atomName);
    };
    this.registerCardComponent = (cardName, template, componentClass=Component.extend()) => {
      this.registry.register(`component:${cardName}`, componentClass);
      this.registry.register(`template:components/${cardName}`, template);
      return createComponentCard(cardName);
    };
    this.registerCardComponentWithEditor = (cardName, template, componentClass, editorTemplate, editorClass=Component.extend()) => {
      let card = this.registerCardComponent(cardName, template, componentClass);
      this.registry.register(`component:${cardName}-editor`, editorClass);
      this.registry.register(`template:components/${cardName}-editor`, editorTemplate);
      return card;
    };
  },

  afterEach() {
    teardownThrowingAdapter(this);
  }
});

test('it boots the mobiledoc editor', function(assert) {
  assert.expect(1);
  this.render(hbs`{{mobiledoc-editor}}`);
  assert.ok(
    this.$('.mobiledoc-editor__editor').prop('contenteditable'),
    'Mobiledoc editor is booted'
  );
});

test('it boots mobiledoc editor with mobiledoc', function(assert) {
  assert.expect(2);
  let mobiledoc = simpleMobileDoc('Howdy');
  this.set('mobiledoc', mobiledoc);
  this.render(hbs`{{mobiledoc-editor mobiledoc=mobiledoc}}`);
  assert.ok(
    this.$('.mobiledoc-editor__editor').prop('contenteditable'),
    'Mobiledoc editor is booted'
  );
  assert.ok(
    !!this.$('.mobiledoc-editor__editor:contains(Howdy)').length,
    'Mobiledoc editor is booted with text'
  );
});

test(`fires ${WILL_CREATE_EDITOR_ACTION} and ${DID_CREATE_EDITOR_ACTION} actions`, function(assert) {
  assert.expect(5);
  let willCreateCalls = 0;
  let editor;

  assert.equal(WILL_CREATE_EDITOR_ACTION, 'will-create-editor',
               'precond - correct will-create action name');
  assert.equal(DID_CREATE_EDITOR_ACTION, 'did-create-editor',
               'precond - correct did-create action name');

  this.set('mobiledoc', simpleMobileDoc('hello'));

  this.on('willCreateEditor', () => {
    willCreateCalls++;
    assert.ok(!editor, 'calls willCreateEditor before didCreateEditor');
  });

  this.on('didCreateEditor', (editor) => {
    assert.equal(willCreateCalls, 1, 'calls didCreateEditor after willCreateEditor');
    assert.ok(editor && (editor instanceof MobiledocKit.Editor),
              `passes Editor instance to ${DID_CREATE_EDITOR_ACTION}`);
  });

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc
                        will-create-editor=(action "willCreateEditor")
                        did-create-editor=(action "didCreateEditor") as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test('it does not create a new editor when the same mobiledoc is set', function(assert) {
  assert.expect(4);
  let mobiledoc = simpleMobileDoc('Howdy');
  let editor;
  let willCreateCalls = 0;
  let didCreateCalls = 0;

  this.set('mobiledoc', mobiledoc);
  this.on('willCreateEditor', () => willCreateCalls++);
  this.on('didCreateEditor', (_editor) => {
    editor = _editor;
    didCreateCalls++;
  });
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=(readonly mobiledoc)
                        will-create-editor=(action "willCreateEditor")
                        did-create-editor=(action "didCreateEditor")
                        on-change=(action (mut mobiledoc)) as |editor|}}
    {{/mobiledoc-editor}}
  `);

  assert.equal(willCreateCalls, 1, 'called willCreateEditor 1x');
  assert.equal(didCreateCalls, 1, 'called didCreateEditor 1x');

  editor.run((postEditor) => {
    postEditor.insertText(editor.post.tailPosition(), 'Friend');
  });

  assert.equal(willCreateCalls, 1, 'still only called willCreateEditor 1x');
  assert.equal(didCreateCalls, 1, 'still only called didCreateEditor 1x');
});

test('wraps component-card adding in runloop correctly', function(assert) {
  assert.expect(3);
  let mobiledoc = simpleMobileDoc('Howdy');
  let editor;

  this.set('mobiledoc', mobiledoc);
  this.on('didCreateEditor', (_editor) => editor = _editor);
  let card = this.registerCardComponent('demo-card', hbs`
    <div id="demo-card">demo-card</div>
  `);
  this.set('cards', [card]);
  this.set('mobiledoc', simpleMobileDoc());
  this.render(hbs`
    {{#mobiledoc-editor did-create-editor=(action 'didCreateEditor') mobiledoc=mobiledoc cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);

  // Add a card without being in a runloop
  assert.ok(!run.currentRunLoop, 'precond - no run loop');
  editor.run((postEditor) => {
    let card = postEditor.builder.createCardSection('demo-card');
    postEditor.insertSection(card);
  });
  assert.ok(!run.currentRunLoop, 'postcond - no run loop after editor.run');

  assert.ok(this.$('#demo-card').length, 'demo card is added');
});

test('it updates the editor when the mobiledoc changes', function(assert) {
  assert.expect(2);
  let mobiledoc1 = simpleMobileDoc('Howdy');
  let mobiledoc2 = simpleMobileDoc('Doody');

  this.set('mobiledoc', mobiledoc1);
  this.render(hbs`{{mobiledoc-editor mobiledoc=mobiledoc}}`);

  assert.ok(
    !!this.$('.mobiledoc-editor__editor:contains(Howdy)').length,
    'Mobiledoc editor is booted with text'
  );

  this.set('mobiledoc', mobiledoc2);

  assert.ok(
    !!this.$('.mobiledoc-editor__editor:contains(Doody)').length,
    'Mobiledoc editor is updated'
  );
});

test('it renders a yielded toolbar', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#mobiledoc-editor as |editor|}}
      Toolbar
    {{/mobiledoc-editor}}
  `);
  assert.ok(
    !!this.$(':contains(Toolbar)').length,
    'Toolbar is yielded'
  );
});

test('it displays a custom placeholder', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{mobiledoc-editor placeholder="Write something in me"}}
  `);
  assert.equal(
    this.$('[data-placeholder]').data("placeholder"),
    'Write something in me'
  );
});

test('passes through spellcheck option', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{mobiledoc-editor spellcheck=false}}
  `);
  assert.equal(
    this.$('[spellcheck]').attr('spellcheck'),
    "false"
  );
});

test('it bolds the text and fires `on-change`', function(assert) {
  let done = assert.async();
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));

  let changeEvents = [];
  this.on('on-change', (mobiledoc) => {
    changeEvents.push(mobiledoc);
  });

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;

  return selectRange(textNode, 0, textNode, text.length).then(() => {
    this.$('button').click();

    assert.ok(
      !!this.$('strong:contains(Howdy)').length,
      'Bold tag contains text'
    );

    assert.ok(!!changeEvents[0], 'on-change fired with mobiledoc');
    done();
  });
});

test('serializes mobiledoc to `mobiledocVersion`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.set('serializeVersion', '0.2.0');

  let version;

  this.on('on-change', (mobiledoc) => {
    version = mobiledoc.version;
    this.set('mobiledoc', mobiledoc);
  });
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc serializeVersion=serializeVersion on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;
  return selectRange(textNode, 0, textNode, text.length).then(() => {
    this.$('button').click();
    assert.equal(version, '0.2.0', 'serializes to the passed serializeVersion (0.2.0)');

    this.set('serializeVersion', '0.3.0');
    version = null;

    textNode = this.$(`p strong:contains(${text})`)[0].firstChild;
    return selectRange(textNode, 0, textNode, text.length);

  }).then(() => {
    this.$('button').click();
    assert.equal(version, '0.3.0', 'serializes to the passed serializeVersion (0.3.0)');
  });
});

test('it exposes "toggleSection" which toggles the section type and fires `on-change`', function(assert) {
  assert.expect(6);

  let onChangeCount = 0;

  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', () => onChangeCount++);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleSection 'h2'}}>H2</button>
    {{/mobiledoc-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;

  return selectRange(textNode, 0, textNode, text.length).then(() => {
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
});

test('toolbar buttons can be active', function(assert) {
  let text = 'abc';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc as |editor|}}
      {{#mobiledoc-toolbar editor=editor}}
      {{/mobiledoc-toolbar}}
    {{/mobiledoc-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;

  const button = this.$(`button[title=Heading]`);
  return selectRange(textNode, 0, textNode, text.length).then(() => {
    assert.ok(button.length, 'has heading toolbar button');
    button.click();

    return wait();
  }).then(() => {
    assert.ok(this.$(`h1:contains(${text})`).length, 'heading-ifies text');
    assert.ok(button.hasClass('active'), 'heading button is active');

    button.click();

    return wait();
  }).then(() => {
    assert.ok(!this.$(`h1`).length, 'heading is gone');
    assert.ok(!button.hasClass('active'), 'heading button is no longer active');
  });
});

test('toolbar has list insertion button', function(assert) {
  let text = 'abc';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc as |editor|}}
      {{#mobiledoc-toolbar editor=editor}}
      {{/mobiledoc-toolbar}}
    {{/mobiledoc-editor}}
  `);
  const textNode = this.$(`p:contains(${text})`)[0].firstChild;
  return selectRange(textNode, 0, textNode, text.length).then(() => {
    const button = this.$(`button[title=List]`);
    assert.ok(button.length, 'has list toolbar button');
    button.click();

    assert.ok(this.$(`ul li:contains(${text})`).length, 'list-ifies text');
  });
});

test('toggleLink action is no-op when nothing is selected', function(assert) {
  assert.expect(2);
  this.set('mobiledoc', simpleMobileDoc(''));
  this.on('didCreateEditor', (editor) => this._editor = editor);
  this.render(hbs`
    {{#mobiledoc-editor autofocus=false mobiledoc=mobiledoc did-create-editor=(action 'didCreateEditor') as |editor|}}
      <button {{action editor.toggleLink}}>Link</button>
    {{/mobiledoc-editor}}
  `);

  assert.ok(!this._editor.hasCursor(), 'precond - no cursor');
  this.$('button').click();
  assert.ok(this.$('input').length === 0, 'no link input shown');
});

test('it links selected text and fires `on-change`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', (mobiledoc) => this._mobiledoc = mobiledoc);
  this.on('didCreateEditor', (editor) => this._editor = editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') did-create-editor=(action 'didCreateEditor') as |editor|}}
      <button {{action editor.toggleLink}}>Link</button>
    {{/mobiledoc-editor}}
  `);
  let { _editor: editor } = this;
  let nextFrame = () => new EmberPromise(resolve => window.requestAnimationFrame(resolve));

  return selectRangeWithEditor(editor, new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition())).then(() => {
    this.$('button:contains(Link)').click();

    return nextFrame();
  }).then(() => {

    this.$('input').val('http://example.com');
    this.$('input').change();
    return nextFrame();
  }).then(() => {
    this.$('button:contains(Link):eq(1)').click();
    assert.ok(
      !!this.$('a[href="http://example.com"]:contains(Howdy)').length,
      'a tag contains text'
    );
    let markup = this._mobiledoc.markups[0];
    assert.deepEqual(markup, ['a', ['href', 'http://example.com']],
                     'mobiledoc contains link markup');
  });
});

test('it de-links selected text and fires `on-change`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', linkMobileDoc(text));
  this.on('on-change', (mobiledoc) => this._mobiledoc = mobiledoc);
  this.on('did-create-editor', (editor) => this._editor = editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') did-create-editor=(action 'did-create-editor') as |editor|}}
      <button {{action editor.toggleLink}}>Link</button>
    {{/mobiledoc-editor}}
  `);

  let { _editor: editor } = this;
  return selectRangeWithEditor(editor, new MobiledocKit.Range(editor.post.headPosition(), editor.post.tailPosition())).then(() => {
    this.$('button').click();

    assert.ok(
      !this.$('a[href="http://example.com"]:contains(Howdy)').length,
      'a tag removed'
    );
    assert.equal(this._mobiledoc.markups.length, 0, 'no markups');
  });
});

test('it adds a component in display mode to the mobiledoc editor', function(assert) {
  assert.expect(5);
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}>CLICK ME</button></div>
   `);
  this.registry.register('template:components/demo-card-editor', hbs`<div id="demo-card-editor"></div>`);
  this.set('cards', [
    createComponentCard('demo-card')
  ]);
  this.set('mobiledoc', simpleMobileDoc());
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}>Add card</button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();

  assert.ok(this.$(`#demo-card`).length, 'Card added in display mode');
  assert.ok(!this.$(`#demo-card-editor`).length, 'Card not in edit mode');
  assert.ok(this.$('button#edit-card').length, 'has edit card button');

  this.$('button#edit-card').click();
  assert.ok(!this.$(`#demo-card`).length, 'Card not in display mode');
  assert.ok(this.$(`#demo-card-editor`).length, 'Card changed to edit mode');
});

test('it adds a card and removes an active blank section', function(assert) {
  assert.expect(4);

  let editor;
  let card = this.registerCardComponent('demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}></button></div>
   `);
  this.set('cards', [card]);
  this.set('mobiledoc', simpleMobileDoc());
  this.on('didCreateEditor', (_editor) => editor = _editor);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards did-create-editor=(action "didCreateEditor") as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
    {{/mobiledoc-editor}}
  `);

  assert.equal(this.$('.mobiledoc-editor p').length, 1, 'blank section exists');
  assert.equal(this.$('#demo-card').length, 0, 'no card section exists');
  editor.selectRange(editor.post.headPosition());
  this.$('button#add-card').click();

  assert.equal(this.$('.mobiledoc-editor p').length, 0, 'no blank section');
  assert.equal(this.$('#demo-card').length, 1, 'card section exists');
});

test('it adds a card and focuses the cursor at the end of the card', function(assert) {
  assert.expect(7);

  let card = this.registerCardComponent('demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}>DEMO CARD</button></div>
   `);
  this.set('cards', [card]);
  let editor;
  this.on('didCreateEditor', (_editor) => editor = _editor);
  this.set('mobiledoc', simpleMobileDoc());
  this.render(hbs`
    {{#mobiledoc-editor autofocus=false did-create-editor=(action 'didCreateEditor') mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}>ADD CARD</button>
    {{/mobiledoc-editor}}
  `);

  return selectRangeWithEditor(editor, editor.post.tailPosition()).then(() => {
    assert.ok(editor && !editor.range.isBlank, 'range is not blank');
    this.$('button#add-card').click();
    return wait();
  }).then(() => {
    assert.equal(this.$('#demo-card').length, 1, 'card section exists');

    let cardWrapper = this.$('#demo-card').parents('.__mobiledoc-card');
    assert.ok(!!cardWrapper.length, 'precond - card wrapper is found');
    let cursorElement = cardWrapper[0].nextSibling;
    assert.ok(!!cursorElement, 'precond - cursor element is found');

    assert.ok(window.getSelection().focusNode === cursorElement, 'selection focus is on cursor element');
    assert.ok(window.getSelection().anchorNode === cursorElement, 'selection anchor is on cursor element');
    assert.ok(document.activeElement === $('.__mobiledoc-editor')[0],
                 'document.activeElement is correct');
  });
});

// See https://github.com/bustle/ember-mobiledoc-editor/issues/86
test('can add a card to a blank post', function(assert) {
  assert.expect(3);

  let card = this.registerCardComponent('demo-card', hbs`<div id="demo-card">DEMO CARD</div>`);
  this.set('cards', [card]);
  let editor;
  this.on('didCreateEditor', (_editor) => editor = _editor);
  this.set('mobiledoc', blankMobiledoc());
  this.render(hbs`
    {{#mobiledoc-editor did-create-editor=(action 'didCreateEditor') mobiledoc=mobiledoc cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);

  let editorEl = this.$('.mobiledoc-editor__editor')[0];
  return selectRange(editorEl, 0, editorEl, 0).then(() => {
    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.ok(!this.$('#demo-card').length, 'precond - no card inserted');
    run(() => editor.insertCard('demo-card'));
    return wait();
  }).then(() => {
    assert.ok(this.$('#demo-card').length, 'inserts card');
  });
});

test('it has `addCardInEditMode` action to add card in edit mode', function(assert) {
  assert.expect(2);
  this.registry.register('template:components/demo-card',
                         hbs`<div id="demo-card"></div>`);
  this.registry.register('template:components/demo-card-editor',
                         hbs`<div id="demo-card-editor"></div>`);
  this.set('cards', [createComponentCard('demo-card')]);
  this.set('mobiledoc', simpleMobileDoc());

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCardInEditMode 'demo-card'}}>Add Card</button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();

  assert.ok(!this.$(`#demo-card`).length, 'Card added in edit mode');
  assert.ok(this.$(`#demo-card-editor`).length, 'Card not in display mode');
});

test(`sets ${COMPONENT_CARD_EXPECTED_PROPS.join(',')} properties on card components`, function(assert) {
  assert.expect(COMPONENT_CARD_EXPECTED_PROPS.length);

  let DemoCardComponent = Component.extend({
    didInsertElement() {
      COMPONENT_CARD_EXPECTED_PROPS.forEach(propName => {
        assert.ok(!!this.get(propName), `has ${propName} property`);
      });
    }
  });
  let card = this.registerCardComponent('demo-card', hbs`<div id='demo-card'></div>`, DemoCardComponent);
  this.set('cards', [card]);
  this.set('mobiledoc', mobiledocWithCard('demo-card'));

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test(`passes options through to card components`, function(assert) {

  let cardOptions = {
    foo: 'bar'
  };
  let DemoCardComponent = Component.extend({
    didInsertElement() {
      assert.equal(this.get('options.foo'), 'bar', `options property has been passed`);
    }
  });
  let card = this.registerCardComponent('demo-card', hbs`<div id='demo-card'></div>`, DemoCardComponent);
  this.set('cards', [card]);
  this.set('mobiledoc', mobiledocWithCard('demo-card'));
  this.set('cardOptions', cardOptions);

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards cardOptions=cardOptions as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test(`passes options through to atom components`, function(assert) {

  let cardOptions = {
    foo: 'bar'
  };
  let DemoAtomComponent = Component.extend({
    didInsertElement() {
      assert.equal(this.get('options.foo'), 'bar', `options property has been passed`);
    }
  });
  let atom = this.registerAtomComponent('demo-atom', hbs`I AM AN ATOM`, DemoAtomComponent);
  this.set('atoms', [atom]);
  this.set('mobiledoc', mobiledocWithAtom('demo-atom'));
  this.set('cardOptions', cardOptions);

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc atoms=atoms cardOptions=cardOptions as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test('component card `env` property exposes `isInEditor`', function(assert) {
  assert.expect(1);

  let env;
  let DemoCardComponent = Component.extend({
    didInsertElement() {
      env = this.get('env');
    }
  });
  let card = this.registerCardComponent('demo-card', hbs`<div id='demo-card'></div>`, DemoCardComponent);
  this.set('cards', [card]);
  this.set('mobiledoc', mobiledocWithCard('demo-card'));

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);

  assert.ok(env && env.isInEditor, 'env.isInEditor is true');
});

test('(deprecated) `addCard` passes `data`, breaks reference to original payload', function(assert) {
  assert.expect(6);

  let passedPayload;

  const DemoCardComponent = Component.extend({
    init() {
      this._super(...arguments);
      passedPayload = this.get('data');
    },
    actions: {
      mutatePayload() {
        this.set('data.foo', 'baz');
      }
    }
  });

  let card = this.registerCardComponent('demo-card', hbs`
    <div id="demo-card">
      {{data.foo}}
      <button id='mutate-payload' {{action 'mutatePayload'}}></button>
    </div>
  `, DemoCardComponent);

  this.set('cards', [card]);
  let payload = {foo: 'bar'};
  this.set('payload', payload);
  this.set('mobiledoc', simpleMobileDoc());

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card' payload}}>
      </button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();

  assert.ok(!!passedPayload && passedPayload.foo === 'bar',
            'payload is passed to card');
  assert.ok(passedPayload !== payload,
            'card receives data payload that is not the same object');

  assert.ok(this.$('button#mutate-payload').length,
            'has mutate-payload button');
  assert.ok(this.$(`#demo-card:contains(${payload.foo})`).length,
            'displays passed `data`');
  this.$('button#mutate-payload').click();

  assert.equal(passedPayload.foo, 'baz', 'mutates its payload');
  assert.equal(payload.foo, 'bar', 'originalpayload remains unchanged');
});

test('`addCard` passes `payload`, breaks reference to original payload', function(assert) {
  assert.expect(6);

  let passedPayload;

  const DemoCardComponent = Component.extend({
    init() {
      this._super(...arguments);
      passedPayload = this.get('payload');
    },
    actions: {
      mutatePayload() {
        this.set('payload.foo', 'baz');
      }
    }
  });

  let card = this.registerCardComponent('demo-card', hbs`
    <div id="demo-card">
      {{payload.foo}}
      <button id='mutate-payload' {{action 'mutatePayload'}}></button>
    </div>
  `, DemoCardComponent);

  this.set('cards', [card]);
  let payload = {foo: 'bar'};
  this.set('payload', payload);
  this.set('mobiledoc', simpleMobileDoc());

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card' payload}}>
      </button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();

  assert.ok(!!passedPayload && passedPayload.foo === 'bar',
            'payload is passed to card');
  assert.ok(passedPayload !== payload,
            'card receives data payload that is not the same object');

  assert.ok(this.$('button#mutate-payload').length,
            'has mutate-payload button');
  assert.ok(this.$(`#demo-card:contains(${payload.foo})`).length,
            'displays passed `payload`');
  this.$('button#mutate-payload').click();

  assert.equal(passedPayload.foo, 'baz', 'mutates its payload');
  assert.equal(payload.foo, 'bar', 'originalpayload remains unchanged');
});

test('throws on unknown card when `unknownCardHandler` is not passed', function(assert) {
  setupThrowingAdapter(this);

  assert.expect(1);
  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    cards: [
      ['missing-card', {}]
    ],
    markups: [],
    atoms: [],
    sections: [
      [10, 0]
    ]
  });
  this.set('unknownCardHandler', undefined);

  assert.throws(() => {
    this.render(hbs`
      {{#mobiledoc-editor mobiledoc=mobiledoc
                options=(hash unknownCardHandler=unknownCardHandler) as |editor|}}
      {{/mobiledoc-editor}}
    `);
  }, /Unknown card "missing-card".*no unknownCardHandler/);
});

test('calls `unknownCardHandler` when it renders an unknown card', function(assert) {
  assert.expect(5);
  let expectedPayload = {};

  this.set('unknownCardHandler', ({env, payload}) => {
    assert.equal(env.name, 'missing-card', 'correct env.name');
    assert.ok(env.isInEditor, 'isInEditor is correct');
    assert.ok(!!env.onTeardown, 'has onTeardown hook');

    assert.ok(env.save && env.remove && env.edit && env.cancel,
              'has save, remove, edit, cancel hooks');
    assert.deepEqual(payload, expectedPayload, 'has payload');
  });

  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    cards: [
      ['missing-card', expectedPayload]
    ],
    markups: [],
    atoms: [],
    sections: [
      [10, 0]
    ]
  });

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc
              options=(hash unknownCardHandler=unknownCardHandler) as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test('#activeSectionTagNames is correct', function(assert) {
  assert.expect(2);

  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    markups: [],
    cards: [],
    atoms: [],
    sections: [
      [1, 'p', [[0, [], 0, "first paragraph"]]],
      [1, 'blockquote', [[0, [], 0, "blockquote section"]]]
    ]
  });

  this.render(hbs`
    {{#mobiledoc-editor autofocus=false mobiledoc=mobiledoc as |editor|}}
      {{#if editor.activeSectionTagNames.isBlockquote}}
        <div id='is-block-quote'>is block quote</div>
      {{/if}}
      {{#if editor.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{/if}}
    {{/mobiledoc-editor}}
  `);

  return moveCursorTo(this, 'blockquote:contains(blockquote section)').then(() => {
    assert.ok(this.$('#is-block-quote').length, 'is block quote');
    return moveCursorTo(this, 'p:contains(first paragraph)');
  }).then(() => {
    assert.ok(this.$('#is-p').length, 'is p');
  });
});

test('#activeSectionTagNames is correct when a card is selected', function(assert) {
  assert.expect(2);

  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    markups: [],
    cards: [
      ['test-card', {}]
    ],
    atoms: [],
    sections: [
      [1, 'p', [[0, [], 0, "first paragraph"]]],
      [10, 0]
    ]
  });

  this.set('cards', [{
    name: 'test-card',
    type: 'dom',
    render() {
      return $('<div id="card-test">CARD CONTENT</div>')[0];
    }
  }]);

  this.render(hbs`
    {{#mobiledoc-editor autofocus=false cards=cards mobiledoc=mobiledoc as |editor|}}
      {{#if editor.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{else}}
        <div id='not-p'>not p</div>
      {{/if}}
    {{/mobiledoc-editor}}
  `);

  return moveCursorTo(this, '.mobiledoc-editor p').then(() => {
    assert.ok(this.$('#is-p').length, 'precond - is p');
    return moveCursorTo(this, '#card-test');
  }).then(() => {
    assert.ok(this.$('#not-p').length, 'is not p');
  });
});

test('exposes `addAtom` action to add an atom', function(assert) {
  let mobiledoc = simpleMobileDoc('howdy');
  this.set('mobiledoc', mobiledoc);

  let editor;
  this.registerAtomComponent('ember-atom', hbs`I AM AN ATOM`);
  this.set('atoms', [createComponentAtom('ember-atom')]);
  this.set('atomText', 'atom text');
  this.set('atomPayload', {foo: 'bar'});
  this.on('onChange', (mobiledoc) => this.set('mobiledoc', mobiledoc));
  this.on('didCreateEditor', (_editor) => editor = _editor);
  this.render(hbs`
    {{#mobiledoc-editor on-change=(action 'onChange') did-create-editor=(action 'didCreateEditor') mobiledoc=mobiledoc atoms=atoms as |editor|}}
      <button id='add-atom' {{action editor.addAtom 'ember-atom' atomText atomPayload}}>Add Ember Atom</button>
    {{/mobiledoc-editor}}
  `);

  let done = assert.async();

  return selectRangeWithEditor(editor, new MobiledocKit.Range(editor.post.headPosition())).then(() => {
    let button = this.$('button#add-atom');
    assert.ok(button.length, 'precond - has button');
    assert.ok(!this.$('span:contains(I AM AN ATOM)').length, 'precond - no atom');
    button.click();
    return wait();
  }).then(() => {

    assert.ok(this.$('span:contains(I AM AN ATOM)').length, 'atom is added after clicking');

    let atom = this.get('mobiledoc').atoms[0];
    let [ name, text, payload ] = atom;
    assert.equal(name, 'ember-atom', 'correct atom name in mobiledoc');
    assert.equal(text, 'atom text', 'correct atom text in mobiledoc');
    assert.deepEqual(payload, {foo: 'bar'}, 'correct atom payload in mobiledoc');

    done();
  });

});

test('wraps component-atom adding in runloop correctly', function(assert) {
  assert.expect(3);
  let editor;

  this.on('didCreateEditor', (_editor) => editor = _editor);
  let atom = this.registerAtomComponent('demo-atom', hbs`<span id='demo-atom'>demo-atom</span>`);
  this.set('atoms', [atom]);
  this.set('mobiledoc', simpleMobileDoc());
  this.render(hbs`
    {{#mobiledoc-editor did-create-editor=(action 'didCreateEditor') mobiledoc=mobiledoc atoms=atoms as |editor|}}
    {{/mobiledoc-editor}}
  `);

  assert.ok(!run.currentRunLoop, 'precond - no run loop');
  editor.run((postEditor) => {
    let position = editor.post.headPosition();
    let atom = postEditor.builder.createAtom('demo-atom', 'value', {});
    postEditor.insertMarkers(position, [atom]);
  });
  assert.ok(!run.currentRunLoop, 'postcond - no run loop after editor.run');

  assert.ok(this.$('#demo-atom').length, 'demo atom is added');
});

test(`sets ${COMPONENT_ATOM_EXPECTED_PROPS.join(',')} properties on atom components`, function(assert) {
  assert.expect(COMPONENT_ATOM_EXPECTED_PROPS.length);

  let DemoAtomComponent = Component.extend({
    didInsertElement() {
      COMPONENT_ATOM_EXPECTED_PROPS.forEach(propName => {
        assert.ok(!!this.get(propName), `has ${propName} property`);
      });
    }
  });
  let atom = this.registerAtomComponent('demo-atom', hbs`<div id='demo-atom'></div>`, DemoAtomComponent);
  this.set('atoms', [atom]);
  this.set('mobiledoc', mobiledocWithAtom('demo-atom'));

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc atoms=atoms as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test('throws on unknown atom when `unknownAtomHandler` is not passed', function(assert) {
  setupThrowingAdapter(this);
  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'value', {}]
    ],
    markups: [],
    cards: [],
    sections: [
      [1, 'P', [
        [1, [], 0, 0]]
      ]
    ]
  });
  this.set('unknownAtomHandler', undefined);
  this.set('atoms', []);

  assert.throws(() => {
    this.render(hbs`
      {{#mobiledoc-editor mobiledoc=mobiledoc atoms=atoms
                options=(hash unknownAtomHandler=unknownAtomHandler) as |editor|}}
      {{/mobiledoc-editor}}
    `);
  }, /Unknown atom "missing-atom" found.*no unknownAtomHandler/);
});

test('calls `unknownAtomHandler` when it renders an unknown atom', function(assert) {
  assert.expect(4);
  let expectedPayload = {};

  this.set('unknownAtomHandler', ({env, value, payload}) => {
    assert.equal(env.name, 'missing-atom', 'correct env.name');
    assert.equal(value, 'value', 'correct name');
    assert.ok(!!env.onTeardown, 'has onTeardown hook');
    assert.deepEqual(payload, expectedPayload, 'has payload');
  });

  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'value', expectedPayload]
    ],
    markups: [],
    cards: [],
    sections: [
      [1, 'P', [
        [1, [], 0, 0]]
      ]
    ]
  });

  this.set('atoms', []);
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc atoms=atoms
              options=(hash unknownAtomHandler=unknownAtomHandler) as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

// See https://github.com/bustle/ember-mobiledoc-editor/issues/90
test('does not rerender atoms when updating text in section', function(assert) {
  let renderCount = 0;
  this.registerAtomComponent('ember-atom', hbs`I AM AN ATOM`, Component.extend({
    tagName: 'span',
    didRender() {
      renderCount++;
    }
  }));
  this.set('atoms', [createComponentAtom('ember-atom')]);
  this.set('mobiledoc', {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['ember-atom', 'value', {}]
    ],
    markups: [],
    cards: [],
    sections: [
      [1, 'P', [
        [1, [], 0, 0]]
      ]
    ]
  });

  let editor;
  this.on('didCreateEditor', (_editor) => editor = _editor);

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc
                        atoms=atoms
                        did-create-editor=(action 'didCreateEditor') as |editor|}}
    {{/mobiledoc-editor}}
  `);

  return wait().then(() => {
    renderCount = 0;
    return selectRangeWithEditor(editor, editor.post.tailPosition());
  }).then(() => {
    run(() => editor.insertText('abc'));
    return wait();
  }).then(() => {
    assert.equal(renderCount, 0, 'does not rerender atom when inserting text');
  });
});

test('it respects resetting back to initial mobiledoc value', function(assert) {
  let done = assert.async();
  assert.expect(2);
  let text = 'Howdy';
  let initialDoc = simpleMobileDoc(text);
  this.set('mobiledoc', initialDoc);

  this.on('on-change', (mobiledoc) => {
    this.set('mobiledoc', mobiledoc);
  });

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;

  return selectRange(textNode, 0, textNode, text.length).then(() => {
    this.$('button').click();

    assert.ok(
      !!this.$('strong:contains(Howdy)').length,
      'Bold tag contains text'
    );
    this.set('mobiledoc', initialDoc);
    return wait();
  }).then(() => {
    assert.ok(
      this.$('strong').length === 0,
      'no more strong tag after resetting mobiledoc'
    );

    done();
  });
});
