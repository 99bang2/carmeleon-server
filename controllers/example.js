const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let example = await models.example.create(_)
	response.send(ctx, example)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let examples = await models.example.search(_, models)
	response.send(ctx, examples)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let example = await models.example.getByUid(ctx, uid)
	response.send(ctx, example)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let example = await models.example.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(example, _)
	await example.save()
	response.send(ctx, example)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let example = await models.example.getByUid(ctx, uid)
	await example.destroy()
	response.send(ctx, example)
}