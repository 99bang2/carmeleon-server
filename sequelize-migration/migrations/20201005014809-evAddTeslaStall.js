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
			await queryInterface.addColumn('ev_charge_stations', 'stall', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('ev_charge_stations', 'in_use_stall', {
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
			await queryInterface.removeColumn('ev_charge_stations', 'stall')
			await queryInterface.removeColumn('ev_charge_stations', 'in_use_stall')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
