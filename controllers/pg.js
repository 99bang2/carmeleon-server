const models = require('../models')
const response = require('../libs/response')
const crypto = require('crypto-js')
const axios = require('axios')

exports.pgOpen = async function (ctx) {
	let _ = ctx.request.body
	let data = {
		"P_AMT": "33000",
		"P_EMAIL": "",
		"P_GOODS": "5회 주차권",
		"P_HPP_METHOD": "1",
		"P_INI_PAYMENT": "CARD",
		"P_MID": "INIpayTest",
		"P_NEXT_URL": "http://localhost:70/?ic_page=payment&ic_sub_page=payment_check",
		"P_NOTI": "",
		"P_NOTI_URL": "http://localhost:70/?ic_page=payment&ic_sub_page=payment_complete",
		"P_OID": "inicisTestOid1603079358087",
		"P_RESERVED": "",
		"P_UNAME": ""
	}
	let res = await axios.post('https://mobile.inicis.com/smart/payment/', {
		headers: {
			'accept-charset': 'euc-kr'
		},
		data: data
	})
	response.send(ctx, res)
}
