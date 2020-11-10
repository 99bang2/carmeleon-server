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
			await queryInterface.addColumn('pay_logs', 'pay_result_uid', {
				type: Sequelize.INTEGER,
			})
			await queryInterface.addColumn('pay_logs', 'pay_oid', {
				type: Sequelize.STRING,
			})
			await queryInterface.removeColumn('pay_logs', 'pay_info')
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
			await queryInterface.addColumn('pay_logs', 'pay_info', {
				type: Sequelize.JSON,
			})
			await queryInterface.removeColumn('pay_logs', 'pay_result_uid')
			await queryInterface.removeColumn('pay_logs', 'pay_oid')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
