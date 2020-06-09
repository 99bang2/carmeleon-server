const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
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
	let event = await models.event.getByUid(ctx, uid)
	response.send(ctx, event)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(event, _)
	await event.save()
	response.send(ctx, event)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid)
	await event.destroy()
	response.send(ctx, event)
}