'use strict';
const giftCards = [...Array(1000)].map(() =>
	{
		let n1 = 'H' + String(Math.floor(Math.random() * (999 - 100 + 1)) + 100)
		let n2 = String(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000)
		let n3 = String(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000)
		let n4 = String(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000)
		return {
			code: n1 + n2 + n3 + n4,
			status: 'CREATED',
			price: 10000,
			account_uid: 3,
			publisher: 'homeplus',
			created_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
			updated_at: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		}
	}
)

module.exports = {
  up: (queryInterface, Sequelize) => {
	  return queryInterface.bulkInsert('gift_cards', giftCards, {});
  },
  down: (queryInterface, Sequelize) => {
  }
};
