const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let seasonTicket = await models.seasonTicket.create(_)
    response.send(ctx, seasonTicket)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let seasonTicket = await models.seasonTicket.search(_, models)
	response.send(ctx, seasonTicket)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let seasonTicket = await models.seasonTicket.getByUid(ctx, uid)
    response.send(ctx, seasonTicket)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let seasonTicket = await models.seasonTicket.getByUid(ctx, uid)
    let _ = ctx.request.body
    Object.assign(seasonTicket, _)
    await seasonTicket.save()
    response.send(ctx, seasonTicket)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let seasonTicket = await models.seasonTicket.getByUid(ctx, uid)
    await seasonTicket.destroy()
    response.send(ctx, seasonTicket)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.seasonTicket.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}
