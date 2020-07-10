'use strict';
const faker = require('faker')
faker.locale = 'ko'
const parkingSite = [...Array(100)].map((parkingSite) => (
	{
		name: faker.company.companyName()+' 주차장',
		site_type: faker.random.number({
			'min': 0,
			'max': 2
		}),
		lat: faker.random.number({
			min: 37.359166,
			max: 37.372645,
			precision: 0.000001
		}),
		lon: faker.random.number({
			min: 127.104852,
			max: 127.122220,
			precision: 0.000001
		}),
		parking_lot: faker.random.number({
			min:20,
			max:50
		}),
		tel: faker.phone.phoneNumber(),
		phone: faker.phone.phoneNumber(),
		email: faker.internet.email(),
		manager: faker.name.lastName()+faker.name.firstName(),
		is_active: 1,
		payment_tag: '\["card", "cash"\]',
		brand_tag: '\["hiParking,cityOfSeoul"\]',
		product_tag: '\["timePass", "dayPass"\]',
		option_tag: '\["cityOfSeoul", "pregnant"\]',
		car_tag: '\["bus"\]',
		price: faker.random.number({
			min:1,
			max:9
		})*1000,
		address: faker.address.state(),
		info: faker.random.words(),
		price_info: faker.random.number(),
		rate: faker.random.number({
			'min': 1,
			'max': 10
		}),
		picture: '\["'+faker.image.avatar()+'","'+faker.image.avatar()+'"\]',
		created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
		updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	}
))
module.exports = {
  up: (queryInterface, Sequelize) => {
	  return queryInterface.bulkInsert('parking_sites', parkingSite, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  //return queryInterface.bulkDelete('parking_sites', null, { where:uid<100});
  }
};

