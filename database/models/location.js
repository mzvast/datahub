'use strict';
module.exports = function(sequelize, DataTypes) {
  var location = sequelize.define('location', {
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