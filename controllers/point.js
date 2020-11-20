const models = require('../models')
const response = require('../libs/response')
const Sequelize = require('sequelize')
exports.create = async function (ctx) {
    let _ = ctx.request.body
    let point = await models.pointLog.create(_)
	await models.user.update({point: Sequelize.literal(`point+${point}`)},{
		where: {
			uid: _.userUid
		}
	})
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

exports.userListForAdmin = async function (ctx) {
	let {userUid} = ctx.params
	let _ = ctx.request.query
	let point = await models.pointLog.getByUserUid(ctx, userUid, _)
	response.send(ctx, point)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
    let where = {
        userUid: ctx.user.uid
    }
    let offset = null
    let limit = null
    let order = [['createdAt', 'DESC']]
    if (_.page) {
        limit = 10
        offset = (Number(_.page) - 1) * limit
    }
    let result = await models.pointLog.findAll({ offset, limit, where, order})
    let count = await models.pointLog.count({ where: where})
    console.log(result)
	response.send(ctx, {
        rows: result,
        count: count
    })
}
