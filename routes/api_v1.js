'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const accountController = require('../controllers/account')
const noticeController = require('../controllers/notice')
const eventController = require('../controllers/event')

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
api.get('/account/unique/:id', accountController.checkUniqueId)
/**
 * 관리자 관리
 */
api.post('/accounts', auth.isAdminLoggedIn, accountController.create)
api.get('/accounts', auth.isAdminLoggedIn, accountController.list)
api.get('/accounts/:uid', auth.isAdminLoggedIn, accountController.read)
api.put('/accounts/:uid', auth.isAdminLoggedIn, accountController.update)
api.delete('/accounts/:uid', auth.isAdminLoggedIn, accountController.delete)
api.post('/accounts/bulkDelete', auth.isAdminLoggedIn, accountController.bulkDelete)//복수삭제
/**
 * 공지사항 관리
 */
api.post('/notices', auth.isAdminLoggedIn, noticeController.create)
api.get('/notices', auth.isAdminLoggedIn, noticeController.list)
api.get('/notices/:uid', auth.isAdminLoggedIn, noticeController.read)
api.put('/notices/:uid', auth.isAdminLoggedIn, noticeController.update)
api.delete('/notices/:uid', auth.isAdminLoggedIn, noticeController.delete)
api.post('/notices/bulkDelete', auth.isAdminLoggedIn, noticeController.bulkDelete) //복수삭제
/**
 * 이벤트 관리
 */
api.post('/events', auth.isAdminLoggedIn, eventController.create)
api.get('/events', auth.isAdminLoggedIn, eventController.list)
api.get('/events/:uid', auth.isAdminLoggedIn, eventController.read)
api.put('/events/:uid', auth.isAdminLoggedIn, eventController.update)
api.delete('/events/:uid', auth.isAdminLoggedIn, eventController.delete)
api.post('/events/bulkDelete', auth.isAdminLoggedIn, eventController.bulkDelete) //복수삭제

module.exports = api
