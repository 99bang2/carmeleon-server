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
			await queryInterface.addColumn('parking_sites', 'operation_time', {
				type: Sequelize.STRING
			});
			await queryInterface.addColumn('parking_sites', 'account_uid', {
				type: Sequelize.INTEGER
			});
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
		// return [
		//   queryInterface.addColumn('discount_tickets', 'ticket_price_discount', {
		// 	  type: Sequelize.INTEGER
		//   }),
		//   queryInterface.addColumn('discount_tickets', 'ticket_price_discount_percent', {
		// 	  type: Sequelize.INTEGER,
		//   })
		// ];
	},

	down: async (queryInterface, Sequelize) => {
		/*
		  Add reverting commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.dropTable('users');
		*/
		// return [
		//   queryInterface.removeColumn('discount_tickets', 'ticket_price_discount'),
		//   queryInterface.removeColumn('discount_tickets', 'ticket_price_discount_percent')
		// ];
		try {
			await queryInterface.removeColumn('parking_sites', 'operation_time');
			await queryInterface.removeColumn('parking_sites', 'account_uid');
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
