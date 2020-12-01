const models = require('../models')
const response = require('../libs/response')

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let where = { isOpen: 1}
	let order = [ ['noticeType', 'ASC'], ['createdAt', 'DESC']]
	let notices = await models.notice.findAll({ where, order })
	response.send(ctx, notices)
}