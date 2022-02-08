'use strict'

const env 			= process.env.NODE_ENV || 'development'

const axios 		= require('axios')
const moment 		= require('moment')
const Sequelize 	= require('sequelize')
const CryptoJS 		= require("crypto-js")
const qs 			= require('qs')

const models 		= require('../../models')
const pointLib 		= require('../../libs/point')
const response 		= require('../../libs/response')
const nicePay 		= require('../../libs/nicePay')
const config 		= require('../../configs/config.json')[env]
const pointCodes 	= require('../../configs/pointCodes')

const carWashBookingAPI = config.carWashBookingAPI
const merchantKey 		= config.nicePay.merchantKey
const merchantID 		= config.nicePay.merchantID;

exports.bookingPgPaymentCancelNice = async function (ctx) {
	let _ 		= ctx.request.body
	let uid 	= _.uids
	let payInfo = _.paymentsData
	payInfo.reason = _.reason

	let status 				= _.cancelStatus
	let cancelRequestTime 	= _.cancelRequestTime
	let clientStatus 		= _.clientStatus
	let result 				= await nicePay.pgPaymentCancelNice(payInfo)
	let dataBody = cancelRequestTime !== null
		? `${moment(cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 환불 완료되었습니다.`
		: '해당 결제건이 취소 완료되었습니다.'
	if (result.dataValues.resultCode === "2001") {
		//성공
		let userUid = payInfo.userUid
		if(status === 0){
			let user = await models.user.getByUid(ctx, userUid)
			models.push.create({
				pushType : 1,
				title: '환불이 완료 되었습니다.',
				body: dataBody,
				userToken: user.token,
				userUid: userUid,
				sendDate: Sequelize.fn('NOW')
			})
		}

		let carWashUpdateData = {cancelCompleteTime: moment().format('YYYY-MM-DD HH:mm')}
		clientStatus === 'wait' || clientStatus=== 'accept' ? carWashUpdateData.status = 'REJECT': carWashUpdateData.cancelStatus = 10

		let carWashRes =  await axios.put(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`,carWashUpdateData)

		response.send(ctx, {
			result: true,
			data: carWashRes.data.data
		})
	} else {
		//실패
		response.send(ctx, {
			result: false,
			msg: result.dataValues.resultMsg
		})
	}
}

exports.bookingRefundReject = async function (ctx) {
	let _ = ctx.request.body
	let uid = _.uids
	let payInfo = _.paymentsData
	let cancelRequestTime = _.cancelRequestTime
	let userUid = payInfo.userUid
	let user = await models.user.getByUid(ctx, userUid)
	let result = await axios.put(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`,{
		status: 'REJECT'
	})

	if(result){
		models.push.create({
			pushType 	: 1,
			title		: '환불이 거부 되었습니다.',
			body		: `${moment(cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 담당자 확인 결과 환불 거부되었습니다..`,
			userToken	: user.token,
			userUid		: userUid,
			sendDate	: Sequelize.fn('NOW')
		})
	}

	response.send(ctx, {result: true})
}

exports.refundApprove = async function (ctx) {
	let _ 				= ctx.request.body
	let uid 			= _.uids
	let reason 			= _.reason
	let payInfo 		= await models.payLog.getByUid(ctx, uid, models)
	let cardRefundFlag  = true
	let msg 			= null
	let coopPaymentData = {
		userUid		: payInfo.userUid,
		payLogUid	: payInfo.uid,
		usageType	: 'cancel',
		price		: payInfo.coopPayment
	}
	let payLogUpdate 	= {
		status: -20,
		cancelStatus: 10,
		cancelReason: reason,
		cancelCompleteTime: Sequelize.fn('NOW')
	}

	if (payInfo.payType === 'card' || payInfo.payType === 'autoPass') {
		let ediDate 		= moment().format('YYYYMMDDHHmmss')
		let transactionID 	= payInfo.payTid
		let amt 			= payInfo.totalPrice
		let moid 			= payInfo.payOid
		let signData 		= getSignData(merchantID + amt + ediDate + merchantKey).toString()
		let params 			= qs.stringify({
			'TID'				: transactionID,
			'MID'				: merchantID,
			'Moid'				: moid,
			'CancelAmt'			: amt,
			'CancelMsg'			: encodeURI(reason),
			'PartialCancelCode'	: '0',					//부분 취소 여부 0:전체, 1:부분
			'EdiDate'			: ediDate,
			'SignData'			: signData,
			'CharSet'			: 'utf-8',
		}, {
			encode: false
		})
		let result 			= await axios.post(`https://webapi.nicepay.co.kr/webapi/cancel_process.jsp?${params}`)
		let convertResult 	= {
			resultCode	: result.data.ResultCode,
			resultMsg	: result.data.ResultMsg,
			errorCd		: result.data.ErrorCD,
			errorMsg	: result.data.ErrorMsg,
			CancelAmt	: result.data.CancelAmt,
			moid		: result.data.Moid,
			signature	: result.data.Signature,
			payMethod	: result.data.PayMethod,
			tid			: result.data.TID,
			cancelDate	: result.data.CancelDate,
			cancelTime	: result.data.CancelTime,
			cancelNum	: result.data.CancelNum,
			remainAmt	: result.data.RemainAmt,
			userUid 	: payInfo.userUid
		}

		await models.payCancelResult.create(convertResult)

		cardRefundFlag 	= result.data.ResultCode === "2001"
		msg 			= result.ResultMsg
	}
	let dataBody = payInfo.cancelRequestTime !== null
		? `${moment(payInfo.cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 환불 완료되었습니다.`
		: '해당 결제건이 취소 완료되었습니다.'
	if (cardRefundFlag) {
		let userUid = payInfo.userUid
		let user 	= await models.user.getByUid(ctx, userUid)
		models.push.create({
			pushType 	: 1,
			title		: '환불이 완료 되었습니다.',
			body		: dataBody,
			userToken	: user.token,
			userUid		: userUid,
			sendDate	: Sequelize.fn('NOW')
		})
		await payInfo.update(payLogUpdate)
		if(payInfo.point > 0) {
			await pointLib.updatePoint(userUid, pointCodes.REFUND_USE_FOR_PARKING_TICKET, payInfo.point)
		}
		if (coopPaymentData.price > 0) {
			await pointLib.updateCoopPayment(coopPaymentData)
		}

		response.send(ctx, {
			result: true
		})
	} else {
		response.send(ctx, {
			result	: false,
			msg		: msg
		})
	}
}

exports.refundReject = async function (ctx) {
	let _ 				= ctx.request.body
	let uid 			= _.uids
	let reason 			= _.reason
	let payInfo 		= await models.payLog.getByUid(ctx, uid, models)
	let expiredDatetime = moment(moment(payInfo.createdAt).add(1, 'd').format('YYYY-MM-DD'))
	let expired 		= !moment().isBefore(expiredDatetime)

	let result 	= await payInfo.update({
		cancelReason: reason,
		cancelStatus: -10,
		cancelCompleteTime: Sequelize.fn('NOW'),
		expired: expired
	})

	if(result){
		models.push.create({
			pushType 	: 1,
			title		: '환불이 거부 되었습니다.',
			body		: `${moment(payInfo.cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 담당자 확인 결과 환불 거부되었습니다.`,
			userToken	: result.user.token,
			userUid		: result.userUid,
			sendDate	: Sequelize.fn('NOW')
		})
	}

	response.send(ctx, {
		result: true
	})
}

function getSignData(str) {
	return CryptoJS.SHA256(str)
}
