/* eslint-disable ember/no-component-lifecycle-hooks */
/* eslint-disable ember/no-actions-hash */
/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-classes */
/* eslint-disable ember/no-classic-components */
import {
  _getCurrentRunLoop,
  getCurrentRunLoop,
  schedule,
  begin,
  end,
  join,
} from '@ember/runloop';
import { copy } from 'ember-copy';
import { A } from '@ember/array';
import { camelize, capitalize } from '@ember/string';
import EmberObject, { action, computed } from '@ember/object';
import Component from '@ember/component';
import Ember from 'ember';
import layout from './template';
import { Editor, MOBILEDOC_VERSION } from 'mobiledoc-kit';
import assign from 'ember-mobiledoc-editor/utils/polyfill-assign';

export const ADD_CARD_HOOK = 'addComponent';
export const REMOVE_CARD_HOOK = 'removeComponent';
export const ADD_ATOM_HOOK = 'addAtomComponent';
export const REMOVE_ATOM_HOOK = 'removeAtomComponent';
export const WILL_CREATE_EDITOR_ACTION = 'will-create-editor';
export const DID_CREATE_EDITOR_ACTION = 'did-create-editor';

export const TESTING_EXPANDO_PROPERTY = '__mobiledoc_kit_editor';

const EDITOR_CARD_SUFFIX = '-editor';
const EMPTY_MOBILEDOC = {
  version: MOBILEDOC_VERSION,
  markups: [],
  atoms: [],
  cards: [],
  sections: [],
};

export const DEFAULT_SECTION_ATTRIBUTES_CONFIG = {
  'text-align': {
    values: ['left', 'center', 'right'],
    defaultValue: 'left',
  },
};

function arrayToMap(array) {
  let map = Object.create(null);
  array.forEach((key) => {
    if (key) {
      // skip undefined/falsy key values
      key = `is${capitalize(camelize(key))}`;
      map[key] = true;
    }
  });
  return map;
}

