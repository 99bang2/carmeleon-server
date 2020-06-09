const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let point = await models.point.create(_)
    response.send(ctx, point)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let points = await models.point.search(_, models)
    response.send(ctx, points)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.point.getByUid(ctx, uid)
    response.send(ctx, point)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.point.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(point, _)
    await point.save()
    response.send(ctx, point)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let point = await models.point.getByUid(ctx, uid)
    await point.destroy()
    response.send(ctx, point)
}