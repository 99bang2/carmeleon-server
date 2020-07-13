'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const commonController = require('../controllers/common')
const accountController = require('../controllers/account')
const userController = require('../controllers/user')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
const parkingController = require('../controllers/parkingSite')
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
 * 관리자 관리
 */
api.post('/accounts', auth.isAdminLoggedIn, accountController.create)
api.get('/accounts', auth.isAdminLoggedIn, accountController.list)
api.get('/accounts/:uid', auth.isAdminLoggedIn, accountController.read)
api.put('/accounts/:uid', auth.isAdminLoggedIn, accountController.update)
api.delete('/accounts/:uid', auth.isAdminLoggedIn, accountController.delete)
api.post('/accounts/bulkDelete', auth.isAdminLoggedIn, accountController.bulkDelete)//복수삭제
api.put('/accounts/changePassword/:uid', auth.isAdminLoggedIn, accountController.changePassword)// 비밀번호 변경
api.get('/account/unique/:id', auth.isAdminLoggedIn, accountController.checkUniqueId)
/**
 * 공지사항 관리
 */
api.post('/notices', auth.isAdminLoggedIn, noticeController.create)
api.get('/notices', noticeController.list)
api.get('/notices/:uid', noticeController.read)
api.put('/notices/:uid', auth.isAdminLoggedIn, noticeController.update)
api.delete('/notices/:uid', auth.isAdminLoggedIn, noticeController.delete)
api.post('/notices/bulkDelete', auth.isAdminLoggedIn, noticeController.bulkDelete) //복수삭제
api.get('/userNotices', noticeController.userList)
/**
 * 이벤트 관리
 */
api.post('/events', eventController.create)
//api.post('/events', auth.isEitherLoggedIn, eventController.create)
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)
api.put('/events/:uid', auth.isAdminLoggedIn, eventController.update)
api.delete('/events/:uid', auth.isAdminLoggedIn, eventController.delete)
api.post('/events/bulkDelete', auth.isAdminLoggedIn, eventController.bulkDelete) //복수삭제
api.get('/userEvents', eventController.userList)
/**
 * 주차장 관리
 */
api.post('/parkings', parkingController.create)
api.get('/parkings', parkingController.list)
api.get('/parkings/:uid', parkingController.read)
api.put('/parkings/:uid', parkingController.update)
api.delete('/parkings/:uid', parkingController.delete)
api.post('/parkings/bulkDelete', parkingController.bulkDelete)//복수삭제
api.get('/userParkings', parkingController.userList)
/**
 * 리뷰 관리
 */
api.post('/rates', rateController.create)
api.get('/rates', rateController.list)
api.get('/rates/:uid', rateController.read)
api.get('/rates/site/:siteUid', rateController.siteList)
api.put('/rates/:uid', rateController.update)
api.delete('/rates/:uid', rateController.delete)
api.post('/rates/bulkDelete', rateController.bulkDelete)//복수삭제

/**
 * 리뷰 템플릿 관리
 */
api.post('/reviewTemplates', auth.isAdminLoggedIn, reviewTemplateController.create)
api.get('/reviewTemplates', reviewTemplateController.list)
api.get('/reviewTemplates/:uid', reviewTemplateController.read)
api.put('/reviewTemplates/:uid', auth.isAdminLoggedIn, reviewTemplateController.update)
api.delete('/reviewTemplates/:uid', auth.isAdminLoggedIn, reviewTemplateController.delete)
api.post('/reviewTemplates/bulkDelete', auth.isAdminLoggedIn, reviewTemplateController.bulkDelete)

/**
 * 포인트 상품 관리
 */
api.post('/pointProducts', auth.isAdminLoggedIn, pointProductController.create)
api.get('/pointProducts', pointProductController.list)
api.get('/pointProducts/:uid', pointProductController.read)
api.put('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.update)
api.post('/pointProducts/addPoint', auth.isAdminLoggedIn, pointProductController.addPoint)
api.delete('/pointProducts/:uid', auth.isAdminLoggedIn, pointProductController.delete)
api.post('/pointProducts/bulkDelete', auth.isAdminLoggedIn, pointProductController.bulkDelete)

/**
 * 유저 관련 컨트롤러
 */
api.post('/users', userController.create)
api.get('/users', userController.list)
api.get('/users/:uid', userController.read)
api.put('/users/:uid', userController.update)
api.delete('/users/:uid', userController.delete)
api.post('/users/bulkDelete', userController.bulkDelete)
//유저 정보 조회
api.get('/userCars/:userUid', carController.userList)
api.get('/userCards/:userUid', cardController.userList)
api.get('/userFavorites/:userUid', favoriteController.userList)
api.get('/userPointLogs/:userUid', pointLogController.userList)
api.get('/userPayLogs/:userUid', payLogController.userList)
api.get('/userRatings/:userUid', rateController.userList)

/**
 * 튜토리얼
 */
api.post('/tutorials', tutorialController.setTutorial)
api.get('/tutorials', tutorialController.getTutorial)
//api.put('/tutorials/:uid', tutorialController.setTutorial)


// api.post('/cars', carController.create)
// api.get('/cars', carController.list)
//api.get('/cars/:uid', carController.read)
// api.put('/cars/:uid', carController.update)
// api.delete('/cars/:uid', carController.delete)

// api.post('/cards', cardController.create)
// api.get('/cards', cardController.list)
//api.get('/cards/:uid', cardController.read)
// api.put('/cards/:uid', cardController.update)
// api.delete('/cards/:uid', cardController.delete)

// api.post('/favorites', favoriteController.create)
// api.get('/favorites', favoriteController.list)
//api.get('/favorites/:uid', favoriteController.read)
// api.put('/favorites/:uid', favoriteController.update)
// api.delete('/favorites/:uid', favoriteController.delete)

// api.post('/points', pointController.create)
// api.get('/points', pointController.list)
//api.get('/points/:uid', pointController.read)
// api.put('/points/:uid', pointController.update)
// api.delete('/points/:uid', pointController.delete)

// api.post('/payLogs', payLogController.create)
// api.get('/payLogs', payLogController.list)
//api.get('/payLogs/:uid', payLogController.read)
// api.put('/payLogs/:uid', payLogController.update)
// api.delete('/payLogs/:uid', payLogController.delete)

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
