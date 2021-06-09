'use strict'

const models 	= require('../../models')
const response 	= require('../../libs/response')
const Sequelize = require('sequelize')
const moment 	= require('moment')

exports.create = async function (ctx) {
    let _ 				= ctx.request.body
    let currentDate 	= moment(moment().format('YYYY-MM-DD'))
    let todayCount 		= await models.payLog.todayCount(_.discountTicketUid, currentDate)
    let discountTicket 	= await models.discountTicket.findByPk(_.discountTicketUid)
    let startDate 		= moment(moment(discountTicket.ticketStartDate).format('YYYY-MM-DD'))
    let endDate 		= moment(moment(discountTicket.ticketEndDate).format('YYYY-MM-DD'))
    let currentDay 		= parseInt(moment().format('E'))
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
    if (totalPrice) {
        let card = await models.card.findUserCard(user.uid, _.cardUid)
        if(!card) {
            response.customError(ctx, '잘못된 카드 정보입니다.')
        }
    }

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

    response.send(ctx, payLog)
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let payLog = await models.payLog.getByUid(ctx, uid, models)
    /*if(payLog.userUid !== ctx.user.uid) {
        response.unauthorized(ctx)
    }*/
    response.send(ctx, payLog)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    console.log(_.userUid)
    console.log(ctx.user.uid)
    /*if(_.userUid !== ctx.user.uid) {
        response.unauthorized(ctx)
    }*/
    let payLog = await models.payLog.getByUserUid(ctx, _, models)
    response.send(ctx, payLog)
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

    let updateParam = {
        cancelStatus: 0,
        cancelReason: _.cancelReason,
        cancelRequestTime: Sequelize.fn('NOW')
    }

    await models.payLog.update(updateParam, {
        where: {
            uid: _.uid
        }
    })

    response.send(ctx, true)
}

exports.priceCheck = async function (ctx) {
    let _           = ctx.request.body
    let user        = await models.user.getUserPoint(ctx.user.uid)
    let ticket      = await models.discountTicket.getTicketPrice(_.discountTicketUid)
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
