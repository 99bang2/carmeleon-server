const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let {pushType} = _
	let {userUid} = _

	if (pushType === "3" && Array.isArray(userUid)) {
		let pushs = await Promise.all(userUid.map(async (id) => {
			let user = await models.user.getByUid(ctx, id)
			_.userUid = id
			_.userToken = user.token
			let newPush =  await models.push.create(_)
			return newPush
		}))
		response.send(ctx, pushs)
	} else {
		if (pushType === "1" && pushType === "3") {
			let user = await models.user.getByUid(ctx, _.userUid)
			_.userToken = user.token
		}
		let push = await models.push.create(_)
		response.send(ctx, push)
	}
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let pushs = await models.push.search(_, models)
	response.send(ctx, pushs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	response.send(ctx, push)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	let {pushType} = _
	let {userUid} = _

	if (pushType === "3" && Array.isArray(userUid)) {
		let pushs = await Promise.all(userUid.map(async (id, index) => {
			let user = await models.user.getByUid(ctx, id)
			_.userUid = id
			_.userToken = user.token
			if (index === 0) {
				Object.assign(push, _)
				await push.save()
				return push
			} else {
				delete _.uid
				let newPush =  await models.push.create(_)
				return newPush
			}
		}))
		response.send(ctx, pushs)
	} else {
		if (pushType === "2") {
			_.userToken = null
		} else {
			let user = await models.user.getByUid(ctx, userUid)
			_.userToken = user.token
		}
		Object.assign(push, _)
		await push.save()
		response.send(ctx, push)
	}
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	await push.destroy()
	response.send(ctx, push)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.push.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
