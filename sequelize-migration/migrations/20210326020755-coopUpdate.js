'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      await queryInterface.addColumn('users', 'coop_payment', {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      })
      await queryInterface.addColumn('pay_logs', 'coop_payment', {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      })

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    try {
      queryInterface.removeColumn('users', 'coop_payment')
      queryInterface.removeColumn('pay_logs', 'coop_payment')

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
