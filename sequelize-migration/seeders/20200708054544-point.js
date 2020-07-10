'use strict';
const faker = require('faker')
faker.locale = 'ko'
const point = [...Array(1000)].map((point) => (
	{
		user_uid: faker.random.number({
			min:1,
			max:20
		}),
		point: faker.random.number({
			min:-9,
			max:9
		})*100,
		reason: faker.lorem.words(),
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
	  return queryInterface.bulkInsert('point_logs', point, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  return queryInterface.bulkDelete('point_logs', null, { truncate: { cascade: true }});
  }
};
