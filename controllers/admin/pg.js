const models = require('../../models')
const response = require('../../libs/response')
const axios = require('axios')
const moment = require('moment')
const Sequelize = require('sequelize')
const common = require('../../controllers/common')
const nicePay = require('../../libs/nicePay')
const env = process.env.NODE_ENV || 'development'
const config = require('../../configs/config.json')[env]
const carWashBookingAPI = config.carWashBookingAPI


exports.bookingPgPaymentCancelNice = async function (ctx) {
	let _ = ctx.request.body
	let uid = _.uids
	let payInfo = _.paymentsData
	payInfo.reason = _.reason
	let status = _.cancelStatus
	let cancelRequestTime = _.cancelRequestTime
	let clientStatus = _.clientStatus
	let result = await nicePay.pgPaymentCancelNice(payInfo)
	if (result.dataValues.resultCode === "2001") {
		//성공
		let userUid = payInfo.userUid
		if(status === 0){
			let user = await models.user.getByUid(ctx, userUid)
			let data = {
				pushType : 1,
				title: '환불이 완료 되었습니다.',
				body: `${moment(cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 환불 완료되었습니다.`,
				userToken: user.token,
				userUid: userUid,
				sendDate: Sequelize.fn('NOW')
			}
			await common.pushMessage(data)
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
		let data = {
			pushType : 1,
			title: '환불이 거부 되었습니다.',
			body: `${moment(cancelRequestTime).format('YYYY.MM.DD HH:mm')}에 요청하신 취소건이 담당자 확인 결과 환불 거부되었습니다..`,
			userToken: user.token,
			userUid: userUid,
			sendDate: Sequelize.fn('NOW')
		}
		await common.pushMessage(data)
	}
	response.send(ctx, {result: true})
}
