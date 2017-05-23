'use strict';
module.exports = function(sequelize, DataTypes) {
  var radiation = sequelize.define('radiation', {
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return radiation;
};