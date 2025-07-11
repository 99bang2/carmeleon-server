
const models = require('../../models')
const response = require('../../libs/response')

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let rates = await models.rating.search(_, models)
	response.send(ctx, rates)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let rate = await models.rating.getByUid(ctx, uid)
	response.send(ctx, rate)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.rating.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}

//targetUid로 조회
exports.targetList = async function (ctx) {
	let {targetType, targetUid} = ctx.params
	let rate = await models.rating.getByTargetUid(ctx, targetType, targetUid)
	response.send(ctx, rate)
}

exports.userList = async function (ctx) {
	let {uid} = ctx.params
	let _ = ctx.request.query
	let rating = await models.rating.getByUserUid(ctx, uid, _, models)
	response.send(ctx, rating)
}

exports.checkAvailable = async function (ctx) {
	let _ = ctx.request.query
	let checkCount = 0
	_.rateType = true
	if(_.targetType === 0){
		let checkCount = await models.rating.checkPay(_, models)
		_.rateType = checkCount === 0;
	}
	let checkRate = await models.rating.checkRate(_)
	if(_.rateType === false && (checkRate >= checkCount)){
		ctx.throw({
			code: 400,
			message: '이미 평가를 완료 했습니다.'
		})
	}
	if(_.rateType === true && checkRate > 0){
		ctx.throw({
			code: 400,
			message: '이미 평가를 완료 했습니다.'
		})
	}
	response.send(ctx, true)
}
