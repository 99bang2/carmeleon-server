'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const rating = sequelize.define('rating', {
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
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	rating.associate = function (models) {
		rating.belongsTo(models.user),
		rating.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	rating.getByUid = async function (ctx, uid) {
		let data = await rate.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.search = async (params) => {
		let where = {}
		let result = await rating.findAll({
			where: where
		})
		return result
	}
	return rating
}
