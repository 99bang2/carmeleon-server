'use strict'
const response = require('../libs/response')
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
			type: DataTypes.TEXT
		},
		rateType: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '0'
		},
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
		let where = {}
		if (targetType) {
			where.targetType = targetType
		}
		if (targetUid) {
			where.targetUid = targetUid
		}
		let data = await rating.findAll({
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
		let offset = null
		let limit = null
		let targetTable = ''
		if (params.targetType) {
			where.targetType = params.targetType
			switch (params.targetType) {
				case '0' : targetTable = 'parking_sites';
					break;
				case '1' : targetTable = 'gas_stations';
					break;
				case '2' : targetTable = 'car_washes';
					break;
				case '3' : targetTable = 'ev_charges';
					break;
				default : targetTable = 'parking_sites';
					break;
			}
		}
		if (params.targetUid) {
			where.targetUid = params.targetUid
		}
		if (params.page) {
			//offset, limit 처리//
			limit = 10
			offset = (Number(params.page) - 1) * limit
		}
		let order = [['createdAt', 'DESC']]
		if (params.order){
			order = sequelize.literal(`CHARACTER_LENGTH(review_content) DESC, \`rating\`.\`rate\` DESC, \`rating\`.\`created_at\` DESC`)
		}
		let result = await rating.findAll({
			include: [
				{
					model: models.user,
				}
			],
			offset: offset,
			limit: limit,
			where: where,
			order: order
		})
		// 필요 정보 //
		let count = await rating.findAll({
			attributes: [
				[sequelize.literal(`COUNT(CASE WHEN rate = 1 OR rate = 2 THEN 0 END)`), 'rate_1'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 3 OR rate = 4 THEN 0 END)`), 'rate_2'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 5 OR rate = 6 THEN 0 END)`), 'rate_3'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 7 OR rate = 8 THEN 0 END)`), 'rate_4'],
				[sequelize.literal(`COUNT(CASE WHEN rate = 9 OR rate = 10 THEN 0 END)`), 'rate_5'],
				[sequelize.literal(`COUNT(*)`), 'count'],
				[`(SELECT rate FROM `+targetTable+` WHERE uid=`+params.targetUid+')', 'avg_rate']
			],
			where: where
		})
		/////////////
		return {
			rows: result,
			count: count
		}
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
