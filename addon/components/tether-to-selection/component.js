import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import Component from '@ember/component';
import { computed } from '@ember/object'
import { htmlSafe } from '@ember/string';
import layout from './template';

const DIALOG_MARGIN = 16;

function isOutOfBounds (rect, boundingRect) {
  let result = {
    left: rect.left < boundingRect.left,
    right: rect.right > boundingRect.right,
    top: rect.top < boundingRect.top,
    bottom: rect.bottom > boundingRect.bottom
  };
  return (result.left || result.right || result.top || result.bottom) ? result : false;
}

export default Component.extend({
  layout,
  classNames: ['mobiledoc-selection-tether'],
  attributeBindings: ['style'],
  dialogAnchor: null,

  style: computed('dialogAnchor', function () {
    let dialogAnchor = this.get('dialogAnchor')
    return htmlSafe(`position: fixed; left: ${dialogAnchor.left}px; bottom: ${dialogAnchor.bottom}px;`)
  }),

  didReceiveAttrs() {
    let selection = window.getSelection();
    let range = selection && selection.rangeCount && selection.getRangeAt(0);

    assert('Should not render {{#tether-to-selection}} when there is no selection', !!range);

    if (range) {
      let rangeRect = range.getBoundingClientRect();
      // Fallback on the range’s parent container if no anchor position was found:
      if (!rangeRect.left && !rangeRect.top) {
        rangeRect = range.startContainer.getBoundingClientRect();
      }

      let dialogAnchor = { left: rangeRect.left, bottom: window.innerHeight - rangeRect.top }
      this.set('dialogAnchor', dialogAnchor);
    }
  },

  didInsertElement() {
    schedule('afterRender', () => {
      let boundingRect = { left: DIALOG_MARGIN, right: window.innerWidth - DIALOG_MARGIN, top: DIALOG_MARGIN, bottom: window.innerHeight - DIALOG_MARGIN };
      let dialogRect = this.element.getBoundingClientRect();
      let isOffscreen = isOutOfBounds(dialogRect, boundingRect);
      if (isOffscreen) {
        let dialogAnchor = this.get('dialogAnchor');
        this.element.setAttribute('style', `
          position: 'fixed';
          left: ${isOffscreen.left ? DIALOG_MARGIN : (isOffscreen.right ? 'auto' : dialogAnchor.left)};
          right: ${isOffscreen.right ? DIALOG_MARGIN : 'auto'};
          top: ${isOffscreen.top ? DIALOG_MARGIN : 'auto'};
          bottom: ${isOffscreen.bottom ? DIALOG_MARGIN : (isOffscreen.top ? 'auto' : dialogAnchor.bottom)};
        `);
      }
    });
  }
});
