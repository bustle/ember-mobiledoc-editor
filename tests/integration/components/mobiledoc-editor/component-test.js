import { moduleForComponent, test } from 'ember-qunit';
import { selectRange } from 'dummy/tests/helpers/selection';
import hbs from 'htmlbars-inline-precompile';
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import moveCursorTo from '../../../helpers/move-cursor-to';
import simulateMouseup from '../../../helpers/simulate-mouse-up';
import Ember from 'ember';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';
import MobiledocKit from 'mobiledoc-kit';
import {
  WILL_CREATE_EDITOR_ACTION, DID_CREATE_EDITOR_ACTION
} from 'ember-mobiledoc-editor/components/mobiledoc-editor/component';

const COMPONENT_CARD_EXPECTED_PROPS = ['env', 'editCard', 'saveCard', 'cancelCard', 'removeCard'];

function simpleMobileDoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [],
    sections: [
      [1, 'p', [
        [0, [], 0, text]
      ]]
    ]
  };
}

function mobiledocWithCard(cardName, cardPayload={}) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [],
    atoms: [],
    cards: [
      [cardName, cardPayload]
    ],
    sections: [
      [10, 0]
    ]
  };
}

function linkMobileDoc(text) {
  return {
    version: MOBILEDOC_VERSION,
    markups: [
      ['a', ['href', 'http://example.com']]
    ],
    atoms: [],
    cards: [],
    sections: [
      [1, 'p', [
        [0, [0], 1, text]
      ]]
    ]
  };
}

