const models = require('../models')
const response = require('../libs/response')
const axios = require('axios')
const moment = require('moment')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const qs = require('qs')
const crypto = require('crypto')
const CryptoJS = require("crypto-js")
const Op = require('sequelize').Op

const merchantKey = config.nicePay.merchantKey
const merchantID = config.nicePay.merchantID;

exports.pgBillNice = async function(ctx){
	let _ = ctx.request.body
	let data = _.data
	let hashKey = CryptoJS.SHA512(ctx.user.email).toString()
	let decryptedData = CryptoJS.AES.decrypt(data, hashKey)
	let decryptData = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
	let ediDate = moment().format('YYYYMMDDHHmmss')
	let moid = 'nice_bill_test_3.0';
	//IDno : 생년월일(YYMMDD) or 사업자등록번호(법인카드 등록 시)
	//CardPw : 카드 비밀번호 앞 2자리
	let aesString = "CardNo=" + decryptData.CardNo + "&ExpYear=" + decryptData.ExpYear + "&ExpMonth=" + decryptData.ExpMonth + "&IDNo=" + decryptData.IDNo + "&CardPw=" + decryptData.CardPw

	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/billing/billing_regist.jsp", qs.stringify({
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': moid,
		'EncData': getAES(aesString, merchantKey),
		'SignData': getSignData(merchantID + ediDate + moid + merchantKey).toString(),
		'CharSet': 'utf-8',
	}))
	let convertResult = {
		resultCode: result.data.ResultCode,
		resultMsg: result.data.ResultMsg,
		bid: result.data.BID,
		authDate: result.data.AuthDate,
		cardCode: result.data.CardCode,
		cardName: result.data.CardName,
		tid: result.data.TID,
		userUid: ctx.user.uid
	}
	// 공통
	await models.billResult.create(convertResult)

	if (result.data.ResultCode === "F100") {
		//성공
		let cardData = {
			cardNumber : rabbitHash(decryptData.CardNo, config.cardSecretKey.cardNumber),
			cardCode : result.data.CardCode,
			expiryYear : rabbitHash(decryptData.ExpYear, config.cardSecretKey.expYY),
			expiryMonth : rabbitHash(decryptData.ExpMonth, config.cardSecretKey.expMM),
			cardPassword : rabbitHash(decryptData.CardPw, config.cardSecretKey.cardPass),
			cardId : rabbitHash(decryptData.IDNo, config.cardSecretKey.idNo),
			billKey : result.data.BID,
			userUid : ctx.user.uid
		}
		let count = await models.card.count(
			{
				where: {
					userUid: cardData.userUid,
					cardNumber: decryptData.CardNo
				}
			}
		)
		if(count > 0) {
			ctx.throw({
				code: 400,
				message: '이미 등록 된 카드 입니다.'
			})
		}
		await models.card.create(cardData)
	} else {
		//실패
		ctx.throw({
			code: 300,
			message: '카드 등록 실패'
		})
	}
	response.send(ctx, true)
	// decrypted // CryptoJS.Rabbit.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
}
exports.pgBillRemoveNice = async function(billKey, userUid){
	let ediDate = moment().format('YYYYMMDDHHmmss')
	let moid = 'nice_bill_test_3.0'

	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/billing/billkey_remove.jsp", qs.stringify({
		'BID': billKey,
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': moid,
		'SignData': getSignData(merchantID + ediDate + moid + billKey + merchantKey).toString(),
		'CharSet': 'utf-8',
	}))
	let convertResult = {
		resultCode: result.data.ResultCode,
		resultMsg: result.data.ResultMsg,
		bid: result.data.BID,
		authDate: result.data.AuthDate,
		tid: result.data.TID,
		userUid: userUid
	}
	await models.billResult.create(convertResult)
	// 공통
	if (result.data.ResultCode === "F101") {
		//성공
		return true
	} else {
		//실패
		return false
	}
}
exports.pgPaymentNice = async function (ctx) {
	let _ = ctx.request.body
	let payLogUid = _.payLogUid

	let buyerName =  ctx.user.nickname || ctx.user.name || '사용자'
	let buyerEmail = ctx.user.email || 'mobilx.carmeleon@gmail.com'
	let buyerTel = ctx.user.phone || '01000000000'

	let ediDate = moment().format('YYYYMMDDHHmmss')
	let ranNum = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
	let transactionID = merchantID + "0116" + ediDate.substr(2, 12) + ranNum
	let cardInfo = await models.card.findOne({
		attributes: ['billKey'],
		where: {
			uid: _.cardUid,
			userUid: ctx.user.uid
		}
	})
	let payInfo = await models.payLog.findOne({
		where: {
			uid: _.payLogUid,
			userUid: ctx.user.uid
		}
	})
	let bid = cardInfo.billKey
	let amt = payInfo.totalPrice
	// ORDER ID 생성
	// let moid = _.orderId
	let moid  = 'pdc_'+moment().valueOf()
	let signData = getSignData(merchantID + ediDate + moid + amt + bid + merchantKey).toString()
	//가맹점 분담 무이자 사용 여부 (0: 사용안함_이자 / 1: 사용_무이자)
	// 가맹점 분담 무이자를 지칭하며, 가맹점관리자페이지에서 설정 후 사용 가능.
	// TODO:확인 필요
	let cardInterest = "0"
	//할부개월 (00: 일시불 / 02: 2개월 / 03: 3개월 … )
	let cardQuota = "00"
	let params = qs.stringify({
		'TID': transactionID,
		'BID': bid,
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': moid,
		'Amt': amt,
		'GoodsName': encodeURI(_.goodName),
		'SignData': signData,
		'CardInterest': cardInterest,
		'CardQuota': cardQuota,
		'BuyerName': encodeURI(buyerName),
		'BuyerEmail': buyerEmail,
		'BuyerTel': buyerTel,
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
		buyerEmail: buyerName,
		buyerTel: buyerTel,
		tid: result.data.TID,
		cardNo: result.data.CardNo,
		userUid : ctx.user.uid
	}
	// 공통
	let payResult = await models.payResult.create(convertResult)
	if(result.data.ResultCode === "3001"){
		//성공
		//payResultUid 포함 해서 업데이트//
		//payResultUid = payResult.uid//
		models.payLog.update(
			{
				status: 10,
				payResultUid: payResult.uid,
				email: ctx.user.email,
				payOid: moid,
				payTid:  transactionID
			}, {where: {uid: payLogUid}})
		response.send(ctx, {
			result: true,
			msg: result.ResultMsg
		})
	}else{
		//실패
		models.payLog.update(
			{
				status: -10,
				payResultUid: payResult.uid,
				email: ctx.user.email
			}, {where: {uid: payLogUid}})
		response.send(ctx, {
			result: false,
			msg: result.ResultMsg
		})
	}
	response.send(ctx, true)
}
exports.pgPaymentCancelNice = async function (ctx) {
	let {uid} = ctx.params
	let payInfo = await models.payLog.getByUid(ctx, uid, models)
	let ediDate = moment().format('YYYYMMDDHHmmss')
	let transactionID = payInfo.payTid

	let amt = payInfo.totalPrice
	let moid = payInfo.payOid
	let userUid = payInfo.userUid
	let signData = getSignData(merchantID + amt + ediDate + merchantKey).toString()
	let params = qs.stringify({
		'TID': transactionID,
		'MID': merchantID,
		'Moid': moid,
		'CancelAmt': amt,
		'CancelMsg': '관리자 결제 취소',
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
	await models.payCancelResult.create(convertResult)
	if (result.data.ResultCode === "2001") {
		//성공
		payInfo.update({status: -20})
		response.send(ctx, {
			result: true
		})
	} else {
		//실패
		response.send(ctx, {
			result: false,
			msg: result.ResultMsg
		})
	}
}

function getSignData(str) {
	let encrypted = CryptoJS.SHA256(str)
	return encrypted
}

function getAES(text, key) {
	let encKey = key.substr(0, 16)
	let cipher = crypto.createCipheriv('aes-128-ecb', encKey, Buffer.alloc(0))
	let ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('hex')
	return ciphertext
}

function rabbitHash(str, key) {
	return CryptoJS.Rabbit.encrypt(str, key).toString()
}
