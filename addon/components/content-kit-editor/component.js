import Ember from 'ember';
import layout from './template';

let { computed, Component } = Ember;

export default Component.extend({
  layout,
  tagName: 'article',
  classNames: ['content-kit-editor'],

  activeMarkupTagNames: computed(function() {
    return Ember.A([]);
  }),
  activeSectionTagNames: computed(function() {
    return Ember.A([]);
  }),

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

    addCard(cardName, data) {
      let editor = this.get('editor');
      let card = editor.builder.createCardSection(cardName, { data });
      editor.run(postEditor => postEditor.insertSectionAtEnd(card));
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
      cardOptions: {
        onAddComponentCard: (element, cardName, env, payload) => {
          let cardId = Ember.uuid();
          let destinationElementId = `content-kit-editor-card-${cardId}`;
          element.id = destinationElementId;

          // The data must be copied to avoid sharing the reference
          // to the `defaultListicleItem` between new listicle items.
          let data = Ember.copy(payload.data, true);

          let card = Ember.Object.create({
            destinationElementId,
            cardName,
            data,
            callbacks: env,
            editor,
            section: env.section
          });
          return this.get('componentCards').pushObject(card);
        },
        onRemoveComponentCard: (card) => {
          this.get('componentCards').removeObject(card);
        }
      }
    });
    editor.on('update', () => {
      let updatedMobileDoc = editor.serialize();
      this.sendAction('on-change', updatedMobileDoc);
    });
    editor.cursorDidChange(() => {
      if (this.isDestroyed) { return; }

      const markupTags = Ember.A(editor.markupsInSelection).mapBy('tagName');
      const sectionTags = Ember.A(editor.activeSections).mapBy('tagName');

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
  }

});
