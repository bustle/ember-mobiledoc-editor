import { Promise as EmberPromise } from 'rsvp';
import { TESTING_EXPANDO_PROPERTY } from 'ember-mobiledoc-editor/components/mobiledoc-editor/component';

function findEditor(element) {
  do {
    if (element[TESTING_EXPANDO_PROPERTY]) {
      return element[TESTING_EXPANDO_PROPERTY];
    }
    element = element.parentNode;
  } while (element);

  throw new Error('Unable to find ember-mobiledoc-editor from element');
}

export function insertText(element, text) {
  let editor = findEditor(element);
  return new EmberPromise((resolve) => {
    let { post } = editor;
    editor.run((postEditor) => {
      if (editor.post.isBlank) {
        let section = postEditor.builder.createMarkupSection('p');
        postEditor.insertSectionBefore(post.sections, section);
      }
      postEditor.insertText(post.tailPosition(), text);
    });

    requestAnimationFrame(resolve);
  });
}

export function run(element, callback) {
  let editor = findEditor(element);
  editor.run(callback);

  return new EmberPromise((resolve) => {
    requestAnimationFrame(resolve);
  });
}
