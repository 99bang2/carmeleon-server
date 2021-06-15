const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')

exports.list = async function (ctx) {
	let now = moment().format('YYYY-MM-DD')
	let where = {
		isOpen: true,
		startDate: {
			[models.Sequelize.Op.lte]: now
		},
		endDate: {
			[models.Sequelize.Op.gte]: now
		}
	}
	let limit = 6
	let order = [['createdAt', 'DESC']]
	let popups = await models.popup.findAll({where, order, limit})
	response.send(ctx, popups)
}
