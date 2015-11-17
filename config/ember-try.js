module.exports = {
  scenarios: [
    {
      name: '1.13',
      dependencies: {
        "ember": "~1.13.7"
      }
    },
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: '2.3',
      dependencies: {
        'ember': '2.3.0-beta.1'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'components/ember#canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    }
  ]
};
