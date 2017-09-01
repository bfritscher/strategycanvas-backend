'use strict';

const commonHooks = require('feathers-hooks-common');

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors');

const ALPHA_NUM = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCode(len) {
    const code = [];
    for (let i=0;  i < len;  i++) {
        let ndx = Math.floor(Math.random() * ALPHA_NUM.length);
        code.push(ALPHA_NUM[ndx]);
    }
    return code.join('');
}

const includeAssociations = hook => {
  const models = hook.app.get('sequelize').models;
  hook.params.sequelize = {
    include: [{
      model: models.serie,
      as: 'series',
      attributes: {
        exclude: ['chart_id', 'date_created', 'last_updated']
      }
    }, {
      model: models.offering,
      as: 'offerings',
      attributes: {
        exclude: ['chart_id', 'date_created', 'last_updated']
      }
    },]
  };
}

const onlyCodeLookup = hook => {
  if(!hook.params.query.edit_code && !hook.params.query.view_code) {
    throw new errors.BadRequest('Missing Parameter view_code or edit_code.');
  }
};

const handleViewCode = hook => {
  if (!hook.params.query.view_code) {
    return hook;
  }
  if (hook.result.total === 0) {
    throw new errors.NotFound('No canvas found with this code.');
  }
  hook.result = hook.result.data[0].dataValues;
  delete hook.result.edit_code;
};

const handleEditCode = hook => {
  if (!hook.params.query.edit_code) {
    return hook;
  }
  if (hook.result.total === 0 && hook.params.provider) {
      const service = hook.app.service('/charts');
      const chart = {
        title: '',
        description: '',
        factors_json: '["Factor 1","Factor 2","Factor 3","Factor 4","Factor 5"]',
        series: [{
          business:'Business', color:'#1f77b4', symbol:'circle', dash:'0'
        }],
        offerings: []
      }
      if (hook.params.query.edit_code === 'new0') {
        chart.title = 'Strategy Canvas: Southwest Airlines';
        chart.description = `Welcome to StrategyCanvas.org!
This demo canvas was created for you. You can edit it or start from a new empty canvas by clicking the new document icon.
This tool helps you design a strategy canvas with value curves like they are proposed by in the Blue Ocean Strategy by W. Chan Kim and Renée Mauborgne (2002, 2005)
For more explanation, check out the handbook (help icon on top).
In this sample, you can see that:
"The strategic profile of Southwest Airlines differs dramatically from those of its competitors in the short-haul airline industry. Note how Southwest’s profile has more in common with the car's than with the profile of other airlines." (Harvard Business Review, Vol. 80, No. 6, June 2002)
HINT: Live collaborative editing is supported; just share the link with a colleague!
`;
        chart.factors_json = '["price","meals","lounges","seating choices","hub connectivity","friendly service","speed","frequent departures"]';
        chart.series = [
          {business:'Southwest', color:'#1f77b4', symbol:'square', dash:'0'},
          {business:'Other airlines', color:'#d62728', symbol:'circle', dash:'0'},
          {business:'Car', color:'#7f7f7f', symbol:'circle', dash:'0'}];
        chart.offerings = [
          {business:'Southwest', factor:'price', value:0.15},
          {business:'Other airlines', factor:'price', value:0.671},
          {business:'Car', factor:'price', value:0.089},
          {business:'Southwest', factor:'meals', value:0.179},
          {business:'Other airlines', factor:'meals', value:0.5},
          {business:'Car', factor:'meals', value:0.0},
          {business:'Southwest', factor:'lounges', value:0.101},
          {business:'Other airlines', factor:'lounges', value:0.6},
          {business:'Car', factor:'lounges', value:0.0},
          {business:'Southwest', factor:'seating choices', value:0.05},
          {business:'Other airlines', factor:'seating choices', value:0.8},
          {business:'Car', factor:'seating choices', value:0.0},
          {business:'Southwest', factor:'hub connectivity', value:0.04},
          {business:'Other airlines', factor:'hub connectivity', value:0.52},
          {business:'Car', factor:'hub connectivity', value:0.0},
          {business:'Southwest', factor:'friendly service', value:0.91},
          {business:'Other airlines', factor:'friendly service', value:0.74},
          {business:'Car', factor:'friendly service', value:0.0},
          {business:'Southwest', factor:'speed', value:1},
          {business:'Other airlines', factor:'speed', value:0.709},
          {business:'Car', factor:'speed', value:0.0},
          {business:'Southwest', factor:'frequent departures', value:0.8},
          {business:'Other airlines', factor:'frequent departures', value:null},
          {business:'Car', factor:'frequent departures', value:1}];
      }
      return service.create(chart).then((data) => {
        hook.result = data.dataValues;
        return hook;
      }, (err) => {
        console.log(err);
        throw new Error('Unable to create!');
      });
  }
  else if(hook.result.total === 0) {
    throw new errors.NotFound('No canvas found with this code.');
  } else {
    hook.result = hook.result.data[0].dataValues;
  }
};

const generateUniqueCode = (service, type, len) => {
  return new Promise((resolve, reject) => {
    const code = generateCode(len);
    const params = {
      query: {}
    };
    params.query[type] = code;
    service.find(params).then( res => {
      resolve(generateCode(service, type, len));
    }, res => {
      resolve(code);
    });
  });
};

const generateUniqueCodes = hook => {
  const service = hook.app.service('/charts');
  return new Promise((resolve, reject) => {
    Promise.all([
      generateUniqueCode(service, 'view_code', 5),
      generateUniqueCode(service, 'edit_code', 10)
    ]).then(values => {
      hook.data.view_code = values[0];
      hook.data.edit_code = values[1];
      resolve(hook);
    });

  });
};

const dbObjectToApi = hook => {
   hook.result.factors = JSON.parse(hook.result.factors_json);
   delete hook.result.factors_json;

    // map offerings onto series
   if (hook.result.series) {
    hook.result.series.map(serie => serie.dataValues).forEach(serie => {
        serie.offerings = hook.result.offerings.filter(offering => {
          return offering.get('business') === serie.business;
        }).reduce((offerings, offering) => {
          if (offering.get('value')) {
            offerings[offering.get('factor')] = offering.get('value');
          }
          return offerings;
        }, {});
      });
      delete hook.result.offerings;
   }
}

exports.before = {
  all: [],
  find: [hooks.pluckQuery('view_code', 'edit_code'), onlyCodeLookup, commonHooks.iff(commonHooks.isNot(commonHooks.isProvider('server')), includeAssociations)],
  get: [],
  create: [generateUniqueCodes, includeAssociations],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [handleViewCode, handleEditCode, dbObjectToApi],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
