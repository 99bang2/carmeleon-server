'use strict'

const models    = require('../../models')
const coop      = require('../../libs/coop')
const response  = require('../../libs/response')

exports.add = async function(ctx) {
    let _ = ctx.request.body
    let info = await coop.checkCoupon(_.couponNumber)
    let flag = true
    let message = "SUCCESS"

    if (info === 'SERVERERROR') {
        flag = false
        message = "통신중 에러가 발생하였습니다. \n 잠시후 다시 시도해주세요."
    }
    if (info === 'MISMATCH') {
        flag = false
        message = "일치하는 상품권이 없습니다."
    }
    if (info === 'INACTIVE') {
        flag = false
        message = "상품권이 비활성화 상태 입니다."
    }

    if (flag) {
        let coopPayLog = await coop.useCoupon(info)
        if (coopPayLog === 'SERVERERROR') {
            flag = false
            message = "통신중 에러가 발생하였습니다. \n 잠시후 다시 시도해주세요."
        }
        if (coopPayLog === 'MISMATCH') {
            flag = false
            message = "일치하는 상품권이 없습니다."
        }
        if (coopPayLog === 'INACTIVE') {
            flag = false
            message = "상품권이 비활성화 상태 입니다."
        }

        // if (flag) {
        //     coopPayLog.userUid = ctx.user.uid
        //     coopPayLog.usageType = 'add'
        //
        //     let user = await models.user.findByPk(ctx.user.uid)
        //     user.coopPayment += coopPayLog.price
        //     await user.save()
        //     await models.coopPaymentLog.create(coopPayLog)
        // }
    }

    response.send(ctx, {
        data: flag,
        message: message
    })
}

exports.history = async function(ctx) {
    let list = await models.coopPaymentLog.getCoopHistory(ctx, models)
    response.send(ctx, list)
}