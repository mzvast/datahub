'use strict';
module.exports = function(sequelize, DataTypes) {
  var host = sequelize.define('host', {
    remote_host: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return host;
};
