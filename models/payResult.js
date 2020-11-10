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
		authCode: {
			type: DataTypes.STRING
		},
		authDate: {
			type: DataTypes.STRING
		},
		acquCardCode: {
			type: DataTypes.STRING
		},
		acquCardName: {
			type: DataTypes.STRING
		},
		cardCode: {
			type: DataTypes.STRING
		},
		cardName: {
			type: DataTypes.STRING
		},
		cardQuota: {
			type: DataTypes.STRING
		},
		cardInterest: {
			type: DataTypes.STRING
		},
		cardCl: {
			type: DataTypes.STRING
		},
		amt: {
			type: DataTypes.STRING
		},
		goodsName: {
			type: DataTypes.STRING
		},
		buyerName: {
			type: DataTypes.STRING
		},
		buyerEmail: {
			type: DataTypes.STRING
		},
		buyerTel: {
			type: DataTypes.STRING
		},
		tid: {
			type: DataTypes.STRING
		},
		cardNo: {
			type: DataTypes.STRING
		}
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
