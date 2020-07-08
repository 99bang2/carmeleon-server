'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const payLog = sequelize.define('payLog', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		payInfo: {
			type: DataTypes.JSON
		},
		status: {
			type: DataTypes.INTEGER
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		siteUid: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	payLog.associate = function (models) {
		payLog.belongsTo(models.user)
		payLog.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	payLog.getByUid = async function (ctx, uid) {
		let data = await payLog.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	payLog.getByUserUid = async function (ctx, uid, models) {
		let data = await payLog.findAll({
			include: [{
				model: models.parkingSite
			}],
			where: {userUid:uid}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	payLog.search = async (params) => {
		let where = {}
		let result = await payLog.findAll({
			where: where
		})
		return result
	}
	return payLog
}
