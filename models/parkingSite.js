'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
	const parkingSite = sequelize.define('parkingSite', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		siteType: {
			type: DataTypes.INTEGER
		},
		siteTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('siteType') !== null) {
					return codes.site[this.getDataValue('siteType')]
				}
			}
		},
		lat: {
			type: DataTypes.DOUBLE
		},
		lon: {
			type: DataTypes.DOUBLE
		},
		parkingLot: {
			type: DataTypes.INTEGER
		},
		tel: {
			type: DataTypes.STRING
		},
		phone: {
			type: DataTypes.STRING
		},
		email: {
			type: DataTypes.STRING
		},
		manager: {
			type: DataTypes.STRING
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		paymentTag: {
			type: DataTypes.JSON
		},
		paymentTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('paymentTag') !== null) {
					return this.getDataValue('paymentTag').map(function (obj) {
						return codes.paymentTag[obj]
					})
				}
			}
		},
		brandTag: {
			type: DataTypes.JSON
		},
		brandTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('brandTag') !== null) {
					return this.getDataValue('brandTag').map(function (obj) {
						return codes.brandTag[obj]
					})
				}
			}
		},
		productTag: {
			type: DataTypes.JSON
		},
		productTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('productTag') !== null) {
					return this.getDataValue('productTag').map(function (obj) {
						return codes.productTag[obj]
					})
				}
			}
		},
		optionTag: {
			type: DataTypes.JSON
		},
		optionTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('optionTag') !== null) {
					return this.getDataValue('optionTag').map(function (obj) {
						return codes.optionTag[obj]
					})
				}
			}
		},
		carTag: {
			type: DataTypes.JSON
		},
		carTagName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('carTag') !== null) {
					return this.getDataValue('carTag').map(function (obj) {
						return codes.carTag[obj]
					})
				}
			}
		},
		price: {
			type: DataTypes.INTEGER
		},
		rate: {
			type: DataTypes.DOUBLE
		},
		address: {
			type: DataTypes.STRING
		},
		info: {
			type: DataTypes.TEXT
		},
		priceInfo: {
			type: DataTypes.TEXT
		},
		timeInfo: {
			type: DataTypes.TEXT
		},
		picture: {
			type: DataTypes.JSON
		},
		operationTime: {
			type: DataTypes.STRING
		},
		accountUid: {
			type: DataTypes.INTEGER
		},
		valetType: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		valetTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('valetType') !== null) {
					return codes.site[this.getDataValue('valetType')]
				}
			}
		},
		isBuy: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	parkingSite.associate = function (models) {
		//parkingSite.hasMany(models.rating, {foreignKey: 'site_uid'})
		parkingSite.hasMany(models.rating, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 0
			}
		})
		parkingSite.hasMany(models.favorite, {
			foreignKey: 'targetUid',
			constraints: false,
			scope: {
				targetType: 0
			}
		})
		parkingSite.hasMany(models.discountTicket, {
			foreignKey: 'siteUid'
		})
	}
	parkingSite.getByUid = async function (ctx, uid, params, models) {
		let userUid = null
		if(params.userUid){
			userUid = params.userUid
		}
		let favoriteCheck = 'target_type = 0 AND target_uid = '+uid+' AND user_uid = '+userUid+' AND deleted_at IS NULL)'
		let data = await parkingSite.findByPk(uid, {
			//TODO: Attribute 필요 항목만//
			include: [{
				model: models.discountTicket
			}],
			attributes: {
				include: [
					[Sequelize.literal(`(SELECT count(uid) FROM favorites WHERE ` + favoriteCheck) , 'favoriteFlag']
				]
			}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	parkingSite.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]

		if (params.siteType) {
			where.siteType = params.siteType
		}
		if (params.accountUid) {
			where.accountUid = params.accountUid
		}

		let result = await parkingSite.findAll({
			order: order,
			where: where
		})
		return result
	}

	parkingSite.userSearch = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let longitude = params.lon ? parseFloat(params.lon) : null
		let latitude = params.lat ? parseFloat(params.lat) : null
		let radius = params.radius
		let distanceQuery = sequelize.where(sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
		let rateWhere = 'target_type = 0 AND target_uid = parkingSite.uid)'
		if (!radius) {
			distanceQuery = null
		}
		if (params.siteType) {
			where.site_type = params.siteType
		}
		// if(params.paymentTag){
		// 	if(params.paymentTag.indexOf(',') !== -1){
		// 		let tagArr = params.paymentTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`payment_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.payment_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.payment_tag = {
		// 			[Op.substring]: params.paymentTag
		// 		}
		// 	}
		// }
		// if(params.brandTag){
		// 	//where.brandTag = params.brandTag
		// 	if(params.brandTag.indexOf(',') !== -1){
		// 		let tagArr = params.brandTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`brand_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.brand_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.brand_tag = {
		// 			[Op.substring]: params.brandTag
		// 		}
		// 	}
		// }
		// if(params.productTag){
		// 	if(params.productTag.indexOf(',') !== -1){
		// 		let tagArr = params.productTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`product_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.product_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.product_tag = {
		// 			[Op.substring]: params.productTag
		// 		}
		// 	}
		// }
		// if(params.optionTag){
		// 	if(params.optionTag.indexOf(',') !== -1){
		// 		let tagArr = params.optionTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`option_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.option_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.option_tag = {
		// 			[Op.substring]: params.optionTag
		// 		}
		// 	}
		// }
		// if(params.carTag){
		// 	if(params.carTag.indexOf(',') !== -1){
		// 		let tagArr = params.carTag.split(',')
		// 		let tagWhereArr = []
		// 		for(let i in tagArr){
		// 			tagWhereArr.push(sequelize.where(sequelize.literal(`car_tag`), 'like', '%'+tagArr[i]+'%'))
		// 		}
		// 		where.car_tag = {
		// 			[Op.and] : tagWhereArr
		// 		}
		// 	}else{
		// 		where.car_tag = {
		// 			[Op.substring]: params.carTag
		// 		}
		// 	}
		// }
		let result = await parkingSite.findAll({
			attributes: {
				include: [
					[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
					[`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count']
				]
			},
			order: order,
			where: [
				distanceQuery
				, where
			]
		})
		return result
	}

	return parkingSite
}
