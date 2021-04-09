'use strict'

const models    = require('../../models')
const coop      = require('../../libs/coop')
const response  = require('../../libs/response')
const common    = require('../common')

exports.add = async function(ctx) {
    let _ = ctx.request.body
    let info = await coop.checkCoupon(_.couponNumber)
    //Todo: coupon이 에러가 발생하는 경우 체크 (기존에 등록, 이미 사용된 카드, 종류 불일치 등등...)

    let req = await coop.useCoupon(info)
    //Todo: coupon이 에러가 발생하는 경우 체크 (통신 에러, 서버에러 등등...)

    let coopPayLog = {
        userUid         : ctx.user.uid,
        usageType       : 'add',
        price           : '',
        brandAuthCode   : '', // 승인취소할때 사용
        couponNumber    : _.couponNumber
    }

    await common.updateCoopPayment(coopPayLog)

    response.send(ctx, info)
}

exports.history = async function(ctx) {
    let list = await models.coopPaymentLog.getCoopHistory(ctx, models)

    response.send(ctx, list)
}
