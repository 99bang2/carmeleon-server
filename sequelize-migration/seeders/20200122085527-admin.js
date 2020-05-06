'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
module.exports = {
	up: async (queryInterface, Sequelize) => {
		let salt = await bcrypt.genSaltAsync(5)
		let hash = await bcrypt.hashAsync('1234', salt, null)
		let superAdmin = {
			id: 'admin',
			password: hash,
			name: '관리자',
			is_active: true,
			grade:0,
			created_at: new Date(),
			updated_at: new Date()
		}

		let admins = []
		admins.push(superAdmin)
		/*for(let i = 1; i <= 20; i++) {
			admins.push({
				id: `admin${i}`,
				password: hash,
				name: `테스트${i}`,
				is_active: true,
				grade:0,
				created_at: new Date(),
				updated_at: new Date()
			})
		}*/

		return queryInterface.bulkInsert('users', admins, {})
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('users', null, {})
	}
}
