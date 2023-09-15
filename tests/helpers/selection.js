import { Promise as EmberPromise } from 'rsvp';
import { findAll } from '@ember/test-helpers';

function clearSelection() {
  window.getSelection().removeAllRanges();
}

let runLater = (cb) => window.requestAnimationFrame(cb);

export function selectRangeWithEditor(editor, range) {
  editor.selectRange(range);
  return new EmberPromise((resolve) => runLater(resolve));
}

export function selectRange(startNode, startOffset, endNode, endOffset) {
  clearSelection();

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  selection.addRange(range);

  return new EmberPromise((resolve) => runLater(resolve));
}

export function moveCursorTo(selector, containingText = undefined) {
  let candidates = findAll(selector);
  if (!candidates.length) {
    throw new Error(`could not find element from selector ${selector}`);
  }
  if (containingText) {
    candidates = candidates.filter((el) =>
      el.textContent.includes(containingText)
    );
  }
  if (!candidates.length) {
    throw new Error(
      `could not find element from selector ${selector} containing '#{containingText}'`
    );
  }

  if (candidates.length > 1) {
    throw new Error(`ambiguous selector ${selector}`);
  }
  let element = candidates[0];

  let selection = window.getSelection();
  selection.removeAllRanges();

  let node = element.firstChild;
  let range = document.createRange();
  range.selectNode(node);
  selection.addRange(range);

  return new EmberPromise((resolve) => runLater(resolve));
}
