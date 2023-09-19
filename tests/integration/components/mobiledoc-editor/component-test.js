/* eslint-disable ember/no-component-lifecycle-hooks */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import { Promise as EmberPromise } from 'rsvp';
import { run, _getCurrentRunLoop } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  find,
  findAll,
  click,
  fillIn,
  resetOnerror,
  setupOnerror,
  triggerEvent,
} from '@ember/test-helpers';
import {
  selectRange,
  selectRangeWithEditor,
  moveCursorTo,
} from 'dummy/tests/helpers/selection';
import hbs from 'htmlbars-inline-precompile';
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';
import createComponentAtom from 'ember-mobiledoc-editor/utils/create-component-atom';
import { Editor, Range, MOBILEDOC_VERSION } from 'mobiledoc-kit';
import {
  WILL_CREATE_EDITOR_ACTION,
  DID_CREATE_EDITOR_ACTION,
} from 'ember-mobiledoc-editor/components/mobiledoc-editor/component';
import {
  simpleMobileDoc,
  blankMobiledoc,
  linkMobileDoc,
  mobiledocWithCard,
  mobiledocWithAtom,
} from '../../../helpers/create-mobiledoc';
import { action } from '@ember/object';

const COMPONENT_CARD_EXPECTED_PROPS = [
  'env',
  'editCard',
  'saveCard',
  'cancelCard',
  'removeCard',
  'postModel',
  'options',
];

const COMPONENT_ATOM_EXPECTED_PROPS = ['saveAtom', 'options'];

function findParagraphElContaining(s) {
  return findAll('p').find((el) => el.textContent.includes(s));
}

