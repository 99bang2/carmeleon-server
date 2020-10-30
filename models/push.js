'use strict'
const response = require('../libs/response')
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
		let result = await push.findAll({
			where: where
		})
		return result
	}
	return push
}
