/* global Mobiledoc */
import Ember from 'ember';
import layout from './template';

let { computed, Component } = Ember;
let { capitalize, camelize } = Ember.String;

export const ADD_HOOK = 'addComponent';
export const REMOVE_HOOK = 'removeComponent';
const EDITOR_CARD_SUFFIX = '-editor';
const EMPTY_MOBILEDOC = {
  version: '0.2.0',
  sections: [[], []]
};

const MobiledocEditor = Mobiledoc.Editor;
const MobiledocRange  = Mobiledoc.Range;

function arrayToMap(array, propertyName) {
  let map = Object.create(null);
  array.forEach(item => {
    if (item[propertyName]) {
      item = `is${capitalize(camelize(item[propertyName]))}`;
      map[item] = true;
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

  options: {},

  // merge in named options with the `options` property data bag
  editorOptions: computed(function() {
    let options = this.get('options');

    return Ember.merge({
      placeholder: this.get('placeholder'),
      spellcheck:  this.get('spellcheck'),
      autofocus:   this.get('autofocus'),
      cards:       this.get('cards') || [],
      atoms:       this.get('atoms') || []
    }, options);
  }),

  init() {
    this._super(...arguments);
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      mobiledoc = EMPTY_MOBILEDOC;
      this.set('mobiledoc', mobiledoc);
    }
    this.set('componentCards', Ember.A([]));
    this.set('linkOffsets', null);
    this.set('activeMarkupTagNames', {});
    this.set('activeSectionTagNames', {});
    this._ignoreCursorDidChange = false;
    this._startedRunLoop  = false;
  },

  actions: {
    toggleMarkup(markupTagName) {
      let editor = this.get('editor');
      editor.run(postEditor => postEditor.toggleMarkup(markupTagName));
    },

    toggleSection(newTagName) {
      let editor = this.get('editor');
      editor.run(postEditor => postEditor.toggleSection(newTagName));
    },

    // Deprecated
    toggleSectionTagName(newTagName) {
      Ember.warn('toggleSectionTagName is deprecated. Use toggleSection instead',
                 false,
                 {id: 'mobiledoc-editor-toggleSectionTagName'});
      this.send('toggleSection', newTagName);
    },

    createListSection(tagName) {
      const editor = this.get('editor');
      const section = editor.activeSections[0];
      if (!section) { return; }

      // can only convert a section *into* an li, do nothing to
      // sections that are already li sections
      if (section.tagName === 'li') { return; }

      const listItem = editor.run(postEditor => {
        const { builder } = postEditor;
        const listItem = builder.createListItem();
        const listSection = builder.createListSection(tagName, [listItem]);
        section.markers.forEach(m => listItem.markers.append(m.clone()));
        postEditor.replaceSection(section, listSection);
        return listItem;
      });

      editor.selectSections([listItem]);
    },

    addCard(cardName, data={}) {
      this._addCard(cardName, data);
    },

    addCardInEditMode(cardName, data={}) {
      let editMode = true;
      this._addCard(cardName, data, editMode);
    },

    toggleLink() {
      let editor = this.get('editor');
      let range = editor.range;
      let headSection = range.head.section,
          tailSection = range.tail.section;
      if (!(headSection.isMarkerable && tailSection.isMarkerable)) {
        return;
      }
      let hasMarkup = editor.detectMarkupInRange(range, 'a');
      if (hasMarkup) {
        editor.run(postEditor => {
          postEditor.removeMarkupFromRange(range, hasMarkup);
        });
      } else {
        this._ignoreCursorDidChange = true;
        this.set('linkOffsets', range);
      }
    },

    completeLink(href) {
      let offsets = this.get('linkOffsets');
      this.set('linkOffsets', null);
      let editor = this.get('editor');
      editor.run(postEditor => {
        let markup = postEditor.builder.createMarkup('a', {
          href: href
        });
        postEditor.addMarkupToRange(offsets, markup);
      });
    },

    cancelLink() {
      this.set('linkOffsets', null);
    }
  },

  editingContexts: computed(function() {
    return Ember.A([]);
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

    // Teardown any old editor that might be around.
    let editor = this.get('editor');
    if (editor) {
      editor.destroy();
    }

    // Create a new editor.
    let editorOptions = this.get('editorOptions');
    editorOptions.mobiledoc = mobiledoc;
    editorOptions.cardOptions = {
      [ADD_HOOK]: ({env, options, payload}, isEditing=false) => {
        let cardId = Ember.uuid();
        let cardName = env.name;
        if (isEditing) {
          cardName = cardName + EDITOR_CARD_SUFFIX;
        }
        let destinationElementId = `mobiledoc-editor-card-${cardId}`;
        let element = document.createElement('div');
        element.id = destinationElementId;

        // The data must be copied to avoid sharing the reference
        payload = Ember.copy(payload, true);

        let card = Ember.Object.create({
          destinationElementId,
          cardName,
          data: payload,
          callbacks: env,
          editor,
          postModel: env.postModel
        });
        Ember.run.schedule('afterRender', () => {
          this.get('componentCards').pushObject(card);
        });
        return { card, element };
      },
      [REMOVE_HOOK]: (card) => {
        this.get('componentCards').removeObject(card);
      }
    };
    editor = new MobiledocEditor(editorOptions);
    editor.willRender(() => {
      // The editor's render/rerender will happen after this `editor.willRender`,
      // so we explicitly start a runloop here if there is none, so that the
      // add/remove card hooks happen inside a runloop.
      // When pasting text that gets turned into a card, for example,
      // the add card hook would run outside the runloop if we didn't begin a new
      // one now.
      if (!Ember.run.currentRunLoop) {
        this._startedRunLoop = true;
        Ember.run.begin();
      }
    });
    editor.didRender(() => {
      // If we had explicitly started a run loop in `editor.willRender`,
      // we must explicitly end it here.
      if (this._startedRunLoop) {
        this._startedRunLoop = false;
        Ember.run.end();
      }
    });
    editor.on('update', () => {
      Ember.run.join(() => {
        let updatedMobileDoc = editor.serialize();
        this._localMobiledoc = updatedMobileDoc;
        this.sendAction('on-change', updatedMobileDoc);
      });
    });
    editor.cursorDidChange(() => {
      if (this.isDestroyed) { return; }

      Ember.run.join(() => {
        const markupTags = arrayToMap(editor.markupsInSelection, 'tagName');
        const sectionTags = arrayToMap(editor.activeSections, 'tagName');

        this.set('activeMarkupTagNames', markupTags);
        this.set('activeSectionTagNames', sectionTags);

        let isCursorOffEditor = !this.get('editor').cursor.offsets.head.section;
        if (!isCursorOffEditor && !this._ignoreCursorDidChange) {
          this.set('linkOffsets', null);
        } else {
          this._ignoreCursorDidChange = false;
        }
      });
    });
    if (this.get('isEditingDisabled')) {
      editor.disableEditing();
    }
    this.set('editor', editor);
  },

  didRender() {
    let editor = this.get('editor');
    if (!editor.hasRendered) {
      let editorElement = this.$('.mobiledoc-editor__editor')[0];
      editor.render(editorElement);
    }
  },

  willDestroyElement() {
    let editor = this.get('editor');
    editor.destroy();
  },

  _addCard(cardName, data, editMode=false) {
    let editor = this.get('editor');
    let section = editor.activeSection;
    editor.run(postEditor => {
      let card = editor.builder.createCardSection(cardName, data);
      if (editMode) {
        editor.editCard(card);
      }
      let nextSection = section && section.next;
      postEditor.insertSectionBefore(editor.post.sections, card, nextSection);
      if (section && section.isBlank) {
        postEditor.removeSection(section);
      }

      // Explicitly put the cursor at the end of the card
      // This prevents problems with the editor element being out-of-focus
      // but the window's selection still in the editor element.
      // See https://github.com/bustlelabs/mobiledoc-kit/issues/286
      let range = new MobiledocRange(card.tailPosition());
      postEditor.setRange(range);
    });
  }
});
