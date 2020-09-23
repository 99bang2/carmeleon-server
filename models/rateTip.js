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
		rateTip.hasMany(models.user, {
			foreignKey: 'uid',
			sourceKey: 'userUid'
		})
		rateTip.hasMany(models.rating, {
			foreignKey: 'uid',
			sourceKey: 'rateUid'
		})
	}
	rateTip.getByParams = async function (ctx, params) {
		let data = await rateTip.findOne({
			where:{
				userUid: params.userUid,
				uid: params.rateUid
			}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	rateTip.checkSelf = async function (ctx, params, models) {
		let data = await models.rating.count({
			where:{
				userUid: params.userUid,
				uid: params.rateUid
			}
		})
		return data
	}
	rateTip.checkTip = async function (ctx, params) {
		let data = await rateTip.count({
			where:{
				userUid: params.userUid,
				rateUid: params.rateUid
			}
		})
		return data
	}
	return rateTip
}
