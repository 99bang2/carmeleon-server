const response = require('../../libs/response')
const nicePay = require('../../libs/nicePay')


exports.bookingPgPaymentCancelNice = async function (ctx) {
	let _ = ctx.request.body
	let data = _.paymentsData
	let result = await nicePay.pgPaymentCancelNice(data) //코어 결제부분
	if (result.dataValues.resultCode === "2001") {
		response.send(ctx, {
			result: true,
		})
	} else {
		//실패
		response.send(ctx, {
			result: false,
			msg: result.dataValues.resultMsg
		})
	}
}