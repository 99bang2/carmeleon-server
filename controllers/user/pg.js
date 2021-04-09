'use strict'

const env 			= process.env.NODE_ENV || 'development'
const qs 			= require('qs')
const crypto 		= require('crypto')
const CryptoJS 		= require("crypto-js")
const axios 		= require('axios')
const moment 		= require('moment')
const Sequelize 	= require('sequelize')

const models 		= require('../../models')
const response 		= require('../../libs/response')
const config 		= require('../../configs/config.json')[env]
const pointCodes 	= require('../../configs/pointCodes')
const common 		= require('../../controllers/common')

const merchantKey 	= config.nicePay.merchantKey
const merchantID 	= config.nicePay.merchantID;
const MOID          = 'carmeleon_billKey'

exports.pgBillNice = async function(ctx){
    let _               = ctx.request.body
    let data            = _.data
    let hashKey         = CryptoJS.SHA512(ctx.user.email).toString()
    let decryptedData   = CryptoJS.AES.decrypt(data, hashKey)
    let decryptData     = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
    let ediDate         = moment().format('YYYYMMDDHHmmss')

    //IDno : 생년월일(YYMMDD) or 사업자등록번호(법인카드 등록 시)
    //CardPw : 카드 비밀번호 앞 2자리
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

    // 공통
    await models.billResult.create(convertResult)

    if (result.data.ResultCode === "F100") {
        //성공
        let cardData = {
            cardNumber 		: rabbitHash(decryptData.CardNo, config.cardSecretKey.cardNumber+ctx.user.uid),
            cardCode 		: result.data.CardCode,
            expiryYear 		: rabbitHash(decryptData.ExpYear, config.cardSecretKey.expYY+ctx.user.uid),
            expiryMonth 	: rabbitHash(decryptData.ExpMonth, config.cardSecretKey.expMM+ctx.user.uid),
            cardPassword 	: rabbitHash(decryptData.CardPw, config.cardSecretKey.cardPass+ctx.user.uid),
            cardId 			: rabbitHash(decryptData.IDNo, config.cardSecretKey.idNo+ctx.user.uid),
            billKey 		: result.data.BID,
            userUid 		: ctx.user.uid
        }
        await models.card.create(cardData)
    } else {
        //실패
        ctx.throw({
            code: 300,
            message: result.data.ResultMsg
        })
    }
    response.send(ctx, true)
    // decrypted // CryptoJS.Rabbit.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
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

exports.pgPaymentNice = async function (ctx) {
    let _ 				= ctx.request.body
    let payLogUid 		= _.payLogUid
    let payInfo 		= await models.payLog.findByPk(payLogUid)
    let resultMsg 		= 'Success'
    let ranNum 			= Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
    let ediDate 		= moment().format('YYYYMMDDHHmmss')
    let moid  			= 'pdc_' + moment().valueOf()
    let transactionID 	= merchantID + "0116" + ediDate.substr(2, 12) + ranNum
    let payLogParam 	= {
        status			: 0,
        payResultUid	: null,
        payOid			: null,
        payTid			: null
    }
    let payLogOptions 	= {
        where: {
            uid: payLogUid
        }
    }
    let coopPaymentData = {
        userUid		: ctx.user.uid,
        payLogUid	: _.payLogUid,
        usageType	: 'use',
        price		: payInfo.coopPayment
    }
    let paymentFlag		= true

    if (payInfo.totalPrice) {
        let cardInfo 		= await models.card.findByPk(payInfo.cardUid)
        let discountTicket 	= await models.discountTicket.findByPk(payInfo.discountTicketUid)
        let bid 			= cardInfo.billKey
        let buyerName 		= ctx.user.nickname || ctx.user.name || '사용자'
        let amt 			= payInfo.totalPrice
        let buyerEmail 		= payInfo.email
        let buyerTel 		= payInfo.phoneNumber
        let signData 		= getSignData(merchantID + ediDate + moid + amt + bid + merchantKey).toString()
        let cardInterest 	= "0" 	// 가맹점 분담 무이자 사용 여부 (0: 사용안함_이자 / 1: 사용_무이자)
        let cardQuota 		= "00"	//할부개월 (00: 일시불 / 02: 2개월 / 03: 3개월 … )
        let params 			= qs.stringify({
            'TID'			: transactionID,
            'BID'			: bid,
            'MID'			: merchantID,
            'EdiDate'		: ediDate,
            'Moid'			: moid,
            'Amt'			: amt,
            'GoodsName'		: encodeURI(discountTicket.ticketTitle),
            'SignData'		: signData,
            'CardInterest'	: cardInterest,
            'CardQuota'		: cardQuota,
            'BuyerName'		: encodeURI(buyerName),
            'BuyerEmail'	: buyerEmail,
            'BuyerTel'		: buyerTel,
            'CharSet'		: 'utf-8',
        }, {
            encode: false
        })
        let result = await axios.post(`https://webapi.nicepay.co.kr/webapi/billing/billing_approve.jsp?${params}`)
        let convertResult = {
            resultCode 		: result.data.ResultCode,
            resultMsg 		: result.data.ResultMsg,
            authCode		: result.data.AuthCode,
            authDate 		: result.data.AuthDate,
            acquCardCode	: result.data.AcquCardCode,
            acquCardName	: result.data.AcquCardName,
            cardCode 		: result.data.CardCode,
            cardName 		: result.data.CardName,
            cardQuota		: result.data.CardQuota,
            CardInterest	: result.data.CardInterest,
            cardCl			: result.data.CardCl,
            amt				: result.data.Amt,
            goodsName		: result.data.GoodsName,
            buyerName		: result.data.BuyerName,
            buyerEmail		: buyerName,
            buyerTel		: buyerTel,
            tid				: result.data.TID,
            cardNo			: result.data.CardNo,
            userUid 		: ctx.user.uid
        }
        let payResult 		= await models.payResult.create(convertResult)
        paymentFlag 		= result.data.ResultCode === "3001"
        resultMsg 			= result.ResultMsg

        payLogParam.payResultUid = payResult.uid
    } else {
        moid 			= null
        transactionID 	= null
    }

    if(paymentFlag) {// success
        // 모바일 상품권 사용
        if (payInfo.coopPayment) {
            await common.updateCoopPayment(coopPaymentData)
        }
        //포인트 사용
        if(payInfo.point > 0){
            await common.updatePoint(ctx.user.uid, pointCodes.USE_FOR_PARKING_TICKET, payInfo.point)
        }
        payLogParam.status = 10
        payLogParam.payOid = moid
        payLogParam.payTid = transactionID
        await models.payLog.update(payLogParam, payLogOptions)
    } else { // fail
        payLogParam.status = -10
        await models.payLog.update(payLogParam, payLogOptions)
    }

    response.send(ctx, {
        result: paymentFlag,
        msg: resultMsg
    })
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
