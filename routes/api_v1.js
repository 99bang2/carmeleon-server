'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const commonController = require('../controllers/common')
const accountController = require('../controllers/account')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
const parkingController = require('../controllers/parkingSite')
const rateController = require('../controllers/rate')
const reviewTemplateController = require('../controllers/reviewTemplate')
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
api.get('/notices',  noticeController.list)
api.get('/notices/:uid', noticeController.read)
api.put('/notices/:uid', auth.isAdminLoggedIn, noticeController.update)
api.delete('/notices/:uid', auth.isAdminLoggedIn, noticeController.delete)
api.post('/notices/bulkDelete', auth.isAdminLoggedIn, noticeController.bulkDelete) //복수삭제
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
/**
 * 주차장 관리
 */
api.post('/parkings', parkingController.create)
api.get('/parkings', parkingController.list)
api.get('/parkings/:uid', parkingController.read)
api.put('/parkings/:uid', parkingController.update)
api.delete('/parkings/:uid',parkingController.delete)
api.post('/parkings/bulkDelete', parkingController.bulkDelete)//복수삭제
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
api.post('/reviewTemplates',auth.isAdminLoggedIn, reviewTemplateController.create)
api.get('/reviewTemplates', reviewTemplateController.list)
api.get('/reviewTemplates/:uid', reviewTemplateController.read)
api.put('/reviewTemplates/:uid',auth.isAdminLoggedIn, reviewTemplateController.update)
api.delete('/reviewTemplates/:uid',auth.isAdminLoggedIn, reviewTemplateController.delete)
api.post('/reviewTemplates/bulkDelete',auth.isAdminLoggedIn, reviewTemplateController.bulkDelete)

/**
 * 공통 컨트롤러
 */

api.post('/uploads', commonController.fileUpload)
api.post('/searchLocal', commonController.searchLocal)
//address : '주소'
api.post('/searchList', commonController.searchList)
//keyword : '주차장'

module.exports = api
