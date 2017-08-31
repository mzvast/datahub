'use strict';
module.exports = function(sequelize, DataTypes) {
  var proto = sequelize.define('proto', {
    type: DataTypes.INTEGER,
    name: DataTypes.STRING,
    in_use: DataTypes.INTEGER,//0正常 1表示当前使用 2表示已删除，就是不显示出来
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
