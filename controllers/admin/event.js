const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	if(_.endDate === '') {
		_.endDate = null
	}
	let event = await models.event.create(_)
	response.send(ctx, event)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let events = await models.event.search(_, models)
	response.send(ctx, events)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	response.send(ctx, event)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	if(_.endDate === '') {
		_.endDate = null
	}
	Object.assign(event, _)
	await event.save()
	response.send(ctx, event)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	await event.destroy()
	response.send(ctx, event)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.event.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}