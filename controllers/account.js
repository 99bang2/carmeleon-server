const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let account = await models.account.create(_)
	response.send(ctx, account)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let accounts = await models.account.search(_, models)
	response.send(ctx, accounts)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	response.send(ctx, account)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(account, _)
	await account.save()
	response.send(ctx, account)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let account = await models.account.getByUid(ctx, uid)
	await account.destroy()
	response.send(ctx, account)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.account.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
