'use strict';

const service = require('feathers-sequelize');
const serie = require('./serie-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: serie(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/series', service(options));

  // Get our initialize service to that we can bind hooks
  const serieService = app.service('/series');

  // Set up our before hooks
  serieService.before(hooks.before);

  // Set up our after hooks
  serieService.after(hooks.after);
};
