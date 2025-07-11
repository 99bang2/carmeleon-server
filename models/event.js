'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes')
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
		mainImage: {
			type: DataTypes.STRING
		},
		bannerImage: {
			type: DataTypes.STRING
		},
		accountUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		startDate: {
			type: DataTypes.DATE
		},
		endDate: {
			type: DataTypes.DATE
		},
		operator: {
			type: DataTypes.STRING
		},
		caution: {
			type: DataTypes.STRING
		},
		eventType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		eventTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('eventType') !== null) {
					return codes.eventType[this.getDataValue('eventType')]
				} else {
					return null
				}
			}
		},
		eventCustomType: {
			type: DataTypes.STRING,
			defaultValue: 'none'
		},
		eventCustomTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('eventCustomType') !== null) {
					return codes.eventCustomType[this.getDataValue('eventCustomType')]
				} else {
					return null
				}
			}
		},
		isOpen: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	event.associate = function (models) {
		event.belongsTo(models.account)
	}
	event.getByUid = async function (ctx, uid, models) {
		let data = await event.findByPk(uid, {
			include: [{
				model: models.account
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	event.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let result = await event.findAll({
			where: where,
			order: order,
			include: [{
				model: models.account
			}]
		})
		return result
	}

	return event
}
