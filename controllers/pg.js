const models = require('../models')
const response = require('../libs/response')
const os = require('os')
const axios = require('axios')
const moment = require('moment')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const qs = require('qs')
const crypto = require('crypto')
const CryptoJS = require("crypto-js")

const merchantKey = config.nicePay.merchantKey
const merchantID = config.nicePay.merchantID;

exports.pgSave = async function (ctx) {
    let _ = ctx.request.body
    let flg = _.resultcode === '00'
    let msg = _.resultmsg

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

    ctx.redirect(`${config.clientUrl}redirect?success=${flg}&msg=${msg}`)

}
exports.pgPayment = async function (ctx) {
    let _ = ctx.request.body
    let payLogUid = _.payLogUid
    let serverName = os.hostname()
    let clientIP = ctx.ip
    let beforeHash = "rKnPljRn5m6J9MzzBillingCard" + moment().format("YYYYMMDDHHiiss") +
        _.clientIp + _.mid + _.orderId + _.price + _.billKey
    let res = await axios.post('https://iniapi.inicis.com/api/v1/billing', qs.stringify({
        type: 'Billing',
        paymethod: 'Card',
        timestamp: moment().format("YYYYMMDDHHiiss"),
        clientIp: _.clientIp,
        mid: _.mid,
        url: serverName,
        moid: _.orderId,
        goodName: _.goodName,
        buyerName: _.buyerName,
        buyerEmail: _.buyerEmail,
        buyerTel: _.buyerTel,
        price: _.price,
        billKey: _.billKey,
        authentification: '00',
        hashData: CryptoJS.SHA512(beforeHash).toString()
    }),{
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    })
    let payInfo = {
        orderId: _.orderId,
        clientIP: _.clientIp,
        tid: res.data.tid
    }
    if (res.data.resultCode === '00') {
        models.payLog.update(
            {
                status: 10,
                payInfo: payInfo,
                email: ctx.user.email
            }, {where: {uid: payLogUid}})
        response.send(ctx, {
            result: true,
            msg: res.data.resultMsg
        })
    } else {
        models.payLog.update(
            {
                status: -10,
                payInfo: payInfo,
                email: ctx.user.email
            }, {where: {uid: payLogUid}})
        response.send(ctx, {
            result: false,
            msg: res.data.resultMsg
        })
    }
}
exports.pgCancel = async function (ctx) {
    let {uid} = ctx.params
    let payInfo = await models.payLog.getByUid(ctx, uid, models)
    let dataArr = []
    let mid = 'INIBillTst'
    let beforeHash = "rKnPljRn5m6J9MzzRefundCard" + moment().format("YYYYMMDDHHiiss") + payInfo.payInfo.clientIp + mid + payInfo.payInfo.tid
    dataArr["type"] = "Refund"
    dataArr["paymethod"] = "Card"
    dataArr["timestamp"] = moment().format("YYYYMMDDHHiiss")
    dataArr["clientIp"] = payInfo.payInfo.clientIp
    dataArr["mid"] = mid
    dataArr["tid"] = payInfo.payInfo.tid
    dataArr["msg"] = "관리자 취소" // 취소 사유
    dataArr["hashData"] = CryptoJS.SHA512(beforeHash).toString()
    let queryString = generateQueryString(dataArr)
    let res = await axios.post('https://iniapi.inicis.com/api/v1/refund?' + encodeURI(queryString))
    if (res.data.resultCode === '00') {
        payInfo.update({status: -20})
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
		userUid: _.userUid
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
			userUid : decryptData.userUid
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

	let ediDate = moment().format('YYYYMMDDHHmmss')
	let ranNum = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
	let transactionID = merchantID + "0116" + ediDate.substr(2, 12) + ranNum
	let cardInfo = await models.card.findOne({
		attributes: ['billKey'],
		where: {
			cardUid: _.cardUid
		}
	})
	let bid = cardInfo.billKey
	let amt = _.price
	let moid = _.orderId
	let signData = getSignData(merchantID + ediDate + moid + amt + bid + merchantKey).toString()
	//가맹점 분담 무이자 사용 여부 (0: 사용안함_이자 / 1: 사용_무이자)
	// 가맹점 분담 무이자를 지칭하며, 가맹점관리자페이지에서 설정 후 사용 가능.
	// TODO:확인 필요
	let cardInterest = "0"
	//할부개월 (00: 일시불 / 02: 2개월 / 03: 3개월 … )
	let cardQuota = "00"
	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/billing/billing_approve.jsp", qs.stringify({
		'TID': transactionID,
		'BID': bid,
		'MID': merchantID,
		'EdiDate': ediDate,
		'Moid': moid,
		'Amt': amt,
		'GoodsName': _.goodName,
		'SignData': signData,
		'CardInterest': cardInterest,
		'CardQuota': cardQuota,
		'BuyerName': _.buyerName,
		'BuyerEmail': _.buyerEmail,
		'BuyerTel': _.buyerTel,
		'CharSet': 'utf-8',
	}))
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
	// 공통
	let payResult = await models.payResult.create(convertResult)
	if(result.ResultCode === "3001"){
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

	let result = await axios.post("https://webapi.nicepay.co.kr/webapi/cancel_process.jsp", qs.stringify(
		{
			'TID': transactionID,
			'MID': merchantID,
			'Moid': moid,
			'CancelAmt': amt,
			'CancelMsg': '결제 취소',
			//부분 취소 여부 0:전체, 1:부분//
			'PartialCancelCode': '0',
			'EdiDate': ediDate,
			'SignData': signData,
			'CharSet': 'utf-8',
		}
	))
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

function generateQueryString(object) {
	return Object.keys(object).map(key => `${key}=${object[key]}`).join('&')
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
