'use strict';
module.exports = function(sequelize, DataTypes) {
  var pdw = sequelize.define('pdw', {
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return pdw;
};