const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let dir = './uploads/event/'
	//파일 이름 정의, 이미지 확장자 체크, 파일명 중복 처리 필요//
	let bannerImageName = 'evt_banner_'+ctx.request.files.bannerImage.name
	let mainImageName = 'evt_banner_'+ctx.request.files.bannerImage.name
	let bannerImage = imageUpload(ctx.request.files.bannerImage.path, dir, bannerImageName)
	let mainImage = imageUpload(ctx.request.files.mainImage.path, dir, mainImageName)
	_.bannerImage = bannerImage
	_.mainImage = mainImage
	let event = await models.event.create(_)
	response.send(ctx, event)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let events = await models.event.search(_, models)
	response.send(ctx, events)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.getByUid(ctx, uid, models)
	response.send(ctx, event)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(event, _)
	await event.save()
	response.send(ctx, event)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let event = await models.event.getByUid(ctx, uid, models)
	await event.destroy()
	response.send(ctx, event)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.event.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
