'use strict';
module.exports = function(sequelize, DataTypes) {
  var intf = sequelize.define('intf', {
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return intf;
};