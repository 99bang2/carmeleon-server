const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let parkingSite = await models.parkingSite.create(_)
    response.send(ctx, parkingSite)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let parkingSite = await models.parkingSite.search(_, models)
    response.send(ctx, parkingSite)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    response.send(ctx, parkingSite)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(parkingSite, _)
    await parkingSite.save()
    response.send(ctx, parkingSite)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.getByUid(ctx, uid)
    await parkingSite.destroy()
    response.send(ctx, parkingSite)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.parkingSite.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}