export default Component.extend({
  layout,
  tagName: 'article',
  classNames: ['mobiledoc-editor'],

  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,
  showLinkTooltips: true,
  serializeVersion: MOBILEDOC_VERSION,

  options: null,

  // merge in named options with the `options` property data-bag
  editorOptions: computed(
    'atoms',
    'autofocus',
    'cardOptions',
    'cards',
    'options',
    'placeholder',
    'showLinkTooltips',
    'spellcheck',
    function () {
      let options = this.options || {};

      return assign(
        {
          placeholder: this.placeholder,
          spellcheck: this.spellcheck,
          autofocus: this.autofocus,
          showLinkTooltips: this.showLinkTooltips,
          cardOptions: this.cardOptions,
          cards: this.cards || [],
          atoms: this.atoms || [],
        },
        options
      );
    }
  ),

  init() {
    this._super(...arguments);
    let mobiledoc = this.mobiledoc;
    if (!mobiledoc) {
      mobiledoc = EMPTY_MOBILEDOC;
      this.set('mobiledoc', mobiledoc);
    }
    let sectionAttributesConfig = this.sectionAttributesConfig;
    if (!sectionAttributesConfig) {
      sectionAttributesConfig = DEFAULT_SECTION_ATTRIBUTES_CONFIG;
      this.set('sectionAttributesConfig', sectionAttributesConfig);
    }
    this.set('componentCards', A([]));
    this.set('componentAtoms', A([]));
    this.set('linkOffsets', null);
    this.set('activeMarkupTagNames', {});
    this.set('activeSectionTagNames', {});
    this.set('activeSectionAttributes', {});
    this._startedRunLoop = false;
  },

  @action
  isDefaultAttributeValue(attributeName, attributeValue) {
    let defaultValue = this.sectionAttributesConfig[attributeName].defaultValue;
    if (!defaultValue) {
      throw new Error(
        `Default value is not configured for attribute '${attributeName}'`
      );
    }
    return attributeValue === defaultValue;
  },

  @action
  toggleMarkup(markupTagName) {
    let editor = this.editor;
    editor.toggleMarkup(markupTagName);
  },

  @action
  toggleSection(sectionTagName) {
    let editor = this.editor;
    editor.toggleSection(sectionTagName);
  },

  @action
  setAttribute(attributeName, attributeValue) {
    let editor = this.editor;
    if (this.isDefaultAttributeValue(attributeName, attributeValue)) {
      editor.removeAttribute(attributeName);
    } else {
      editor.setAttribute(attributeName, attributeValue);
    }
  },

  @action
  removeAttribute(attributeName) {
    let editor = this.editor;
    editor.setAttribute(attributeName);
  },

  @action
  addCard(cardName, payload = {}) {
    this._addCard(cardName, payload);
  },

  @action
  addAtom(atomName, text = '', payload = {}) {
    this._addAtom(atomName, text, payload);
  },

  @action
  addCardInEditMode(cardName, payload = {}) {
    let editMode = true;
    this._addCard(cardName, payload, editMode);
  },

  @action
  toggleLink() {
    let editor = this.editor;
    if (!editor.hasCursor()) {
      return;
    }
    if (editor.hasActiveMarkup('a')) {
      editor.toggleMarkup('a');
    } else {
      this.set('linkOffsets', editor.range);
    }
  },

  @action
  completeLink(href) {
    let offsets = this.linkOffsets;
    this.set('linkOffsets', null);
    let editor = this.editor;
    editor.selectRange(offsets);
    editor.toggleMarkup('a', { href });
  },

  @action
  cancelLink() {
    this.set('linkOffsets', null);
  },

  editingContexts: computed(function () {
    return A([]);
  }),

  willRender() {
    this._super(...arguments);
    // Use a default mobiledoc. If there are no changes, then return
    // early.
    let mobiledoc = this.mobiledoc || EMPTY_MOBILEDOC;
    if (
      ((this._localMobiledoc && this._localMobiledoc === mobiledoc) ||
        (this._upstreamMobiledoc && this._upstreamMobiledoc === mobiledoc)) &&
      this._lastIsEditingDisabled === this.isEditingDisabled
    ) {
      // No change to mobiledoc, no need to recreate the editor
      return;
    }
    this._lastIsEditingDisabled = this.isEditingDisabled;
    this._upstreamMobiledoc = mobiledoc;
    this._localMobiledoc = null;

    this.willCreateEditor();

    // Teardown any old editor that might be around.
    let editor = this.editor;
    if (editor) {
      editor.destroy();
    }

    // Create a new editor.
    let editorOptions = this.editorOptions;
    editorOptions.mobiledoc = mobiledoc;
    let componentHooks = {
      [ADD_CARD_HOOK]: ({ env, options, payload }, isEditing = false) => {
        let cardId = Ember.uuid();
        let cardName = env.name;
        if (isEditing) {
          cardName = cardName + EDITOR_CARD_SUFFIX;
        }
        let destinationElementId = `mobiledoc-editor-card-${cardId}`;
        let element = document.createElement('div');
        element.id = destinationElementId;
        element.className = 'mobiledoc-editor__card-wrapper';

        // The data must be copied to avoid sharing the reference
        payload = copy(payload, true);

        let card = EmberObject.create({
          destinationElementId,
          cardName,
          payload,
          env,
          options,
          editor,
          postModel: env.postModel,
        });
        schedule('afterRender', () => {
          this.componentCards.pushObject(card);
        });
        return { card, element };
      },
      [ADD_ATOM_HOOK]: ({ env, options, payload, value }) => {
        let atomId = Ember.uuid();
        let atomName = env.name;
        let destinationElementId = `mobiledoc-editor-atom-${atomId}`;
        let element = document.createElement('span');
        element.id = destinationElementId;

        // The data must be copied to avoid sharing the reference
        payload = copy(payload, true);

        let atom = EmberObject.create({
          destinationElementId,
          atomName,
          payload,
          value,
          callbacks: env,
          options,
          editor,
          postModel: env.postModel,
        });
        schedule('afterRender', () => {
          this.componentAtoms.pushObject(atom);
        });
        return { atom, element };
      },
      [REMOVE_CARD_HOOK]: (card) => {
        this.componentCards.removeObject(card);
      },
      [REMOVE_ATOM_HOOK]: (atom) => {
        this.componentAtoms.removeObject(atom);
      },
    };
    if (editorOptions.cardOptions) {
      editorOptions.cardOptions = assign(
        editorOptions.cardOptions,
        componentHooks
      );
    } else {
      editorOptions.cardOptions = componentHooks;
    }
    editor = new Editor(editorOptions);
    editor.willRender(() => {
      // The editor's render/rerender will happen after this `editor.willRender`,
      // so we explicitly start a runloop here if there is none, so that the
      // add/remove card hooks happen inside a runloop.
      // When pasting text that gets turned into a card, for example,
      // the add card hook would run outside the runloop if we didn't begin a new
      // one now.
      // Check for current run loop in two ways to avoid deprecations in different Ember versions
      let currRunLoop = _getCurrentRunLoop
        ? _getCurrentRunLoop()
        : getCurrentRunLoop();
      if (!currRunLoop) {
        this._startedRunLoop = true;
        begin();
      }
    });
    editor.didRender(() => {
      // If we had explicitly started a run loop in `editor.willRender`,
      // we must explicitly end it here.
      if (this._startedRunLoop) {
        this._startedRunLoop = false;
        end();
      }
    });
    editor.postDidChange(() => {
      join(() => {
        this.postDidChange(editor);
      });
    });
    editor.inputModeDidChange(() => {
      if (this.isDestroyed) {
        return;
      }
      join(() => {
        this.inputModeDidChange(editor);
      });
    });
    editor.cursorDidChange(() => {
      if (this.isDestroyed) {
        return;
      }
      join(() => {
        this.cursorDidChange(editor);
      });
    });
    if (this.isEditingDisabled) {
      editor.disableEditing();
    }
    this.set('editor', editor);
    this.didCreateEditor(editor);
  },

  didRender() {
    this._super(...arguments);
    let editor = this.editor;
    if (!editor.hasRendered) {
      let editorElement = this.element.querySelector(
        '.mobiledoc-editor__editor'
      );
      this._isRenderingEditor = true;
      try {
        editor.render(editorElement);
      } catch (e) {
        schedule('afterRender', () => {
          throw e;
        });
      }
      this._isRenderingEditor = false;
    }
    this._setExpandoProperty(editor);
  },

  willDestroyElement() {
    this._super(...arguments);
    let editor = this.editor;
    editor.destroy();
  },

  postDidChange(editor) {
    let serializeVersion = this.serializeVersion;
    let updatedMobileDoc = editor.serialize(serializeVersion);
    this._localMobiledoc = updatedMobileDoc;

    if (this['on-change']) {
      this['on-change'](updatedMobileDoc);
    }
  },

  inputModeDidChange(editor) {
    let activeMarkupTagNames = this.getActiveMarkupTagNames(editor);
    let activeSectionTagNames = this.getActiveSectionTagNames(editor);
    let activeSectionAttributes = this.getActiveSectionAttributes(editor);

    let setEditorProps = () => {
      this.setProperties({
        activeMarkupTagNames,
        activeSectionTagNames,
        activeSectionAttributes,
      });
    };
    // Avoid updating this component's properties synchronously while
    // rendering the editor (after rendering the component) because it
    // causes Ember to display deprecation warnings
    if (this._isRenderingEditor) {
      schedule('afterRender', setEditorProps);
    } else {
      setEditorProps();
    }
  },

  getActiveMarkupTagNames(editor) {
    return arrayToMap(editor.activeMarkups.map((m) => m.tagName));
  },

  getActiveSectionTagNames(editor) {
    // editor.activeSections are leaf sections.
    // Map parent section tag names (e.g. 'p', 'ul', 'ol') so that list buttons
    // can be bound.
    let sectionParentTagNames = editor.activeSections.map((s) => {
      return s.isNested ? s.parent.tagName : s.tagName;
    });
    return arrayToMap(sectionParentTagNames);
  },

  getActiveSectionAttributes(editor) {
    const sectionAttributes = {};
    editor.activeSections.forEach((s) => {
      let attributes = s.isNested ? s.parent.attributes : s.attributes;
      Object.keys(attributes || {}).forEach((attrName) => {
        let camelizedAttrName = camelize(attrName.replace(/^data-md/, ''));
        let attrValue = attributes[attrName];
        sectionAttributes[camelizedAttrName] =
          sectionAttributes[camelizedAttrName] || [];
        if (!sectionAttributes[camelizedAttrName].includes(attrValue)) {
          sectionAttributes[camelizedAttrName].push(attrValue);
        }
      });
    });
    return sectionAttributes;
  },

  cursorDidChange(/*editor*/) {},

  willCreateEditor() {
    if (this[WILL_CREATE_EDITOR_ACTION]) {
      this[WILL_CREATE_EDITOR_ACTION]();
    }
  },

  didCreateEditor(editor) {
    if (this[DID_CREATE_EDITOR_ACTION]) {
      this[DID_CREATE_EDITOR_ACTION](editor);
    }
  },

  _addAtom(atomName, text, payload) {
    let editor = this.editor;
    editor.insertAtom(atomName, text, payload);
  },

  _addCard(cardName, payload, editMode = false) {
    let editor = this.editor;
    editor.insertCard(cardName, payload, editMode);
  },

  _setExpandoProperty(editor) {
    // Store a reference to the editor for the acceptance test helpers
    if (this.element && Ember.testing) {
      this.element[TESTING_EXPANDO_PROPERTY] = editor;
    }
  },
});
