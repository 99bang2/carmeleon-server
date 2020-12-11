'use strict';

module.exports = {
	up: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('events', 'event_custom_type', {
				type: Sequelize.STRING,
				defaultValue: 'none'
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	},
	down: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('events', 'event_custom_type')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
