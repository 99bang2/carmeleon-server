'use strict'

const response  = require('../libs/response')
const models    = require('../models')

exports.ticketActive = async function (ctx) {
    let { macroId, active } = ctx.request.body

    if (!macroId) {
        response.validationError(ctx)
    }

    let parkingSite = await models.parkingSite.findByPk(macroId)
    parkingSite.isBuy = active
    await parkingSite.save()

    response.send(ctx, true)
}