'use strict';
const faker = require('faker')
faker.locale = 'ko'
const notice = [...Array(20)].map((notice) => (
	{
		title:faker.lorem.words(),
		content:faker.lorem.sentence(),
		notice_type: faker.random.number({
			min:0,
			max:2
		}),
		is_open: 1,
		account_uid: 1,
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
	  return queryInterface.bulkInsert('notices', notice, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
	  //return queryInterface.bulkDelete('notices', null, { truncate: { cascade: true }});
  }
};
