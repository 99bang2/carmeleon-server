const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let door = await models.door.create(_)
	if(_.tags.length > 0) {
		await door.addTags(_.tags)
	}
	response.send(ctx, door)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	if(ctx.admin.grade === 'COMPLEX') {
		_.complexUid = ctx.admin.complexUid
	}
	let doors = await models.door.search(_, models)
	response.send(ctx, doors)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let door = await models.door.getByUid(ctx, uid)
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(door.complexUid) ) {
		response.forbidden(ctx)
	}
	response.send(ctx, door)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let door = await models.door.getByUid(ctx, uid)
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(door.complexUid) ) {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	Object.assign(door, _)
	await door.save()
	await door.setTags([])
	await door.addTags(_.tags)
	response.send(ctx, door)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let door = await models.door.getByUid(ctx, uid)
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(door.complexUid) ) {
		response.forbidden(ctx)
	}
	await door.destroy()
	response.send(ctx, door)
}

exports.bulkDelete = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	let deleteResult = await models.door.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}