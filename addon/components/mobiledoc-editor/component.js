import { schedule, run, begin, end, join } from '@ember/runloop';
import { copy } from '@ember/object/internals';
import { A } from '@ember/array';
import { camelize, capitalize } from '@ember/string';
import EmberObject, { computed } from '@ember/object';
import Component from '@ember/component';
import Ember from 'ember';
import layout from './template';
import Editor from 'mobiledoc-kit/editor/editor';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';
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
  sections: []
};

export const DEFAULT_SECTION_ATTRIBUTES_CONFIG = {
  'text-align': {
    values: ['left', 'center', 'right'],
    defaultValue: 'left'
  }
}

function arrayToMap(array) {
  let map = Object.create(null);
  array.forEach(key => {
    if (key) { // skip undefined/falsy key values
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
  editorOptions: computed(function() {
    let options = this.get('options') || {};

    return assign({
      placeholder:      this.get('placeholder'),
      spellcheck:       this.get('spellcheck'),
      autofocus:        this.get('autofocus'),
      showLinkTooltips: this.get('showLinkTooltips'),
      cardOptions:      this.get('cardOptions'),
      cards:            this.get('cards') || [],
      atoms:            this.get('atoms') || []
    }, options);
  }),

  init() {
    this._super(...arguments);
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      mobiledoc = EMPTY_MOBILEDOC;
      this.set('mobiledoc', mobiledoc);
    }
    let sectionAttributesConfig = this.get('sectionAttributesConfig');
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
    this._startedRunLoop  = false;
  },

  isDefaultAttributeValue(attributeName, attributeValue) {
    let defaultValue = this.sectionAttributesConfig[attributeName].defaultValue;
    if (!defaultValue) {
      throw new Error(`Default value is not configured for attribute '${attributeName}'`);
    }
    return attributeValue === defaultValue;
  },

  actions: {
    toggleMarkup(markupTagName) {
      let editor = this.get('editor');
      editor.toggleMarkup(markupTagName);
    },

    toggleSection(sectionTagName) {
      let editor = this.get('editor');
      editor.toggleSection(sectionTagName);
    },

    setAttribute(attributeName, attributeValue) {
      let editor = this.get('editor');
      if (this.isDefaultAttributeValue(attributeName, attributeValue)) {
        editor.removeAttribute(attributeName);
      } else {
        editor.setAttribute(attributeName, attributeValue);
      }
    },

    removeAttribute(attributeName) {
      let editor = this.get('editor');
      editor.setAttribute(attributeName);
    },

    addCard(cardName, payload={}) {
      this._addCard(cardName, payload);
    },

    addAtom(atomName, text='', payload={}) {
      this._addAtom(atomName, text, payload);
    },

    addCardInEditMode(cardName, payload={}) {
      let editMode = true;
      this._addCard(cardName, payload, editMode);
    },

    toggleLink() {
      let editor = this.get('editor');
      if (!editor.hasCursor()) {
        return;
      }
      if (editor.hasActiveMarkup('a')) {
        editor.toggleMarkup('a');
      } else {
        this.set('linkOffsets', editor.range);
      }
    },

    completeLink(href) {
      let offsets = this.get('linkOffsets');
      this.set('linkOffsets', null);
      let editor = this.get('editor');
      editor.selectRange(offsets);
      editor.toggleMarkup('a', {href});
    },

    cancelLink() {
      this.set('linkOffsets', null);
    },

    isDefaultAttributeValue() {
      return this.isDefaultAttributeValue(...arguments);
    }
  },

  editingContexts: computed(function() {
    return A([]);
  }),

  willRender() {
    // Use a default mobiledoc. If there are no changes, then return
    // early.
    let mobiledoc = this.get('mobiledoc') || EMPTY_MOBILEDOC;
    if (
      (
        (this._localMobiledoc && this._localMobiledoc === mobiledoc) ||
        (this._upstreamMobiledoc && this._upstreamMobiledoc === mobiledoc)
      ) && (this._lastIsEditingDisabled === this.get('isEditingDisabled'))
    ) {
      // No change to mobiledoc, no need to recreate the editor
      return;
    }
    this._lastIsEditingDisabled = this.get('isEditingDisabled');
    this._upstreamMobiledoc = mobiledoc;
    this._localMobiledoc = null;

    this.willCreateEditor();

    // Teardown any old editor that might be around.
    let editor = this.get('editor');
    if (editor) {
      editor.destroy();
    }

    // Create a new editor.
    let editorOptions = this.get('editorOptions');
    editorOptions.mobiledoc = mobiledoc;
    let componentHooks = {
      [ADD_CARD_HOOK]: ({env, options, payload}, isEditing=false) => {
        let cardId = Ember.uuid();
        let cardName = env.name;
        if (isEditing) {
          cardName = cardName + EDITOR_CARD_SUFFIX;
        }
        let destinationElementId = `mobiledoc-editor-card-${cardId}`;
        let element = document.createElement('div');
        element.id = destinationElementId;

        // The data must be copied to avoid sharing the reference
        payload = copy(payload, true);

        let card = EmberObject.create({
          destinationElementId,
          cardName,
          payload,
          env,
          options,
          editor,
          postModel: env.postModel
        });
        schedule('afterRender', () => {
          this.get('componentCards').pushObject(card);
        });
        return { card, element };
      },
      [ADD_ATOM_HOOK]: ({env, options, payload, value}) => {
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
          postModel: env.postModel
        });
        schedule('afterRender', () => {
          this.get('componentAtoms').pushObject(atom);
        });
        return { atom, element };
      },
      [REMOVE_CARD_HOOK]: (card) => {
        this.get('componentCards').removeObject(card);
      },
      [REMOVE_ATOM_HOOK]: (atom) => {
        this.get('componentAtoms').removeObject(atom);
      }
    };
    if (editorOptions.cardOptions) {
      editorOptions.cardOptions = assign(editorOptions.cardOptions, componentHooks);
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
      if (!run.currentRunLoop) {
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
      if (this.isDestroyed) { return; }
      join(() => {
        this.inputModeDidChange(editor);
      });
    });
    editor.cursorDidChange(() => {
      if (this.isDestroyed) { return; }
      join(() => {
        this.cursorDidChange(editor);
      });
    });
    if (this.get('isEditingDisabled')) {
      editor.disableEditing();
    }
    this.set('editor', editor);
    this.didCreateEditor(editor);
  },

  didRender() {
    let editor = this.get('editor');
    if (!editor.hasRendered) {
      let editorElement = this.$('.mobiledoc-editor__editor')[0];
      this._isRenderingEditor = true;
      try {
        editor.render(editorElement);
      } catch(e) {
        run.schedule('afterRender', () => { throw e; });
      }
      this._isRenderingEditor = false;
    }
    this._setExpandoProperty(editor);
  },

  willDestroyElement() {
    let editor = this.get('editor');
    editor.destroy();
  },

  postDidChange(editor) {
    let serializeVersion = this.get('serializeVersion');
    let updatedMobileDoc = editor.serialize(serializeVersion);
    this._localMobiledoc = updatedMobileDoc;
    this.sendAction('on-change', updatedMobileDoc); // eslint-disable-line ember/closure-actions
  },

  inputModeDidChange(editor) {
    let activeMarkupTagNames = this.getActiveMarkupTagNames(editor);
    let activeSectionTagNames = this.getActiveSectionTagNames(editor);
    let activeSectionAttributes = this.getActiveSectionAttributes(editor);

    let setEditorProps = () => {
      this.setProperties({
        activeMarkupTagNames,
        activeSectionTagNames,
        activeSectionAttributes
      });
    }
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
    return arrayToMap(editor.activeMarkups.map(m => m.tagName));
  },

  getActiveSectionTagNames(editor) {
    // editor.activeSections are leaf sections.
    // Map parent section tag names (e.g. 'p', 'ul', 'ol') so that list buttons
    // can be bound.
    let sectionParentTagNames = editor.activeSections.map(s => {
      return s.isNested ? s.parent.tagName : s.tagName;
    });
    return arrayToMap(sectionParentTagNames);
  },

  getActiveSectionAttributes(editor) {
    const sectionAttributes = {};
    editor.activeSections.forEach(s => {
      let attributes = s.isNested ? s.parent.attributes : s.attributes;
      Object.keys(attributes || {}).forEach(attrName => {
        let camelizedAttrName = camelize(attrName.replace(/^data-md/, ''));
        let attrValue = attributes[attrName];
        sectionAttributes[camelizedAttrName] = sectionAttributes[camelizedAttrName] || [];
        if (!sectionAttributes[camelizedAttrName].includes(attrValue)) {
          sectionAttributes[camelizedAttrName].push(attrValue);
        }
      });
    });
    return sectionAttributes;
  },

  cursorDidChange(/*editor*/) {

  },

  willCreateEditor() {
    this.sendAction(WILL_CREATE_EDITOR_ACTION); // eslint-disable-line ember/closure-actions
  },

  didCreateEditor(editor) {
    this.sendAction(DID_CREATE_EDITOR_ACTION, editor); // eslint-disable-line ember/closure-actions
  },

  _addAtom(atomName, text, payload) {
    let editor = this.get('editor');
    editor.insertAtom(atomName, text, payload);
  },

  _addCard(cardName, payload, editMode=false) {
    let editor = this.get('editor');
    editor.insertCard(cardName, payload, editMode);
  },

  _setExpandoProperty(editor) {
    // Store a reference to the editor for the acceptance test helpers
    if (this.element && Ember.testing) {
      this.element[TESTING_EXPANDO_PROPERTY] = editor;
    }
  }
});
