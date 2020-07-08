'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const favorite = sequelize.define('favorite', {
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
		nickname: {
			type: DataTypes.STRING
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	favorite.associate = function (models) {
		favorite.belongsTo(models.user)
		favorite.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	favorite.getByUid = async function (ctx, uid) {
		let data = await favorite.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	favorite.getByUserUid = async function (ctx, uid, models) {
		let data = await favorite.findAll({
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
	favorite.search = async (params) => {
		let where = {}
		let result = await favorite.findAll({
			where: where
		})
		return result
	}
	return favorite
}
