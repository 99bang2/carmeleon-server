'use strict'
const response = require('../libs/response')
const axios = require('axios')
const ip = require('ip')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]

module.exports = (sequelize, DataTypes) => {
	const rating = sequelize.define('rating', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		targetType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		targetUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		userUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		reviewTemplateUid: {
			type: DataTypes.INTEGER,
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		reviewTitle: {
			type: DataTypes.STRING
		},
		reviewContent: {
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
		paranoid: true,
		hooks: {}
	})
	rating.associate = function (models) {
		rating.belongsTo(models.user),
		rating.belongsTo(models.reviewTemplate),
		//rating.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
		rating.belongsTo(models.parkingSite, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'parkingSite'
		})
		rating.belongsTo(models.gasStation, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'gasStation'
		})
		rating.belongsTo(models.carWash, {
			foreignKey: 'targetUid',
			constraints: false,
			as: 'carWash'
		})
	}
	rating.getByUid = async function (ctx, uid, models) {
		let data = await rating.findByPk(uid, {
			include: [{
				model: models.user
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.getByTargetUid = async function (ctx, targetType, targetUid) {
		let rateWhere = 'target_type = 0 AND target_uid = parkingSite.uid)'
		let where = {}
		if (targetType) {
			where.targetType = targetType
		}
		if (targetUid) {
			where.targetUid = targetUid
		}
		let data = await rating.findAll({
			attributes: {
				include: [
					[`(SELECT COUNT(CASE WHEN rate = 1 OR rate = 2 THEN 0 END) FROM ratings WHERE ` + rateWhere, 'rate_1'],
					[`(SELECT COUNT(CASE WHEN rate = 3 OR rate = 4 THEN 0 END) FROM ratings WHERE ` + rateWhere, 'rate_2'],
					[`(SELECT COUNT(CASE WHEN rate = 5 OR rate = 6 THEN 0 END) FROM ratings WHERE ` + rateWhere, 'rate_3'],
					[`(SELECT COUNT(CASE WHEN rate = 7 OR rate = 8 THEN 0 END) FROM ratings WHERE ` + rateWhere, 'rate_4'],
					[`(SELECT COUNT(CASE WHEN rate = 9 OR rate = 10 THEN 0 END) FROM ratings WHERE ` + rateWhere, 'rate_5']
				]
			},
			where: where
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rating.getByUserUid = async function (ctx, uid, params, models) {
		let data = await rating.findAll({
			include: [{
				as: 'parkingSite',
				model: models.parkingSite
			}, {
				as: 'gasStation',
				model: models.gasStation
			}, {
				as: 'carWash',
				model: models.carWash
			},],
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			where: {userUid: uid}
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
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			where: where,
			order: order
		})
		return result
	}
	rating.avgRate = async (targetType, targetUid) => {
		let data = await rating.findAll({
			attributes: [[sequelize.fn('AVG', sequelize.col('rate')), 'ratingAvg']],
			where: {
				targetType: targetType,
				targetUid: targetUid
			},
		})
		return data
	}
	return rating
}
