const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')

exports.list = async function (ctx) {
	let now = moment().format('YYYY-MM-DD')
	let where = {
		isOpen: true,
		startDate: {
			[models.Sequelize.Op.lte]: now
		}
	}
	let order = [['createdAt', 'DESC']]
	let events = await models.event.findAll({where, order})
	response.send(ctx, events)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	response.send(ctx, event)
}
