'use strict';

/* eslint-disable-next-line node/no-missing-require */
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
            'ember-template-imports': null,
          },
        },
        allowedToFail: true, // to fix this, we need some build-time logic to avoid trying to render gts component
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
            '@ember/test-helpers': '2.8.1',
            'ember-qunit': '5.1.5',
            '@types/ember__test-helpers': '^2.8.1',
            '@types/ember-qunit': '^5.0.2',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
            '@ember/test-helpers': '2.8.1',
            'ember-qunit': '5.1.5',
            '@types/ember__test-helpers': '^2.8.1',
            '@types/ember-qunit': '^5.0.2',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
