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
      await queryInterface.removeColumn('coop_payment_logs', 'brand_auth_code')

      await queryInterface.addColumn('coop_payment_logs', 'gift_card_type', {
        type: Sequelize.STRING
      })
      await queryInterface.addColumn('coop_payment_logs', 'approval_date', {
        type: Sequelize.STRING
      })
      await queryInterface.addColumn('coop_payment_logs', 'approval_time', {
        type: Sequelize.STRING
      })
      await queryInterface.addColumn('coop_payment_logs', 'approval_no', {
        type: Sequelize.STRING
      })
      await queryInterface.addColumn('coop_payment_logs', 'product_code', {
        type: Sequelize.STRING
      })
      await queryInterface.addColumn('coop_payment_logs', 'pays_code', {
        type: Sequelize.STRING
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
      await queryInterface.addColumn('coop_payment_logs', 'brand_auth_code', {
        type: Sequelize.STRING,
      })

      await queryInterface.removeColumn('coop_payment_logs', 'gift_card_type')
      await queryInterface.removeColumn('coop_payment_logs', 'approval_date')
      await queryInterface.removeColumn('coop_payment_logs', 'approval_time')
      await queryInterface.removeColumn('coop_payment_logs', 'approval_no')
      await queryInterface.removeColumn('coop_payment_logs', 'product_code')
      await queryInterface.removeColumn('coop_payment_logs', 'pays_code')

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
