'use strict'
const models = require('../models')
const moment = require('moment')
const qs = require('qs')
const axios = require('axios')
const crypto 		= require('crypto')
const CryptoJS = require("crypto-js")
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const merchantKey = config.nicePay.merchantKey
const merchantID = config.nicePay.merchantID;
const privateKey 	= config.privateKey
const MOID          = 'carmeleon_billKey'

exports.pgBillNice = async function(data, ctx){
	const buffer = Buffer.from(data, 'hex')
	const decrypted = crypto.privateDecrypt(privateKey, buffer).toString('utf8')
	let hashKey         = CryptoJS.SHA512(ctx.user.uid).toString()
	let decryptedData   = CryptoJS.AES.decrypt(decrypted, hashKey)
	let decryptData     = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
	let ediDate         = moment().format('YYYYMMDDHHmmss')
	let aesString
		= "CardNo=" 	+ decryptData.CardNo
		+ "&ExpYear=" 	+ decryptData.ExpYear
		+ "&ExpMonth=" 	+ decryptData.ExpMonth
		+ "&IDNo=" 		+ decryptData.IDNo
		+ "&CardPw=" 	+ decryptData.CardPw
	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/billing/billing_regist.jsp", qs.stringify({
		'MID'		: merchantID,
		'EdiDate'	: ediDate,
		'Moid'		: MOID,
		'EncData'	: getAES(aesString, merchantKey),
		'SignData'	: getSignData(merchantID + ediDate + MOID + merchantKey).toString(),
		'CharSet'	: 'utf-8',
	}))

	let convertResult = {
		resultCode	: result.data.ResultCode,
		resultMsg	: result.data.ResultMsg,
		bid			: result.data.BID,
		authDate	: result.data.AuthDate,
		cardCode	: result.data.CardCode,
		cardName	: result.data.CardName,
		tid			: result.data.TID,
		userUid		: ctx.user.uid
	}
	await models.billResult.create(convertResult)
	return result.data.ResultCode === "F100" ? {
		success: true,
		cardData: {
			cardNumber 		: rabbitHash(decryptData.CardNo, config.cardSecretKey.cardNumber+ctx.user.uid),
			cardCode 		: result.data.CardCode,
			expiryYear 		: rabbitHash(decryptData.ExpYear, config.cardSecretKey.expYY+ctx.user.uid),
			expiryMonth 	: rabbitHash(decryptData.ExpMonth, config.cardSecretKey.expMM+ctx.user.uid),
			cardPassword 	: rabbitHash(decryptData.CardPw, config.cardSecretKey.cardPass+ctx.user.uid),
			cardId 			: rabbitHash(decryptData.IDNo, config.cardSecretKey.idNo+ctx.user.uid),
			billKey 		: result.data.BID,
			userUid 		: ctx.user.uid
		}
	} : {
		success: false,
		message: result.data.ResultMsg
	}
}

exports.pgBillRemoveNice = async function(cardUid){
	let ediDate     = moment().format('YYYYMMDDHHmmss')
	let cardInfo    = await models.card.findOne({
		attributes: ['billKey', 'userUid'],
		where: {
			uid: cardUid
		}
	})
	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/billing/billkey_remove.jsp", qs.stringify({
		'BID': cardInfo.billKey,
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': MOID,
		'SignData': getSignData(merchantID + ediDate + MOID + cardInfo.billKey + merchantKey).toString(),
		'CharSet': 'utf-8',
	}))
	let convertResult = {
		resultCode  : result.data.ResultCode,
		resultMsg   : result.data.ResultMsg,
		bid         : result.data.BID,
		authDate    : result.data.AuthDate,
		tid         : result.data.TID,
		userUid     : cardInfo.userUid
	}
	await models.billResult.create(convertResult)
	return result.data.ResultCode === "F101"
}


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
	return CryptoJS.SHA256(str)
}
function getAES(text, key) {
	let encKey = key.substr(0, 16)
	let cipher = crypto.createCipheriv('aes-128-ecb', encKey, Buffer.alloc(0))
	return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('hex')
}
function rabbitHash(str, key) {
	return CryptoJS.Rabbit.encrypt(str, key).toString()
}

