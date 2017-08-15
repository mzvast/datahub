'use strict';
module.exports = function(sequelize, DataTypes) {
  var radiation = sequelize.define('radiation', {
    remote_host: DataTypes.STRING,
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
