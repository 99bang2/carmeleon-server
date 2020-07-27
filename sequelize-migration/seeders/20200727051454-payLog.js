'use strict';
const faker = require('faker');
faker.locale = 'ko'
const payLog = [...Array(1000)].map((payLog) => (
	{
		car_number : faker.random.number({
			'min': 10,
			'max': 999
		})+faker.name.lastName()+faker.random.number({
			'min': 1111,
			'max': 9999
		}),
		phone_number : faker.phone.phoneNumber(),
		reserve_time : "12:00~18:00",
		pay_type : "card",
		status : faker.random.number({
			'min': 0,
			'max': 5
		}),
		price: faker.random.number({
			'min': 1,
			'max': 10
		})*1000,
		discount_price: faker.random.number({
			'min': 1,
			'max': 10
		})*1000,
		total_price: faker.random.number({
			'min': 1,
			'max': 10
		})*1000,
		fee: faker.random.number({
			'min': 1,
			'max': 10
		})*1000 * 0.2,
		user_uid : faker.random.number({
			'min': 1,
			'max': 50
		}),
		site_uid : faker.random.number({
			'min': 1,
			'max': 100
		}),
		discount_ticket_uid : faker.random.number({
			'min': 1,
			'max': 100
		}),
		created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	}
))
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('pay_logs', payLog, {});
	},

	down: (queryInterface, Sequelize) => {
		/*
		  Add reverting commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.bulkDelete('People', null, {});
		*/
		return queryInterface.bulkDelete('pay_logs', null, { truncate: { cascade: true }});
	}
};
