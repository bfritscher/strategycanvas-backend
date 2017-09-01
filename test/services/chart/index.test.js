'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('chart service', function() {
  it('registered the charts service', () => {
    assert.ok(app.service('charts'));
  });
});
