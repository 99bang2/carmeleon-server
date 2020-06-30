const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let reviewTemplate = await models.reviewTemplate.create(_)
    response.send(ctx, reviewTemplate)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let reviewTemplates = await models.reviewTemplate.search(_, models)
    response.send(ctx, reviewTemplates)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let reviewTemplate = await models.reviewTemplate.getByUid(ctx, uid, models)
    response.send(ctx, reviewTemplate)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let reviewTemplate = await models.reviewTemplate.getByUid(ctx, uid, models)
    let _ = ctx.request.body
    Object.assign(reviewTemplate, _)
    await reviewTemplate.save()
    response.send(ctx, reviewTemplate)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let reviewTemplate = await models.reviewTemplate.getByUid(ctx, uid, models)
    await reviewTemplate.destroy()
    response.send(ctx, reviewTemplate)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult= await models.reviewTemplate.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}