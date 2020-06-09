'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const rate = sequelize.define('rate', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		siteUid: {
			type: DataTypes.INTEGER
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		review: {
			type: DataTypes.STRING
		},
		rateType: {
			type: DataTypes.CHAR
		}
	}, {
		timestamps: true,
		underscored: true
	})
	rate.associate = function (models) {
		rate.belongsTo(models.user)
	}
	rate.getByUid = async function (ctx, uid) {
		let data = await rate.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rate.search = async (params) => {
		let where = {}
		let result = await rate.findAll({
			where: where
		})
		return result
	}
	return rate
}
