const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let question = await models.question.create(_)
    response.send(ctx, question)
}
