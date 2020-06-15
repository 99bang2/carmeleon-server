'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const event = sequelize.define('event', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING
		},
		mainPicture: {
			type: DataTypes.STRING
		},
		subPicture: {
			type: DataTypes.STRING
		},
		adminUid: {
			type: DataTypes.INTEGER
		},
		startDate: {
			type: DataTypes.DATE
		},
		endDate: {
			type: DataTypes.DATE
		},
		eventType: {
			type: DataTypes.INTEGER
		},
		isOpen: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	event.associate = function (models) {
		event.belongsTo(models.admin)
	}
	event.getByUid = async function (ctx, uid) {
		let data = await event.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	event.search = async (params) => {
		let where = {}
		let result = await event.findAll({
			where: where
		})
		return result
	}
	return event
}
