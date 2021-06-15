const models = require('../../models')
const response = require('../../libs/response')

exports.list = async function (ctx) {
	let _ = ctx.request.query
    let where = { userUid: ctx.user.uid }
    let offset = null
    let limit = null
    let order = [['createdAt', 'DESC']]
    if (_.page) {
        limit = 10
        offset = (Number(_.page) - 1) * limit
    }
    let result = await models.pointLog.findAll({ offset, limit, where, order})
    let count = await models.pointLog.count({ where: where})
	response.send(ctx, {
        rows: result,
        count: count
    })
}
