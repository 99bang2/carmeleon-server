'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    try {
      await queryInterface.changeColumn('pushes', 'send_date', {
        type: Sequelize.DATE
      })
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    try {
      await queryInterface.changeColumn('pushes', 'send_date', {
        type: Sequelize.STRING
      })
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
