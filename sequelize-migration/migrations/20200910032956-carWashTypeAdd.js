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
			await queryInterface.addColumn('car_washes', 'type_tag', {
				type: Sequelize.JSON
			})
			await queryInterface.addColumn('car_washes', 'time_tag', {
				type: Sequelize.JSON
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
			await queryInterface.removeColumn('car_washes', 'type_tag')
			await queryInterface.removeColumn('car_washes', 'time_tag')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
