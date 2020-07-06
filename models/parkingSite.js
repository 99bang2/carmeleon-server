'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')

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
					return codes.site[this.getDataValue('siteType')].text
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
					let dataLength = this.getDataValue('paymentTag').length
					let dataArray = []
					for(let i = 0; i < dataLength; i++){
						switch (this.getDataValue('paymentTag')[i]) {
							case 'card' : dataArray.push(codes.paymentTag[0].name); break;
							case 'cash' : dataArray.push(codes.paymentTag[1].name); break;
							case 'inApp' : dataArray.push(codes.paymentTag[2].name); break;
						}
					}
					return dataArray
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
					let dataLength = this.getDataValue('brandTag').length
					let dataArray = []
					for(let i = 0; i < dataLength; i++){
						switch (this.getDataValue('brandTag')[i]) {
							case 'hiParking' : dataArray.push(codes.brandTag[0].name); break;
							case 'cityOfSeoul' : dataArray.push(codes.brandTag[1].name); break;
						}
					}
					return dataArray
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
					let dataLength = this.getDataValue('productTag').length
					let dataArray = []
					for(let i = 0; i < dataLength; i++){
						switch (this.getDataValue('productTag')[i]) {
							case 'timePass' : dataArray.push(codes.productTag[0].name); break;
							case 'dayPass' : dataArray.push(codes.productTag[1].name); break;
							case 'monthPass' : dataArray.push(codes.productTag[2].name); break;
						}
					}
					return dataArray
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
					let dataLength = this.getDataValue('optionTag').length
					let dataArray = []
					for(let i = 0; i < dataLength; i++){
						switch (this.getDataValue('optionTag')[i]) {
							case 'cityCar' : dataArray.push(codes.optionTag[0].name); break;
							case 'cityOfSeoul' : dataArray.push(codes.optionTag[1].name); break;
							case 'disabled' : dataArray.push(codes.optionTag[2].name); break;
							case 'pregnant' : dataArray.push(codes.optionTag[3].name); break;
							case 'female' : dataArray.push(codes.optionTag[4].name); break;
							case 'elecCharge' : dataArray.push(codes.optionTag[5].name); break;
							case 'mechanical' : dataArray.push(codes.optionTag[6].name); break;
						}
					}
					return dataArray
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
					let dataLength = this.getDataValue('carTag').length
					let dataArray = []
					for(let i = 0; i < dataLength; i++){
						switch (this.getDataValue('carTag')[i]) {
							case 'bus' : dataArray.push(codes.carTag[0].name); break;
							case 'freight' : dataArray.push(codes.carTag[1].name); break;
						}
					}
					return dataArray
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
		picture: {
			type: DataTypes.JSON
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
	})
	parkingSite.associate = function (models) {
		parkingSite.hasMany(models.rating, {foreignKey: 'site_uid'})
	}
	parkingSite.getByUid = async function (ctx, uid) {
		let data = await parkingSite.findByPk(uid)
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
		let radius = params.radius ? params.radius : 0

		if (params.siteType) {
			where.site_type = params.siteType
		}
		where.is_active = false

		let result = await parkingSite.findAll({
			attributes: {
				include: [
					[`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`, 'distance'],
					[`(SELECT count(*) FROM ratings WHERE site_uid = parkingSite.uid)`, 'rate_count']]
			},
			order: order,
			where: [
				sequelize.where(sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`),'<=',radius)
				,where
			]
		})
		return result
	}

	return parkingSite
}
