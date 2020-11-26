'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		/*
		  Add altering commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.createTable('users', { id: Sequelize.INTEGER });
		*/
		try {
			await queryInterface.removeColumn('users', 'new_message')
			await queryInterface.addColumn('users', 'new_message', {
				type: Sequelize.DATE,
				defaultValue: null
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
			await queryInterface.removeColumn('users', 'new_message')
			await queryInterface.addColumn('users', 'new_message', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
