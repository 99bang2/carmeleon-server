'use strict'
const Promise = require('bluebird')
const response = require('../libs/response')

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
		brandTag: {
			type: DataTypes.JSON
		},
		productTag: {
			type: DataTypes.JSON
		},
		optionTag: {
			type: DataTypes.JSON
		},
		carTag: {
			type: DataTypes.JSON
		},
		price: {
			type: DataTypes.INTEGER
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
		parkingSite.hasMany(models.rating, {foreignKey:'site_uid'})
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
		if(params.siteType) {
			where.siteType = params.siteType
		}
		let result = await parkingSite.findAll({
			order: order,
			where: where
		})
		return result
	}

	return parkingSite
}
