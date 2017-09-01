'use strict';

// offering-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Offering = sequelize.define('offering', {
    business: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'factorBusinessChart'
    },
    factor: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'factorBusinessChart'
    },
    value: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
  }, {
    freezeTableName: true,
    createdAt: 'date_created',
    updatedAt: 'last_updated',
    classMethods: {
      associate() {
        Offering.belongsTo(sequelize.models.chart, {
          foreignKey: 'chart_id',
          allowNull: false,
          unique: 'factorBusinessChart'});
      }
    }
  });


  return Offering;
};
