import { run } from '@ember/runloop';
import Ember from 'ember';
import { QUnitAdapter } from 'ember-qunit';

/**
 * Creates a TestAdapter that will throw when an exception is encountered.
 * Before Ember 2.11, errors that occur in tests during `this.render` were thrown
 * and catchable (and therefore testable using `assert.throws`), but
 * in https://github.com/emberjs/ember.js/pull/14898 this changed and we need
 * to override the Test Adapter's exception handler to rethrow the error.
 *
 * This file and any references can be removed if the Ember Test Adapter's
 * error-handling behavior changes in the future.
 */

const ThrowingAdapter = QUnitAdapter.extend({
  exception(error) {
    // rethrow error
    throw error;
  }
});

export function setup(context) {
	let origTestAdapter = Ember.Test.adapter;
  context.__originalTestAdapter = origTestAdapter;

  run(() => { Ember.Test.adapter = ThrowingAdapter.create(); });
}

export function teardown(context) {
  if (context.__originalTestAdapter) {
    run(() => {
      context.__originalTestAdapter.destroy();
      delete context.__originalTestAdapter;

      Ember.Test.adapter = QUnitAdapter.create();
    });
  }
}