module('Integration | Component | mobiledoc editor', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.actions = {};
    this.send = (actionName, ...args) =>
      this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function () {
    this.registerAtomComponent = (
      atomName,
      template,
      componentClass = Component.extend({ tagName: 'span' })
    ) => {
      this.owner.register(`component:${atomName}`, componentClass);
      this.owner.register(`template:components/${atomName}`, template);
      return createComponentAtom(atomName);
    };
    this.registerCardComponent = (
      cardName,
      template,
      componentClass = Component.extend()
    ) => {
      this.owner.register(`component:${cardName}`, componentClass);
      this.owner.register(`template:components/${cardName}`, template);
      return createComponentCard(cardName);
    };
    this.registerCardComponentWithEditor = (
      cardName,
      template,
      componentClass,
      editorTemplate,
      editorClass = Component.extend()
    ) => {
      let card = this.registerCardComponent(cardName, template, componentClass);
      this.owner.register(`component:${cardName}-editor`, editorClass);
      this.owner.register(
        `template:components/${cardName}-editor`,
        editorTemplate
      );
      return card;
    };
  });

  hooks.afterEach(function () {
    resetOnerror();
  });

  test('it boots the mobiledoc editor', async function (assert) {
    assert.expect(1);
    await render(hbs`<MobiledocEditor />`);
    assert
      .dom('.mobiledoc-editor__editor')
      .hasAttribute('contenteditable', 'true', 'Mobiledoc editor is booted');
  });

  test('it boots mobiledoc editor with mobiledoc', async function (assert) {
    assert.expect(2);
    let mobiledoc = simpleMobileDoc('Howdy');
    this.set('mobiledoc', mobiledoc);
    await render(hbs`<MobiledocEditor @mobiledoc={{this.mobiledoc}} />`);
    assert
      .dom('.mobiledoc-editor__editor')
      .hasAttribute('contenteditable', 'true', 'Mobiledoc editor is booted');
    assert
      .dom('.mobiledoc-editor__editor')
      .containsText('Howdy', 'Mobiledoc editor is booted with text');
  });

  test(`fires ${WILL_CREATE_EDITOR_ACTION} and ${DID_CREATE_EDITOR_ACTION} actions`, async function (assert) {
    assert.expect(5);
    let willCreateCalls = 0;
    let editor;

    assert.equal(
      WILL_CREATE_EDITOR_ACTION,
      'will-create-editor',
      'precond - correct will-create action name'
    );
    assert.equal(
      DID_CREATE_EDITOR_ACTION,
      'did-create-editor',
      'precond - correct did-create action name'
    );

    this.set('mobiledoc', simpleMobileDoc('hello'));

    this.actions.willCreateEditor = () => {
      willCreateCalls++;
      assert.notOk(editor, 'calls willCreateEditor before didCreateEditor');
    };

    this.actions.didCreateEditor = (editor) => {
      assert.equal(
        willCreateCalls,
        1,
        'calls didCreateEditor after willCreateEditor'
      );
      assert.ok(
        // eslint-disable-next-line qunit/no-assert-logical-expression
        editor && editor instanceof Editor,
        `passes Editor instance to ${DID_CREATE_EDITOR_ACTION}`
      );
    };

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}}
          @will-create-editor={{action "willCreateEditor"}}
          @did-create-editor={{action "didCreateEditor"}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('it does not create a new editor when the same mobiledoc is set', async function (assert) {
    assert.expect(4);
    let mobiledoc = simpleMobileDoc('Howdy');
    let editor;
    let willCreateCalls = 0;
    let didCreateCalls = 0;

    this.set('mobiledoc', mobiledoc);
    this.actions.willCreateEditor = () => willCreateCalls++;
    this.actions.didCreateEditor = (_editor) => {
      editor = _editor;
      didCreateCalls++;
    };
    await render(hbs`
      <MobiledocEditor @mobiledoc={{readonly this.mobiledoc}}
                          @will-create-editor={{action "willCreateEditor"}}
                          @did-create-editor={{action "didCreateEditor"}}
                          @on-change={{action (mut this.mobiledoc)}} as |editor|>
      </MobiledocEditor>
    `);

    assert.equal(willCreateCalls, 1, 'called willCreateEditor 1x');
    assert.equal(didCreateCalls, 1, 'called didCreateEditor 1x');

    editor.run((postEditor) => {
      postEditor.insertText(editor.post.tailPosition(), 'Friend');
    });

    assert.equal(willCreateCalls, 1, 'still only called willCreateEditor 1x');
    assert.equal(didCreateCalls, 1, 'still only called didCreateEditor 1x');
  });

  test('wraps component-card adding in runloop correctly', async function (assert) {
    assert.expect(3);
    let mobiledoc = simpleMobileDoc('Howdy');
    let editor;

    this.set('mobiledoc', mobiledoc);
    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    let card = this.registerCardComponent(
      'demo-card',
      hbs`
      <div id="demo-card">demo-card</div>
    `
    );
    this.set('cards', [card]);
    this.set('mobiledoc', simpleMobileDoc());
    await render(hbs`
      <MobiledocEditor @did-create-editor={{action 'didCreateEditor'}} @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
      </MobiledocEditor>
    `);

    // Add a card without being in a runloop
    assert.notOk(_getCurrentRunLoop(), 'precond - no run loop');
    editor.run((postEditor) => {
      let card = postEditor.builder.createCardSection('demo-card');
      postEditor.insertSection(card);
    });
    assert.notOk(
      _getCurrentRunLoop(),
      'postcond - no run loop after editor.run'
    );

    assert.ok(findAll('#demo-card').length, 'demo card is added');
  });

  test('it updates the editor when the mobiledoc changes', async function (assert) {
    assert.expect(2);
    let mobiledoc1 = simpleMobileDoc('Howdy');
    let mobiledoc2 = simpleMobileDoc('Doody');

    this.set('mobiledoc', mobiledoc1);
    await render(hbs`{{mobiledoc-editor mobiledoc=this.mobiledoc}}`);

    assert
      .dom('.mobiledoc-editor__editor')
      .containsText('Howdy', 'Mobiledoc editor is booted with text');

    this.set('mobiledoc', mobiledoc2);

    assert
      .dom('.mobiledoc-editor__editor')
      .containsText('Doody', 'Mobiledoc editor is updated');
  });

  test('it renders a yielded toolbar', async function (assert) {
    assert.expect(1);
    await render(hbs`
    <MobiledocEditor as |editor|>
        Toolbar
    </MobiledocEditor>
    `);
    assert
      .dom('.mobiledoc-editor')
      .containsText('Toolbar', 'Toolbar is yielded');
  });

  test('it displays a custom placeholder', async function (assert) {
    assert.expect(1);
    await render(hbs`
      <MobiledocEditor @placeholder="Write something in me" />
    `);
    assert
      .dom('[data-placeholder]')
      .hasAttribute('data-placeholder', 'Write something in me');
  });

  test('passes through spellcheck option', async function (assert) {
    assert.expect(1);
    await render(hbs`
      {{mobiledoc-editor spellcheck=false}}
    `);
    assert.dom('[spellcheck]').hasAttribute('spellcheck', 'false');
  });

  test('it bolds the text and fires `on-change`', async function (assert) {
    let done = assert.async();
    assert.expect(2);
    let text = 'Howdy';
    this.set('mobiledoc', simpleMobileDoc(text));

    let changeEvents = [];
    this.actions['on-change'] = (mobiledoc) => {
      changeEvents.push(mobiledoc);
    };

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @on-change={{action 'on-change'}} as |editor|>
        <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
      </MobiledocEditor>
    `);
    let textNode = findAll('p').find((el) =>
      el.textContent.includes(text)
    ).firstChild;

    return selectRange(textNode, 0, textNode, text.length).then(async () => {
      await click('button');

      assert.dom('strong').containsText('Howdy', 'Bold tag contains text');

      assert.ok(!!changeEvents[0], 'on-change fired with mobiledoc');
      done();
    });
  });

  test('serializes mobiledoc to `mobiledocVersion`', async function (assert) {
    assert.expect(2);
    let text = 'Howdy';
    this.set('mobiledoc', simpleMobileDoc(text));
    this.set('serializeVersion', '0.2.0');

    let version;

    this.actions['on-change'] = (mobiledoc) => {
      version = mobiledoc.version;
    };
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @serializeVersion={{this.serializeVersion}} @on-change={{action 'on-change'}} as |editor|>
        <button {{action editor.toggleMarkup 'strong'}}>Bold</button>
      </MobiledocEditor>
    `);
    let textNode = findAll('p').find((el) =>
      el.textContent.includes(text)
    ).firstChild;
    await selectRange(textNode, 0, textNode, text.length);
    await click('button');
    assert.equal(
      version,
      '0.2.0',
      'serializes to the passed serializeVersion (0.2.0)'
    );

    this.set('serializeVersion', '0.3.2');
    version = null;

    textNode = findAll('p strong').find((el) =>
      el.textContent.includes(text)
    ).firstChild;
    await selectRange(textNode, 0, textNode, text.length);
    await click('button');
    assert.equal(
      version,
      '0.3.2',
      'serializes to the passed serializeVersion (0.3.2)'
    );
  });

  test('it exposes "toggleSection" which toggles the section type and fires `on-change`', async function (assert) {
    assert.expect(6);

    let onChangeCount = 0;

    let text = 'Howdy';
    this.set('mobiledoc', simpleMobileDoc(text));
    this.actions['on-change'] = () => onChangeCount++;
    await render(hbs`
      {{#mobiledoc-editor mobiledoc=this.mobiledoc on-change=(action 'on-change') as |editor|}}
        <button {{action editor.toggleSection 'h2'}}>H2</button>
      {{/mobiledoc-editor}}
    `);
    let textNode = findAll('p').find((el) =>
      el.textContent.includes(text)
    ).firstChild;

    return selectRange(textNode, 0, textNode, text.length).then(async () => {
      assert.dom('h2').doesNotExist('precond - no h2');
      assert.equal(onChangeCount, 0, 'precond - no on-change');

      await click('button');

      assert.equal(onChangeCount, 1, 'fires on-change');
      assert.dom('h2').containsText('Howdy', 'Changes to h2 tag');

      onChangeCount = 0;
      await click('button');
      assert.equal(onChangeCount, 1, 'fires on-change again');
      assert.dom('h2').doesNotExist('toggles h2 tag off again');
    });
  });

  test('it exposes "setAttribute" which can be used by section-attribute-button to update the section attribute value and fires `on-change`', async function (assert) {
    assert.expect(8);

    let onChangeCount = 0;

    let text = 'Howdy';
    this.set('mobiledoc', simpleMobileDoc(text));
    this.actions['on-change'] = () => onChangeCount++;
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @on-change={{action 'on-change'}} as |editor|>
        <MobiledocSectionAttributeButton @editor={{editor}} @attributeName="text-align" @attributeValue="left" />
        <MobiledocSectionAttributeButton @editor={{editor}} @attributeName="text-align" @attributeValue="center" />
      </MobiledocEditor>
    `);
    let textNode = findParagraphElContaining(text).firstChild;

    await selectRange(textNode, 0, textNode, text.length);
    assert
      .dom(findParagraphElContaining(text))
      .doesNotHaveAttribute('data-md-text-align', 'precond - no attr');
    assert.equal(onChangeCount, 0, 'precond - no on-change');
    await click(findAll('button')[1]);
    assert.equal(onChangeCount, 1, 'fires on-change');
    assert
      .dom(findParagraphElContaining(text))
      .hasAttribute('data-md-text-align', 'center', 'sets attribute');

    onChangeCount = 0;
    await click(findAll('button')[1]);
    assert.equal(onChangeCount, 0, 'fires on-change again');
    assert
      .dom(findParagraphElContaining(text))
      .hasAttribute(
        'data-md-text-align',
        'center',
        'clicking again does nothing'
      );

    onChangeCount = 0;
    await click(findAll('button')[0]);
    assert.equal(onChangeCount, 1, 'fires on-change again');
    assert
      .dom(findParagraphElContaining(text))
      .doesNotHaveAttribute(
        'data-md-text-align',
        'clicking left removes attribute since it is the default value'
      );
  });

  test('toolbar buttons can be active', async function (assert) {
    let text = 'abc';
    this.set('mobiledoc', simpleMobileDoc(text));
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} as |editor|>
        <MobiledocToolbar @editor={{editor}}>
        </MobiledocToolbar>
      </MobiledocEditor>
    `);
    const textNode = findParagraphElContaining(text).firstChild;

    await selectRange(textNode, 0, textNode, text.length);
    assert.dom(`button[title=Heading]`).exists('has heading toolbar button');
    await click(`button[title=Heading]`);
    assert.dom('h1').containsText(text, 'heading-ifies text');
    assert
      .dom(`button[title=Heading]`)
      .hasClass('active', 'heading button is active');

    await click(`button[title=Heading]`);
    assert.dom('h1').doesNotExist('heading is gone');
    assert
      .dom(`button[title=Heading]`)
      .doesNotHaveClass('active', 'heading button is no longer active');
  });

  test('toolbar has list insertion button', async function (assert) {
    let text = 'abc';
    this.set('mobiledoc', simpleMobileDoc(text));
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} as |editor|>
        <MobiledocToolbar @editor={{editor}}>
        </MobiledocToolbar>
      </MobiledocEditor>
    `);
    const textNode = findParagraphElContaining(text).firstChild;
    await selectRange(textNode, 0, textNode, text.length);
    assert.dom(`button[title=List]`).exists('has list toolbar button');
    await click(`button[title=List]`);

    assert
      .dom('.mobiledoc-editor__editor ul li')
      .containsText(text, 'list-ifies text');
  });

  test('toggleLink action is no-op when nothing is selected', async function (assert) {
    assert.expect(2);
    this.set('mobiledoc', simpleMobileDoc(''));
    this.actions.didCreateEditor = (editor) => (this._editor = editor);
    await render(hbs`
      {{#mobiledoc-editor autofocus=false mobiledoc=this.mobiledoc did-create-editor=(action 'didCreateEditor') as |editor|}}
        <button {{action editor.toggleLink}}>Link</button>
      {{/mobiledoc-editor}}
    `);

    assert.notOk(this._editor.hasCursor(), 'precond - no cursor');
    await click('button');
    assert.strictEqual(findAll('input').length, 0, 'no link input shown');
  });

  test('it links selected text and fires `on-change`', async function (assert) {
    assert.expect(2);
    let text = 'Howdy';
    this.set('mobiledoc', simpleMobileDoc(text));
    this.actions['on-change'] = (mobiledoc) => (this._mobiledoc = mobiledoc);
    this.actions.didCreateEditor = (editor) => (this._editor = editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @on-change={{action 'on-change'}} @did-create-editor={{action 'didCreateEditor'}} as |editor|>
        <button {{action editor.toggleLink}} data-test-link-button>Link</button>
      </MobiledocEditor>
    `);
    let { _editor: editor } = this;
    let nextFrame = () =>
      new EmberPromise((resolve) => window.requestAnimationFrame(resolve));

    await selectRangeWithEditor(
      editor,
      new Range(editor.post.headPosition(), editor.post.tailPosition())
    );
    await click('[data-test-link-button]');

    await nextFrame();
    await fillIn('input', 'http://example.com');
    await triggerEvent('input', 'change');
    await nextFrame();
    await click('button[type=submit]');
    assert
      .dom('a[href="http://example.com"]')
      .containsText('Howdy', 'a tag contains text');
    let markup = this._mobiledoc.markups[0];
    assert.deepEqual(
      markup,
      ['a', ['href', 'http://example.com']],
      'mobiledoc contains link markup'
    );
  });

  test('it de-links selected text and fires `on-change`', async function (assert) {
    assert.expect(2);
    let text = 'Howdy';
    this.set('mobiledoc', linkMobileDoc(text));
    this.actions['on-change'] = (mobiledoc) => (this._mobiledoc = mobiledoc);
    this.actions['did-create-editor'] = (editor) => (this._editor = editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @on-change={{action 'on-change'}} @did-create-editor={{action 'did-create-editor'}} as |editor|>
        <button {{action editor.toggleLink}} data-test-link-button>Link</button>
      </MobiledocEditor>
    `);

    let { _editor: editor } = this;
    await selectRangeWithEditor(
      editor,
      new Range(editor.post.headPosition(), editor.post.tailPosition())
    );
    await click('[data-test-link-button]');

    assert.dom('a[href="http://example.com"]').doesNotExist('a tag removed');
    assert.equal(this._mobiledoc.markups.length, 0, 'no markups');
  });

  test('it adds a component in display mode to the mobiledoc editor', async function (assert) {
    assert.expect(5);
    this.owner.register(
      'template:components/demo-card',
      hbs`
      <div id="demo-card"><button id='edit-card' {{action @editCard}}>CLICK ME</button></div>
     `
    );
    this.owner.register(
      'template:components/demo-card-editor',
      hbs`<div id="demo-card-editor"></div>`
    );
    this.set('cards', [createComponentCard('demo-card')]);
    this.set('mobiledoc', simpleMobileDoc());
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
        <button id='add-card' {{action editor.addCard 'demo-card'}}>Add card</button>
      </MobiledocEditor>
    `);

    await click('button#add-card');

    assert.dom(`#demo-card`).exists('Card added in display mode');
    assert.dom(`#demo-card-editor`).doesNotExist('Card not in edit mode');
    assert.dom(`button#edit-card`).exists('has edit card button');

    await click('button#edit-card');
    assert.dom(`#demo-card`).doesNotExist('Card not in display mode');
    assert.dom(`#demo-card-editor`).exists('Card changed to edit mode');
  });

  test('it adds a card and removes an active blank section', async function (assert) {
    assert.expect(4);

    let editor;
    let card = this.registerCardComponent(
      'demo-card',
      hbs`
      <div id="demo-card"><button id='edit-card' {{action this.editCard}}></button></div>
     `
    );
    this.set('cards', [card]);
    this.set('mobiledoc', simpleMobileDoc());
    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} @did-create-editor={{action "didCreateEditor"}} as |editor|>
        <button id='add-card' {{action editor.addCard 'demo-card'}}></button>
      </MobiledocEditor>
    `);

    assert
      .dom('.mobiledoc-editor p')
      .exists({ count: 1 }, 'blank section exists');
    assert.dom('#demo-card').doesNotExist('no card section exists');
    editor.selectRange(editor.post.headPosition());
    await click('button#add-card');

    assert.dom('.mobiledoc-editor p').doesNotExist('no blank section');
    assert.dom('#demo-card').exists({ count: 1 }, 'card section exists');
  });

  test('it adds a card and focuses the cursor at the end of the card', async function (assert) {
    assert.expect(7);

    let card = this.registerCardComponent(
      'demo-card',
      hbs`
      <div id="demo-card"><button id='edit-card' {{action @editCard}}>DEMO CARD</button></div>
     `
    );
    this.set('cards', [card]);
    let editor;
    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    this.set('mobiledoc', simpleMobileDoc());
    await render(hbs`
      <MobiledocEditor @autofocus={{false}} @did-create-editor={{action 'didCreateEditor'}} @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
        <button id='add-card' {{action editor.addCard 'demo-card'}}>ADD CARD</button>
      </MobiledocEditor>
    `);

    await selectRangeWithEditor(editor, editor.post.tailPosition());
    // eslint-disable-next-line qunit/no-assert-logical-expression
    assert.ok(editor && !editor.range.isBlank, 'range is not blank');
    await click('button#add-card');
    assert.dom('#demo-card').exists({ count: 1 }, 'card section exists');

    let cardWrapper = find('#demo-card').closest('.__mobiledoc-card');
    assert.dom(cardWrapper).exists('precond - card wrapper is found');
    let cursorNode = cardWrapper.nextSibling;
    assert.ok(!!cursorNode, 'precond - cursor element is found');

    assert.strictEqual(
      window.getSelection().focusNode,
      cursorNode,
      'selection focus is on cursor element'
    );
    assert.strictEqual(
      window.getSelection().anchorNode,
      cursorNode,
      'selection anchor is on cursor element'
    );
    assert.strictEqual(
      document.activeElement,
      find('.__mobiledoc-editor'),
      'document.activeElement is correct'
    );
  });

  // See https://github.com/bustle/ember-mobiledoc-editor/issues/86
  test('can add a card to a blank post', async function (assert) {
    assert.expect(3);

    let card = this.registerCardComponent(
      'demo-card',
      hbs`<div id="demo-card">DEMO CARD</div>`
    );
    this.set('cards', [card]);
    let editor;
    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    this.set('mobiledoc', blankMobiledoc());
    await render(hbs`
      <MobiledocEditor @did-create-editor={{action 'didCreateEditor'}} @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
      </MobiledocEditor>
    `);

    let editorEl = find('.mobiledoc-editor__editor');
    await selectRange(editorEl, 0, editorEl, 0);
    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.dom('#demo-card').doesNotExist('precond - no card inserted');
    run(() => editor.insertCard('demo-card'));
    await settled();
    assert.dom('#demo-card').exists('inserts card');
  });

  test('it has `addCardInEditMode` action to add card in edit mode', async function (assert) {
    assert.expect(2);
    this.owner.register(
      'template:components/demo-card',
      hbs`<div id="demo-card"></div>`
    );
    this.owner.register(
      'template:components/demo-card-editor',
      hbs`<div id="demo-card-editor"></div>`
    );
    this.set('cards', [createComponentCard('demo-card')]);
    this.set('mobiledoc', simpleMobileDoc());

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
        <button id='add-card' {{action editor.addCardInEditMode 'demo-card'}}>Add Card</button>
      </MobiledocEditor>
    `);

    await click('button#add-card');

    assert.dom('#demo-card-editor').exists('Card added in edit mode');
    assert.dom('#demo-card').doesNotExist('Card not in display mode');
  });

  test(`sets ${COMPONENT_CARD_EXPECTED_PROPS.join(
    ','
  )} properties on card components`, async function (assert) {
    assert.expect(COMPONENT_CARD_EXPECTED_PROPS.length);

    let DemoCardComponent = Component.extend({
      didInsertElement() {
        this._super(...arguments);
        COMPONENT_CARD_EXPECTED_PROPS.forEach((propName) => {
          assert.ok(!!this.get(propName), `has ${propName} property`);
        });
      },
    });
    let card = this.registerCardComponent(
      'demo-card',
      hbs`<div id='demo-card'></div>`,
      DemoCardComponent
    );
    this.set('cards', [card]);
    this.set('mobiledoc', mobiledocWithCard('demo-card'));

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test(`passes options through to card components`, async function (assert) {
    assert.expect(1);
    let cardOptions = {
      foo: 'bar',
    };
    let DemoCardComponent = Component.extend({
      didInsertElement() {
        this._super(...arguments);
        assert.equal(
          this.options.foo,
          'bar',
          `options property has been passed`
        );
      },
    });
    let card = this.registerCardComponent(
      'demo-card',
      hbs`<div id='demo-card'></div>`,
      DemoCardComponent
    );
    this.set('cards', [card]);
    this.set('mobiledoc', mobiledocWithCard('demo-card'));
    this.set('cardOptions', cardOptions);

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} @cardOptions={{this.cardOptions}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test(`passes options through to atom components`, async function (assert) {
    assert.expect(1);
    let cardOptions = {
      foo: 'bar',
    };
    let DemoAtomComponent = Component.extend({
      didInsertElement() {
        this._super(...arguments);
        assert.equal(
          this.options.foo,
          'bar',
          `options property has been passed`
        );
      },
    });
    let atom = this.registerAtomComponent(
      'demo-atom',
      hbs`I AM AN ATOM`,
      DemoAtomComponent
    );
    this.set('atoms', [atom]);
    this.set('mobiledoc', mobiledocWithAtom('demo-atom'));
    this.set('cardOptions', cardOptions);

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @atoms={{this.atoms}} @cardOptions={{this.cardOptions}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('component card `env` property exposes `isInEditor`', async function (assert) {
    assert.expect(1);

    let env;
    let DemoCardComponent = Component.extend({
      didInsertElement() {
        this._super(...arguments);
        env = this.env;
      },
    });
    let card = this.registerCardComponent(
      'demo-card',
      hbs`<div id='demo-card'></div>`,
      DemoCardComponent
    );
    this.set('cards', [card]);
    this.set('mobiledoc', mobiledocWithCard('demo-card'));

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
      </MobiledocEditor>
    `);

    assert.ok(env?.isInEditor, 'env.isInEditor is true');
  });

  test('(deprecated) `addCard` passes `data`, breaks reference to original payload', async function (assert) {
    assert.expect(6);

    let passedPayload;

    const DemoCardComponent = Component.extend({
      init() {
        this._super(...arguments);
        passedPayload = this.data;
      },
      @action
      mutatePayload() {
        this.set('data.foo', 'baz');
      },
    });

    let card = this.registerCardComponent(
      'demo-card',
      hbs`
      <div id="demo-card">
        {{this.data.foo}}
        <button id='mutate-payload' {{action this.mutatePayload}}></button>
      </div>
    `,
      DemoCardComponent
    );

    this.set('cards', [card]);
    let payload = { foo: 'bar' };
    this.set('payload', payload);
    this.set('mobiledoc', simpleMobileDoc());

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
        <button id='add-card' {{action editor.addCard 'demo-card' this.payload}}>
        </button>
      </MobiledocEditor>
    `);

    await click('button#add-card');

    assert.strictEqual(passedPayload?.foo, 'bar', 'payload is passed to card');
    assert.notStrictEqual(
      passedPayload,
      payload,
      'card receives data payload that is not the same object'
    );

    assert.dom('button#mutate-payload').exists('has mutate-payload button');
    assert
      .dom('#demo-card')
      .containsText(payload.foo, 'displays passed `data`');
    await click('button#mutate-payload');

    assert.equal(passedPayload.foo, 'baz', 'mutates its payload');
    assert.equal(payload.foo, 'bar', 'originalpayload remains unchanged');
  });

  test('`addCard` passes `payload`, breaks reference to original payload', async function (assert) {
    assert.expect(6);

    let passedPayload;

    const DemoCardComponent = Component.extend({
      init() {
        this._super(...arguments);
        passedPayload = this.payload;
      },
      @action
      mutatePayload() {
        this.set('payload.foo', 'baz');
      },
    });

    let card = this.registerCardComponent(
      'demo-card',
      hbs`
      <div id="demo-card">
        {{this.payload.foo}}
        <button id='mutate-payload' {{action this.mutatePayload}}></button>
      </div>
    `,
      DemoCardComponent
    );

    this.set('cards', [card]);
    let payload = { foo: 'bar' };
    this.set('payload', payload);
    this.set('mobiledoc', simpleMobileDoc());

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @cards={{this.cards}} as |editor|>
        <button id='add-card' {{action editor.addCard 'demo-card' this.payload}}>
        </button>
      </MobiledocEditor>
    `);

    await click('button#add-card');

    assert.strictEqual(passedPayload?.foo, 'bar', 'payload is passed to card');
    assert.notStrictEqual(
      passedPayload,
      payload,
      'card receives data payload that is not the same object'
    );

    assert.dom('button#mutate-payload').exists('has mutate-payload button');
    assert
      .dom('#demo-card')
      .containsText(payload.foo, 'displays passed `payload`');
    await click('button#mutate-payload');

    assert.equal(passedPayload.foo, 'baz', 'mutates its payload');
    assert.equal(payload.foo, 'bar', 'originalpayload remains unchanged');
  });

  test('throws on unknown card when `unknownCardHandler` is not passed', async function (assert) {
    assert.expect(1);
    setupOnerror(function (err) {
      assert.ok(
        err.message.match(/Unknown card "missing-card".*no unknownCardHandler/)
      );
    });

    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      cards: [['missing-card', {}]],
      markups: [],
      atoms: [],
      sections: [[10, 0]],
    });
    this.set('unknownCardHandler', undefined);
    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}}
                @options={{hash unknownCardHandler=this.unknownCardHandler}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('calls `unknownCardHandler` when it renders an unknown card', async function (assert) {
    assert.expect(5);
    let expectedPayload = {};

    this.set('unknownCardHandler', ({ env, payload }) => {
      assert.equal(env.name, 'missing-card', 'correct env.name');
      assert.ok(env.isInEditor, 'isInEditor is correct');
      assert.ok(!!env.onTeardown, 'has onTeardown hook');

      assert.ok(
        // eslint-disable-next-line qunit/no-assert-logical-expression
        env.save && env.remove && env.edit && env.cancel,
        'has save, remove, edit, cancel hooks'
      );
      assert.deepEqual(payload, expectedPayload, 'has payload');
    });

    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      cards: [['missing-card', expectedPayload]],
      markups: [],
      atoms: [],
      sections: [[10, 0]],
    });

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}}
                @options={{hash unknownCardHandler=this.unknownCardHandler}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('#activeSectionTagNames is correct', async function (assert) {
    assert.expect(2);

    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      markups: [],
      cards: [],
      atoms: [],
      sections: [
        [1, 'p', [[0, [], 0, 'first paragraph']]],
        [1, 'blockquote', [[0, [], 0, 'blockquote section']]],
      ],
    });

    await render(hbs`
      <MobiledocEditor @autofocus={{false}} @mobiledoc={{this.mobiledoc}} as |editor|>
        {{#if editor.activeSectionTagNames.isBlockquote}}
          <div id='is-block-quote'>is block quote</div>
        {{/if}}
        {{#if editor.activeSectionTagNames.isP}}
          <div id='is-p'>is p</div>
        {{/if}}
      </MobiledocEditor>
    `);

    await moveCursorTo('blockquote', 'blockquote section');
    assert.dom('#is-block-quote').exists('is block quote');
    await moveCursorTo('p', 'first paragraph');
    assert.dom('#is-p').exists('is p');
  });

  test('#activeSectionTagNames is correct when a card is selected', async function (assert) {
    assert.expect(2);

    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      markups: [],
      cards: [['test-card', {}]],
      atoms: [],
      sections: [
        [1, 'p', [[0, [], 0, 'first paragraph']]],
        [10, 0],
      ],
    });

    this.set('cards', [
      {
        name: 'test-card',
        type: 'dom',
        render() {
          var template = document.createElement('template');
          template.innerHTML = '<div id="card-test">CARD CONTENT</div>'; // Never return a text node of whitespace as the result
          return template.content.firstChild;
        },
      },
    ]);

    await render(hbs`
      <MobiledocEditor @autofocus={{false}} @cards={{this.cards}} @mobiledoc={{this.mobiledoc}} as |editor|>
        {{#if editor.activeSectionTagNames.isP}}
          <div id='is-p'>is p</div>
        {{else}}
          <div id='not-p'>not p</div>
        {{/if}}
      </MobiledocEditor>
    `);

    return moveCursorTo('.mobiledoc-editor p')
      .then(() => {
        assert.ok(findAll('#is-p').length, 'precond - is p');
        return moveCursorTo('#card-test');
      })
      .then(() => {
        assert.ok(findAll('#not-p').length, 'is not p');
      });
  });

  test('exposes `addAtom` action to add an atom', async function (assert) {
    let mobiledoc = simpleMobileDoc('howdy');
    this.set('mobiledoc', mobiledoc);

    let editor;
    this.registerAtomComponent('ember-atom', hbs`I AM AN ATOM`);
    this.set('atoms', [createComponentAtom('ember-atom')]);
    this.set('atomText', 'atom text');
    this.set('atomPayload', { foo: 'bar' });
    this.actions.onChange = (_mobiledoc) => (mobiledoc = _mobiledoc);
    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    await render(hbs`
      <MobiledocEditor
        @on-change={{action 'onChange'}}
        @did-create-editor={{action 'didCreateEditor'}}
        @mobiledoc={{this.mobiledoc}}
        @atoms={{this.atoms}}
      as |editor|>
        <button id='add-atom' {{action editor.addAtom 'ember-atom' this.atomText this.atomPayload}}>Add Ember Atom</button>
      </MobiledocEditor>
    `);

    await selectRangeWithEditor(editor, new Range(editor.post.headPosition()));
    assert.dom('button#add-atom').exists('precond - has button');
    assert
      .dom('.mobiledoc-editor__editor span')
      .doesNotExist('precond - no atom');
    await click('button#add-atom');
    assert
      .dom('.mobiledoc-editor__editor span')
      .containsText('I AM AN ATOM', 'atom is added after clicking');

    let atom = mobiledoc.atoms[0];
    let [name, text, payload] = atom;
    assert.equal(name, 'ember-atom', 'correct atom name in mobiledoc');
    assert.equal(text, 'atom text', 'correct atom text in mobiledoc');
    assert.deepEqual(
      payload,
      { foo: 'bar' },
      'correct atom payload in mobiledoc'
    );
  });

  test('wraps component-atom adding in runloop correctly', async function (assert) {
    assert.expect(3);
    let editor;

    this.actions.didCreateEditor = (_editor) => (editor = _editor);
    let atom = this.registerAtomComponent(
      'demo-atom',
      hbs`<span id='demo-atom'>demo-atom</span>`
    );
    this.set('atoms', [atom]);
    this.set('mobiledoc', simpleMobileDoc());
    await render(hbs`
      <MobiledocEditor @did-create-editor={{action 'didCreateEditor'}} @mobiledoc={{this.mobiledoc}} @atoms={{this.atoms}} as |editor|>
      </MobiledocEditor>
    `);

    assert.notOk(_getCurrentRunLoop(), 'precond - no run loop');
    editor.run((postEditor) => {
      let position = editor.post.headPosition();
      let atom = postEditor.builder.createAtom('demo-atom', 'value', {});
      postEditor.insertMarkers(position, [atom]);
    });
    assert.notOk(
      _getCurrentRunLoop(),
      'postcond - no run loop after editor.run'
    );

    assert.ok(findAll('#demo-atom').length, 'demo atom is added');
  });

  test(`sets ${COMPONENT_ATOM_EXPECTED_PROPS.join(
    ','
  )} properties on atom components`, async function (assert) {
    assert.expect(COMPONENT_ATOM_EXPECTED_PROPS.length);

    let DemoAtomComponent = Component.extend({
      didInsertElement() {
        this._super(...arguments);
        COMPONENT_ATOM_EXPECTED_PROPS.forEach((propName) => {
          assert.ok(!!this.get(propName), `has ${propName} property`);
        });
      },
    });
    let atom = this.registerAtomComponent(
      'demo-atom',
      hbs`<div id='demo-atom'></div>`,
      DemoAtomComponent
    );
    this.set('atoms', [atom]);
    this.set('mobiledoc', mobiledocWithAtom('demo-atom'));

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @atoms={{this.atoms}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('throws on unknown atom when `unknownAtomHandler` is not passed', async function (assert) {
    assert.expect(1);
    setupOnerror(function (err) {
      assert.ok(
        err.message.match(
          /Unknown atom "missing-atom" found.*no unknownAtomHandler/
        )
      );
    });
    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      atoms: [['missing-atom', 'value', {}]],
      markups: [],
      cards: [],
      sections: [[1, 'P', [[1, [], 0, 0]]]],
    });
    this.set('unknownAtomHandler', undefined);
    this.set('atoms', []);

    await render(hbs`
      <MobiledocEditor @mobiledoc={{this.mobiledoc}} @atoms={{this.atoms}}
                @options={{hash unknownAtomHandler=this.unknownAtomHandler}} as |editor|>
      </MobiledocEditor>
    `);
  });

  test('calls `unknownAtomHandler` when it renders an unknown atom', async function (assert) {
    assert.expect(4);
    let expectedPayload = {};

    this.set('unknownAtomHandler', ({ env, value, payload }) => {
      assert.equal(env.name, 'missing-atom', 'correct env.name');
      assert.equal(value, 'value', 'correct name');
      assert.ok(!!env.onTeardown, 'has onTeardown hook');
      assert.deepEqual(payload, expectedPayload, 'has payload');
    });

    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      atoms: [['missing-atom', 'value', expectedPayload]],
      markups: [],
      cards: [],
      sections: [[1, 'P', [[1, [], 0, 0]]]],
    });

    this.set('atoms', []);
    await render(hbs`
      <MobiledocEditor
        @mobiledoc={{this.mobiledoc}}
        @atoms={{this.atoms}}
        @options={{hash unknownAtomHandler=this.unknownAtomHandler}} as |editor|>
      </MobiledocEditor>
    `);
  });

  // See https://github.com/bustle/ember-mobiledoc-editor/issues/90
  test('does not rerender atoms when updating text in section', async function (assert) {
    assert.expect(1);
    let renderCount = 0;
    this.registerAtomComponent(
      'ember-atom',
      hbs`I AM AN ATOM`,
      Component.extend({
        tagName: 'span',
        didRender() {
          this._super(...arguments);
          renderCount++;
        },
      })
    );
    this.set('atoms', [createComponentAtom('ember-atom')]);
    this.set('mobiledoc', {
      version: MOBILEDOC_VERSION,
      atoms: [['ember-atom', 'value', {}]],
      markups: [],
      cards: [],
      sections: [[1, 'P', [[1, [], 0, 0]]]],
    });

    let editor;
    this.actions.didCreateEditor = (_editor) => (editor = _editor);

    await render(hbs`
      <MobiledocEditor
        @mobiledoc={{this.mobiledoc}}
        @atoms={{this.atoms}}
        @did-create-editor={{action 'didCreateEditor'}} as |editor|>
      </MobiledocEditor>
    `);

    renderCount = 0;
    await selectRangeWithEditor(editor, editor.post.tailPosition());
    run(() => editor.insertText('abc'));
    await settled();
    assert.equal(renderCount, 0, 'does not rerender atom when inserting text');
  });
});
