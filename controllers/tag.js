const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let alreadyTag = await models.tag.findOne({
		where: {
			complexUid: _.complexUid,
			name: _.name
		}
	})
	if(alreadyTag) {
		response.customError(ctx, '이미 추가한 태그입니다.')
	}
	let tag = await models.tag.create(_)
	if(_.doors.length > 0) {
		await tag.addDoors(_.doors)
	}
	response.send(ctx, tag)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let tags = await models.tag.search(_, models)
	response.send(ctx, tags)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	if( ctx.admin.grade !== 'SUPER' && Number(ctx.admin.complexUid) !== Number(_.complexUid) ) {
		response.forbidden(ctx)
	}
	let tag = await models.tag.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(tag, _)
	await tag.save()
	await tag.setDoors([])
	await tag.addDoors(_.doors)
	response.send(ctx, tag)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	if( ctx.admin.grade !== 'SUPER' ) {
		response.forbidden(ctx)
	}
	let tag = await models.tag.getByUid(ctx, uid)
	await tag.destroy()
	response.send(ctx, tag)
}

exports.bulkDelete = async function (ctx) {
	if(ctx.admin.grade !== 'SUPER') {
		response.forbidden(ctx)
	}
	let _ = ctx.request.body
	let deleteResult = await models.tag.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}