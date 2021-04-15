'use strict'

const models    = require('../../models')
const coop      = require('../../libs/coop')
const response  = require('../../libs/response')
const common    = require('../common')

exports.add = async function(ctx) {
    let _ = ctx.request.body
    let info = await coop.checkCoupon(_.couponNumber)

    // let req = await coop.useCoupon(info)
    //
    // let coopPayLog = {
    //     userUid         : ctx.user.uid,
    //     usageType       : 'add',
    //     price           : '',
    //     brandAuthCode   : '', // 승인취소할때 사용
    //     couponNumber    : _.couponNumber
    // }
    //
    // await common.updateCoopPayment(coopPayLog)

    response.send(ctx, {
        data: true,
        msg: "test"
    })
}

exports.history = async function(ctx) {
    let list = await models.coopPaymentLog.getCoopHistory(ctx, models)
    response.send(ctx, list)
}