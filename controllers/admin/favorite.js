const models = require('../../models')
const response = require('../../libs/response')

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
