const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let point = await models.pointLog.create(_)
    response.send(ctx, point)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let points = await models.pointLog.search(_, models)
    response.send(ctx, points)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.pointLog.getByUid(ctx, uid)
    response.send(ctx, point)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.pointLog.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(point, _)
    await point.save()
    response.send(ctx, point)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.pointLog.getByUid(ctx, uid)
    await point.destroy()
    response.send(ctx, point)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let _ = ctx.request.query
	let point = await models.pointLog.getByUserUid(ctx, _, userUid)
	response.send(ctx, point)
}
