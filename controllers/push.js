const models = require('../models')
const response = require('../libs/response')
const commonController = require('../controllers/common')
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	_.status = 0
	let push = await models.push.create(_)
	//add Push Default Data
	response.send(ctx, push)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let pushs = await models.push.search(_, models)
	response.send(ctx, pushs)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let pushs = await models.push.userList()
	response.send(ctx, pushs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	response.send(ctx, push)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(push, _)
	await push.save()
	response.send(ctx, push)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	await push.destroy()
	response.send(ctx, push)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.push.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
