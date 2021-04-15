'use strict'

const Router                = require('koa-router')
const api                   = new Router()
const adminRouter           = require('../routes/admin')
const userRouter            = require('../routes/user')
const carWashVendorRouter   = require('../routes/carWashVendor')
const controller            = require('../controllers')

/*
* Carmelon Sever
* */
/**
 * admin&user Route
 * carWashVendor Route
 */
api.use('/carWashVendor', carWashVendorRouter.routes())
api.use('/admin',  adminRouter.routes())
api.use('', userRouter.routes())

api.post('/ticket/active', controller.ticketActive)

module.exports = api
