'use strict';
const faker = require('faker')
faker.locale = 'ko'
const users_kakao = [...Array(10)].map((users_kakao) => (
	{
		id: 'kakao-'+faker.random.number(),
		name: faker.name.lastName()+faker.name.firstName(),
		sns_type: 'kakao',
		nickname: faker.internet.userName(),
		email: faker.internet.email(),
		phone: faker.phone.phoneNumber(),
		profile_image: faker.image.avatar(),
		point: faker.random.number({
			min:1,
			max:9
		})*1000,
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
	  return queryInterface.bulkInsert('users', users_kakao, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  //return queryInterface.bulkDelete('users', null, { truncate: { cascade: true }});
  }
};
