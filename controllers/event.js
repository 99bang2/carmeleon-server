const models = require('../models')
const response = require('../libs/response')

exports.list = async function (ctx) {
	let where = { isOpen: true }
	let order = [['createdAt', 'DESC']]
	let events = await models.event.findAll({where, order})
	response.send(ctx, events)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	response.send(ctx, event)
}