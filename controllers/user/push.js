const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')

exports.list = async function (ctx) {
	let user = await models.user.findByPk(ctx.user.uid)
	let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
	let where = {
		status: 1,
		[models.Sequelize.Op.or]: [{
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
		where: where,
		order: [['sendDate','DESC']]
	})
	if(!user.newMessage) {
		for(let push of result) {
			push.dataValues.flag = false
		}
	}else {
		for(let push of result) {
			if(moment(user.newMessage).isAfter(moment(push.sendDate))) {
				push.dataValues.flag = false
			}else {
				push.dataValues.flag = true
			}
		}
		user.newMessage = null
		await user.save()
	}
	response.send(ctx, result)
}
