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
api.post('/admin/login', accountController.login)
api.get('/admin/logout', accountController.logout)
api.get('/admin/check', accountController.check)
api.get('/admin/unique/:id', accountController.checkUniqueId) //아이디중복체크
/**
 * 관리자 관리
 */
api.post('/accounts', accountController.create)
api.get('/accounts', accountController.list)
api.get('/accounts/:uid', accountController.read)
api.put('/accounts/:uid', accountController.update)
api.delete('/accounts/:uid', accountController.delete)
api.post('/accounts/bulkDelete', accountController.bulkDelete)//복수삭제
/**
 * 공지사항 관리
 */
api.post('/notices', noticeController.create)
api.get('/notices', noticeController.list)
api.get('/notices/:uid', noticeController.read)
api.put('/notices/:uid', noticeController.update)
api.delete('/notices/:uid', noticeController.delete)
api.post('/notices/bulkDelete', noticeController.bulkDelete) //복수삭제
/**
 * 이벤트 관리
 */
api.post('/events', eventController.create)
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)
api.put('/events/:uid', eventController.update)
api.delete('/events/:uid', eventController.delete)
api.post('/events/bulkDelete', eventController.bulkDelete) //복수삭제

module.exports = api
