'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const payCancelResult = sequelize.define('payCancelResult', {
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
	payCancelResult.associate = function (models) {
		payCancelResult.belongsTo(models.user)
	}
	payCancelResult.getByUid = async function (ctx, uid) {
		let data = await payCancelResult.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	payCancelResult.search = async (params) => {
		let where = {}
		if(params.userUid){
			where.userUid = params.userUid
		}
		let result = await payCancelResult.findAll({
			where: where,
		})
		return result
	}
	return payCancelResult
}
