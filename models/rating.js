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
			type: DataTypes.INTEGER,
			allowNull: false
		},
		userUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		review: {
			type: DataTypes.STRING
		},
		rateType: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '0'
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
	rating.getByUid = async function (ctx, uid, models) {
		let data = await rate.findByPk(uid, {
			include: [{
				model: models.account
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.getBySiteUid = async function (ctx, siteUid) {
		let where = {}
		if(siteUid) {
			where.siteUid = siteUid
		}
		let data = await rating.findAll({
			where: where
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let result = await rating.findAll({
			where: where,
			order: order,
			include: [{
				model: models.parkingSite
			}]
		})
		return result
	}
	return rating
}
