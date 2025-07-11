'use strict';
const faker = require('faker');
faker.locale = 'ko'
const rate = [...Array(1000)].map((rate) => (
	{
		target_type : 0,
		target_uid : faker.random.number({
			'min': 1,
			'max': 100
		}),
		user_uid: faker.random.number({
			'min': 1,
			'max': 20
		}),
		rate: faker.random.number({
			'min': 1,
			'max': 10
		}),
		review: faker.lorem.words(),
		created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	}
))
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert('ratings', rate, {});
	},

	down: (queryInterface, Sequelize) => {
		/*
		  Add reverting commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.bulkDelete('People', null, {});
		*/
		return queryInterface.bulkDelete('ratings', null, { truncate: { cascade: true }});
	}
};
