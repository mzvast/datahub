'use strict';
module.exports = function(sequelize, DataTypes) {
  var pkg = sequelize.define('pkg', {
    remote_host: DataTypes.STRING,
    raw: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return pkg;
};
