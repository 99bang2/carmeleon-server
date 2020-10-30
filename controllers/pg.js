const models = require('../models')
const response = require('../libs/response')
const SHA512 = require('crypto-js/sha512')
const os = require('os')
const axios = require('axios')
const moment = require('moment')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const qs = require('qs')

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
        hashData: SHA512(beforeHash).toString()
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
    dataArr["hashData"] = SHA512(beforeHash).toString()
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

function generateQueryString(object) {
    return Object.keys(object).map(key => `${key}=${object[key]}`).join('&')
}
