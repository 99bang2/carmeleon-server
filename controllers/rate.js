const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let rate = await models.rate.create(_)
	response.send(ctx, rate)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let rates = await models.rate.search(_, models)
	response.send(ctx, rates)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rate.getByUid(ctx, uid)
	response.send(ctx, rate)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rate.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(rate, _)
	await rate.save()
	response.send(ctx, rate)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rate.getByUid(ctx, uid)
	await rate.destroy()
	response.send(ctx, rate)
}