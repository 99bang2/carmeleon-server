'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const accountController = require('../controllers/account')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')
const parkingController = require('../controllers/parkingSite')
const rateController = require('../controllers/rate')

/*
* Carmelon Sever
* */
/**
 * POST: Insert, GET: Read, PUT: UPDATE, DELETE: DELETE
 */
/**
 * 인증
 */
api.post('/accounts/login', accountController.login)
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
api.get('/notices', auth.isEitherLoggedIn, noticeController.list)
api.get('/notices/:uid', auth.isEitherLoggedIn, noticeController.read)
api.put('/notices/:uid', auth.isAdminLoggedIn, noticeController.update)
api.delete('/notices/:uid', auth.isAdminLoggedIn, noticeController.delete)
api.post('/notices/bulkDelete', auth.isAdminLoggedIn, noticeController.bulkDelete) //복수삭제
/**
 * 이벤트 관리
 */
api.post('/events', eventController.create)
//api.post('/events', auth.isEitherLoggedIn, eventController.create)
api.get('/events', auth.isEitherLoggedIn, eventController.list)
api.get('/events/:uid', auth.isEitherLoggedIn, eventController.read)
api.put('/events/:uid', auth.isAdminLoggedIn, eventController.update)
api.delete('/events/:uid', auth.isAdminLoggedIn, eventController.delete)
api.post('/events/bulkDelete', auth.isAdminLoggedIn, eventController.bulkDelete) //복수삭제
/**
 * 주차장 관리
 */
api.post('/parkigs', parkingController.create)
api.get('/parkigs', parkingController.list)
api.get('/parkigs/:uid', parkingController.read)
api.put('/parkigs/:uid', parkingController.update)
/**
 * 리뷰 관리
 */
api.post('/rates', rateController.create)
api.get('/rates', rateController.list)
api.get('/rates/:uid', rateController.read)
api.get('/rates/site/:siteUid', rateController.siteList)
api.put('/rates/:uid', rateController.update)
api.delete('/rates/:uid', rateController.delete)

module.exports = api
