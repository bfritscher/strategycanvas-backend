'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('serie service', function() {
  it('registered the series service', () => {
    assert.ok(app.service('series'));
  });
});
