'use strict';
module.exports = function(sequelize, DataTypes) {
  var phase = sequelize.define('phase', {
    remote_host: DataTypes.STRING,
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
