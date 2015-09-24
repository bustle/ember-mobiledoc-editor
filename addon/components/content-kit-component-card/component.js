import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['content-kit-component-card'],
  classNameBindings: ['isEditing', 'cardTypeClass'],

  /* Actions */

  actions: {
    moveCard(direction) {
      let editor = this.get('editor');
      let section = this.get('cardSection');
      let method = direction === 'up' ? 'moveSectionUp' : 'moveSectionDown';
      editor.run(postEditor => postEditor[method](section));
    },

    edit() {
      this.saveOriginalData();
      this.set('isEditing', true);
    },

    save(data) {
      this.saveCard({ data });
      this.setProperties({
        isEditing: false,
        data
      });
    },

    cancel() {
      this.restoreOriginalData();
      this.set('isEditing', false);
    },

    remove() {
      this.removeCard();
    }

  },

  /* Properties */

  isEditing: true,
  editor: null,
  cardSection: null,

  /* Computed properties */

  cardTypeClass: Ember.computed('cardName', function() {
    return `is-${this.get('cardName')}`;
  }),

  /* private methods */

  // Keep a copy of the data before starting editing
  saveOriginalData() {
    this.set('originalData', Ember.copy(this.get('data')));
  },

  // Restore pre-edit data, if any
  restoreOriginalData() {
    let data = this.get('originalData');
    if (data) {
      this.saveCard({ data });
      this.set('data', data);
    }
  }
});
