const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let question = await models.question.create(_)
    response.send(ctx, question)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let questions = await models.question.search(_, models)
    response.send(ctx, questions)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let question = await models.question.getByUid(ctx, uid, models)
    response.send(ctx, question)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let question = await models.question.getByUid(ctx, uid, models)
    let _ = ctx.request.body
    Object.assign(question, _)
    await question.save()
    response.send(ctx, question)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let question = await models.question.getByUid(ctx, uid, models)
    await question.destroy()
    response.send(ctx, question)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult= await models.question.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}
