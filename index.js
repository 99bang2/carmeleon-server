'use strict'

const koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const cors = require('koa2-cors')
const { userAgent } = require('koa-useragent')
const consola = require('consola')
const app = new koa()
const router = new Router()
const apiV1Router = require('./routes/api_v1')
const models = require('./models')
const response = require('./libs/response')
const init = require('./libs/init')
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/configs/config.json')[env]
router.get('/', (ctx) => ctx.body = 'OK')
router.use('/api', response.res, apiV1Router.routes())
app.use(cors())
app.use(userAgent)
app.use(koaBody({
	formidable: {
		uploadDir: './uploads',
		maxFileSize: 200 * 1024 * 1024, //Upload file size
		maxFieldsSize: 20 * 1024 * 1024, //Upload file size
		keepExtensions: true //  Extensions to save images
	},
	multipart: true,
}))
app.use(router.routes()).use(router.allowedMethods())
app.use(koaStatic('./uploads'));

models.sequelize.sync().then(async function () {
	await init.start()
	app.listen(config.listenPort, async () => {
		consola.ready({
			message: `Server listening on ${config.listenPort}`,
			badge: true
		})
	})
})



