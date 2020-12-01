'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('cars', 'discount_type', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('cars', 'discount_pictures', {
				type: Sequelize.JSON
			})
			await queryInterface.addColumn('cars', 'discount_day', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('cars', 'discount_status', {
				type: Sequelize.INTEGER
			})

			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('cars', 'discount_type')
			await queryInterface.removeColumn('cars', 'discount_pictures')
			await queryInterface.removeColumn('cars', 'discount_day')
			await queryInterface.removeColumn('cars', 'discount_status')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
