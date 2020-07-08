'use strict';
const faker = require('faker')
faker.locale = 'ko'
const favorite = [...Array(50)].map((favorite) => (
	{
		site_uid: faker.random.number({
			min:1,
			max:100
		}),
		user_uid: faker.random.number({
			min:1,
			max:100
		}),
		nickname: faker.name.title(),
		created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	}
))

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
	  return queryInterface.bulkInsert('favorites', favorite, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  return queryInterface.bulkDelete('favorites', null, {});
  }
};
