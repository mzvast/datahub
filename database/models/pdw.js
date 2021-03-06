'use strict';
module.exports = function(sequelize, DataTypes) {
  var pdw = sequelize.define('pdw', {
    remote_host: DataTypes.STRING,
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
