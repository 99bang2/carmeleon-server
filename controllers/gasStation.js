const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let gasStation = await models.gasStation.create(_)
    response.send(ctx, gasStation)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let gasStation = await models.gasStation.search(_, models)
	response.send(ctx, gasStation)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let gasStation = await models.gasStation.getByUid(ctx, uid)
    response.send(ctx, gasStation)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let gasStation = await models.gasStation.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(gasStation, _)
    await gasStation.save()
    response.send(ctx, gasStation)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let gasStation = await models.gasStation.getByUid(ctx, uid)
    await gasStation.destroy()
    response.send(ctx, gasStation)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.gasStation.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let gasStation = await models.gasStation.userSearch(_, models)
	response.send(ctx, gasStation)
}
