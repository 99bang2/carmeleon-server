const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let couponLog = await models.couponLog.create(_)
	response.send(ctx, couponLog)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let couponLogs = await models.couponLog.search(_, models)
	response.send(ctx, couponLogs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let couponLog = await models.couponLog.getByUid(ctx, uid)
	response.send(ctx, couponLog)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let couponLog = await models.couponLog.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(couponLog, _)
	await couponLog.save()
	response.send(ctx, couponLog)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let couponLog = await models.couponLog.getByUid(ctx, uid)
	await couponLog.destroy()
	response.send(ctx, couponLog)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let couponLog = await models.couponLog.getByUserUid(ctx, userUid, models)
	response.send(ctx, couponLog)
}
