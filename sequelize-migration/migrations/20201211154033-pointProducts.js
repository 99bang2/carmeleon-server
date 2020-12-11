'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('point_products', 'point')
			await queryInterface.removeColumn('point_products', 'add_point')
			await queryInterface.removeColumn('point_products', 'add_point_percent')

			await queryInterface.addColumn('point_products', 'product_type', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('point_products', 'category', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('point_products', 'title', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('point_products', 'is_active', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			})
			await queryInterface.addColumn('point_products', 'is_sold_out', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('point_products', 'point', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('point_products', 'add_point', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('point_products', 'add_point_percent', {
				type: Sequelize.INTEGER
			})
			await queryInterface.removeColumn('point_products', 'product_type')
			await queryInterface.removeColumn('point_products', 'category')
			await queryInterface.removeColumn('point_products', 'title')
			await queryInterface.removeColumn('point_products', 'is_active')
			await queryInterface.removeColumn('point_products', 'is_sold_out')

			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
