const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let popup = await models.popup.create(_)
	response.send(ctx, popup)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let popups = await models.popup.search(_, models)
	response.send(ctx, popups)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let popup = await models.popup.findByPk(uid)
	response.send(ctx, popup)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let popup = await models.popup.findByPk(uid)
	let _ = ctx.request.body
	Object.assign(popup, _)
	await popup.save()
	response.send(ctx, popup)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let popup = await models.popup.findByPk(uid)
	await popup.destroy()
	response.send(ctx, popup)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.popup.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}