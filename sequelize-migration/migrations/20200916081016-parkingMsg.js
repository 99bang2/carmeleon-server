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
			await queryInterface.addColumn('parking_sites', 'message', {
				type: Sequelize.TEXT
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
			await queryInterface.removeColumn('parking_sites', 'message')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
