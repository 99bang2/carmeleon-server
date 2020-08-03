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
		  await queryInterface.addColumn('discount_tickets', 'ticket_price_discount', {
			  type: Sequelize.INTEGER
		  });
		  await queryInterface.addColumn('discount_tickets', 'ticket_price_discount_percent', {
			  type: Sequelize.INTEGER
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
		  await queryInterface.removeColumn('discount_tickets', 'ticket_price_discount');
		  await queryInterface.removeColumn('discount_tickets', 'ticket_price_discount_percent');
		  return Promise.resolve();
	  } catch (e) {
		  return Promise.reject(e);
	  }
  }
};
