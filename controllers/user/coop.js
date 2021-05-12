'use strict'

const models    = require('../../models')
const coop      = require('../../libs/coop')
const response  = require('../../libs/response')

function coopError(info) {
    let message = 'SUCCESS'
    let result = true
    
    if (info === 'SERVERERROR') {
        result = false
        message = "통신중 에러가 발생하였습니다. \n 잠시후 다시 시도해주세요."
    }
    if (info === 'MISMATCH') {
        result = false
        message = "일치하는 상품권이 없습니다."
    }
    if (info === 'INACTIVE') {
        result = false
        message = "상품권이 비활성화 상태 입니다."
    }
    
    return {
        result,
        message
    }
}

module.exports = {
    async check(ctx) {
        let _ = ctx.request.body
        let info = await coop.checkCoupon(_.couponNumber)
        let check = coopError(info)

        response.send(ctx, {
            data: info,
            message: check.message
        })
    },
    async use(ctx) {
        let _ = ctx.request.body
        let info = await coop.useCoupon(_)
        let check = coopError(info)
        
        if (check.result) {
            info.userUid = ctx.user.uid
            info.usageType = 'add'
    
            let user = await models.user.findByPk(ctx.user.uid)
            user.coopPayment += parseInt(info.price)
            await user.save()
            await models.coopPaymentLog.create(info)
        }
    
        response.send(ctx, {
            data: info,
            message: check.message
        })
    },
    async cancel(ctx) {
        let _ = ctx.request.body
        let info = await coop.useNetworkCancel(_)
        let check = coopError(info)
    
        response.send(ctx, {
            data: info,
            message: check.message
        })
    },
    async history(ctx) {
        let list = await models.coopPaymentLog.getCoopHistory(ctx, models)
        response.send(ctx, list)
    }
}