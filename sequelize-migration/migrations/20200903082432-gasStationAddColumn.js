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
			await queryInterface.addColumn('gas_stations', 'tag', {
				type: Sequelize.JSON
			})
			await queryInterface.addColumn('gas_stations', 'gasoline', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('gas_stations', 'diesel', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('gas_stations', 'premium_gasoline', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('gas_stations', 'heating_oil', {
				type: Sequelize.INTEGER
			})
			await queryInterface.addColumn('gas_stations', 'lpg', {
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
			await queryInterface.removeColumn('gas_stations', 'tag', {
				type: Sequelize.JSON
			})
			await queryInterface.removeColumn('gas_stations', 'gasoline', {
				type: Sequelize.INTEGER
			})
			await queryInterface.removeColumn('gas_stations', 'diesel', {
				type: Sequelize.INTEGER
			})
			await queryInterface.removeColumn('gas_stations', 'premium_gasoline', {
				type: Sequelize.INTEGER
			})
			await queryInterface.removeColumn('gas_stations', 'heating_oil', {
				type: Sequelize.INTEGER
			})
			await queryInterface.removeColumn('gas_stations', 'lpg', {
				type: Sequelize.INTEGER
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
