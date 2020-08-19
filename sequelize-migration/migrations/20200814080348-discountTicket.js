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
			await queryInterface.addColumn('discount_tickets', 'ticket_start_date', {
				type: Sequelize.DATE
			});
			await queryInterface.addColumn('discount_tickets', 'ticket_end_date', {
				type: Sequelize.DATE
			});
			await queryInterface.addColumn('discount_tickets', 'ticket_count', {
				type: Sequelize.INTEGER
			});
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
			await queryInterface.removeColumn('discount_tickets', 'ticket_start_date');
			await queryInterface.removeColumn('discount_tickets', 'ticket_end_date');
			await queryInterface.removeColumn('discount_tickets', 'ticket_count');
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
