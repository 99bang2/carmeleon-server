'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/*
		  Add altering commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.createTable('users', { id: Sequelize.INTEGER });
		*/
		try {
			await queryInterface.removeColumn('gas_stations', 'oil_price')
			await queryInterface.removeColumn('gas_stations', 'is_car_wash')
			await queryInterface.removeColumn('gas_stations', 'is_convenience')
			await queryInterface.removeColumn('gas_stations', 'is_kpetro')
			return Promise.resolve()
		} catch (e) {
			return Promise.reject(e)
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
			await queryInterface.addColumn('gas_stations', 'oil_price', {
				type: Sequelize.JSON
			})
			await queryInterface.addColumn('gas_stations', 'is_car_wash', {
				type: Sequelize.BOOLEAN
			})
			await queryInterface.addColumn('gas_stations', 'is_convenience', {
				type: Sequelize.BOOLEAN
			})
			await queryInterface.addColumn('gas_stations', 'is_kpetro', {
				type: Sequelize.BOOLEAN
			})
			return Promise.resolve()
		} catch (e) {
			return Promise.reject(e)
		}
	}
}
