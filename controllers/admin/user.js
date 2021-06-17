const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let user = await models.user.create(_)
    response.send(ctx, user)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let users = await models.user.search(_, models)
    response.send(ctx, users)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
    response.send(ctx, user)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
	if(user.uid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
    let _ = ctx.request.body
    Object.assign(user, _)
    await user.save()
	let data = {
    	user: user,
	}
    response.send(ctx, data)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let user = await models.user.getByUid(ctx, uid)
    await user.destroy()
    response.send(ctx, user)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.user.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

exports.carList = async function (ctx) {
	let {userUid} = ctx.params
	let cars = await models.car.getByUserUid(ctx, userUid)
	response.send(ctx, cars)
}

exports.cardList = async function (ctx) {
	let {userUid} = ctx.params
	let cards = await models.card.getByUserUid(ctx, userUid)
	response.send(ctx, cards)
}

exports.pointLogList = async function (ctx) {
	let {userUid} = ctx.params
	let _ = ctx.request.query
	let pointLogs = await models.pointLog.getByUserUid(ctx, userUid, _)
	response.send(ctx, pointLogs)
}
