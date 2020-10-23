const models = require('../models')
const response = require('../libs/response')
const SHA512 = require('crypto-js/SHA512')
const os = require('os')
const axios = require('axios')
const moment = require('moment')

exports.pgSave = async function (ctx) {
	let _ = ctx.request.body
	let flg = _.resultcode === '00'

	if (flg) {
		let insertData = {}
		let data = {}
		data.cardCode = _.cardcd
		data.cardNumber = _.cardno
		data.billKey = _.billkey
		insertData.userUid = _.p_noti
		insertData.cardInfo = data
		await models.card.create(insertData)
	}

	ctx.redirect(`http://192.168.0.101:3000/redirect?success=${flg}`)
}
exports.pgPayment = async function (ctx) {
	let _ = ctx.request.body
	let serverName = os.hostname()
	let clientIP = ctx.ip
	//sampleData
	let testData = {
		goodName: '상품',
		buyerName: '테스트',
		buyerEmail: 'test@test.com',
		buyerTel: '01000000000',
		price: '1000',
		billKey: 'bcb28d6f2af792eed2b69710dfed7f8a826612d5',
		orderId: 'testOrder',
		mid: 'INIBillTst'
	}
	//성공
	let dataArr = []
	let beforeHash = "rKnPljRn5m6J9MzzBillingCard" + moment().format("YYYYMMDDHHiiss") +
		clientIP + testData.mid + testData.orderId + testData.price + testData.billKey
	dataArr["type"] = "Billing"
	dataArr["paymethod"] = "Card"
	dataArr["timestamp"] = moment().format("YYYYMMDDHHiiss")
	dataArr["clientIp"] = clientIP
	dataArr["mid"] = testData.mid
	dataArr["url"] = serverName
	dataArr["moid"] = testData.orderId
	dataArr["goodName"] = testData.goodName
	dataArr["buyerName"] = testData.buyerName
	dataArr["buyerEmail"] = testData.buyerEmail
	dataArr["buyerTel"] = testData.buyerTel
	dataArr["price"] = testData.price
	dataArr["billKey"] = testData.billKey
	dataArr["authentification"] = "00"
	dataArr["hashData"] = SHA512(beforeHash).toString()
	let queryString = generateQueryString(dataArr)
	let res = await axios.post('https://iniapi.inicis.com/api/v1/billing?' + encodeURI(queryString))
	if (res.data.resultCode === '00') {
		response.send(ctx, true)
	} else {
		response.send(ctx, res.data.resultMsg)
	}
}

function generateQueryString(object) {
	return Object.keys(object).map(key => `${key}=${object[key]}`).join('&')
}
