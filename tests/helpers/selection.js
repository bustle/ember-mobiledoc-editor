import { Promise as EmberPromise } from 'rsvp';

function clearSelection() {
  window.getSelection().removeAllRanges();
}

let runLater = (cb) => window.requestAnimationFrame(cb);

export function selectRangeWithEditor(editor, range) {
  editor.selectRange(range);
  return new EmberPromise(resolve => runLater(resolve));
}

export function selectRange(startNode, startOffset, endNode, endOffset) {
  clearSelection();

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  selection.addRange(range);

  return new EmberPromise(resolve => runLater(resolve));
}

export function moveCursorTo(context, selector) {
  let element = context.$(selector);
  if (!element.length) {
    throw new Error(`could not find element from selector ${selector}`);
  } else if (element.length > 1) {
    throw new Error(`ambiguous selector ${selector}`);
  }

  let selection = window.getSelection();
  selection.removeAllRanges();

  let node = element[0].firstChild;
  let range = document.createRange();
  range.selectNode(node);
  selection.addRange(range);

  return new EmberPromise(resolve => runLater(resolve));
}
