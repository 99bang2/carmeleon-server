'use strict'

const Router                = require('koa-router')
const api                   = new Router()
const adminRouter           = require('../routes/admin')
const userRouter            = require('../routes/user')
const carWashVendorRouter   = require('../routes/carWashVendor')

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

module.exports = api
