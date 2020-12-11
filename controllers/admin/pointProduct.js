const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let pointProduct = await models.pointProduct.create(_)
    response.send(ctx, pointProduct)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let pointProducts = await models.pointProduct.search(_, models)
    response.send(ctx, pointProducts)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let pointProduct = await models.pointProduct.getByUid(ctx, uid, models)
    response.send(ctx, pointProduct)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let pointProduct = await models.pointProduct.getByUid(ctx, uid, models)
    let _ = ctx.request.body
    Object.assign(pointProduct, _)
    await pointProduct.save()
    response.send(ctx, pointProduct)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let pointProduct = await models.pointProduct.getByUid(ctx, uid, models)
    await pointProduct.destroy()
    response.send(ctx, pointProduct)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult= await models.pointProduct.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}
