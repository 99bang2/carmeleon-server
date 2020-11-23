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
			await queryInterface.addColumn('pay_logs', 'point', {
				type: Sequelize.INTEGER,
				defaultValue: 0
			})
			await queryInterface.addColumn('pay_logs', 'selling_price', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('pay_logs', 'discount_type', {
				type: Sequelize.INTEGER,
				defaultValue: 0
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
			await queryInterface.removeColumn('pay_logs', 'point')
			await queryInterface.removeColumn('pay_logs', 'selling_price')
			await queryInterface.removeColumn('pay_logs', 'discount_type')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
