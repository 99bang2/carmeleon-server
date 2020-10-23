const models = require('../models')
const response = require('../libs/response')
const SHA512 = require('crypto-js/SHA512')
const os = require('os')
const axios = require('axios')
const moment = require('moment')

exports.pgSave = async function (ctx) {
	let _ = ctx.request.body
	if (_.resultcode === '00') {
		let insertData = {}
		let data = {}
		data.cardCode = _.cardcd
		data.cardNumber = _.cardno
		data.billKey = _.billkey
		insertData.userUid = _.p_noti
		insertData.cardInfo = data
		let card = await models.card.create(insertData)
		response.send(ctx, card)
	} else {
		response.send(ctx, _.resultmsg)
	}
}
exports.pgPayment = async function (ctx) {
	let _ = ctx.request.body
	let serverName = os.hostname()
	let clientIP = ctx.ip
	let dataArr = []
	let beforeHash = "rKnPljRn5m6J9MzzBillingCard" + moment().format("YYYYMMDDHHiiss") +
		clientIP + _.mid + _.orderId + _.price + _.billKey
	dataArr["type"] = "Billing"
	dataArr["paymethod"] = "Card"
	dataArr["timestamp"] = moment().format("YYYYMMDDHHiiss")
	dataArr["clientIp"] = clientIP
	dataArr["mid"] = _.mid
	dataArr["url"] = serverName
	dataArr["moid"] = _.orderId
	dataArr["goodName"] = _.goodName
	dataArr["buyerName"] = _.buyerName
	dataArr["buyerEmail"] = _.buyerEmail
	dataArr["buyerTel"] = _.buyerTel
	dataArr["price"] = _.price
	dataArr["billKey"] = _.billKey
	dataArr["authentification"] = "00"
	dataArr["hashData"] = SHA512(beforeHash).toString()
	let queryString = generateQueryString(dataArr)
	let res = await axios.post('https://iniapi.inicis.com/api/v1/billing?' + encodeURI(queryString))
	if (res.data.resultCode === '00') {
		response.send(ctx, {
			result: true
		})
	} else {
		response.send(ctx, {
			result: false,
			msg: res.data.resultMsg
		})
	}
}

function generateQueryString(object) {
	return Object.keys(object).map(key => `${key}=${object[key]}`).join('&')
}
