'use strict'
const response = require('../libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]

module.exports = (sequelize, DataTypes) => {
	const rateTip = sequelize.define('rateTip', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		userUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		rateUid: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		rateTip: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true,
		hooks: {}
	})
	rateTip.associate = function (models) {
		rateTip.belongsTo(models.user)
		// rateTip.hasMany(models.rating, {
		// 	foreignKey: 'uid',
		// 	sourceKey: 'rateUid'
		// })
	}
	return rateTip
}
