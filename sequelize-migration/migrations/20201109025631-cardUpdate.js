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
			await queryInterface.removeColumn('cards', 'card_info')
			// cardNumber
			// cardCode
			// expiryYear
			// expiryMonth
			// cardPassword
			// cardId
			// billKey
			await queryInterface.addColumn('cards', 'card_number', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'card_code', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'expiry_year', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'expiry_month', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'card_password', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'card_id', {
				type: Sequelize.STRING,
			})
			await queryInterface.addColumn('cards', 'bill_key', {
				type: Sequelize.STRING,
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
			await queryInterface.addColumn('cards', 'card_info', {
				type: Sequelize.JSON,
			})
			await queryInterface.removeColumn('cards', 'card_number')
			await queryInterface.removeColumn('cards', 'card_code')
			await queryInterface.removeColumn('cards', 'expiry_year')
			await queryInterface.removeColumn('cards', 'expiry_month')
			await queryInterface.removeColumn('cards', 'card_password')
			await queryInterface.removeColumn('cards', 'card_id')
			await queryInterface.removeColumn('cards', 'bill_key')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
