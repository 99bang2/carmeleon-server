'use strict'
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
		isRecommend: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		isBuy: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		isRate: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
		tableName: 'crawling_parking_sites'
	})
	return parkingSite
}
