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
			await queryInterface.removeColumn('parking_sites', 'valetType');
			await queryInterface.removeColumn('parking_sites', 'isBuy');
			await queryInterface.addColumn('parking_sites', 'valet_type', {
				type: Sequelize.INTEGER,
				defaultValue: 0
			});
			await queryInterface.addColumn('parking_sites', 'is_buy', {
				type: Sequelize.BOOLEAN,
				defaultValue: true
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
			await queryInterface.removeColumn('parking_sites', 'valet_type');
			await queryInterface.removeColumn('parking_sites', 'is_buy');
			await queryInterface.addColumn('parking_sites', 'valetType', {
				type: Sequelize.INTEGER,
				defaultValue: 0
			});
			await queryInterface.addColumn('parking_sites', 'isBuy', {
				type: Sequelize.BOOLEAN,
				defaultValue: true
			});
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
