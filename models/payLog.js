'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
	const payLog = sequelize.define('payLog', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		//// 사용 내역 정보 /////
		payInfo: {
			type: DataTypes.JSON
		},
		// or carModel uid //
		carNumber: {
			type: DataTypes.STRING
		},
		reserveTime: {
			type: DataTypes.STRING
		},
		payType: {
			type: DataTypes.STRING
		},
		payTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('payType') !== null) {
					return codes.paymentTag[this.getDataValue('payType')]
				}
			}
		},
		status: {
			type: DataTypes.INTEGER
		},
		price: {
			type: DataTypes.INTEGER
		},
		discountPrice: {
			type: DataTypes.INTEGER
		},
		totalPrice: {
			type: DataTypes.INTEGER
		},
		fee: {
			type: DataTypes.INTEGER
		},
		///////////////////////
		userUid: {
			type: DataTypes.INTEGER
		},
		siteUid: {
			type: DataTypes.INTEGER
		},
		discountTicketUid: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	payLog.associate = function (models) {
		payLog.belongsTo(models.user)
		payLog.belongsTo(models.discountTicket)
		payLog.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	payLog.getByUid = async function (ctx, uid) {
		let data = await payLog.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	payLog.search = async (params, models) => {
		let where = {}
		let result = await payLog.findAll({
			include: [
				{
					model: models.parkingSite
				}, {
					model: models.discountTicket
				}, {
					model: models.user
				}],
			where: where
		})
		return result
	}
	return payLog
}
