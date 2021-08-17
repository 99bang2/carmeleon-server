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
      await queryInterface.addColumn('pay_logs', 'car_model', {
        type: Sequelize.STRING,
        after: 'car_number'
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
      await queryInterface.removeColumn('pay_logs', 'car_model')

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
