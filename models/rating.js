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
		targetType:{
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
		paranoid: true,
		hooks: {}
	})
	rating.associate = function (models) {
		rating.belongsTo(models.user),
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
	rating.getByUserUid = async function (ctx, uid, models) {
		let data = await rating.findAll({
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
	rating.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let result = await rating.findAll({
			where: where,
			order: order
		})
		return result
	}
	rating.avgRate = async (siteUid) => {
		let data = await rating.findAll({
			attributes: [[sequelize.fn('AVG', sequelize.col('rate')), 'ratingAvg']],
			where: {
				siteUid: siteUid
			},
		})
		return data
	}
	return rating
}