moduleForComponent('mobiledoc-editor', 'Integration | Component | mobiledoc editor', {
  integration: true
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
    postEditor.insertText(editor.range.tail, 'Friend');
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
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card">demo-card</div>
   `);
  this.set('cards', [createComponentCard('demo-card')]);
  this.set('mobiledoc', simpleMobileDoc(''));
  this.render(hbs`
    {{#mobiledoc-editor
              did-create-editor=(action "didCreateEditor")
              mobiledoc=mobiledoc
              cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);

  // Add a card without being in a runloop
  assert.ok(!Ember.run.currentRunLoop, 'precond - no run loop');
  editor.run((postEditor) => {
    let card = postEditor.builder.createCardSection('demo-card');
    postEditor.insertSection(card);
  });
  assert.ok(!Ember.run.currentRunLoop, 'postcond - no run loop after editor.run');

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
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.on('on-change', (mobiledoc) => {
    assert.ok(!!mobiledoc, 'change event fired with mobiledoc');
  });
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();
  assert.ok(
    !!this.$('strong:contains(Howdy)').length,
    'Bold tag contains text'
  );
});

test('serializes mobiledoc to `mobiledocVersion`', function(assert) {
  assert.expect(2);
  let text = 'Howdy';
  this.set('mobiledoc', simpleMobileDoc(text));
  this.set('serializeVersion', '0.2.0');

  let version;

  this.on('on-change', (mobiledoc) => {
    version = mobiledoc.version;
  });
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc serializeVersion=serializeVersion on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();

  assert.equal(version, '0.2.0', 'serializes to the passed serializeVersion (0.2.0)');

  this.set('serializeVersion', '0.3.0');
  version = null;

  textNode = this.$(`p strong:contains(${text})`)[0].firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();

  assert.equal(version, '0.3.0', 'serializes to the passed serializeVersion (0.3.0)');
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
    {{#mobiledoc-editor mobiledoc=mobiledoc as |editor|}}
      {{#mobiledoc-toolbar editor=editor}}
      {{/mobiledoc-toolbar}}
    {{/mobiledoc-editor}}
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
    {{#mobiledoc-editor mobiledoc=mobiledoc as |editor|}}
      {{#mobiledoc-toolbar editor=editor}}
      {{/mobiledoc-toolbar}}
    {{/mobiledoc-editor}}
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
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleLink}}>Link</button>
    {{/mobiledoc-editor}}
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
    {{#mobiledoc-editor mobiledoc=mobiledoc on-change=(action 'on-change') as |editor|}}
      <button {{action editor.toggleLink}}>Link</button>
    {{/mobiledoc-editor}}
  `);
  let textNode = this.$(`p:contains(${text})`)[0].firstChild.firstChild;
  selectRange(textNode, 0, textNode, text.length);
  this.$('button').click();
  assert.ok(
    !this.$('a[href="http://example.com"]:contains(Howdy)').length,
    'a tag removed'
  );
});

test('it adds a component in display mode to the mobiledoc editor', function(assert) {
  assert.expect(5);
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}></button></div>
   `);
  this.registry.register('template:components/demo-card-editor', hbs`<div id="demo-card-editor"></div>`);
  this.set('cards', [
    createComponentCard('demo-card')
  ]);
  this.render(hbs`
    {{#mobiledoc-editor cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
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

test('exposes the `postModel` on the card component', function(assert) {
  assert.expect(2);
  this.registry.register('component:demo-card', Ember.Component.extend({
    init() {
      this._super(...arguments);
      assert.ok(!!this.get('postModel'), 'card is passed postModel');
    }
  }));
  this.registry.register('template:components/demo-card',
                         hbs`<div id="demo-card"></div>`);
  this.set('cards', [createComponentCard('demo-card')]);
  this.render(hbs`
    {{#mobiledoc-editor cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();
  assert.ok(this.$(`#demo-card`).length, 'Card added in display mode');
});

test('it adds a card and removes an active blank section', function(assert) {
  assert.expect(4);

  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}></button></div>
   `);
  this.set('cards', [ createComponentCard('demo-card') ]);
  this.set('mobiledoc', simpleMobileDoc(''));
  this.on('didCreateEditor', (editor) => { this.editor = editor; });
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards did-create-editor=(action "didCreateEditor") as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
    {{/mobiledoc-editor}}
  `);

  assert.equal(this.$('.mobiledoc-editor p').length, 1, 'blank section exists');
  assert.equal(this.$('#demo-card').length, 0, 'no card section exists');
  this.editor.selectRange(new MobiledocKit.Range(this.editor.post.headPosition()));
  this.$('button#add-card').click();

  assert.equal(this.$('.mobiledoc-editor p').length, 0, 'no blank section');
  assert.equal(this.$('#demo-card').length, 1, 'card section exists');
});

test('it adds a card and focuses the cursor at the end of the card', function(assert) {
  assert.expect(6);
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card"><button id='edit-card' {{action editCard}}></button></div>
   `);
  this.set('cards', [
    createComponentCard('demo-card')
  ]);
  let editor;
  this.on('expose-editor', (hash) => {
    editor = hash.editor;
  });
  this.set('mobiledoc', simpleMobileDoc(''));
  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
      <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
      <button id='get-editor' {{action 'expose-editor' editor}}></button>
    {{/mobiledoc-editor}}
  `);

  moveCursorTo(this, '.mobiledoc-editor p');
  this.$('button#get-editor').click();
  this.$('button#add-card').click();
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

test('it has `addCardInEditMode` action to add card in edit mode', function(assert) {
  assert.expect(2);
  this.registry.register('template:components/demo-card',
                         hbs`<div id="demo-card"></div>`);
  this.registry.register('template:components/demo-card-editor',
                         hbs`<div id="demo-card-editor"></div>`);
  this.set('cards', [createComponentCard('demo-card')]);

  this.render(hbs`
    {{#mobiledoc-editor cards=cards as |editor|}}
      <button id='add-card'
              {{action editor.addCardInEditMode 'demo-card'}}>
      </button>
    {{/mobiledoc-editor}}
  `);

  this.$('button#add-card').click();

  assert.ok(!this.$(`#demo-card`).length, 'Card added in edit mode');
  assert.ok(this.$(`#demo-card-editor`).length, 'Card not in display mode');
});

test(`sets ${COMPONENT_CARD_EXPECTED_PROPS.join(',')} properties on card components`, function(assert) {
  assert.expect(COMPONENT_CARD_EXPECTED_PROPS.length);

  let Component = Ember.Component.extend({
    didInsertElement() {
      COMPONENT_CARD_EXPECTED_PROPS.forEach(propName => {
        assert.ok(!!this.get(propName), `has ${propName} property`);
      });
    }
  });
  this.registry.register('component:demo-card', Component);
  this.registry.register('template:components/demo-card', hbs`<div id="demo-card"></div>`);
  this.set('cards', [createComponentCard('demo-card')]);
  this.set('mobiledoc', mobiledocWithCard('demo-card'));

  this.render(hbs`
    {{#mobiledoc-editor mobiledoc=mobiledoc cards=cards as |editor|}}
    {{/mobiledoc-editor}}
  `);
});

test('component card `env` property exposes `isInEditor`', function(assert) {
  assert.expect(1);

  let env;
  let Component = Ember.Component.extend({
    didInsertElement() {
      env = this.get('env');
    }
  });
  this.registry.register('component:demo-card', Component);
  this.registry.register('template:components/demo-card', hbs`<div id="demo-card"></div>`);
  this.set('cards', [createComponentCard('demo-card')]);
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

  const DemoCardComponent = Ember.Component.extend({
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

  this.registry.register('component:demo-card', DemoCardComponent);
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card">
      {{data.foo}}
      <button id='mutate-payload' {{action 'mutatePayload'}}></button>
    </div>
  `);

  this.set('cards', [createComponentCard('demo-card')]);
  let payload = {foo: 'bar'};
  this.set('payload', payload);

  this.render(hbs`
    {{#mobiledoc-editor cards=cards as |editor|}}
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

  const DemoCardComponent = Ember.Component.extend({
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

  this.registry.register('component:demo-card', DemoCardComponent);
  this.registry.register('template:components/demo-card', hbs`
    <div id="demo-card">
      {{payload.foo}}
      <button id='mutate-payload' {{action 'mutatePayload'}}></button>
    </div>
  `);

  this.set('cards', [createComponentCard('demo-card')]);
  let payload = {foo: 'bar'};
  this.set('payload', payload);

  this.render(hbs`
    {{#mobiledoc-editor cards=cards as |editor|}}
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
  }, /Unknown card "missing-card" found.*no unknownCardHandler/);
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
  let done = assert.async();

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
    {{#mobiledoc-editor mobiledoc=mobiledoc as |editor|}}
      {{#if editor.activeSectionTagNames.isBlockquote}}
        <div id='is-block-quote'>is block quote</div>
      {{/if}}
      {{#if editor.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{/if}}
    {{/mobiledoc-editor}}
  `);

  moveCursorTo(this, 'blockquote:contains(blockquote section)');
  simulateMouseup();

  setTimeout(() => {
    assert.ok(this.$('#is-block-quote').length, 'is block quote');

    moveCursorTo(this, 'p:contains(first paragraph)');
    simulateMouseup();

    setTimeout(() => {
      assert.ok(this.$('#is-p').length, 'is p');
      done();
    }, 10);
  }, 10);
});

test('#activeSectionTagNames is correct when a card is selected', function(assert) {
  let done = assert.async();

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
      let input = $('<input id="test-card-inner">')[0];
      setTimeout(() => {
        $(input).focus();
      });
      return input;
    }
  }]);

  this.render(hbs`
    {{#mobiledoc-editor cards=cards mobiledoc=mobiledoc as |editor|}}
      {{#if editor.activeSectionTagNames.isP}}
        <div id='is-p'>is p</div>
      {{else}}
        <div id='not-p'>not p</div>
      {{/if}}
    {{/mobiledoc-editor}}
  `);

  // Since the card focuses on itself, the editor will report the card
  // as the active selection after mouseup, triggering a bug in the
  // cursorDidChange handler of the mobiledoc-editor component
  simulateMouseup();

  setTimeout(() => {
    assert.ok(this.$('#not-p').length, 'is not p');
    done();
  });
});
