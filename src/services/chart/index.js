'use strict';

const service = require('feathers-sequelize');
const chart = require('./chart-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: chart(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/charts', service(options));

  // Get our initialize service to that we can bind hooks
  const chartService = app.service('/charts');

  // Set up our before hooks
  chartService.before(hooks.before);

  // Set up our after hooks
  chartService.after(hooks.after);
};
