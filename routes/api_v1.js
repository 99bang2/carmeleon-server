'use strict'
const Router = require('koa-router')
const api = new Router()
const adminRouter = require('../routes/admin')
const userRouter = require('../routes/user')
const auth = require('../libs/auth')
/*
* Carmelon Sever
* */
/**
 * admin&user Route
 */
api.use('/admin', auth.isAdminLoggedIn, adminRouter.routes())
// api.use('', auth.isUserLoggedIn, userRouter.routes())
api.use('/admin',  adminRouter.routes())
api.use('', userRouter.routes())

module.exports = api
