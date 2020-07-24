'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const seasonTicket = sequelize.define('seasonTicket', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		siteUid:{
			type: DataTypes.INTEGER,
		},
		ticketType: {
			type: DataTypes.INTEGER,
		},
		ticketTime: {
			type: DataTypes.INTEGER,
		},
		ticketPrice: {
			type: DataTypes.INTEGER,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	seasonTicket.associate = function (models) {
		// seasonTicket.hasMany(models.parkingSite, {
		// 	foreignKey: 'siteUid',
		// })
	}
	seasonTicket.getByUid = async function (ctx, uid) {
		let data = await seasonTicket.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	seasonTicket.search = async (params) => {
		let where = {}
		let result = await seasonTicket.findAll({
			where: where
		})
		return result
	}
	return seasonTicket
}
