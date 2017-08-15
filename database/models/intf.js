'use strict';
module.exports = function(sequelize, DataTypes) {
  var intf = sequelize.define('intf', {
    remote_host: DataTypes.STRING,
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
