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
			await queryInterface.removeColumn('ratings', 'review_template_uid');
			await queryInterface.removeColumn('ratings', 'review_title');
			await queryInterface.addColumn('ratings', 'picture', {
				type: Sequelize.JSON
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
			await queryInterface.addColumn('ratings', 'review_template_uid',{
				type: Sequelize.INTEGER
			});
			await queryInterface.addColumn('ratings', 'review_title',{
				type: Sequelize.STRING
			});
			await queryInterface.removeColumn('ratings', 'picture');
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
};
