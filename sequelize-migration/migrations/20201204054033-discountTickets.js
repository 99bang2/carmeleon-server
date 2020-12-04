'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('discount_tickets', 'ticket_category', {
				type: Sequelize.INTEGER,
				defaultValue: 1
			})
			await queryInterface.addColumn('discount_tickets', 'include_valet', {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			})
			await queryInterface.addColumn('discount_tickets', 'parking_start_time', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('discount_tickets', 'parking_end_time', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('discount_tickets', 'selling_start_time', {
				type: Sequelize.STRING
			})
			await queryInterface.addColumn('discount_tickets', 'selling_end_time', {
				type: Sequelize.STRING
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('discount_tickets', 'ticket_category')
			await queryInterface.removeColumn('discount_tickets', 'include_valet')
			await queryInterface.removeColumn('discount_tickets', 'parking_start_time')
			await queryInterface.removeColumn('discount_tickets', 'parking_end_time')
			await queryInterface.removeColumn('discount_tickets', 'selling_start_time')
			await queryInterface.removeColumn('discount_tickets', 'selling_end_time')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
