const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let admin = await models.admin.create(_)
	response.send(ctx, admin)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let admins = await models.admin.search(_, models)
	response.send(ctx, admins)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let admin = await models.admin.getByUid(ctx, uid)
	response.send(ctx, admin)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let admin = await models.admin.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(admin, _)
	await admin.save()
	response.send(ctx, admin)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let admin = await models.admin.getByUid(ctx, uid)
	await admin.destroy()
	response.send(ctx, admin)
}