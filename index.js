'use strict'

const koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const cors = require('koa2-cors')
const consola = require('consola')
const app = new koa()
const router = new Router()
const apiV1Router = require('./routes/api_v1')
const models = require('./models')
const response = require('./libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/configs/config.json')[env]

router.get('/', (ctx) => {
	ctx.body = 'OK'
})
router.use('/api', response.res, apiV1Router.routes())
app.use(cors())
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
//static
app.use(koaStatic('./uploads'));
models.sequelize.sync().then(async function () {
	let superAdmin = await models.account.findOne({
		where: {
			id: 'admin'
		}
	})
	if(!superAdmin) {
		models.account.create({
			id: 'admin',
			password: 'admin',
			name: '관리자',
			grade: 0
		})
	}

	let pointGames = await models.pointGame.count()
	if(pointGames === 0) {
		let pointGameArray = [{
			point: 10, probability: 10000
		},{
			point: 20, probability: 20160
		},{
			point: 30, probability: 29780
		},{
			point: 50, probability: 25000
		},{
			point: 100, probability: 15000
		},{
			point: 5000, probability: 50
		},{
			point: 10000, probability: 9
		},{
			point: 30000, probability: 1
		}]
		models.pointGame.bulkCreate(pointGameArray)
	}
	app.listen(config.listenPort, async () => {
		consola.ready({
			message: `Server listening on ${config.listenPort}`,
			badge: true
		})
	})
})



