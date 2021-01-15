const models = require('../models')
const response = require('../libs/response')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let currentDate = moment(moment().format('YYYY-MM-DD'))
	let currentDay = parseInt(moment().format('E'))
	let currentDayType = (currentDay === 0 || currentDay === 6) ? 2 : 1
	let discountTicket = await models.discountTicket.findByPk(_.discountTicketUid)
	//구매/사용가능 요일 체크
	if(discountTicket.ticketDayType < 3) {
		if(currentDayType !== discountTicket.ticketDayType) {
			response.customError(ctx, '현재 구매 불가능한 상품입니다.')
		}
	}
	//판매기간 체크
	let startDate = moment(moment(discountTicket.ticketStartDate).format('YYYY-MM-DD'))
	let endDate = moment(moment(discountTicket.ticketEndDate).format('YYYY-MM-DD'))
	if(currentDate.isBefore(startDate) || currentDate.isAfter(endDate)) {
		response.customError(ctx, '현재 구매 불가능한 상품입니다.')
	}
	//매진체크
	let todayCount = await models.payLog.count({
		where: {
			discountTicketUid: _.discountTicketUid,
			createdAt: {
				[Op.gte]: currentDate.format('YYYY-MM-DD')
			},
			status: {
				[Op.in]: [0, 10]
			}
		}
	})
	if(todayCount >= discountTicket.ticketCount) {
		response.customError(ctx, '매진된 상품입니다.')
	}

	let user = await models.user.findByPk(ctx.user.uid)
	let sellingPrice = discountTicket.ticketPrice - discountTicket.ticketPriceDiscount // 판매가
	let discountPrice = 0 // 경감차량 할인금액 todo:경감차량 할인
	let discountType = 0 //경감차량 할인유형 todo:경감차량 할인
	let price = sellingPrice - discountPrice // 경감차량할인된 가격
	let point = Number(_.point) // 유저가 사용할 포인트
	let fee = price * Number(discountTicket.fee) / 100 //수수료
	let totalPrice = price - point
	if(totalPrice !== Number(_.totalPrice)) {
		response.customError(ctx, '잘못된 요금입니다.')
	}
	if(point > 0 && (price < 10000 || user.point < 10000)) {
		response.customError(ctx, '포인트를 사용할 수 없습니다.')
	}
	//카드 유효성 체크
	let card = await models.card.findOne({
		where: {
			uid: _.cardUid,
			userUid: user.uid
		}
	})
	if(!card) {
		response.customError(ctx, '잘못된 카드 정보입니다.')
	}

	let payLog = await models.payLog.create({
		carNumber: _.carNumber,
		phoneNumber: user.phone || '01000000000',
		reserveTime: _.reserveTime,
		payType: _.payType,
		status: 0,
		sellingPrice: sellingPrice,
		discountPrice: discountPrice,
		discountType: discountType,
		price: price,
		point: point,
		fee: fee,
		totalPrice: totalPrice,
		userUid: user.uid,
		siteUid: _.siteUid,
		discountTicketUid: discountTicket.uid,
		cardUid: card.uid,
		email: user.email || 'mobilx.carmeleon@gmail.com',
		activeStatus: false,
		cancelStatus: -1,
		expired: false,
	})
	response.send(ctx, payLog)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let payLogs = await models.payLog.search(_, models)
	response.send(ctx, payLogs)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	response.send(ctx, payLog)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(payLog, _)
	await payLog.save()
	response.send(ctx, payLog)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let payLog = await models.payLog.getByUid(ctx, uid, models)
	await payLog.destroy()
	response.send(ctx, payLog)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let payLog = await models.payLog.getByUserUid(ctx, _, models)
	response.send(ctx, payLog)
}

exports.userListForAdmin = async function (ctx) {
	let {userUid} = ctx.params
	let payLog = await models.payLog.getByUserUidForAdmin(ctx, userUid, models)
	response.send(ctx, payLog)
}

exports.activeTicketList = async function (ctx) {
	let ticketList = await models.payLog.activeTicketList(ctx, models)
	response.send(ctx, ticketList)
}

exports.refundRequest = async function (ctx) {
	let _ = ctx.request.body
	let count = await models.payLog.count({
		where: {
			uid: _.uid,
			userUid: ctx.user.uid
		}
	})
	if (count === 0) {
		ctx.throw({
			code: 400,
			message: '거래 내역이 존재하지 않습니다.'
		})
	}
	await models.payLog.update({cancelStatus: 0, cancelReason: _.cancelReason, cancelRequestTime: Sequelize.fn('NOW')}, {
		where: {
			uid: _.uid
		}
	})
	response.send(ctx, true)
}

exports.refundRequestCancel = async function (ctx) {
	let _ = ctx.request.body
	let count = await models.payLog.count({
		where: {
			uid: _.uid,
			userUid: ctx.user,
			cancelStatus: {
				[Op.gt]: -1
			}
		}
	})
	if (count === 0) {
		ctx.throw({
			code: 400,
			message: '환불 요청 내역이 존재하지 않습니다.'
		})
	}
	await models.paylog.update({cancelStatus: -1, cancelReason: "", cancelRequestTime: Sequelize.fn('NOW')}, {
		where: {
			uid: _.uid
		}
	})
	response.send(ctx, true)
}

exports.priceCheck = async function (ctx) {
	let _ = ctx.request.body
	let user = await models.user.findOne(
		{
			attributes: ['point'],
			where: {
				uid: ctx.user.uid
			}
		}
	)
	let ticketPrice = await models.discountTicket.findOne({
		attributes: ['ticketPriceDiscountPercent', 'ticketPrice', 'ticketPriceDiscount'],
		where: {
			uid: _.discountTicketUid
		}
	})
	let originPrice = ticketPrice.ticketPrice
	let discountPrice = ticketPrice.ticketPriceDiscount
	if (discountPrice) {
		originPrice = originPrice - discountPrice
	}

	let data = {
		price: originPrice,
		availablePoint: 0
	}
	if (user.point >= 10000 && originPrice >= 10000) {
		/*TODO:감면 차량 관련 할인 추가 예정*/
		data.availablePoint = originPrice / 10
	}
	/*TODO:쿠폰 관련 할인 추가 예정*/
	response.send(ctx, data)
}

exports.allList = async function (ctx) {
	let _ = ctx.request.query
	let payLogs = await models.payLog.searchAll(_, models)
	response.send(ctx, payLogs)
}
