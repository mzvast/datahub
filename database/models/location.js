'use strict';
module.exports = function(sequelize, DataTypes) {
  var location = sequelize.define('location', {
    remote_host: DataTypes.STRING,
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return location;
};
