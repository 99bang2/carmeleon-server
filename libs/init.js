'use strict'
const models = require('../models')
exports.start = async function () {
	let superAdmin = await models.account.findOne({
		where: {
			id: 'admin'
		}
	})
	if(!superAdmin) {
		models.account.create({
			id: 'admin',
			password: 'admin',
			name: '관리자',
			grade: 0
		})
	}
	let pointGames = await models.pointGame.count()
	if(pointGames === 0) {
		let pointGameArray = [{
			point: 10, probability: 10000
		},{
			point: 20, probability: 20160
		},{
			point: 30, probability: 29780
		},{
			point: 50, probability: 25000
		},{
			point: 100, probability: 15000
		},{
			point: 5000, probability: 50
		},{
			point: 10000, probability: 9
		},{
			point: 30000, probability: 1
		}]
		models.pointGame.bulkCreate(pointGameArray)
	}
}
