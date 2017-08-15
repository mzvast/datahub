'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      local_port: {
        type: Sequelize.BIGINT
      },
      local_host: {
        type: Sequelize.STRING
      },
      remote_port: {
        type: Sequelize.BIGINT
      },
      remote_host: {
        type: Sequelize.STRING
      },
      debug: {
        type: Sequelize.BOOLEAN
      },
      record: {
        type: Sequelize.BOOLEAN
      },
      intf: {
        type: Sequelize.STRING
      },
      other: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('settings');
  }
};
