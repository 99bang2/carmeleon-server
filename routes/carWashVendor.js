'use strict'
const Router = require('koa-router')
const api = new Router()
const bookingPgController = require('../controllers/carWashVendor/pg')

api.post('/bookingRefundApprove', bookingPgController.bookingPgPaymentCancelNice)

module.exports = api