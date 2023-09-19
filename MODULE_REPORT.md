## Module Report
### Unknown Global

**Global**: `Ember.uuid`

**Location**: `addon/components/mobiledoc-editor/component.js` at line 206

```js
    let componentHooks = {
      [ADD_CARD_HOOK]: ({env, options, payload}, isEditing=false) => {
        let cardId = Ember.uuid();
        let cardName = env.name;
        if (isEditing) {
```

### Unknown Global

**Global**: `Ember.uuid`

**Location**: `addon/components/mobiledoc-editor/component.js` at line 234

```js
      },
      [ADD_ATOM_HOOK]: ({env, options, payload, value}) => {
        let atomId = Ember.uuid();
        let atomName = env.name;
        let destinationElementId = `mobiledoc-editor-atom-${atomId}`;
```

### Unknown Global

**Global**: `Ember.testing`

**Location**: `addon/components/mobiledoc-editor/component.js` at line 425

```js
  _setExpandoProperty(editor) {
    // Store a reference to the editor for the acceptance test helpers
    if (this.element && Ember.testing) {
      this.element[TESTING_EXPANDO_PROPERTY] = editor;
    }
```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/helpers/create-throwing-adapter.js` at line 24

```js

export function setup(context) {
	let origTestAdapter = Ember.Test.adapter;
  context.__originalTestAdapter = origTestAdapter;

```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/helpers/create-throwing-adapter.js` at line 27

```js
  context.__originalTestAdapter = origTestAdapter;

  run(() => { Ember.Test.adapter = ThrowingAdapter.create(); });
}

```

### Unknown Global

**Global**: `Ember.Test`

**Location**: `tests/helpers/create-throwing-adapter.js` at line 36

```js
      delete context.__originalTestAdapter;

      Ember.Test.adapter = QUnitAdapter.create();
    });
  }
```
