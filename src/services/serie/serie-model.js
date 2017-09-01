'use strict';

// serie-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Serie = sequelize.define('serie', {
    business: {
      type: Sequelize.STRING,
      allowNull: false
    },
    color: {
      type: Sequelize.STRING,
      allowNull: false
    },
    dash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    symbol: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    createdAt: 'date_created',
    updatedAt: 'last_updated',
    classMethods: {
      associate() {
        Serie.belongsTo(sequelize.models.chart, {foreignKey: 'chart_id', allowNull: false});
      }
    }
  });

  return Serie;
};
