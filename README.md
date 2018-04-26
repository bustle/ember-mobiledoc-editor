## ember-mobiledoc-editor

[![npm version](https://badge.fury.io/js/ember-mobiledoc-editor.svg)](https://badge.fury.io/js/ember-mobiledoc-editor)
[![Build Status](https://travis-ci.org/bustle/ember-mobiledoc-editor.svg)](https://travis-ci.org/bustle/ember-mobiledoc-editor)
[![Ember Observer Score](https://emberobserver.com/badges/ember-mobiledoc-editor.svg)](https://emberobserver.com/addons/ember-mobiledoc-editor)

A Mobiledoc editor written using Ember.js UI components and
[Mobiledoc Kit](https://github.com/bustle/mobiledoc-kit).

Additionally, ember-mobiledoc-editor supports the creation of
[Mobiledoc cards](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md)
as Ember components. This is a significant improvement for developer
ergonomics over using Mobiledoc cards directly.

### Installation

```
ember install ember-mobiledoc-editor
```

`ember-mobiledoc-editor` will install the `mobiledoc-kit` package as a
dependency and load its assets.

### Usage

This addon is primarily composed of components used for building an editor
UI.

* [`{{mobiledoc-editor}}`](#mobiledoc-editor)
* [`{{mobiledoc-section-button}}`](#mobiledoc-section-button)
* [`{{mobiledoc-markup-button}}`](#mobiledoc-markup-button)
* [`{{mobiledoc-link-button}}`](#mobiledoc-link-button)
* [`{{mobiledoc-toolbar}}`](#mobiledoc-toolbar)

### Configuration

If you don't want default styles from mobiledoc-kit being added to your
vendor.css file, add the following configuration to your
`ember-cli-build.js` file:

```js
  let app = new EmberApp(defaults, {
    'ember-mobiledoc-editor': {
      skipStyleImport: true
    }
  }
```

#### `{{mobiledoc-editor}}`

This component is the main entrance point for a mobiledoc editor instance
in your Ember app. Used in the most basic form it will render a dummy editor
with no toolbar. For example this usage:

```hbs
{{mobiledoc-editor}}
```

Will render a blank Mobiledoc into the following DOM:

```hbs
<article class="mobiledoc-editor">
  <div class="mobiledoc-editor__editor-wrapper">
    <div class="mobiledoc-editor__editor"></div>
  </div>
</article>
```

The components accepts these arguments:

* `mobiledoc`, a Mobiledoc to be edited
* `cards`, an array of available cards for use by the editor. Jump to
  the section on [Component-based cards](#component-based-cards) for more detail on how
  to use cards with Ember components.
* `atoms`, an array of available atoms for use by the editor. Jump to
  the section on [Component-based atoms](#component-based-atoms) for more detail on how
  to use atoms with Ember components.
* `spellcheck` boolean
* `autofocus` boolean
* `placeholder` string -- the placeholder text to display when the mobiledoc is blank
* `options` hash -- any properties in the `options` hash will be passed to the MobiledocKitEditor constructor
* `serializeVersion` string -- The mobiledoc version to serialize to when firing the on-change action. Default: 0.3.0
* `on-change` -- Accepts an action that the component will send every time the mobiledoc is updated
* `will-create-editor` -- Accepts an action that will be sent when the instance of the MobiledocKitEditor is about to be created
  This action may be fired more than once if the component's `mobiledoc` property is set to a new value.
* `did-create-editor` -- Accepts an action that will be sent after the instance of the MobiledocKitEditor is created.
  The action is passed the created editor instance.
  This action may be fired more than once if the component's `mobiledoc` property is set to a new value.

For example, the following index route and template would log before and
after creating the MobiledocKitEditor, and every time the user modified the
mobiledoc (by typing some text, e.g.).

```javascript
// routes/index.js

export default Ember.Route.extend({
 ...,
 actions: {
   mobiledocWasUpdated(updatedMobiledoc) {
     console.log('New mobiledoc:',updatedMobiledoc);
     // note that this action will be fired for every changed character,
     // so you may want to debounce API calls if you are using it for
     // an "autosave" feature.
   },
   willCreateEditor() {
     console.log('about to create the editor');
   },
   didCreateEditor(editor) {
     console.log('created the editor:', editor);
   }
 }
});
```

```hbs
{{! index.hbs }}

{{mobiledoc-editor
    on-change=(action 'mobiledocWasUpdated')
    will-create-editor=(action 'willCreateEditor')
    did-create-editor=(action 'didCreateEditor')
}}
```

Of course often you want to provide a user interface to bold text, create
headlines, or otherwise reflect the state of the editor.

Called with a block, the `editor` param is yielded.

```hbs
{{#mobiledoc-editor mobiledoc=someDoc as |editor|}}
{{/mobiledoc-editor}}
```

`editor` has the following properties, useful to inspect the current
state of the editor:

* `editor`, the Mobiledoc kit editor instance itself
* `activeSectionTagNames`, an object with true values for section tag names
  in the current selection. For example `activeSectionTagNames.isH1`.
* `activeMarkupTagNames`, an object with true values for markup tag names in
  the current selection. For example `activeMarkupTagNames.isStrong`

Additionally `editor` provides the following actions:

* `toggleMarkup`, toggling the passed markup tag name in the current selection.
* `toggleSection`, toggling the passed section tag name in the current
  selection. Pass a string tagName as an argument. Possible valid values: "h1", "h2",
   "p", "blockquote". To toggle to-from a list section pass "ul" or "ol".
* `toggleLink`, toggling the linking of a selection. The user will be prompted
   for a URL if required.
* `addCard`, passed a card name and payload will add that card at the end of the post.
* `addCardInEditMode`, passed a card name and payload will add that card at the end of
  a post and render it in "edit" mode initially.
* `addAtom`, passed an atomName, text, and payload, will add that atom at the cursor position.

The `editor` object is often used indirectly by passing it to other
components. For example:

```hbs
{{#mobiledoc-editor as |editor|}}
  <div class="toolbar">
    {{mobiledoc-markup-button editor=editor for="strong"}}
    {{mobiledoc-link-button editor=editor}}
  </div>
{{/mobiledoc-editor}}
```

#### `{{mobiledoc-section-button}}`

Requires two properties:

* `for`, the name of the tag
* `editor`, the `editor` instance from `mobiledoc-editor`

And accepts one optional property:

* `title`, added as the `title` attribute on the `button` element

Creates a `<button>` element that has a class of `active` when the provided
section tag is used in the current selection. For example:

```hbs
{{mobiledoc-section-button editor=editor for="h2"}}
```

Alternatively, custom text for the HTML of the button can be yielded:

```hbs
{{#mobiledoc-section-button editor=editor for="h2"}}
  Headline 2
{{/mobiledoc-section-button}}
```

When clicked, the section tag name will be toggled.

#### `{{mobiledoc-markup-button}}`

Requires two properties:

* `for`, the name of the tag
* `editor`, the `editor` instance from `mobiledoc-editor`

And accepts one optional property:

* `title`, added as the `title` attribute on the `button` element

Creates a `<button>` element that has a class of `active` when the provided
markup tag is used in the current selection. For example:

```hbs
{{mobiledoc-markup-button editor=editor for="em"}}
```

Alternatively, custom text for the HTML of the button can be yielded:

```hbs
{{#mobiledoc-markup-button editor=editor for="em"}}
  Italicize
{{/mobiledoc-markup-button}}
```

When clicked, the markup tag name will be toggled.

#### `{{mobiledoc-link-button}}`

Requires one property:

* `editor`, the `editor` instance from `mobiledoc-editor`

And accepts one optional property:

* `title`, added as the `title` attribute on the `button` element

Creates a `<button>` element that has a class of `active` when the an `a`
tag is used in the current selection. For example:

```hbs
{{mobiledoc-link-button editor=editor}}
```

Custom text for the HTML of the button can be yielded:

```hbs
{{#mobiledoc-link-button editor=editor}}
  Toggle Link
{{/mobiledoc-link-button}}
```

When clicked, the presence of a link will be toggled. The user will be prompted
for a URL if required.

#### `{{mobiledoc-toolbar}}`

Requires one property:

* `editor`, the `editor` instance from `mobiledoc-editor`

This component creates a full-featured toolbar for the Mobiledoc editor.
For example:

```hbs
{{#mobiledoc-editor as |editor|}}
  {{mobiledoc-toolbar editor=editor}}
{{/mobiledoc-editor}}
```

### Component-based Cards

Mobiledoc supports "cards", blocks of rich content that are embedded into a
post. For more details on the API for authoring cards in vanilla JavaScript, see
[CARDS.md](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md).

ember-mobiledoc-editor comes with a handle helper for using Ember
components as the display and edit modes of a card. Create a list of cards
using the `createComponentCard` helper:

```js
import Ember from 'ember';
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';

export default Ember.Component.extend({
  cards: Ember.computed(function() {
    return [
      createComponentCard('demo-card')
    ];
  })
});
```

And pass that list into the `{{mobiledoc-editor}}` component:

```hbs
{{mobiledoc-editor cards=cards}}
```

When added to the post (or loaded from a passed-in Mobiledoc), these components
will be used:

* For display, the `demo-card` component will be called
* For edit, the `demo-card-editor` component will be called

The component will be provided with the following `attrs`:

  * `payload`, the payload for this card. *Note* the payload object is disconnected from the card's payload in the serialized mobiledoc. To update the mobiledoc payload, use the `saveCard` action.
  * `editCard`, an action for toggling this card into edit mode (this action is a no-op if the card is already in edit mode)
  * `removeCard`, an action for removing this card (see the ["remove" Mobiledoc card action](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `saveCard`, an action accepting new payload for the card, then saving
    that payload and toggling this card into display mode can optionally be passed an extra `false` argument to avoid toggling to display mode (see the ["save Mobiledoc card action](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `cancelCard`, an action toggling this card to display mode without saving (this action is a no-op if the card is already in display mode) (see the ["cancel Mobiledoc card action](https://github.com/bustle/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `cardName` the name of this card
  * `editor` A reference to the [mobiledoc-kit](https://github.com/bustle/mobiledoc-kit)
  * `postModel` A reference to this card's model in the editor's abstract tree. This may be necessary to do programmatic editing (such as moving the card via the `postEditor#moveSection` API that Mobiledoc editor provides)


### Component-based Atoms

Mobiledoc supports "atoms", inline sections of rich content that are embedded into a line of text in your post.
For more details on the API for authoring atoms in vanilla JavaScript, see
[ATOMS.md](https://github.com/bustle/mobiledoc-kit/blob/master/ATOMS.md).

ember-mobiledoc-editor comes with a handle helper for using Ember
components as an atom. Create a list of atoms using the `createComponentAtom` helper:

```js
import Ember from 'ember';
import createComponentAtom from 'ember-mobiledoc-editor/utils/create-component-atom';

export default Ember.Component.extend({
  atoms: Ember.computed(function() {
    return [
      createComponentAtom('demo-atom')
    ];
  })
});
```

And pass that list into the `{{mobiledoc-editor}}` component:

```hbs
{{mobiledoc-editor atoms=atoms}}
```

### Editor Lifecycle Hooks

Currently editor lifecycle hooks are available by available by extending the mobiledoc-editor component.

```js
import Component from 'ember-mobiledoc-editor/components/mobiledoc-editor/component';

export default Component.extend({
  cursorDidChange(editor) {
    this._super(...arguments);
    // custom event handling goes here
  }
});
```

The following lifecycle hooks are available:
* `willRender`
* `didRender`
* `postDidChange`
* `inputModeDidChange`
* `cursorDidChange`

### Test Helpers

ember-mobiledoc-editor exposes two test helpers for use in your acceptance tests:
  * `insertText(editorElement, text)` -- inserts text into the editor (at the end)
  * `run(editorElement, callback)` -- equivalent to [`editor.run`](http://bustle.github.io/mobiledoc-kit/demo/docs/Editor.html#run), it calls the callback with the `postEditor`

Example usage:
```javascript
// acceptance test
import { insertText, run } from '../../helpers/ember-mobiledoc-editor';

test('visit /', function(assert) {
  visit('/');
  andThen(() => {
    let editorEl = find('.mobiledoc-editor__editor')[0];
    return insertText(editorEl, 'here is some text');
    /* Or:
      return run(editorEl, (postEditor) => ...);
    */
  });
  andThen(() => {
    // assert text inserted, etc.
  });
});
```

### Developing ember-mobiledoc-editor

Releasing a new version:

* Use `np` (`npm install -g np`)
* `np <version>` # e.g. `np 0.6.0`
* (np can get stuck when ember-try runs tests because it doesn't know which test suites are allowed to fail. If necessary, use `np --yolo` (see `np --help`))
* `git push origin --tags`

To get started:

* `git clone` this repository
* `yarn install`

Run the development server:

* `ember server`
* Visit your app at http://localhost:4200.

Run tests:

* `ember test`
* `ember test --server`

Build to `dist/`:

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
