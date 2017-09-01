'use strict';

// chart-model.js - A sequelize model
//
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.

const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Chart = sequelize.define('chart', {
    view_code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    edit_code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    factors_json: {
      type: Sequelize.TEXT,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    createdAt: 'date_created',
    updatedAt: 'last_updated',
    classMethods: {
      associate() {
        Chart.belongsTo(sequelize.models.chart, {as: 'origin', foreignKey: 'origin_id' });
        Chart.hasMany(sequelize.models.serie, {as: 'series', foreignKey: 'chart_id'});
        Chart.hasMany(sequelize.models.offering, {as: 'offerings', foreignKey: 'chart_id'});
      }
    }
  });

  return Chart;
};
