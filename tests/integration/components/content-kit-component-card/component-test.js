import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('content-kit-component-card', 'Integration | Component | content kit component card', {
  integration: true,
  setup() {
    this.registry.register('template:components/my-card', hbs`
      <button {{action data.edit}}>Edit</button>
    `);
    this.registry.register('template:components/my-card-editor', hbs`
      <button {{action data.cancel}}>Cancel</button>
    `);
  }
});

test('it renders', function(assert) {
  this.set('data', {
    edit() {},
    cancel() {}
  });
  this.render(hbs`{{content-kit-component-card cardName="my-card" data=data}}`);

  let cancelButton = this.$('button:contains(Cancel)');
  assert.ok(!!cancelButton.length, '`Cancel` buttons found');
  cancelButton.click();
  assert.ok(!!this.$('button:contains(Edit)').length, '`Edit` buttons found');
});
