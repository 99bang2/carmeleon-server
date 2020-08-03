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
		  await queryInterface.addColumn('pay_logs', 'visible', {
			  type: Sequelize.BOOLEAN,
			  defaultValue: true
		  });
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
		  await queryInterface.removeColumn('pay_logs', 'visible');
		  return Promise.resolve();
	  } catch (e) {
		  return Promise.reject(e);
	  }
  }
};
