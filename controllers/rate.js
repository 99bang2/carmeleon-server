const models = require('../models')
const response = require('../libs/response')
const pointLib = require('../libs/point')
const pointCodes = require('../configs/pointCodes')
const targetsMap = {
	"0": "parkingSite",
	"1": "evChargeStation",
	"2": "gasStation",
	"3": "carWash"
}

exports.create = async function (ctx) {
	let { targetUid, targetType } = ctx.params
	let _ = ctx.request.body
	let target = await models[targetsMap[targetType]].findOne({
		where:{
			uid: targetUid,
			isRate: true
		}
	})

	if(!target) {
		ctx.throw({
			code: 400,
			message: `리뷰를 쓸 수 없는 장소입니다.`
		})
	}

	// 포인트 지급
	let point = await pointLib.updatePoint(ctx.user.uid, _.picture.length > 0 ? pointCodes.REVIEW_IMAGE : pointCodes.REVIEW_TEXT)

	let rate = await models.rating.create({
		targetType: targetType,
		targetUid: targetUid,
		userUid: ctx.user.uid,
		rate: _.rate,
		reviewContent: _.reviewContent,
		picture: _.picture,
		point: point
	})
	
	//평점 업데이트
	target.rate = await models.rating.getTargetRateAvg(targetType, targetUid)
	await target.save()
	
	response.send(ctx, rate)
}
exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let rating = await models.rating.findByPk(uid)
	if(rating.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	if(rating.point > 0) {
		await pointLib.updatePoint(ctx.user.uid, pointCodes.REVIEW_DELETE, rating.point)
	}
	let target = await models[targetsMap[rating.targetType]].findOne({
		where:{
			uid: rating.targetUid
		}
	})

	//삭제처리
	await rating.destroy()

	//평점 업데이트
	target.rate = await models.rating.getTargetRateAvg(rating.targetType, rating.targetUid)
	await target.save()

	response.send(ctx, rating)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let rates = await models.rating.search(_, models)
	response.send(ctx, rates)
}

exports.userList = async function (ctx) {
	let {uid} = ctx.params
	let _ = ctx.request.query
	let rating = await models.rating.getByUserUid(ctx, uid, _, models)
	response.send(ctx, rating)
}

