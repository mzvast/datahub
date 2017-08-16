'use strict';
module.exports = function(sequelize, DataTypes) {
  var intf = sequelize.define('intf', {
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
  return intf;
};
