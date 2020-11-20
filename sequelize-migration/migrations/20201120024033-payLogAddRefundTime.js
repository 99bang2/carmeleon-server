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
			await queryInterface.addColumn('pay_logs', 'cancel_request_time', {
				type: Sequelize.DATE
			})
			await queryInterface.addColumn('pay_logs', 'cancel_complete_time', {
				type: Sequelize.DATE
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
			await queryInterface.removeColumn('pay_logs', 'cancel_request_time')
			await queryInterface.removeColumn('pay_logs', 'cancel_complete_time')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
