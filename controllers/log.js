const models = require('../models')
const response = require('../libs/response')

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let logs = await models.openDoorLog.search(_,  models)
	response.send(ctx, logs)
}