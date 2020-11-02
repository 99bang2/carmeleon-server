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
			await queryInterface.addColumn('car_washes', 'booking_code', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('pushes', 'user_uid', {
				type: Sequelize.INTEGER,
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
			await queryInterface.removeColumn('car_washes', 'booking_code')
			await queryInterface.removeColumn('pushes', 'user_uid')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
