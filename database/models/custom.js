'use strict';
module.exports = function(sequelize, DataTypes) {
  var pdw = sequelize.define('custom', {
    remote_host: DataTypes.STRING,
    type: DataTypes.INTEGER,
    proto_id: DataTypes.INTEGER,
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
