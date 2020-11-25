const models = require('../models')
const response = require('../libs/response')
const commonController = require('../controllers/common')
const moment = require('moment')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	_.status = 0
	let push = await models.push.create(_)
	//add Push Default Data
	response.send(ctx, push)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
	let pushs = await models.push.search(_, models)
	response.send(ctx, pushs)
}

exports.userList = async function (ctx) {
	let user = await models.user.findByPk(ctx.user.uid)
	let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
	let where = {
		status: 1,
		[Op.or]: [{
			userUid: ctx.user.uid
		},{
			pushType: 2
		}],
		sendDate: {
			[models.Sequelize.Op.gte]: user.createdAt,
			[models.Sequelize.Op.between]: [
				moment().add(-4, 'weeks').format('YYYY-MM-DD'),
				currentDate
			]
		}
	}
	let result = await models.push.findAll({
		attributes: {
			include: [
				[models.sequelize.literal(`case when DATE(send_date) = DATE(NOW()) THEN true ELSE false END`), 'flag']
			]
		},
		where: where,
		order: [['sendDate','DESC']]
	})

	response.send(ctx, result)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	response.send(ctx, push)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	let _ = ctx.request.body
	Object.assign(push, _)
	await push.save()
	response.send(ctx, push)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let push = await models.push.getByUid(ctx, uid, models)
	await push.destroy()
	response.send(ctx, push)
}

exports.bulkDelete = async function (ctx) {
	let _ = ctx.request.body
	let deleteResult = await models.push.destroy({
		where: {
			uid: _.uids
		}
	})
	response.send(ctx, deleteResult)
}
