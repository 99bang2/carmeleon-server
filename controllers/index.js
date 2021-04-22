'use strict'

const response  = require('../libs/response')
const models    = require('../models')

exports.ticketActive = async function (ctx) {
    let { macroId, active } = ctx.request.body

    if (!macroId) {
        response.validationError(ctx)
    }

    let parkingSite = await models.parkingSite.findByPk(macroId)

    if (parkingSite.siteType !== 0) {
        response.send(ctx, {
            data: false,
            message: "하이파킹 주차장이 아닙니다."
        })
    } else {
        parkingSite.isBuy = active
        await parkingSite.save()

        response.send(ctx, true)
    }
}