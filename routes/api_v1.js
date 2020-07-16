'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const adminRouter = require('../routes/admin')
const userRouter = require('../routes/user')
const commonController = require('../controllers/common')
const accountController = require('../controllers/account')
const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')

const parkingController = require('../controllers/parkingSite')
const carWashController = require('../controllers/carWash')
const gasStationController = require('../controllers/gasStation')

const rateController = require('../controllers/rate')
const reviewTemplateController = require('../controllers/reviewTemplate')
const pointProductController = require('../controllers/pointProduct')
const carController = require('../controllers/car')
const cardController = require('../controllers/card')
const favoriteController = require('../controllers/favorite')
const pointLogController = require('../controllers/point')
const payLogController = require('../controllers/payLog')
const tutorialController = require('../controllers/tutorial')

/*
* Carmelon Sever
* */
/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */
/**
 * 인증
 */
api.post('/account/login', accountController.login)
api.get('/account/logout', accountController.logout)
api.get('/account/check', accountController.check)

api.post('/users/login', userController.login)
api.get('/users/logout', userController.logout)
api.get('/users/check', userController.check)

/**
 * admin&user Route
 */
api.use('/admin', auth.isAdminLoggedIn, adminRouter.routes())
api.use('', auth.isUserLoggedIn, userRouter.routes())

/**
 * 공통 컨트롤러
 */
api.post('/uploads', commonController.fileUpload)
api.post('/searchLocal', commonController.searchLocal)
//address : '주소'
api.post('/searchList', commonController.searchList)
//keyword : '주차장'
api.post('/avgRate', commonController.avgRate)
api.post('/codes', commonController.codes)

module.exports = api
