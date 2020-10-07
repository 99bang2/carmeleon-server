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
			await queryInterface.renameColumn('ev_charge_stations', 'in_use_stall', 'available_stall')
			await queryInterface.changeColumn('ev_charge_stations', 'stall', {
				type: Sequelize.INTEGER
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
			await queryInterface.renameColumn('ev_charge_stations', 'available_stall', 'in_use_stall')
			await queryInterface.changeColumn('ev_charge_stations', 'stall', {
				type: Sequelize.STRING
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
