## ember-content-kit

[![Build Status](https://travis-ci.org/bustlelabs/ember-content-kit.svg)](https://travis-ci.org/bustlelabs/ember-content-kit)

An Ember.js addon that can be used to build UIs around the 
[Content-Kit](https://github.com/bustlelabs/content-kit-editor) editor.

Additionally, ember-content-kit supports the creation of
[Mobiledoc cards](https://github.com/bustlelabs/content-kit-editor/blob/master/CARDS.md)
as Ember components. This is a significant improvement for developer
ergonomics over vanilla JS.

### Installation

```
ember install ember-content-kit
```

`ember-content-kit` will install the `content-kit-editor` packages as a
dependency and load its assets.

### Usage

This addon is primarily composed of components used building an editor
UI.

* [`{{content-kit-editor}}`](#content-kit-editor)
* [`{{content-kit-section-button}}`](#content-kit-section-button)
* [`{{content-kit-markup-button}}`](#content-kit-markup-button)
* [`{{content-kit-link-button}}`](#content-kit-link-button)
* [`{{content-kit-toolbar}}`](#content-kit-toolbar)

#### `{{content-kit-editor}}`

This component is the main entrance point for a content-kit editor instance
in your Ember app. Used in the most basic form it will render a dummy editor
with no toolbar. For example this usage:

```hbs
{{content-kit-editor}}
```

Will render a blank Mobiledoc into the following DOM:

```hbs
<article class="content-kit-editor">
  <div class="content-kit-editor__editor-wrapper">
    <div class="content-kit-editor__editor"></div>
  </div>
</article>
```

The components accepts two arguments:

* `mobiledoc`, a Mobiledoc for editing by the Content-Kit editor
* `cards`, an array of available cards for use by the editor. Jump to
  the section on [Component-based cards](#component-based-cards) for more detail on how
  to use cards with Ember components.

Of course often you want to provide a user interface to bold text, create
headlines, or otherwise reflect the state of the editor.

Called with a block, the `contentKit` param is yielded.

```hbs
{{#content-kit-editor mobiledoc=someDoc as |contentKit|}}
{{/content-kit-editor}}
```

`contentKit` has the following properties, useful to inspect the current
state of the editor:

* `editor`, the Content-Kit editor itself
* `activeSectionTagNames`, an object with true values for section tag names
  in the current selection. For example `activeSectionTagNames.isH1`.
* `activeMarkupTagNames`, an object with true values for markup tag names in
  the current selection. For example `activeMarkupTagNames.isStrong`

Additionally `contentKit` provides the following actions:

* `toggleMarkup`, toggling the passed markup tag name in the current selection.
* `toggleSectionTagName`, toggling the passed section tag name in the current
  selection.
* `toggleLink`, toggling the linking of a selection. The user will be prompted
   for a URL if required.
* `addCard`, passed a card name and payload will add that card at the end of
* `addCardInEditMode`, passed a card name and payload will add that card at the end of
  a post and render it in "edit" mode initially.
* `createListSection`, changing selected content into list items.

The `contentKit` object is often used indirectly by passing it to other
components. For example:

```hbs
{{#content-kit-editor as |contentKit|}}
  <div class="toolbar">
    {{content-kit-markup-button contentKit=contentKit for="strong"}}
    {{content-kit-link-button contentKit=contentKit}}
  </div>
{{/content-kit-editor}}
```

#### `{{content-kit-section-button}}`

Requires two properties:

* `for`, the name of the tag
* `contentKit`, the `contentKit` instance from `content-kit-editor`

Creates a `<button>` element that has a class of `active` when the provided
section tag is used in the current selection. For example:

```hbs
{{content-kit-section-button contentKit=contentKit for="h2"}}
```

Alternatively, custom text for the HTML of the button can be yielded:

```hbs
{{#content-kit-section-button contentKit=contentKit for="h2"}}
  Headline 2
{{/content-kit-section-button}}
```

When clicked, the section tag name will be toggled.

#### `{{content-kit-markup-button}}`

Requires two properties:

* `for`, the name of the tag
* `contentKit`, the `contentKit` instance from `content-kit-editor`

Creates a `<button>` element that has a class of `active` when the provided
markup tag is used in the current selection. For example:

```hbs
{{content-kit-markup-button contentKit=contentKit for="em"}}
```

Alternatively, custom text for the HTML of the button can be yielded:

```hbs
{{#content-kit-markup-button contentKit=contentKit for="em"}}
  Italicize
{{/content-kit-markup-button}}
```

When clicked, the markup tag name will be toggled.

#### `{{content-kit-link-button}}`

Requires one property:

* `contentKit`, the `contentKit` instance from `content-kit-editor`

Creates a `<button>` element that has a class of `active` when the an `a`
tag is used in the current selection. For example:

```hbs
{{content-kit-link-button contentKit=contentKit}}
```

Custom text for the HTML of the button can be yielded:

```hbs
{{#content-kit-link-button contentKit=contentKit}}
  Toggle Link
{{/content-kit-link-button}}
```

When clicked, the presence of a link will be toggled. The user will be prompted
for a URL if required.

#### `{{content-kit-toolbar}}`

Requires one property:

* `contentKit`, the `contentKit` instance from `content-kit-editor`

This component creates a full-features toolbar for the Content-Kit editor.
For example:

```hbs
{{#content-kit-editor as |contentKit|}}
  {{content-kit-toolbar contentKit=contentKit}}
{{/content-kit-editor}}
```

### Component-based Cards

Mobiledoc supports "cards", blocks of rich content that are embedded into a
post. For more details on the API for authoring cards in vanilla JavaScript, see
[CARDS.md](https://github.com/bustlelabs/content-kit-editor/blob/master/CARDS.md).

ember-content-kit comes with a handle helper for using Ember
components as the display and edit modes of a card. Create a list of cards
using the `createComponentCard` helper:

```js
import Ember from 'ember';
import createComponentCard from 'ember-content-kit/utils/create-component-card';

export default Ember.Component.extend({
  cards: Ember.computed(function() {
    return [
      createComponentCard('demo-card')
    ];
  });
});
```

And pass that list into the `{{content-kit-editor}}` component:

```hbs
{{content-kit-editor cards=cards}}
```

When added to the post (or loaded from a passed-in Mobiledoc), these components
will be used:

* For display, the `demo-card` component will be called
* For edit, the `demo-card-editor` component will be called

The component will be provided with the following `attrs`:

  * `data`, the data payload for this card
  * `editCard`, an action for toggling this card into edit mode (this action is a no-op if the card is already in edit mode)
  * `removeCard`, an action for removing this card
  * `saveCard`, an action accepting new data for the card payload, then saving
    that data and toggling this card into display mode
  * `cancelCard`, an action toggling this card to display mode without saving (this action is a no-op if the card is already in display mode)
  * `removeCard`, an action for removing this card
  * `cardName` the name of this card
  * `editor` A reference to the content-kit-editor
  * `cardSection` A reference to this card's `cardSection` model in the editor's abstract tree. This may be necessary to do programmatic editing (such as moving the card via the `postEditor#moveSection` API that content-kit-editor provides)

### Developing ember-content-kit

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
