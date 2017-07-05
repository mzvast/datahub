'use strict';
module.exports = function(sequelize, DataTypes) {
  var setting = sequelize.define('setting', {
    local_port: DataTypes.BIGINT,
    local_host: DataTypes.STRING,
    remote_port: DataTypes.BIGINT,
    remote_host: DataTypes.STRING,
    intf: DataTypes.STRING,
    debug: DataTypes.BOOLEAN,
    record: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return setting;
};
