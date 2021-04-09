'use strict'

const models 	= require('../../models')
const response 	= require('../../libs/response')
const Sequelize = require('sequelize')

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let payLogs = await models.payLog.search(_, models)
    response.send(ctx, payLogs)
}

exports.userPayLogs = async function (ctx) {
    let {userUid} = ctx.params
    let payLog = await models.payLog.getByUserUidForAdmin(ctx, userUid, models)
    response.send(ctx, payLog)
}

exports.allList = async function (ctx) {
    let _ = ctx.request.query
    let payLogs = await models.payLog.searchAll(_, models)
    response.send(ctx, payLogs)
}
