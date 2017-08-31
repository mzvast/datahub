'use strict';
module.exports = function(sequelize, DataTypes) {
  var proto = sequelize.define('proto', {
    type: DataTypes.INTEGER,
    name: DataTypes.STRING,
    in_use: DataTypes.INTEGER,
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
