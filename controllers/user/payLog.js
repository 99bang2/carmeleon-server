'use strict'
const models 	= require('../../models')
const response 	= require('../../libs/response')
const moment 	= require('moment')
const nicePay = require('../../libs/nicePay')
const pointLib 		= require('../../libs/point')
const pointCodes 	= require('../../configs/pointCodes')

exports.create = async function (ctx) {
    let _ 				= ctx.request.body
    let currentDate 	= moment(moment().format('YYYY-MM-DD'))
    let todayCount 		= await models.payLog.todayCount(_.discountTicketUid, currentDate)
    let discountTicket 	= await models.discountTicket.findByPk(_.discountTicketUid)
    let startDate 		= moment(moment(discountTicket.ticketStartDate).format('YYYY-MM-DD'))
    let endDate 		= moment(moment(discountTicket.ticketEndDate).format('YYYY-MM-DD'))
    let currentDay 		= parseInt(moment().format('e'))
    let currentDayType 	= (currentDay === 0 || currentDay === 6) ? 2 : 1

    // 구매/사용가능 요일 체크
    if(discountTicket.ticketDayType < 3 && currentDayType !== discountTicket.ticketDayType) {
        response.customError(ctx, '현재 구매 불가능한 상품입니다.')
    }

    // 판매기간 체크
    if(currentDate.isBefore(startDate) || currentDate.isAfter(endDate)) {
        response.customError(ctx, '현재 구매 불가능한 상품입니다.')
    }

    // 매진체크
    if(todayCount >= discountTicket.ticketCount) {
        response.customError(ctx, '매진된 상품입니다.')
    }

    let user 			= await models.user.findByPk(ctx.user.uid)
    let sellingPrice 	= discountTicket.ticketPrice - discountTicket.ticketPriceDiscount
    let discountPrice 	= 0 // 경감차량 할인금액 todo:경감차량 할인
    let discountType 	= 0 // 경감차량 할인유형 todo:경감차량 할인
    let price 			= sellingPrice - discountPrice
    let point 			= Number(_.point)
    let coopPayment 	= Number(_.coopPayment) || 0
    let fee 			= price * Number(discountTicket.fee) / 100
    let totalPrice 		= price - point - coopPayment

    // 가격 확인
    if(totalPrice !== Number(_.totalPrice)) {
        response.customError(ctx, '잘못된 요금입니다.')
    }

    // 포인트 확인
    if(point > 0 && (price < 10000 || user.point < 10000)) {
        response.customError(ctx, '포인트를 사용할 수 없습니다.')
    }

    // 모바일 상품권 확인
    if (coopPayment > user.coopPayment) {
        response.customError(ctx, '잔액이 부족합니다.')
    }

    // 카드 유효성 확인 (결제가 필요한 경우에만)
    let card = null
    if (totalPrice) {
        card = await models.card.findUserCard(user.uid, _.cardUid)
        if(!card) {
            response.customError(ctx, '잘못된 카드 정보입니다.')
        }
    }
    // 데이터 생성 (LOCK)
    let payLog = await models.payLog.create({
        carNumber			: _.carNumber,
        reserveTime			: _.reserveTime,
        payType				: _.payType,
        siteUid				: _.siteUid,
        cardUid				: _.cardUid,
        discountTicketUid	: _.discountTicketUid,
        status				: 0,
        sellingPrice		: sellingPrice,
        discountPrice		: discountPrice,
        discountType		: discountType,
        price				: price,
        point				: point,
        coopPayment			: coopPayment,
        fee					: fee,
        totalPrice			: totalPrice,
        userUid				: user.uid,
        phoneNumber			: user.phone || '01000000000',
        email				: user.email || 'mobilx.carmeleon@gmail.com',
        activeStatus		: false,
        cancelStatus		: -1,
        expired				: false
    })
    // 결제금액이 있을 경우 결제 처리.
    if (totalPrice) {
        let payResult = await nicePay.pgPaymentNice({
            userUid: user.uid,
            billKey: card.billKey,
            price: totalPrice,
            goodsName: discountTicket.ticketTitle,
            buyerName: ctx.user.nickname || '사용자',
            buyerEmail: payLog.email || 'mobilx.carmeleon@gmail.com',
            buyerTel: payLog.phoneNumber
        })
        if(payResult.resultCode !== '3001') {
            payLog.status = -10
            await payLog.save()
            response.customError(ctx, '[결제실패] ' + payResult.resultMsg)
        }
        payLog.payResultUid = payResult.uid
        payLog.payOid = payResult.moid
        payLog.payTid = payResult.tid
    }
    // 모바일 상품권 사용
    if (payLog.coopPayment) {
        await pointLib.updateCoopPayment({
            userUid		: ctx.user.uid,
            payLogUid	: payLog.uid,
            usageType	: 'use',
            price		: payLog.coopPayment
        })
    }
    //포인트 사용
    if(payLog.point > 0){
        await pointLib.updatePoint(ctx.user.uid, pointCodes.USE_FOR_PARKING_TICKET, payLog.point)
    }
    payLog.status = 10
    await payLog.save()
    response.send(ctx, payLog)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let payLog = await models.payLog.findByPk(uid, {
        include: [
            {
                model: models.parkingSite,
            }, {
                model: models.discountTicket,
                paranoid: false
            }, {
                model: models.card,
                paranoid: false
            }, {
                model: models.user,
            },
        ]
    })
    if(payLog.userUid !== ctx.user.uid) {
        response.unauthorized(ctx)
    }
    response.send(ctx, payLog)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let limit =_.page ? 10 : null
    let offset = _.page ? (Number(_.page) - 1) * limit : null
    let order = [['createdAt', 'DESC']]
    let where = {
        visible: true,
        status: { [models.Sequelize.Op.in]: [10, -20] },
        userUid: ctx.user.uid
    }
    let include = [{
        model: models.parkingSite,
        attribute: ['name', 'address', 'lat', 'lon']
    },{
        model: models.discountTicket
    }]
    let result = await models.payLog.findAll({ where, limit, offset, order, include })
    let count = await models.payLog.count({ where })
    response.send(ctx, {
        rows: result,
        count: count
    })
}

exports.refundRequest = async function (ctx) {
    let {uid} = ctx.params
    let _ = ctx.request.body
    let payLog = await models.payLog.findByPk(uid)
    if(payLog.userUid !== ctx.user.uid) {
        response.unauthorized(ctx)
    }
    payLog.cancelStatus = 0
    payLog.cancelReason = _.cancelReason
    payLog.cancelRequestTime = moment().format('YYYY-MM-DD HH:mm:ss')
    await payLog.save()
    response.send(ctx, payLog)
}

exports.priceCheck = async function (ctx) {
    let {uid} = ctx.params
    let user        = await models.user.findByPk(ctx.user.uid)
    let ticket      = await models.discountTicket.getTicketPrice(uid)
    let discount    = ticket.ticketPriceDiscount
    let price       = discount ? ticket.ticketPrice - discount : ticket.ticketPrice
    let data = {
        price: price,
        availablePoint: 0
    }
    if (user.point >= 10000 && price >= 10000) {
        /*TODO:감면 차량 관련 할인 추가 예정*/
        data.availablePoint = price / 10
    }
    /*TODO:쿠폰 관련 할인 추가 예정*/
    response.send(ctx, data)
}
