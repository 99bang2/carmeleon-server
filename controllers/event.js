const models = require('../models')
const response = require('../libs/response')
const imageUpload = require('../libs/imageUpload')
const dir = './uploads/event/'
const folder = 'event/'

exports.create = async function (ctx) {
	let _ = ctx.request.body
	if(!ctx.request.files.bannerImage){
		ctx.throw({
			code: 400,
			message: '배너 이미지가 등록되지 않았습니다.'
		})
	}
	if(!ctx.request.files.mainImage){
		ctx.throw({
			code: 400,
			message: '메인 이미지가 등록되지 않았습니다.'
		})
	}
	//파일 이름 정의, 이미지 확장자 체크, 파일명 중복 처리 필요//
	_.bannerImage = imageUpload.imageUpload(ctx, ctx.request.files.bannerImage, dir, folder,'evt_banner_')
	_.mainImage = imageUpload.imageUpload(ctx, ctx.request.files.mainImage, dir, folder,'evt_main_')
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
	if(ctx.request.files.bannerImage){
		_.bannerImage = imageUpload.imageUpload(ctx, ctx.request.files.bannerImage, dir, folder, 'evt_banner_')
	}
	if(ctx.request.files.mainImage){
		_.mainImage = imageUpload.imageUpload(ctx, ctx.request.files.mainImage, dir, folder, 'evt_main_')
	}
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
