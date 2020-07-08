const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let favorite = await models.favorite.create(_)
	response.send(ctx, favorite)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let favorites = await models.favorite.search(_, models)
	response.send(ctx, favorites)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let favorite = await models.favorite.getByUid(ctx, uid)
	response.send(ctx, favorite)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let favorite = await models.favorite.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(favorite, _)
	await favorite.save()
	response.send(ctx, favorite)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let favorite = await models.favorite.getByUid(ctx, uid)
	await favorite.destroy()
	response.send(ctx, favorite)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let favorite = await models.favorite.getByUserUid(ctx, userUid, models)
	response.send(ctx, favorite)
}
