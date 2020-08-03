'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
module.exports = (sequelize, DataTypes) => {
	const couponLog = sequelize.define('couponLog', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		///////////////////////
		userUid: {
			type: DataTypes.INTEGER
		},
		siteUid: {
			type: DataTypes.INTEGER
		},
		couponUid: {
			type: DataTypes.INTEGER
		},
		status: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	couponLog.associate = function (models) {
		couponLog.belongsTo(models.user)
		couponLog.belongsTo(models.coupon)
		couponLog.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	couponLog.getByUid = async function (ctx, uid) {
		let data = await couponLog.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	couponLog.search = async (params, models) => {
		let where = {}
		if (params.userUid){
			where.userUid = params.userUid
		}
		let result = await couponLog.findAll({
			//TODO:추후 필요한 사항만 attribute 넣어 놓을 것
			include: [
				{
					model: models.parkingSite,
				}, {
					model: models.coupon,
				}, {
					model: models.user,
				},
			],
			where: where
		})
		let count = await couponLog.count({
			where: where
		})
		return {
			rows: result,
			count: count
		}
	}
	couponLog.getByUserUid = async function (ctx, uid, models) {
		let data = await couponLog.findAll({
            include: [
                {
                    model: models.parkingSite,
                }, {
                    model: models.coupon,
                }
            ],
			where: {userUid:uid}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	return couponLog
}
