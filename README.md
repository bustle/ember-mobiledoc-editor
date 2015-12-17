## ember-mobiledoc-editor

[![Build Status](https://travis-ci.org/bustlelabs/ember-mobiledoc-editor.svg)](https://travis-ci.org/bustlelabs/ember-mobiledoc-editor)

A Mobiledoc editor written using Ember.js UI components and
[Mobiledoc Kit](https://github.com/bustlelabs/mobiledoc-kit).

Additionally, ember-mobiledoc-editor supports the creation of
[Mobiledoc cards](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md)
as Ember components. This is a significant improvement for developer
ergonomics over using Mobiledoc cards directly.

### Installation

```
ember install ember-mobiledoc-editor
```

`ember-mobiledoc-editor` will install the `mobiledoc-kit` package as a
dependency and load its assets.

### Usage

This addon is primarily composed of components used building an editor
UI.

* [`{{mobiledoc-editor}}`](#mobiledoc-editor-editor)
* [`{{mobiledoc-section-button}}`](#mobiledoc-section-button)
* [`{{mobiledoc-markup-button}}`](#mobiledoc-markup-button)
* [`{{mobiledoc-link-button}}`](#mobiledoc-link-button)
* [`{{mobiledoc-toolbar}}`](#mobiledoc-toolbar)

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
* `spellcheck` boolean
* `autofocus` boolean
* `placeholder` string -- the placeholder text to display when the mobiledoc is blank
* `options` hash -- any properties in the `options` hash will be passed to the ContentKitEditor constructor


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
  selection.
* `toggleLink`, toggling the linking of a selection. The user will be prompted
   for a URL if required.
* `addCard`, passed a card name and payload will add that card at the end of
* `addCardInEditMode`, passed a card name and payload will add that card at the end of
  a post and render it in "edit" mode initially.
* `createListSection`, changing selected content into list items.

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
[CARDS.md](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md).

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
  });
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

  * `data`, the data payload for this card. *Note* the data is disconnected from the card's payload in the serialized mobiledoc. To update the mobiledoc payload, use the `saveCard` or `mutData` actions.
  * `editCard`, an action for toggling this card into edit mode (this action is a no-op if the card is already in edit mode)
  * `removeCard`, an action for removing this card (see the ["remove" Mobiledoc card action](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `saveCard`, an action accepting new data for the card payload, then saving
    that data and toggling this card into display mode can optionally be passed an extra `false` argument to avoid toggling to display mode (see the ["save Mobiledoc card action](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `cancelCard`, an action toggling this card to display mode without saving (this action is a no-op if the card is already in display mode) (see the ["cancel Mobiledoc card action](https://github.com/bustlelabs/mobiledoc-kit/blob/master/CARDS.md#available-hooks))
  * `cardName` the name of this card
  * `editor` A reference to the [mobiledoc-kit](https://github.com/bustlelabs/mobiledoc-kit)
  * `postModel` A reference to this card's model in the editor's abstract tree. This may be necessary to do programmatic editing (such as moving the card via the `postEditor#moveSection` API that Mobiledoc editor provides)

### Developing ember-mobiledoc-editor

To get started:

* `git clone` this repository
* `npm install`
* `bower install`

Run the development server:

* `ember server`
* Visit your app at http://localhost:4200.

Run tests:

* `ember test`
* `ember test --server`

Build to `dist/`:

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
