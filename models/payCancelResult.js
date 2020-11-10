'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const payResult = sequelize.define('payResult', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		userUid: {
			type: DataTypes.INTEGER
		},
		resultCode: {
			type: DataTypes.STRING
		},
		resultMsg: {
			type: DataTypes.STRING
		},
		errorCd: {
			type: DataTypes.STRING
		},
		errorMsg: {
			type: DataTypes.STRING
		},
		CancelAmt: {
			type: DataTypes.STRING
		},
		moid: {
			type: DataTypes.STRING
		},
		signature: {
			type: DataTypes.STRING
		},
		payMethod: {
			type: DataTypes.STRING
		},
		tid: {
			type: DataTypes.STRING
		},
		cancelDate: {
			type: DataTypes.STRING
		},
		cancelTime: {
			type: DataTypes.STRING
		},
		cancelNum: {
			type: DataTypes.STRING
		},
		remainAmt: {
			type: DataTypes.STRING
		},
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	payResult.associate = function (models) {
		payResult.belongsTo(models.user)
	}
	payResult.getByUid = async function (ctx, uid) {
		let data = await payResult.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	payResult.search = async (params) => {
		let where = {}
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await payResult.findAll({
			where: where,
		})
		return result
	}
	return payResult
}
