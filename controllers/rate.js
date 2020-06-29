const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let rate = await models.rating.create(_)
	response.send(ctx, rate)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let rates = await models.rating.search(_, models)
	response.send(ctx, rates)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rating.getByUid(ctx, uid)
	response.send(ctx, rate)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rating.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(rate, _)
	await rate.save()
	response.send(ctx, rate)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rating.getByUid(ctx, uid)
	await rate.destroy()
	response.send(ctx, rate)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.rating.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

//주차장 uid로 조회
exports.siteList = async function (ctx) {
	let {siteUid} = ctx.params
	let rate = await models.rating.getBySiteUid(ctx, siteUid)
	response.send(ctx, rate)
}
