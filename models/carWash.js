'use strict'
const response = require('../libs/response')

module.exports = (sequelize, DataTypes) => {
	const carWash = sequelize.define('carWash', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		carWashName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		carWashIndustry: {
			type:DataTypes.STRING
		},
		carWashType: {
			type:DataTypes.STRING
		},
		address: {
			type: DataTypes.STRING
		},
		sido: {
			type: DataTypes.STRING
		},
		sigungu:{
			type: DataTypes.STRING
		},
		closedDay: {
			type: DataTypes.STRING,
		},
		weekdayOperOpenHhmm: {
			type: DataTypes.STRING
		},
		weekdayOperCloseHhmm: {
			type: DataTypes.STRING
		},
		holidayOperOpenHhmm: {
			type: DataTypes.STRING
		},
		holidayOperCloseHhmm: {
			type: DataTypes.STRING
		},
		carWashChargeInfo:{
			type: DataTypes.STRING
		},
		phoneNumber: {
			type: DataTypes.STRING
		},
		lat: {
			type:DataTypes.DOUBLE
		},
		lon: {
			type:DataTypes.DOUBLE
		},
		picture: {
			type: DataTypes.JSON
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	carWash.associate = function (models) {
		//carWash.hasMany(models.rating, {foreignKey: 'site_uid'})
		carWash.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 2
			}
		})
		carWash.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 2
			}
		})
	}
	carWash.getByUid = async function (ctx, uid) {
		let data = await carWash.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	carWash.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.carWashType) {
			where.carWashType = params.carWashType
		}

		let result = await carWash.findAll({
			order: order,
			where: where
		})
		return result
	}

	carWash.userSearch = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let longitude = params.lon ? parseFloat(params.lon) : null
		let latitude = params.lat ? parseFloat(params.lat) : null
		let radius = params.radius
		let distaceQuery = sequelize.where(sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`),'<=',radius)
		if(!radius){
			distaceQuery = null
		}
		if (params.carWashType) {
			where.site_type = params.carWashType
		}
		where.is_active = 1
		let result = await carWash.findAll({
			attributes: {
				include: [
					[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
					[`(SELECT count(*) FROM ratings WHERE site_uid = carWash.uid)`, 'rate_count']]
			},
			order: order,
			where: [
				distaceQuery
				,where
			]
		})
		return result
	}

	return carWash
}
