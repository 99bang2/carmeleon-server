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
			await queryInterface.changeColumn('pay_logs', 'cancel_status', {
				type: Sequelize.INTEGER,
				defaultValue: -1
			})
			await queryInterface.addColumn('pay_logs', 'cancel_reason', {
				type: Sequelize.STRING
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
			await queryInterface.changeColumn('pay_logs', 'cancel_status', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			})
			await queryInterface.removeColumn('pay_logs', 'cancel_reason')
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
