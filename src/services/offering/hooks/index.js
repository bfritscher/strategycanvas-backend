'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors');

const chartIdFromEditCode = hook => {
  const service = hook.app.service('/charts');
  return service.find({query: {
    edit_code: hook.params.query.edit_code
  }}).then(chart => {
    delete hook.params.query.edit_code;
    hook.params.viewCode = chart.view_code;
    hook.params.query.chart_id = chart.id;
    return hook;
  })
};

const ensure = (...fields) => {
  return hook => {
    if (!fields.every(e => hook.params.query.hasOwnProperty(e))) {
      throw new errors.BadRequest('Missing Parameters.');
    }
  };
}

const createIfEmpty = hook => {
  if (hook.result.length === 0) {
    const service = hook.app.service('/offerings');
    return service.create({
      chart_id: hook.params.query.chart_id,
      business: hook.params.query.business,
      factor: hook.params.query.factor,
      value: hook.data.value
    }).then(res => {
      hook.result = res.dataValues;
      hook.result.viewCode = hook.params.viewCode;
      return hook;
    });
  }
  hook.result = hook.result[0].dataValues;
  hook.result.viewCode = hook.params.viewCode;
};

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [chartIdFromEditCode, ensure('chart_id', 'business', 'factor')],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [createIfEmpty],
  remove: []
};
