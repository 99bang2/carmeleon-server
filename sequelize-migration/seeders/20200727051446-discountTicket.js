'use strict';
const faker = require('faker');
faker.locale = 'ko'
const discountTicket = [...Array(1000)].map((discountTicket) => (
	{
		site_uid : faker.random.number({
			'min': 1,
			'max': 100
		}),
		ticket_type: faker.random.number({
			'min': 1,
			'max': 4
		}),
		ticket_time: faker.random.number({
			'min': 1,
			'max': 24
		}),
		ticket_day_type: faker.random.number({
			'min': 1,
			'max': 3
		}),
		ticket_price: faker.random.number({
			'min': 1,
			'max': 10
		})*1000,
		is_active : 0,
		created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	}
))
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('discount_tickets', discountTicket, {});
	},

	down: (queryInterface, Sequelize) => {
		/*
		  Add reverting commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.bulkDelete('People', null, {});
		*/
		return queryInterface.bulkDelete('discount_tickets', null, { truncate: { cascade: true }});
	}
};
