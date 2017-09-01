'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('offering service', function() {
  it('registered the offerings service', () => {
    assert.ok(app.service('offerings'));
  });
});
