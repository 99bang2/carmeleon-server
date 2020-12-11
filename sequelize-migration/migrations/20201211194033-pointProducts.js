'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('point_products', 'list_image', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('point_products', 'detail_image', {
				type: Sequelize.STRING
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('point_products', 'list_image')
			await queryInterface.removeColumn('point_products', 'detail_image')

			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
