'use strict'
const response = require('../libs/response')
const Op = require('sequelize').Op
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
	const push = sequelize.define('push', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		pushType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		topic: {
			type: DataTypes.STRING
		},
		title: {
			type: DataTypes.STRING
		},
		body: {
			type: DataTypes.STRING
		},
		image: {
			type: DataTypes.STRING
		},
		sendDate: {
			type: DataTypes.DATE
		},
		status: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		userToken: {
			type: DataTypes.STRING
		},
		userUid: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	push.getByUid = async function (ctx, uid) {
		let data = await push.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	push.search = async (params, models) => {
		let where = {}
		if(params.status){
			where.status = params.status
		}
		let result = await push.findAll({
			where: where
		})
		return result
	}
	push.userList = async (userUid) => {
		let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')
		let where = {
			status: 1,
			[Op.or]: [{
				userUid: userUid
			},{
				pushType: 2
			}],
			sendDate: {
				[Op.between]: [
					moment().add(-4, 'weeks').format('YYYY-MM-DD'),
					currentDate
				]
			}
		}
		let result = await push.findAll({
			attributes: {
				include: [
					[sequelize.literal(`case when DATE(send_date) = DATE(NOW()) THEN true ELSE false END`), 'flag']
				]
			},
			where: where,
			order: [['sendDate','DESC']]
		})
		return result
	}
	return push
}
