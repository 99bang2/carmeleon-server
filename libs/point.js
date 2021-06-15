'use strict'
const models = require('../models')
const moment = require('moment')
const response 		= require('../libs/response')
/**
 * 포인트 지급/사용
 * @param userUid
 * @param pointCode
 * @param point
 * @returns {Promise<*>}
 */
exports.updatePoint = async function (userUid, pointCode, point = 0) {
	let user = await models.user.findByPk(userUid)
	point = point > 0 ? point : pointCode.amount
	// 리뷰 중복 체크
	if(pointCode.id === 2000 || pointCode.id === 2100){
		let checkPointCount = await models.pointLog.count({
			where: {
				userUid: userUid,
				codeId: {
					[models.Sequelize.Op.in]: [2000, 2100]
				},
				createdAt: {
					[models.Sequelize.Op.gte]: moment().format('YYYY-MM-DD')
				}
			}
		})
		if(checkPointCount >= 5){
			point = 0
		}
	}
	if(point > 0) {
		await models.pointLog.create({
			userUid: userUid,
			point: pointCode.isPlus ? point : (point * -1),
			codeId: pointCode.id,
			reason: pointCode.reason
		})
		user.point = pointCode.isPlus ? user.point + point : user.point - point
		await user.save()
	}

	return point
}

exports.updateCoopPayment = async function(data) {
	let user = await models.user.findByPk(data.userUid)
	let usage = data.usageType === 'use' ? data.price * (-1) : data.price

	if (user.coopPayment + usage >= 0) {
		user.coopPayment += usage
		await user.save()
		await models.coopPaymentLog.create(data)
	} else {
		response.validationError(ctx)
	}
}
