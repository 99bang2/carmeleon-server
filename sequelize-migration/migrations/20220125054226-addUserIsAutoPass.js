'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		try {
			await queryInterface.addColumn('users', 'is_auto_pass', {
				type: Sequelize.BOOLEAN
			})
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
  },

  down: async(queryInterface, Sequelize) => {
		try {
			await queryInterface.removeColumn('users', 'is_auto_pass')
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
  }
};
