const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let evChargeStation = await models.evChargeStation.create(_)
    response.send(ctx, evChargeStation)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let evChargeStation = await models.evChargeStation.search(_, models)
    response.send(ctx, evChargeStation)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let evChargeStation = await models.evChargeStation.findByPk(uid)
    response.send(ctx, evChargeStation)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.body
    let evChargeStation = await models.evChargeStation.findByPk(uid)
    Object.assign(evChargeStation, _)
    await evChargeStation.save()
    response.send(ctx, evChargeStation)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let evChargeStation = await models.evChargeStation.findByPk(uid)
    await evChargeStation.destroy()
    response.send(ctx, evChargeStation)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.evChargeStation.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}
