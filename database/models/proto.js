'use strict';
module.exports = function(sequelize, DataTypes) {
  var proto = sequelize.define('proto', {
    type: DataTypes.INTEGER,
    in_use: DataTypes.BOOLEAN,
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return proto;
};
