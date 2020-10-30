
const models = require('../models')
const response = require('../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let checkSelf = await models.rateTip.checkSelf(ctx, _, models)
	if(checkSelf > 0){
		ctx.throw({
			code: 400,
			message: '자신의 글은 추천할 수 없습니다.'
		})
	}
	let checkTipCount = await models.rateTip.checkTip(ctx, _)
	let rateTip
	if(checkTipCount > 0) {
		//tip : true, false
		rateTip = await models.rateTip.getByParams(ctx, _)
		console.log(rateTip.rateTip)
		if(rateTip.rateTip === false){
			_.rateTip = true
			Object.assign(rateTip, _)
			await rateTip.save()
		}else{
			_.rateTip = false
			Object.assign(rateTip, _)
			await rateTip.save()
		}
	}else{
		rateTip = await models.rateTip.create(_)
	}
	response.send(ctx, rateTip)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let rateTips = await models.rateTip.search(_, models)
	response.send(ctx, rateTips)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let rateTip = await models.rateTip.getByUid(ctx, uid, models)
	await rateTip.destroy()
	response.send(ctx, rateTip)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.rateTip.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
