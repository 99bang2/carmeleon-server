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
			await queryInterface.addColumn('parking_sites', 'is_recommend', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			});
			await queryInterface.addColumn('gas_stations', 'is_recommend', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			});
			await queryInterface.addColumn('car_washes', 'is_recommend', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			});
			await queryInterface.addColumn('ev_charges', 'is_recommend', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
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
			await queryInterface.removeColumn('parking_sites', 'is_recommend');
			await queryInterface.removeColumn('gas_stations', 'is_recommend');
			await queryInterface.removeColumn('car_washes', 'is_recommend');
			await queryInterface.removeColumn('ev_charges', 'is_recommend');
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
