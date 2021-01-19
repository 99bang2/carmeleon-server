'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('cars', 'brand', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cars', 'model', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cars', 'mobilx_car_uid', {
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
			await queryInterface.removeColumn('cars', 'brand')
			await queryInterface.removeColumn('cars', 'model')
			await queryInterface.removeColumn('cars', 'mobilx_car_uid')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
