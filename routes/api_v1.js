'use strict'
const Router = require('koa-router')
const api = new Router()
const adminController = require('../controllers/admin')
const noticeController = require('../controllers/admin')
const eventController = require('../controllers/admin')

/*
* Carmelon Sever
* */
api.post('/admins', adminController.create)
api.get('/admins', adminController.list)
api.get('/admins/:uid', adminController.read)
api.put('/admins/:uid', adminController.update)
api.delete('/admins/:uid', adminController.delete)

api.post('/notices', noticeController.create)
api.get('/notices', noticeController.list)
api.get('/notices/:uid', noticeController.read)
api.put('/notices/:uid', noticeController.update)
api.delete('/notices/:uid', noticeController.delete)

api.post('/events', eventController.create)
api.get('/events', eventController.list)
api.get('/events/:uid', eventController.read)
api.put('/events/:uid', eventController.update)
api.delete('/events/:uid', eventController.delete)

module.exports = api
