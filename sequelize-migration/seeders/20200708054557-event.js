'use strict';
const faker = require('faker')
faker.locale = 'ko'
const event = [...Array(20)].map((event) => (
	{
		title:faker.lorem.words(),
		main_image: "http://lorempixel.com/800/800/",
		banner_image: "http://lorempixel.com/800/200/",
		event_type: faker.random.number({
			min:0,
			max:1
		}),
		is_open: 1,
		account_uid: 1,
		start_date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		end_date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
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
	  return queryInterface.bulkInsert('events', event, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  return queryInterface.bulkDelete('events', null, {});
  }
};
