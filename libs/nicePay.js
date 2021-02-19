'use strict'
const models = require('../models')
const moment = require('moment')
const qs = require('qs')
const axios = require('axios')
const CryptoJS = require("crypto-js")
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const merchantKey = config.nicePay.merchantKey
const merchantID = config.nicePay.merchantID;

exports.pgPaymentNice = async function (_) {
	let ediDate = moment().format('YYYYMMDDHHmmss')
	let ranNum = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
	let transactionID = merchantID + "0116" + ediDate.substr(2, 12) + ranNum
	let bid = _.billKey
	let amt = _.price
	let moid  = 'pdc_'+moment().valueOf()
	let signData = getSignData(merchantID + ediDate + moid + amt + bid + merchantKey).toString()
	let cardInterest = "0"
	let cardQuota = "00"
	let params = qs.stringify({
		'TID': transactionID,
		'BID': bid,
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': moid,
		'Amt': amt,
		'GoodsName': encodeURI(_.goodsName),
		'SignData': signData,
		'CardInterest': cardInterest,
		'CardQuota': cardQuota,
		'BuyerName': encodeURI(_.buyerName),
		'BuyerEmail': _.buyerEmail,
		'BuyerTel': _.buyerTel,
		'CharSet': 'utf-8',
	}, {
		encode: false
	})
	let result = await axios.post(`https://webapi.nicepay.co.kr/webapi/billing/billing_approve.jsp?${params}`)
	let convertResult = {
		resultCode : result.data.ResultCode,
		resultMsg : result.data.ResultMsg,
		authCode: result.data.AuthCode,
		authDate : result.data.AuthDate,
		acquCardCode: result.data.AcquCardCode,
		acquCardName: result.data.AcquCardName,
		cardCode : result.data.CardCode,
		cardName : result.data.CardName,
		cardQuota: result.data.CardQuota,
		CardInterest: result.data.CardInterest,
		cardCl: result.data.CardCl,
		amt: result.data.Amt,
		goodsName: result.data.GoodsName,
		buyerName: result.data.BuyerName,
		buyerEmail: _.buyerEmail,
		buyerTel: _.buyerTel,
		tid: result.data.TID,
		cardNo: result.data.CardNo,
		userUid : _.userUid
	}
	console.log(convertResult)
	console.log(moid)
	let payResult = await models.payResult.create(convertResult)
	return {
		...payResult.dataValues,
		moid: moid
	}
}

exports.pgPaymentCancelNice = async function (_) {
	let reason = _.reason
	let ediDate = moment().format('YYYYMMDDHHmmss')
	let transactionID = _.tid
	let amt = _.price
	let moid = _.moid
	let userUid = _.userUid
	let signData = getSignData(merchantID + amt + ediDate + merchantKey).toString()
	let params = qs.stringify({
		'TID': transactionID,
		'MID': merchantID,
		'Moid': moid,
		'CancelAmt': amt,
		'CancelMsg': encodeURI(reason),
		//부분 취소 여부 0:전체, 1:부분//
		'PartialCancelCode': '0',
		'EdiDate': ediDate,
		'SignData': signData,
		'CharSet': 'utf-8',
	}, {
		encode: false
	})
	let result = await axios.post(`https://webapi.nicepay.co.kr/webapi/cancel_process.jsp?${params}`)
	//공통
	let convertResult = {
		resultCode: result.data.ResultCode,
		resultMsg: result.data.ResultMsg,
		errorCd: result.data.ErrorCD,
		errorMsg: result.data.ErrorMsg,
		CancelAmt: result.data.CancelAmt,
		moid: result.data.Moid,
		signature: result.data.Signature,
		payMethod: result.data.PayMethod,
		tid: result.data.TID,
		cancelDate: result.data.CancelDate,
		cancelTime: result.data.CancelTime,
		cancelNum: result.data.CancelNum,
		remainAmt: result.data.RemainAmt,
		userUid : userUid
	}
	// 공통
	let payCancelResult = await models.payCancelResult.create(convertResult)
	return payCancelResult
}

function getSignData(str) {
	let encrypted = CryptoJS.SHA256(str)
	return encrypted
}
