'use strict';

const service = require('feathers-sequelize');
const offering = require('./offering-model');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const options = {
    Model: offering(app.get('sequelize')),
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/offerings', service(options));

  // Get our initialize service to that we can bind hooks
  const offeringService = app.service('/offerings');

  offeringService.filter((message, connection) => {
    if (message.viewCode === connection.viewCode) {
      return message;
    }
    return false;
  });

  // Set up our before hooks
  offeringService.before(hooks.before);

  // Set up our after hooks
  offeringService.after(hooks.after);
};
