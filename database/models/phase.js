'use strict';
module.exports = function(sequelize, DataTypes) {
  var phase = sequelize.define('phase', {
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return phase;
};