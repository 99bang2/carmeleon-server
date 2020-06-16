'use strict'
const Router = require('koa-router')
const api = new Router()
const auth = require('../libs/auth')
const adminController = require('../controllers/admin')
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
// api.post('/auth/login', auth.login)
// api.get('/auth/logout', auth.logout)
// api.get('/auth/check', auth.check)
/**
 * 관리자 관리
 */
api.post('/admins', adminController.create)
api.get('/admins', adminController.list)
api.get('/admins/:uid', adminController.read)
api.put('/admins/:uid', adminController.update)
api.delete('/admins/:uid', adminController.delete)
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
api.post('/notices/bulkDelete', eventController.bulkDelete) //복수삭제

module.exports = api
