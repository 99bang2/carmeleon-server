const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let evCharger = await models.evCharger.create(_)
    response.send(ctx, evCharger)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let evCharger = await models.evCharger.search(_, models)
	response.send(ctx, evCharger)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let evCharger = await models.evCharger.getByUid(ctx, uid)
    response.send(ctx, evCharger)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let evCharger = await models.evCharger.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(evCharger, _)
    await evCharger.save()
    response.send(ctx, evCharger)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let evCharger = await models.evCharger.getByUid(ctx, uid)
    await evCharger.destroy()
    response.send(ctx, evCharger)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.evCharger.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let evCharger = await models.evCharger.userSearch(_, models)
	response.send(ctx, evCharger)
}
