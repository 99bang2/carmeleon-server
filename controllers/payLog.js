const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let payLog = await models.payLog.create(_)
	response.send(ctx, payLog)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let payLogs = await models.payLog.search(_, models)
	response.send(ctx, payLogs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	response.send(ctx, payLog)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(payLog, _)
	await payLog.save()
	response.send(ctx, payLog)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid)
	await payLog.destroy()
	response.send(ctx, payLog)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let payLog = await models.payLog.getByUserUid(ctx, userUid, models)
	response.send(ctx, payLog)
}
