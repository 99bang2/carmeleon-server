const models = require('../../models')
const response = require('../../libs/response')
exports.list = async function (ctx) {
    let _ = ctx.request.query
    let pointOrders = await models.pointOrder.search(_, models)
    response.send(ctx, pointOrders)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let pointOrder = await models.pointOrder.findByPk(uid)
    let _ = ctx.request.body
    Object.assign(pointOrder, _)
    await pointOrder.save()
    response.send(ctx, pointOrder)
}