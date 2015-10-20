import Ember from 'ember';
import layout from './template';

let { computed, Component } = Ember;
let { capitalize, camelize } = Ember.String;

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
  classNames: ['content-kit-editor'],

  placeholder: 'Write here...',
  spellcheck: true,
  autofocus: true,

  init() {
    this._super(...arguments);
    let mobiledoc = this.get('mobiledoc');
    if (!mobiledoc) {
      mobiledoc = {
        version: '0.2.0',
        sections: [[], []]
      };
      this.set('mobiledoc', mobiledoc);
    }
    this.set('componentCards', Ember.A([]));
    this.set('linkOffsets', null);
    this.set('activeMarkupTagNames', {});
    this.set('activeSectionTagNames', {});
    this._ignoreCursorDidChange = false;
  },

  actions: {
    toggleMarkup(markupTagName) {
      let editor = this.get('editor');
      editor.run(postEditor => postEditor.toggleMarkup(markupTagName));
    },

    toggleSectionTagName(newTagName) {
      const editor = this.get('editor');
      const sections = editor.activeSections;
      let hasSectionsOfTagName = false;

      editor.run(postEditor => {
        hasSectionsOfTagName = Ember.A(sections).any(
          s => s.tagName === newTagName);

        if (hasSectionsOfTagName) {
          sections.forEach(s => postEditor.resetSectionTagName(s));
        } else {
          sections.forEach(s => postEditor.changeSectionTagName(s, newTagName));
        }
        postEditor.scheduleAfterRender(() => {
          editor.selectSections(sections);
        });
      });
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
      let offsets = editor.cursor.offsets;
      let hasMarkup = editor.detectMarkupInRange(offsets, 'a');
      if (hasMarkup) {
        editor.run(postEditor => {
          postEditor.removeMarkupFromRange(offsets, hasMarkup);
        });
      } else {
        this._ignoreCursorDidChange = true;
        this.set('linkOffsets', offsets);
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

  editor: computed('mobiledoc', 'isEditingDisabled', function() {
    if (this._lastEditor) {
      this._lastEditor.destroy();
      this._lastEditor = null;
    }
    let mobiledoc = this.get('mobiledoc');
    let editor = new window.ContentKit.Editor({
      mobiledoc,
      cards: this.get('cards') || [],
      placeholder: this.get('placeholder'),
      autofocus: this.get('autofocus'),
      spellcheck: this.get('spellcheck'),
      cardOptions: {
        onAddComponentCard: (element, cardName, env, payload) => {
          let cardId = Ember.uuid();
          let destinationElementId = `content-kit-editor-card-${cardId}`;
          element.id = destinationElementId;

          // The data must be copied to avoid sharing the reference
          payload = Ember.copy(payload, true);

          let card = Ember.Object.create({
            destinationElementId,
            cardName,
            data: payload,
            callbacks: env,
            editor,
            section: env.section
          });
          Ember.run.schedule('afterRender', () => {
            this.get('componentCards').pushObject(card);
          });
          return card;
        },
        onRemoveComponentCard: (card) => {
          Ember.run.join(() => {
            this.get('componentCards').removeObject(card);
          });
        }
      }
    });
    editor.on('update', () => {
      let updatedMobileDoc = editor.serialize();
      this.sendAction('on-change', updatedMobileDoc);
    });
    editor.cursorDidChange(() => {
      if (this.isDestroyed) { return; }

      const markupTags = arrayToMap(editor.markupsInSelection, 'tagName');
      const sectionTags = arrayToMap(editor.activeSections, 'tagName');

      Ember.run(() => {
        this.set('activeMarkupTagNames', markupTags);
        this.set('activeSectionTagNames', sectionTags);
      });

      let isCursorOffEditor = !this.get('editor').cursor.offsets.head.section;
      if (!isCursorOffEditor && !this._ignoreCursorDidChange) {
        this.set('linkOffsets', null);
      } else {
        this._ignoreCursorDidChange = false;
      }
    });
    if (this.get('isEditingDisabled')) {
      editor.disableEditing();
    }
    this._lastEditor = editor;
    return editor;
  }),

  didRender() {
    let editor = this.get('editor');
    let editorElement = this.$('.content-kit-editor__editor')[0];
    if (this._renderedEditor !== editor) {
      this._renderedEditor = editor;
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
      postEditor.insertSectionBefore(editor.post.sections, card, section);
      if (section && section.isBlank) {
        postEditor.removeSection(section);
      }
    });
  }

});
